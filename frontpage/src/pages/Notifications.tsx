// Notifications.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // ✅ direct import

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigation = useNavigation();

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://10.0.2.2:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <View style={styles.container}>
      {/* 🔙 Back Arrow */}
      <Pressable
        style={styles.backArrow}
        onPress={
          () => navigation.navigate('MainApp', { screen: 'Dashboard' }) // reliable back
        }
      >
        <Image
          source={require('../assets/arrow.png')}
          style={styles.arrowIcon}
        />
      </Pressable>

      <Text style={styles.header}>Notifications</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {notifications.length === 0 && (
          <Text style={styles.empty}>No notifications yet</Text>
        )}

        {notifications.map((n, index) => (
          <View key={index} style={styles.notification}>
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.body}>{n.body}</Text>
            <Text style={styles.date}>{new Date(n.date).toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
    padding: 10,
    paddingTop: 50,
  },
  backArrow: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 10,
  },
  arrowIcon: {
    width: 24,
    height: 24,
  },
  header: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  empty: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  notification: {
    backgroundColor: '#22232A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 5,
  },
  body: {
    color: '#ccc',
    fontSize: 14,
  },
  date: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
});
