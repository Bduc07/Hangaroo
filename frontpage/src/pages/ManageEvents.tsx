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
  location?: string;
  participants?: any[];
}

const { width } = Dimensions.get('window');

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

  const renderEvent = ({ item }: { item: EventType }) => (
    <Pressable
      style={styles.eventCard}
      onPress={() =>
        navigation.navigate('EventManagement', { eventId: item._id })
      }
    >
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventInfo}>
            📅{' '}
            {item.startTime
              ? new Date(item.startTime).toLocaleDateString()
              : 'N/A'}
          </Text>
          <Text style={styles.eventInfo}>
            📍 {item.location || 'Location not set'}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.participants?.length || 0} Joined
          </Text>
        </View>
      </View>

      <View style={styles.footerLine}>
        <Text style={styles.manageText}>
          Tap to manage attendance & finalize →
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* --- Functional Back Button --- */}
      <Pressable style={styles.backArrow} onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/arrow.png')}
          style={styles.arrowIcon}
        />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ongoing Events</Text>
        <Text style={styles.headerSubtitle}>
          Select an event to manage participants
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3B82F6"
          style={{ marginTop: 50 }}
        />
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noEventText}>No active events found.</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

export default ManageEvents;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10151C' },
  backArrow: {
    position: 'absolute',
    top: 45,
    left: 15,
    zIndex: 10,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    
  },
  header: {
    padding: 20,
    paddingTop: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginLeft: 55,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 17,
    marginTop: 4,
    marginLeft: 35,
  },
  eventCard: {
    width: width * 0.92,
    backgroundColor: '#22232A',
    borderRadius: 15,
    alignSelf: 'center',
    marginTop: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventInfo: { color: '#94A3B8', fontSize: 13, marginBottom: 4 },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  badgeText: { color: '#3B82F6', fontSize: 12, fontWeight: 'bold' },
  footerLine: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  manageText: { color: '#64748B', fontSize: 12, fontStyle: 'italic' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noEventText: { color: '#94A3B8', fontSize: 16 },
});
