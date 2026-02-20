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

  // Function to handle category clicks
  const handleCategoryPress = categoryName => {
    navigation.navigate('CategoryResults', { category: categoryName });
  };

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

      {/* Circle Preferences - Now each one is clickable */}
      <View style={styles.scrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.CircleBox}
        >
          {/* Festivals */}
          <Pressable
            style={styles.categoryItem}
            onPress={() => handleCategoryPress('Festivals')}
          >
            <Image
              source={require('../assets/festivals.png')}
              style={styles.Image}
            />
            <Text style={styles.categoryText}>Festivals</Text>
          </Pressable>

          {/* Sports */}
          <Pressable
            style={styles.categoryItem}
            onPress={() => handleCategoryPress('Sports')}
          >
            <Image
              source={require('../assets/sports.png')}
              style={styles.Image}
            />
            <Text style={styles.categoryText}>Sports</Text>
          </Pressable>

          {/* Business */}
          <Pressable
            style={styles.categoryItem}
            onPress={() => handleCategoryPress('Business')}
          >
            <Image
              source={require('../assets/business.png')}
              style={styles.Image}
            />
            <Text style={styles.categoryText}>Business</Text>
          </Pressable>

          {/* Music */}
          <Pressable
            style={styles.categoryItem}
            onPress={() => handleCategoryPress('Music')}
          >
            <Image
              source={require('../assets/music.png')}
              style={styles.Image}
            />
            <Text style={styles.categoryText}>Music</Text>
          </Pressable>

          {/* Workshop */}
          <Pressable
            style={styles.categoryItem}
            onPress={() => handleCategoryPress('Workshop')}
          >
            <Image
              source={require('../assets/workshop.png')}
              style={styles.Image}
            />
            <Text style={styles.categoryText}>Workshop</Text>
          </Pressable>

          {/* Others */}
          <Pressable
            style={styles.categoryItem}
            onPress={() => handleCategoryPress('Other')}
          >
            <Image
              source={require('../assets/others.png')}
              style={styles.Image}
            />
            <Text style={styles.categoryText}>Others</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Events List */}
      <View style={styles.EventBox}>
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 15,
          }}
        >
          Ongoing Events
        </Text>

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
              {event.location || 'No location'} | {event.category}
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
    paddingTop: height * 0.03,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
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

  scrollContainer: {
    marginTop: height * 0.01,
  },
  CircleBox: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  Image: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: (width * 0.18) / 2,
    marginBottom: 8,
  },
  categoryText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
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
