import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://10.0.2.2:3000/api/v1/user/signin',
        { email: trimmedEmail, password: trimmedPassword },
      );

      const token = response.data.token;
      await AsyncStorage.setItem('token', token);
      onLogin(true);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert('Error', 'Login failed. Check email/password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
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
        onPress={() =>
          Alert.alert('Info', 'Password reset not implemented yet')
        }
      >
        Forget Password?
      </Text>

      <Pressable
        style={[styles.loginButton, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginText}>
          {loading ? 'Logging in...' : 'Log In'}
        </Text>
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
  eyeIcon: { width: 24, height: 24 },
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
    marginBottom: 24,
  },
  loginText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  signupText: { color: '#FFFFFF', fontSize: 14 },
  signupLink: { color: '#2563EB', fontWeight: '700' },
});
