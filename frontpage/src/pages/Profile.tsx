import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ onLogout }) => {
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          onLogout(); // switches AppNavigator to login
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBox}>
        <Text style={styles.Profile}>Profile</Text>
        <Image source={require('../assets/Boy.png')} style={styles.Boylogo} />
      </View>

      <Pressable style={styles.LogOutBox} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
    justifyContent: 'space-between',
    paddingBottom: 50,
  },
  topBox: {
    alignItems: 'center',
    marginTop: 50,
  },
  Profile: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
  Boylogo: {
    width: 90,
    height: 90,
    marginTop: 50,
  },
  LogOutBox: {
    backgroundColor: '#2563EB',
    height: 60,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
