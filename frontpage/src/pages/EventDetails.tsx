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
  Modal,
  TextInput,
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

  // Reporting State
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  // Editing State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editMaxParticipants, setEditMaxParticipants] = useState('');
  const [editing, setEditing] = useState(false);

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
        if (data.success) {
          setEvent(data.event);
          setEditTitle(data.event.title || '');
          setEditDescription(data.event.description || '');
          setEditPrice(data.event.payment?.amount?.toString() || '');
          setEditMaxParticipants(data.event.maxParticipants?.toString() || '50');
        }
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

  const currentParticipants = event?.participants?.length || 0;
  const maxParticipants = event?.maxParticipants || 50;
  const isFull = currentParticipants >= maxParticipants;

  const isHost = event?.host && (event.host._id === userId || event.host === userId);

  const handleDeleteEvent = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const res = await fetch(`http://10.0.2.2:3000/api/v1/events/${eventId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              if (data.success) {
                Alert.alert("Success", "Event deleted successfully.");
                navigation.goBack();
              } else {
                Alert.alert("Error", data.error || "Failed to delete event.");
              }
            } catch (err) {
              Alert.alert('Error', 'Something went wrong');
            }
          }
        }
      ]
    );
  };

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

  const handleReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert('Error', 'Please enter a reason');
      return;
    }
    setReporting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://10.0.2.2:3000/api/v1/events/${eventId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Report Submitted', 'We will review this event shortly.');
        setReportModalVisible(false);
        setReportReason('');
      } else {
        Alert.alert('Error', data.error || 'Could not submit report');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setReporting(false);
    }
  };

  const handleEditEvent = async () => {
    if (!editTitle.trim() || !editDescription.trim() || !editPrice.trim()) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }
    setEditing(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const payload = {
        title: editTitle,
        description: editDescription,
        maxParticipants: parseInt(editMaxParticipants) || 50,
        payment: {
          method: event.payment?.method || 'Bank Transfer',
          amount: Number(editPrice)
        }
      };

      const res = await fetch(`http://10.0.2.2:3000/api/v1/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(data.success) {
        Alert.alert('Success', 'Event updated successfully');
        setEvent(data.event);
        setEditModalVisible(false);
      } else {
        Alert.alert('Error', data.error || 'Failed to update event');
      }
    } catch(err) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setEditing(false);
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
          <Pressable onPress={() => setReportModalVisible(true)} style={styles.reportButton}>
            <Text style={styles.reportText}>🚩</Text>
          </Pressable>
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

            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Text style={{fontSize: 20}}>👥</Text>
              </View>
              <Text style={styles.infoText}>
                {currentParticipants}/{maxParticipants} Joined
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
        {isHost ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable style={[styles.bookButton, { flex: 1, marginRight: 10, backgroundColor: '#4B5563' }]} onPress={() => setEditModalVisible(true)}>
              <Text style={styles.bookButtonText}>Edit</Text>
            </Pressable>
            <Pressable style={[styles.bookButton, { flex: 1, marginLeft: 10, backgroundColor: '#ef4444' }]} onPress={handleDeleteEvent}>
              <Text style={styles.bookButtonText}>Delete</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[
              styles.bookButton,
              (joining || isAlreadyJoined || isFull) && { backgroundColor: '#4B5563' },
            ]}
            onPress={handleBook}
            disabled={joining || isAlreadyJoined || isFull}
          >
            {joining ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.bookButtonText}>
                {isAlreadyJoined ? 'Already Joined' : isFull ? 'Event Full/Closed' : 'Book Ticket'}
              </Text>
            )}
          </Pressable>
        )}
      </View>

      {/* Report Modal */}
      <Modal visible={reportModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Report Event</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Why are you reporting this event?"
              placeholderTextColor="#9ca3af"
              multiline
              value={reportReason}
              onChangeText={setReportReason}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setReportModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSubmit} onPress={handleReport} disabled={reporting}>
                {reporting ? <ActivityIndicator color="white" /> : <Text style={styles.modalSubmitText}>Submit</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Event</Text>
            
            <TextInput
              style={styles.modalSingleInput}
              placeholder="Event Title"
              placeholderTextColor="#9ca3af"
              value={editTitle}
              onChangeText={setEditTitle}
            />
            
            <TextInput
              style={styles.modalSingleInput}
              placeholder="Price (Rs.)"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={editPrice}
              onChangeText={setEditPrice}
            />

            <TextInput
              style={styles.modalSingleInput}
              placeholder="Max Participants"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={editMaxParticipants}
              onChangeText={setEditMaxParticipants}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Event Description"
              placeholderTextColor="#9ca3af"
              multiline
              value={editDescription}
              onChangeText={setEditDescription}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalSubmit, { backgroundColor: '#2563EB' }]} onPress={handleEditEvent} disabled={editing}>
                {editing ? <ActivityIndicator color="white" /> : <Text style={styles.modalSubmitText}>Save</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  reportButton: { padding: 8, backgroundColor: '#22232A', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  reportText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', backgroundColor: '#22232A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#374151' },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: '700', marginBottom: 15 },
  modalSingleInput: { width: '100%', height: 50, backgroundColor: '#10151C', borderRadius: 12, padding: 15, color: 'white', borderWidth: 1, borderColor: '#374151', marginBottom: 15 },
  modalInput: { width: '100%', height: 100, backgroundColor: '#10151C', borderRadius: 12, padding: 15, color: 'white', textAlignVertical: 'top', borderWidth: 1, borderColor: '#374151', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalCancelText: { color: '#9CA3AF', fontSize: 16, fontWeight: '600' },
  modalSubmit: { backgroundColor: '#ef4444', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  modalSubmitText: { color: 'white', fontSize: 16, fontWeight: '700' },
});

export default EventDetails;
