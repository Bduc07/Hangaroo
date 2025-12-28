import { StyleSheet, Text, View, Image, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../routes/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';

type EventsHostedNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'EventsHosted'
>;

const Profile = ({ onLogout }) => {
  const navigation = useNavigation<EventsHostedNavProp>();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://10.0.2.2:3000/api/v1/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error('Server returned non-JSON:', text);
          return;
        }

        if (data.user) setUser(data.user);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

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
      <Pressable style={styles.backArrow} onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/arrow.png')}
          style={styles.arrowIcon}
        />
      </Pressable>

      <View style={styles.topBox}>
        <Text style={styles.Profile}>Profile</Text>
        <Image source={require('../assets/Boy.png')} style={styles.Boylogo} />
        <Text style={{ color: 'white', fontSize: 20, marginTop: 20 }}>
          {user?.firstName || ''} {user?.lastName || ''}
        </Text>
        <Text style={{ color: 'white', fontSize: 16, marginTop: 5 }}>
          {user?.email || ''}
        </Text>
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
  backArrow: {
    position: 'absolute',
    top: 55,
    left: 10,
    zIndex: 10,
  },
  arrowIcon: {
    width: 24,
    height: 24,
  },
});
