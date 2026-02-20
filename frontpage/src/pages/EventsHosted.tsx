import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  FlatList,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EventsHosted = () => {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHostedEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://10.0.2.2:3000/api/v1/events/hosted', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchHostedEvents();
    }, []),
  );

  const renderEvent = ({ item }: any) => (
    <Pressable
      style={({ pressed }) => [
        styles.eventCard,
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
      ]}
      onPress={() =>
        navigation.navigate('EventManagement', { eventId: item._id })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Live</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.eventInfo}>
          📅 {new Date(item.startTime).toLocaleDateString()}
        </Text>
        <Text style={styles.participantCount}>
          👥 {item.participants?.length || 0} Joined
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../assets/arrow.png')}
            style={styles.arrowIcon}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Events You Host</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              You haven't created any events yet.
            </Text>
          }
        />
      )}
    </View>
  );
};

export default EventsHosted;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10151C' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#22232A',
    borderRadius: 10,
  },
  arrowIcon: { width: 15, height: 15 },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginLeft: 35,
  },

  // List Styles
  listContent: { padding: 20, paddingBottom: 40 },

  // Card Styles
  eventCard: {
    backgroundColor: '#22232A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#30363D',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  activeBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  activeBadgeText: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventInfo: { color: '#8B949E', fontSize: 14 },
  participantCount: { color: '#8B949E', fontSize: 14, fontWeight: '500' },

  emptyText: {
    color: '#8B949E',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});
