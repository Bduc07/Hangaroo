import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EventDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false); // track join button loading

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        const res = await fetch(
          `http://10.0.2.2:3000/api/v1/events/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();
        if (data.success) {
          setEvent(data.event);
        } else {
          setEvent(null);
        }
      } catch (err) {
        console.error(err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Handle "Book Ticket"
  const handleBook = async () => {
    if (!eventId) return;

    try {
      setJoining(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const res = await fetch(
        `http://10.0.2.2:3000/api/v1/events/${eventId}/join`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();

      if (data.success) {
        Alert.alert('Success', 'You have successfully joined this event!');
        setEvent(data.event); // update participants if needed
      } else {
        Alert.alert('Error', data.error || 'Failed to join event');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setJoining(false);
    }
  };

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
      {/* Back */}
      <Pressable style={styles.backArrow} onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/arrow.png')}
          style={styles.arrowIcon}
        />
      </Pressable>

      {/* Title */}
      <Text style={styles.text}>{event.title}</Text>

      {/* Image */}
      <View style={styles.Image}>
        {event.imageUrl && (
          <Image
            source={{ uri: event.imageUrl }}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </View>

      {/* Description */}
      <Text style={styles.descriptionText}>Description</Text>
      <View style={styles.description}>
        <Text style={{ color: '#ccc', padding: 10 }}>{event.description}</Text>
      </View>

      {/* Date */}
      <View style={styles.calender}>
        <Image source={require('../assets/calender.png')} style={styles.logo} />
        <Text style={styles.infoText}>
          {event.startTime ? new Date(event.startTime).toLocaleString() : 'N/A'}
        </Text>
      </View>

      {/* Price */}
      <View style={styles.ticket}>
        <Image source={require('../assets/ticket.png')} style={styles.logo} />
        <Text style={styles.infoText}>
          Rs. {event.price ?? 0} ({event.paymentMethod ?? 'N/A'})
        </Text>
      </View>

      {/* Location */}
      <Text style={styles.locationtext}>Location</Text>
      <View style={styles.location}>
        <Text style={styles.infoText}>{event.location?.address ?? 'N/A'}</Text>
      </View>

      {/* Book Button */}
      <Pressable
        style={[styles.bookticket, { opacity: joining ? 0.7 : 1 }]}
        onPress={handleBook}
        disabled={joining}
      >
        <Text style={styles.Book}>
          {joining ? 'Booking...' : 'Book Ticket'}
        </Text>
      </Pressable>
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
    width: 20,
    height: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    marginLeft: 10,
    width: 24,
    height: 24,
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
    justifyContent: 'center',
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
  },
  infoText: {
    color: '#ccc',
    marginLeft: 15,
    fontSize: 16,
  },
});
