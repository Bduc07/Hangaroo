import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../routes/types';

type EventManagementNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'EventManagement'
>;
type EventManagementRouteProp = RouteProp<
  RootStackParamList,
  'EventManagement'
>;

interface Participant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  attended?: boolean;
}

interface EventType {
  _id: string;
  title: string;
  participants: Participant[];
}

const EventManagement = () => {
  const route = useRoute<EventManagementRouteProp>();
  const { eventId } = route.params;
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, []);

  const fetchEventDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://10.0.2.2:3000/api/v1/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setEvent(data.event);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (participantId: string) => {
    setEvent(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.participants = updated.participants.map(p =>
        p._id === participantId ? { ...p, attended: !p.attended } : p,
      );
      return updated;
    });
  };

  const renderParticipant = ({ item }: { item: Participant }) => (
    <View style={styles.participantBox}>
      <Text style={styles.participantName}>
        {item.firstName} {item.lastName}
      </Text>
      <Text style={styles.participantEmail}>{item.email}</Text>
      <Pressable
        style={[
          styles.attendanceBtn,
          { backgroundColor: item.attended ? 'green' : '#3B82F6' },
        ]}
        onPress={() => toggleAttendance(item._id)}
      >
        <Text style={{ color: 'white' }}>
          {item.attended ? 'Attended' : 'Mark Attend'}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : event ? (
        <>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <FlatList
            data={event.participants}
            renderItem={renderParticipant}
            keyExtractor={item => item._id}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </>
      ) : (
        <Text style={styles.noEventText}>Event not found</Text>
      )}
    </View>
  );
};

export default EventManagement;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10151C', padding: 15 },
  eventTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  participantBox: { backgroundColor: '#22232A', padding: 15, borderRadius: 8 },
  participantName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  participantEmail: { color: '#ccc', fontSize: 14, marginBottom: 5 },
  attendanceBtn: { padding: 8, borderRadius: 5, alignItems: 'center' },
  noEventText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});
