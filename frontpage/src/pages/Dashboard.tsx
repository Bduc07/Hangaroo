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
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

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

      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Row */}
        <View style={styles.firstRow}>
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Image
              source={require('../assets/Boy.png')}
              style={{
                width: width * 0.1,
                height: width * 0.1,
                borderRadius: width * 0.05,
              }}
            />
          </Pressable>

          <View
            style={[
              styles.searchBox,
              {
                height: height * 0.065,
                minWidth: width * 0.4,
              },
            ]}
          >
            <TextInput
              placeholder="Search events"
              placeholderTextColor="#888"
              style={styles.searchText}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <Pressable onPress={() => navigation.navigate('Notifications')}>
            <Image
              source={require('../assets/Bellring.png')}
              style={{
                width: width * 0.075,
                height: width * 0.075,
              }}
            />
          </Pressable>
        </View>

        {/* Categories */}
        <View style={{ marginTop: height * 0.01 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.CircleBox}
          >
            {[
              { name: 'Festivals', img: require('../assets/festivals.png') },
              { name: 'Sports', img: require('../assets/sports.png') },
              { name: 'Business', img: require('../assets/business.png') },
              { name: 'Music', img: require('../assets/music.png') },
              { name: 'Workshop', img: require('../assets/workshop.png') },
              { name: 'Other', img: require('../assets/others.png') },
            ].map((item, index) => (
              <Pressable
                key={index}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(item.name)}
              >
                <Image
                  source={item.img}
                  style={{
                    width: width * 0.18,
                    height: width * 0.18,
                    borderRadius: (width * 0.18) / 2,
                    marginBottom: 8,
                  }}
                />
                <Text style={styles.categoryText}>{item.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Events */}
        <View style={{ marginTop: height * 0.04 }}>
          <Text style={styles.eventHeader}>Ongoing Events</Text>

          {filteredEvents.length === 0 && (
            <Text style={styles.noEvents}>No events found</Text>
          )}

          {filteredEvents.map(event => (
            <Pressable
              key={event._id}
              style={styles.Event}
              onPress={() =>
                navigation.navigate('EventDetails', {
                  eventId: event._id,
                })
              }
            >
              {event.imageUrl && (
                <Image
                  source={{ uri: event.imageUrl }}
                  style={{
                    width: '100%',
                    height: height * 0.22,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                />
              )}

              <Text style={[styles.eventTitle, { fontSize: height * 0.022 }]}>
                {event.title}
              </Text>

              <Text style={[styles.eventDesc, { fontSize: height * 0.017 }]}>
                {event.description}
              </Text>

              <Text style={[styles.eventInfo, { fontSize: height * 0.015 }]}>
                {event.location || 'No location'} | {event.category}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#10151C',
  },

  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  firstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:25,
  },

  searchBox: {
    flex: 1,
    backgroundColor: '#162233',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#122035',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    justifyContent: 'center',
  },

  searchText: {
    color: 'white',
    fontSize: 16,
  },

  CircleBox: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },

  categoryText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },

  eventHeader: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  Event: {
    width: '100%',
    backgroundColor: '#22232A',
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
  },

  eventTitle: {
    color: 'white',
    fontWeight: 'bold',
  },

  eventDesc: {
    color: '#ccc',
    marginBottom: 5,
  },

  eventInfo: {
    color: '#aaa',
  },

  noEvents: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Dashboard;
