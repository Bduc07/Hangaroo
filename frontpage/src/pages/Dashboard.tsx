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
  Dimensions,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');

const Dashboard = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(
        'http://10.0.2.2:3000/api/v1/events/ongoing/all',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
            placeholder="Search events"
            placeholderTextColor="#888"
            style={{ color: 'white', fontSize: 16, marginTop: 5 }}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Pressable onPress={() => navigation.navigate('Notifications')}>
          <Image
            source={require('../assets/Bellring.png')}
            style={styles.Bellring}
          />
        </Pressable>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
    paddingHorizontal: width * 0.03,
    paddingTop: height * 0.03, // reduced from 0.06 to move row up
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02, // optional spacing below
  },
  Boylogo: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: (width * 0.1) / 2,
  },
  searchBox: {
    flex: 1,
    height: height * 0.065,
    backgroundColor: '#162233',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#122035',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  Bellring: { width: width * 0.075, height: width * 0.075 },

  CircleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.04,
  },
  Image: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: (width * 0.18) / 2,
  },

  ChooseBox: {
    width: width * 0.3,
    height: height * 0.04,
    backgroundColor: 'white',
    borderRadius: 5,
    marginTop: height * 0.015,
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
  ChooseText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: height * 0.018,
  },

  EventBox: { marginTop: height * 0.04 },
  Event: {
    width: '100%',
    backgroundColor: '#22232A',
    borderRadius: 10,
    marginBottom: height * 0.02,
    padding: 10,
  },
  eventImage: {
    width: '100%',
    height: height * 0.22,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventTitle: { color: 'white', fontSize: height * 0.022, fontWeight: 'bold' },
  eventDesc: { color: '#ccc', fontSize: height * 0.017, marginBottom: 5 },
  eventInfo: { color: '#aaa', fontSize: height * 0.015 },
  noEvents: { color: 'white', textAlign: 'center', marginTop: height * 0.03 },
});

export default Dashboard;
