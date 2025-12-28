import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://10.0.2.2:3000/api/v1/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setEvents(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Top Row */}
      <View style={styles.firstRow}>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Image source={require('../assets/Boy.png')} style={styles.Boylogo} />
        </Pressable>

        <View style={[styles.searchBox, { justifyContent: 'flex-start' }]}>
          <TextInput
            placeholder="Search events..."
            placeholderTextColor="#888"
            style={{ color: 'white', fontSize: 16 }}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Image
          source={require('../assets/Bellring.png')}
          style={styles.Bellring}
        />
      </View>

      {/* Circle Preferences */}
      <View style={styles.CircleBox}>
        <Image
          source={require('../assets/Football.png')}
          style={styles.Image}
        />
        <Image
          source={require('../assets/Basketball.png')}
          style={styles.Image}
        />
        <Image source={require('../assets/Dance.png')} style={styles.Image} />
        <Image
          source={require('../assets/Hackathon.png')}
          style={styles.Image}
        />
        <Image source={require('../assets/Hiking.png')} style={styles.Image} />
      </View>

      <View style={styles.ChooseBox}>
        <Text style={styles.ChooseText}>Preference</Text>
      </View>

      {/* Events List */}
      <View style={styles.EventBox}>
        {filteredEvents.length === 0 && (
          <Text style={styles.noEvents}>No events found</Text>
        )}

        {filteredEvents.map(event => (
          <Pressable
            key={event._id}
            style={styles.Event}
            onPress={() =>
              navigation.navigate('EventDetails', { eventId: event._id })
            }
          >
            {event.imageUrl && (
              <Image
                source={{ uri: event.imageUrl }}
                style={styles.eventImage}
              />
            )}
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDesc}>{event.description}</Text>
            <Text style={styles.eventInfo}>
              {event.location?.address || 'No location'} | {event.category}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

export default Dashboard;

// CSS unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
    paddingHorizontal: 10,
    paddingTop: 50,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  Boylogo: { width: 40, height: 40, borderRadius: 20 },
  searchBox: {
    width: '60%',
    height: 50,
    backgroundColor: '#162233',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#122035',
    paddingHorizontal: 10,
  },
  logo: { width: 25, height: 25 },
  Bellring: { width: 30, height: 30 },

  CircleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  Image: { width: 70, height: 70, borderRadius: 35 },

  ChooseBox: {
    width: 120,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
  ChooseText: { textAlign: 'center', fontWeight: '700' },

  EventBox: { marginTop: 30 },
  Event: {
    width: '100%',
    backgroundColor: '#22232A',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  eventDesc: { color: '#ccc', fontSize: 14, marginBottom: 5 },
  eventInfo: { color: '#aaa', fontSize: 12 },
  noEvents: { color: 'white', textAlign: 'center', marginTop: 20 },
});
