import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { configureGoogleSignIn } from '../config/googleAuth';

interface LoginProps {
  onLogin: (loggedIn: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // --- Standard Email/Password Login ---
  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://10.0.2.2:3000/api/v1/user/signin',
        { email: trimmedEmail, password: trimmedPassword },
      );

      await AsyncStorage.setItem('token', response.data.token);
      onLogin(true);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Real Google Login Implementation ---
  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      // 1. Ensure Play Services are available (Required for Android)
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // 2. THE FIX: Clear existing session so Google shows the account picker.
      // This prevents the "direct login" behavior your teacher mentioned.
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Sign out fails if no one is signed in; we can safely ignore this.
      }

      // 3. Trigger the Google Identity UI
      const signInResult = await GoogleSignin.signIn();

      // In @react-native-google-signin/google-signin v11+, data is in .data
      const idToken =
        signInResult.data?.idToken || (signInResult as any).idToken;

      if (!idToken) {
        throw new Error('No ID Token received from Google');
      }

      // 4. Exchange Google Token for your App's JWT Token via your Backend
      const res = await axios.post(`http://10.0.2.2:3000/api/v1/auth/google`, {
        idToken,
      });

      // 5. Save your backend's token
      await AsyncStorage.setItem('token', res.data.token);
      console.log('Backend verified user:', res.data.user);

      onLogin(true);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available or outdated');
      } else {
        console.error('Google Sign-In Error:', error);
        Alert.alert('Error', 'Something went wrong with Google Sign-In');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Image source={require('../assets/Login.png')} style={styles.logo} />
      <Text style={styles.welcome}>Welcome Back</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#616161"
        value={email}
        onChangeText={setEmail}
        style={styles.inputBox}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#616161"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
        />
        <Image source={require('../assets/Eyes.png')} style={styles.eyeIcon} />
      </View>

      <Text
        style={styles.forgetPassword}
        onPress={() => Alert.alert('Info', 'Reset link sent to email (Mock)')}
      >
        Forget Password?
      </Text>

      {/* Standard Login Button */}
      <Pressable
        style={[styles.loginButton, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading || googleLoading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.loginText}>Log In</Text>
        )}
      </Pressable>

      {/* Google Login Button */}
      <Pressable
        style={[styles.googleButton, googleLoading && { opacity: 0.7 }]}
        onPress={signInWithGoogle}
        disabled={loading || googleLoading}
      >
        <View style={styles.googleContent}>
          {googleLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Image
                source={require('../assets/google_logo.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </View>
      </Pressable>

      <Text style={styles.signupText}>
        Don’t have an account?{' '}
        <Text
          style={styles.signupLink}
          onPress={() => navigation.navigate('SignUp')}
        >
          Sign up
        </Text>
      </Text>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
    alignItems: 'center',
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  logo: { width: 96, height: 96, marginBottom: 24 },
  welcome: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 32,
  },
  inputBox: {
    width: '100%',
    height: 64,
    backgroundColor: '#22232A',
    borderWidth: 1,
    borderColor: '#616161',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    width: '100%',
    height: 64,
    backgroundColor: '#22232A',
    borderWidth: 1,
    borderColor: '#616161',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  passwordInput: { flex: 1, color: 'white', fontSize: 16 },
  eyeIcon: { width: 20, height: 15 },
  forgetPassword: {
    color: '#FFFFFF',
    fontSize: 14,
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    width: '100%',
    height: 64,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  googleButton: {
    width: '100%',
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  googleContent: { flexDirection: 'row', alignItems: 'center' },
  googleIcon: { width: 24, height: 24, marginRight: 12 },
  googleButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  signupText: { color: '#FFFFFF', fontSize: 14 },
  signupLink: { color: '#2563EB', fontWeight: '700' },
});
