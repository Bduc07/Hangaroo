import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const EventsJoined = () => {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // State to track which tab is selected
  const [showActive, setShowActive] = useState(true);

  const fetchJoinedEvents = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Switch URL based on which button is pressed
      const url = showActive
        ? 'http://10.0.2.2:3000/api/v1/events/joined-active'
        : 'http://10.0.2.2:3000/api/v1/events/joined';

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setEvents(data.success ? data.events : []);
    } catch (err) {
      console.error('Error:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJoinedEvents();
    }, [showActive]), // Refetch when you click a different button
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/arrow.png')}
            style={styles.arrowIcon}
          />
        </Pressable>
        <Text style={styles.headerTitle}>My Joined Events</Text>
      </View>

      {/* Button CSS: Toggle between Active and Completed */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tabButton, showActive && styles.activeTabActive]}
          onPress={() => setShowActive(true)}
        >
          <Text style={[styles.tabText, showActive && styles.activeTabText]}>
            Active
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, !showActive && styles.activeTabPast]}
          onPress={() => setShowActive(false)}
        >
          <Text style={[styles.tabText, !showActive && styles.activeTabText]}>
            Past
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3B82F6"
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {events.length === 0 ? (
            <Text style={styles.noEventText}>No events found here.</Text>
          ) : (
            events.map(event => (
              <Pressable
                key={event._id}
                style={[
                  styles.eventCard,
                  showActive ? styles.activeCardBorder : styles.pastCardBorder,
                ]}
                onPress={() =>
                  navigation.navigate('EventDetails', { eventId: event._id })
                }
              >
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventInfo}>
                  📅 {new Date(event.startTime).toLocaleDateString()} | 📍{' '}
                  {event.location}
                </Text>
                {showActive && (
                  <View style={styles.upcomingBadge}>
                    <Text style={styles.badgeText}>Upcoming</Text>
                  </View>
                )}
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10151C' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginLeft: 40,
  },
  arrowIcon: { width: 15, height: 15 },

  // Tab/Button CSS
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#22232A',
    borderRadius: 10,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: { color: '#888', fontWeight: 'bold' },
  activeTabText: { color: 'white' },
  activeTabActive: { backgroundColor: '#3B82F6' }, // Blue for Active
  activeTabPast: { backgroundColor: '#4B5563' }, // Grey for Past

  // Event Card CSS
  eventCard: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#22232A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  activeCardBorder: { borderColor: '#042c6e' },
  pastCardBorder: { borderColor: '#444' },
  eventTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  eventInfo: { color: '#ccc', marginTop: 5 },
  upcomingBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 10,
  },
  badgeText: { color: '#3B82F6', fontSize: 12, fontWeight: 'bold' },
  noEventText: { color: 'white', alignSelf: 'center', marginTop: 50 },
});

export default EventsJoined;
