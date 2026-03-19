import { StyleSheet, Text, View, Image, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';

// Define the prop type to include onLogout
interface ProfileProps {
  onLogout: () => void;
}

const Profile = ({ onLogout }: ProfileProps) => {
  const navigation = useNavigation();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://10.0.2.2:3000/api/v1/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) {
        console.error('Profile Fetch Error:', err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          // 1. Clear the storage
          await AsyncStorage.removeItem('token');
          // 2. Simply update the state in AppNavigator
          // This causes the AppNavigator to re-render and show the Login screen automatically.
          onLogout();
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
  topBox: { alignItems: 'center', marginTop: 40 },
  Profile: { fontSize: 36, color: 'white', fontWeight: 'bold' },
  Boylogo: { width: 90, height: 90, marginTop: 50 },
  LogOutBox: {
    backgroundColor: '#616161',
    borderColor: '#22232A',
    borderWidth: 4,
    height: 60,
    marginHorizontal: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: 'red', fontWeight: 'bold', fontSize: 18 },
  backArrow: { position: 'absolute', top: 45, left: 15, zIndex: 10 },
  arrowIcon: { width: 15, height: 15, marginTop: 15 },
});
