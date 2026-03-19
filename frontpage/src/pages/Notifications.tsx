import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://10.0.2.2:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, []),
  );

  const handleNotificationPress = (notification: any) => {
    // If the notification is linked to an event, navigate to it
    if (notification.eventId) {
      navigation.navigate('EventDetails', { eventId: notification.eventId });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header & Back Button */}
      <View style={styles.headerContainer}>
        <Pressable style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/arrow.png')}
            style={styles.arrowIcon}
          />
        </Pressable>
        <Text style={styles.header}>Notifications</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchNotifications}
            tintColor="#fff"
          />
        }
      >
        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>😉</Text>
            <Text style={styles.empty}>All caught up!</Text>
          </View>
        )}

        {notifications.map((n: any, index: number) => {
          const isWink = n.title.includes('tomorrow') || n.title.includes('😉');

          return (
            <Pressable
              key={index}
              onPress={() => handleNotificationPress(n)}
              style={({ pressed }) => [
                styles.notification,
                isWink && styles.winkCard,
                pressed && { opacity: 0.7 }, // Visual feedback when clicked
              ]}
            >
              <View style={styles.row}>
                <Text style={[styles.title, isWink && { color: '#FACD15' }]}>
                  {n.title}
                </Text>
                {isWink && <Text style={{ fontSize: 16 }}>⏰</Text>}
              </View>

              <Text style={styles.body}>{n.body}</Text>

              <Text style={styles.date}>
                {n.createdAt
                  ? new Date(n.createdAt).toLocaleString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short',
                    })
                  : 'Just now'}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10151C' },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { color: 'white', fontSize: 24, fontWeight: '700' },
  backArrow: { position: 'absolute', left: 20, top: 55 },
  arrowIcon: { width: 20, height: 20 },

  notification: {
    backgroundColor: '#22232A',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 12,
    // Add subtle shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  winkCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FACD15',
    backgroundColor: '#2A2D35',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { color: 'white', fontWeight: '700', fontSize: 16 },
  body: { color: '#ccc', fontSize: 14, lineHeight: 20 },
  date: { color: '#888', fontSize: 11, marginTop: 10, textAlign: 'right' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  empty: { color: '#888', fontSize: 16 },
});

export default Notifications;
