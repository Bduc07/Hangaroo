import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '../routes/navigation';
import axios from 'axios';

const SignUp = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedFirst || !trimmedLast) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://10.0.2.2:3000/api/v1/user/signup',
        {
          email: trimmedEmail,
          password: trimmedPassword,
          firstName: trimmedFirst,
          lastName: trimmedLast,
        },
      );

      console.log('Signup Response:', response.data);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert('Error', 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Manage your events effortlessly.</Text>

      <Text style={styles.label}>Email</Text>
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#616161"
          value={email}
          onChangeText={setEmail}
          style={styles.textInput}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Image source={require('../assets/Email.png')} style={styles.icon} />
      </View>

      <Text style={styles.label}>Password</Text>
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Enter password"
          placeholderTextColor="#616161"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.textInput}
        />
        <Image source={require('../assets/Eyes.png')} style={styles.icon} />
      </View>

      <Text style={styles.label}>First Name</Text>
      <TextInput
        placeholder="First Name"
        placeholderTextColor="#616161"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.inputBoxSimple}
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        placeholder="Last Name"
        placeholderTextColor="#616161"
        value={lastName}
        onChangeText={setLastName}
        style={styles.inputBoxSimple}
      />

      <Pressable
        style={[styles.signUpButton, loading && { opacity: 0.6 }]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.signUpText}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </Text>
      </Pressable>

      <Text style={styles.loginText}>
        Already a member?{' '}
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          Log In
        </Text>
      </Text>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  title: { color: 'white', fontSize: 30, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#616161', marginBottom: 24 },
  label: { color: 'white', marginTop: 12, marginBottom: 8 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22232A',
    borderWidth: 1,
    borderColor: '#616161',
    borderRadius: 8,
    height: 64,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputBoxSimple: {
    backgroundColor: '#22232A',
    borderWidth: 1,
    borderColor: '#616161',
    borderRadius: 8,
    height: 64,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: 'white',
    fontSize: 16,
  },
  textInput: { flex: 1, color: 'white', fontSize: 16 },
  icon: { width: 24, height: 24, marginLeft: 8 },
  signUpButton: {
    width: '100%',
    height: 64,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  signUpText: { color: 'white', fontSize: 20, fontWeight: '700' },
  loginText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
  },
  loginLink: { color: '#2563EB', fontWeight: '700' },
});
