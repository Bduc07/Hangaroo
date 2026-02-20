import React, { useState, useCallback } from 'react'; // Added useCallback
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  RefreshControl, // Added for pull-to-refresh
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Added useFocusEffect

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://10.0.2.2:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // 🔥 THE FIX: This runs every time the screen comes into view
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.backArrow}
        onPress={() => navigation.navigate('MainApp', { screen: 'Dashboard' })}
      >
        <Image
          source={require('../assets/arrow.png')}
          style={styles.arrowIcon}
        />
      </Pressable>

      <Text style={styles.header}>Notifications</Text>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        {notifications.length === 0 && (
          <Text style={styles.empty}>No notifications yet</Text>
        )}

        {notifications.map((n, index) => (
          <View key={index} style={styles.notification}>
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.body}>{n.body}</Text>
            {/* Added a fallback check for the date field name */}
            <Text style={styles.date}>
              {n.createdAt
                ? new Date(n.createdAt).toLocaleString()
                : new Date().toLocaleString()}
            </Text>
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
    paddingTop: 20,
  },
  backArrow: {
    position: 'absolute',
    top: 25,
    left: 15,
    zIndex: 10,
  },
  arrowIcon: {
    width: 20,
    height: 20,
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
