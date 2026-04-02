import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Linking, Platform } from 'react-native';

const EventDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        // Fetch User Profile
        const userRes = await fetch(
          'http://10.0.2.2:3000/api/v1/user/profile',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const userData = await userRes.json();
        if (userData.success) setUserId(userData.user._id);

        // Fetch Event
        const res = await fetch(
          `http://10.0.2.2:3000/api/v1/events/${eventId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (data.success) setEvent(data.event);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const isAlreadyJoined = event?.participants?.some(
    (p: any) => p._id === userId || p === userId,
  );

  const handleBook = async () => {
    try {
      setJoining(true);

      // Generate unique transaction ID
      const transaction_uuid = `EVT${Date.now()}-${Math.floor(
        Math.random() * 1000,
      )}`;

      // Navigate to eSewaPayment screen
      navigation.navigate('EsewaPayment', {
        amount: event?.payment?.amount || 100,
        eventId,
        transaction_uuid,
      });
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require('../assets/arrow.png')}
              style={styles.backIcon}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Image */}
        <View style={styles.imageContainer}>
          {event?.imageUrl ? (
            <Image source={{ uri: event.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={{ color: '#666' }}>No Image</Text>
            </View>
          )}
        </View>

        <View style={styles.contentWrapper}>
          <Text style={styles.eventTitle}>{event?.title}</Text>

          {/* Info Rows */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Image
                  source={require('../assets/calender.png')}
                  style={styles.smallIcon}
                />
              </View>
              <Text style={styles.infoText}>
                {event?.startTime
                  ? new Date(event.startTime).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Image
                  source={require('../assets/ticket.png')}
                  style={styles.smallIcon}
                />
              </View>
              <Text style={styles.infoText}>
                Rs. {event?.payment?.amount ?? 0} •{' '}
                {event?.payment?.method ?? 'Cash'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.descriptionBody}>{event?.description}</Text>

          {/* Location */}
          <Text style={styles.sectionLabel}>Location</Text>
          {event?.latitude && event?.longitude ? (
            <Pressable
              style={styles.mapContainer}
              onPress={() => {
                const lat = event.latitude;
                const lng = event.longitude;
                const scheme = Platform.select({
                  ios: 'maps:0,0?q=',
                  android: 'geo:0,0?q=',
                });
                const latLng = `${lat},${lng}`;
                const label = event.title;
                const url = Platform.select({
                  ios: `${scheme}${label}@${latLng}`,
                  android: `${scheme}${latLng}(${label})`,
                });

                if (url) {
                  Linking.openURL(url).catch(() => {
                    Alert.alert('Error', 'Could not open map app.');
                  });
                }
              }}
            >
              <View pointerEvents="none" style={{ flex: 1 }}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  initialRegion={{
                    latitude: event.latitude,
                    longitude: event.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: event.latitude,
                      longitude: event.longitude,
                    }}
                    title={event.title}
                    description={event.location || ''}
                  />
                </MapView>
              </View>
            </Pressable>
          ) : (
            <View style={styles.locationCard}>
              <Text style={styles.locationText}>
                📍{' '}
                {event?.location?.address ||
                  event?.location ||
                  'Location not specified'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomNav}>
        <Pressable
          style={[
            styles.bookButton,
            (joining || isAlreadyJoined) && { backgroundColor: '#4B5563' },
          ]}
          onPress={handleBook}
          disabled={joining || isAlreadyJoined}
        >
          {joining ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.bookButtonText}>
              {isAlreadyJoined ? 'Already Joined' : 'Book Ticket'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10151C' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#22232A',
    borderRadius: 10,
  },
  backIcon: { width: 20, height: 20 },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700',
  },
  imageContainer: { paddingHorizontal: 20, marginTop: 10 },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: '#22232A',
  },
  placeholderImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: '#22232A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: { paddingHorizontal: 25, marginTop: 25 },
  eventTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },
  infoSection: { marginBottom: 25 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#22232A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  smallIcon: { width: 20, height: 20 },
  infoText: { color: '#E5E7EB', fontSize: 16, fontWeight: '500' },
  sectionLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  descriptionBody: {
    color: '#9CA3AF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
  },
  locationCard: {
    backgroundColor: '#22232A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 20,
  },
  locationText: { color: '#E5E7EB', fontSize: 15 },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: { flex: 1 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: '#10151C',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  bookButton: {
    backgroundColor: '#2563EB',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
});

export default EventDetails;
