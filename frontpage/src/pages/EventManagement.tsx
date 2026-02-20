import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../routes/types';

const { width } = Dimensions.get('window');

type EventManagementRouteProp = RouteProp<
  RootStackParamList,
  'EventManagement'
>;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'EventManagement'>;

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
  // 1. Hooks (Must be at the top level)
  const route = useRoute<EventManagementRouteProp>();
  const navigation = useNavigation<NavProp>();
  const { eventId } = route.params;

  // 2. State
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  // 3. Data Fetching
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
      if (data.success) {
        setEvent(data.event);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Attendance Logic (Only declared ONCE to prevent SyntaxError)
  const toggleAttendance = (participantId: string) => {
    setEvent(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: prev.participants.map(p =>
          p._id === participantId ? { ...p, attended: !p.attended } : p,
        ),
      };
    });
  };

  // 5. Finalize Event (Awards 50 points)
  const handleCompleteEvent = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const attendedIds = event?.participants
        .filter(p => p.attended)
        .map(p => p._id);

      const res = await fetch(
        `http://10.0.2.2:3000/api/v1/events/${eventId}/complete`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ attendedParticipantIds: attendedIds }),
        },
      );

      const data = await res.json();
      if (data.success) {
        setShowPopup(true); // Show the purple trophy popup
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to complete event');
    }
  };

  // 6. UI Components
  const renderParticipant = ({ item }: { item: Participant }) => (
    <View style={styles.participantBox}>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.participantEmail}>{item.email}</Text>
      </View>
      <Pressable
        style={[
          styles.attendanceBtn,
          { backgroundColor: item.attended ? '#10B981' : '#3B82F6' },
        ]}
        onPress={() => toggleAttendance(item._id)}
      >
        <Text style={styles.btnText}>{item.attended ? 'Present' : 'Mark'}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* SUCCESS MODAL */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.trophyCircle}>
              <Text style={{ fontSize: 40 }}>🏆</Text>
            </View>
            <Text style={styles.modalTitle}>Event Complete!</Text>
            <Text style={styles.modalPoints}>+50</Text>
            <Text style={styles.pointsSub}>POINTS EARNED</Text>
            <Text style={styles.modalDesc}>
              Attendance confirmed for {event?.title}.
            </Text>
            <Pressable
              style={styles.collectBtn}
              onPress={() => {
                setShowPopup(false);
                navigation.navigate('ManageEvents');
              }}
            >
              <Text style={styles.collectText}>Collect</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3B82F6"
          style={{ marginTop: 50 }}
        />
      ) : event ? (
        <>
          <View style={styles.headerCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {event.participants.length}
                </Text>
                <Text style={styles.statLabel}>Joined</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {event.participants.filter(p => p.attended).length}
                </Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Participant List</Text>
          <FlatList
            data={event.participants}
            renderItem={renderParticipant}
            keyExtractor={item => item._id}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          <View style={styles.footer}>
            <Pressable
              style={styles.completeBtn}
              onPress={() => {
                Alert.alert(
                  'End Event',
                  'Mark present users and award points?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Confirm', onPress: handleCompleteEvent },
                  ],
                );
              }}
            >
              <Text style={styles.completeBtnText}>End & Complete Event</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10151C' },
  headerCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  eventTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNumber: { color: '#3B82F6', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    margin: 20,
  },
  participantBox: {
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#22232A',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  participantInfo: { flex: 1 },
  participantName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  participantEmail: { color: '#94A3B8', fontSize: 13 },
  attendanceBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: '#10151C',
  },
  completeBtn: {
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  // Popup Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#10151C',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A855F7',
  },
  modalTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  modalPoints: { color: '#A855F7', fontSize: 48, fontWeight: '900' },
  pointsSub: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalDesc: { color: '#94A3B8', textAlign: 'center', marginBottom: 25 },
  collectBtn: { padding: 10 },
  collectText: { color: '#94A3B8', fontSize: 16 },
});

export default EventManagement;
