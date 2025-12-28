import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../routes/types';

type EventsHostedNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'EventsHosted'
>;

const EventDetails = () => {
  const navigation = useNavigation<EventsHostedNavProp>();
  const route = useRoute();
  const { eventId } = route.params as { eventId: string };

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(
          `http://10.0.2.2:3000/api/v1/events/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (data.success) setEvent(data.event);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white', alignSelf: 'center', marginTop: 20 }}>
          Event not found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backArrow} onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/arrow.png')}
          style={styles.arrowIcon}
        />
      </Pressable>
      <Text style={styles.text}>{event.title}</Text>
      <View style={styles.Image}></View>
      <Text style={styles.descriptionText}>Description</Text>
      <View style={styles.description}>
        <Text style={{ color: '#ccc', padding: 10 }}>{event.description}</Text>
      </View>
      <View style={styles.calender}>
        <Image source={require('../assets/calender.png')} style={styles.logo} />
      </View>
      <View style={styles.ticket}>
        <Image source={require('../assets/ticket.png')} style={styles.logo} />
      </View>
      <Text style={styles.locationtext}>Location</Text>
      <View style={styles.location}></View>
      <View style={styles.bookticket}>
        <Text style={styles.Book}>Book Ticket</Text>
      </View>
    </View>
  );
};

export default EventDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
  },
  text: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 40,
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
  Image: {
    width: '80%',
    height: '20%',
    backgroundColor: 'white',
    marginLeft: 40,
    marginTop: 20,
  },
  descriptionText: {
    color: 'white',
    fontSize: 20,
    marginLeft: 40,
    marginTop: 20,
  },
  description: {
    width: '80%',
    height: '20%',
    backgroundColor: '#22232A',
    borderColor: '#22232A',
    borderWidth: 3,
    marginLeft: 40,
    marginTop: 10,
    borderRadius: 5,
  },
  calender: {
    width: '80%',
    height: '7%',
    backgroundColor: '#22232A',
    borderColor: '#22232A',
    borderWidth: 3,
    marginLeft: 40,
    marginTop: 10,
    borderRadius: 5,
  },
  ticket: {
    width: '80%',
    height: '7%',
    backgroundColor: '#22232A',
    borderColor: '#22232A',
    borderWidth: 3,
    marginLeft: 40,
    marginTop: 10,
    borderRadius: 5,
  },
  logo: {
    marginTop: 12,
    marginLeft: 10,
  },
  location: {
    width: '80%',
    height: '7%',
    backgroundColor: '#22232A',
    borderColor: '#22232A',
    borderWidth: 3,
    marginLeft: 40,
    marginTop: 10,
    borderRadius: 5,
  },
  locationtext: {
    color: 'white',
    fontSize: 20,
    marginLeft: 40,
    marginTop: 10,
  },
  bookticket: {
    width: '80%',
    height: '7%',
    backgroundColor: 'blue',
    marginLeft: 40,
    marginTop: 30,
    borderRadius: 5,
    justifyContent: 'center',
  },
  Book: {
    color: 'white',
    fontSize: 20,
    alignSelf: 'center',
    marginTop: 17,
  },
});
