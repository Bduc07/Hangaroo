import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../routes/types';

type EventsHostedNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'EventsHosted'
>;

interface EventType {
  _id: string;
  title: string;
  imageUrl?: string;
  startTime?: string;
  location?: { address: string };
}

const EventsHosted = () => {
  const navigation = useNavigation<EventsHostedNavProp>();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchHostedEvents();
  }, []);

  const renderEvent = ({ item }: { item: EventType }) => (
    <Pressable
      style={styles.Event}
      onPress={() => navigation.navigate('EventDetails', { eventId: item._id })}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventInfo}>
        {item.startTime ? new Date(item.startTime).toLocaleDateString() : 'N/A'}{' '}
        - {item.location?.address || 'No location'}
      </Text>
    </Pressable>
  );

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
          You have not hosted any events yet.
        </Text>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingTop: 100, paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
};

export default EventsHosted;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
  },
  Event: {
    width: '83%',
    height: 130,
    backgroundColor: '#22232A',
    borderRadius: 5,
    marginLeft: 30,
    padding: 10,
    justifyContent: 'center',
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
  eventTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventInfo: {
    color: '#ccc',
    fontSize: 14,
  },
  noEventText: {
    color: 'white',
    fontSize: 16,
    alignSelf: 'center',
    marginTop: 100,
  },
});
