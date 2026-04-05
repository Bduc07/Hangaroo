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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const Dashboard = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showNearMe, setShowNearMe] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);

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

  const handleCategoryPress = (categoryName: string) => {
    navigation.navigate('CategoryResults', { category: categoryName });
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need your location to show events near you.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const toggleNearMe = async () => {
    if (showNearMe) {
      setShowNearMe(false);
      return;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Location permission denied');
      return;
    }

    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setShowNearMe(true);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        Alert.alert('Failed to get location. Make sure GPS is enabled.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (showNearMe && userLocation) {
      const distance = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(event.latitude),
        parseFloat(event.longitude)
      );
      return distance <= 50; // within 50km
    }

    return true;
  });

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Main Content ScrollView */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }} // Extra padding so button doesn't block the last event
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
          {/* Near Me Toggle */}
          <View style={styles.filterRow}>
            <Pressable
              style={[styles.nearMeButton, showNearMe && styles.nearMeButtonActive]}
              onPress={toggleNearMe}
            >
              <Text style={[styles.nearMeText, showNearMe && styles.nearMeTextActive]}>
                {showNearMe ? 'Showing events near you (50km)' : 'Show Near Me'}
              </Text>
            </Pressable>
          </View>
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

              <Text style={[styles.eventInfo, { fontSize: height * 0.015, marginTop: 5, color: '#4ADE80' }]}>
                Hosted by: {event.host?.firstName} {event.host?.lastName}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* FLOATING CHAT ICON - Placed outside ScrollView to float independently */}
      <Pressable
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Chat')}
      >
        <Image
          source={require('../assets/message.png')}
          style={styles.chatIcon}
        />
      </Pressable>
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
    marginTop: -20,
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
    marginTop: 25,
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

  filterRow: {
    flexDirection: 'row',
    marginTop: 15,
    paddingHorizontal: 5,
  },

  nearMeButton: {
    backgroundColor: '#162233',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },

  nearMeButtonActive: {
    backgroundColor: '#3B82F6',
  },

  nearMeText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },

  nearMeTextActive: {
    color: 'white',
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

  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    elevation: 5,
    zIndex: 10, // Ensures it stays above all content
  },

  chatIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});

export default Dashboard;