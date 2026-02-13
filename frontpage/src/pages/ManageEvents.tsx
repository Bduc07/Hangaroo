import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../routes/types';

type ManageEventsNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ManageEvents'
>;

interface EventType {
  _id: string;
  title: string;
  startTime?: string;
  location?: { address: string };
  participants?: any[];
}

const { width, height } = Dimensions.get('window');

const ManageEvents = () => {
  const navigation = useNavigation<ManageEventsNavProp>();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOngoingEvents();
  }, []);

  const fetchOngoingEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://10.0.2.2:3000/api/v1/events/ongoing', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setEvents(data.events);
      else setEvents([]);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteEvent = async (eventId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(
        `http://10.0.2.2:3000/api/v1/events/${eventId}/complete`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) {
        setEvents(prev => prev.filter(e => e._id !== eventId));
      } else {
        Alert.alert('Error', data.error || 'Failed to complete event');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const renderEvent = ({ item }: { item: EventType }) => (
    <View style={styles.eventBox}>
      <Pressable
        onPress={() =>
          navigation.navigate('EventManagement', { eventId: item._id })
        }
      >
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventInfo}>
          {item.startTime
            ? new Date(item.startTime).toLocaleDateString()
            : 'N/A'}{' '}
          - {item.location?.address || 'No location'}
        </Text>
        <Text style={styles.participantsText}>
          Participants: {item.participants?.length || 0}
        </Text>
      </Pressable>

      <Pressable
        style={styles.completeButton}
        onPress={() =>
          Alert.alert('Mark Event Completed', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => handleCompleteEvent(item._id) },
          ])
        }
      >
        <Text style={styles.completeButtonText}>Mark as Completed</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3B82F6"
          style={{ marginTop: 100 }}
        />
      ) : events.length === 0 ? (
        <Text style={styles.noEventText}>No ongoing events.</Text>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
};

export default ManageEvents;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10151C' },
  eventBox: {
    width: width * 0.9,
    minHeight: 130,
    backgroundColor: '#22232A',
    borderRadius: 8,
    alignSelf: 'center',
    padding: 15,
    justifyContent: 'center',
  },
  eventTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventInfo: { color: '#ccc', fontSize: 14, marginBottom: 5 },
  participantsText: { color: '#ccc', fontSize: 14, marginBottom: 10 },
  completeButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  completeButtonText: { color: 'white', fontWeight: 'bold' },
  noEventText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});
