import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';

const EventsJoined = () => {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoinedEvents = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://10.0.2.2:3000/api/v1/events/joined', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success) setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching joined events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedEvents();
  }, []);

  return (
    <View style={styles.container}>
      {/* Always show back button */}
      <Pressable style={styles.backArrow} onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/arrow.png')}
          style={styles.arrowIcon}
        />
      </Pressable>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3B82F6"
          style={{ marginTop: 100 }}
        />
      ) : events.length === 0 ? (
        <Text style={styles.noEventText}>
          You haven’t joined any events yet.
        </Text>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingTop: 100, paddingBottom: 20 }}
        >
          {events.map(event => (
            <Pressable
              key={event._id}
              style={styles.Event}
              onPress={() =>
                navigation.navigate('EventDetails', { eventId: event._id })
              }
            >
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventInfo}>
                {new Date(event.startTime).toLocaleDateString()} | Rs.{' '}
                {event.payment?.amount ?? 0}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default EventsJoined;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10151C' },
  backArrow: {
    position: 'absolute',
    top: 55,
    left: 10,
    zIndex: 10,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  Event: {
    width: '90%',
    height: 130,
    backgroundColor: '#22232A',
    borderRadius: 5,
    marginVertical: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingLeft: 15,
  },
  eventTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  eventInfo: { color: '#ccc', fontSize: 16, marginTop: 10 },
  noEventText: {
    color: 'white',
    alignSelf: 'center',
    marginTop: 100,
    fontSize: 18,
  },
});
