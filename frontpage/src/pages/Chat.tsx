import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


//Hiii

const Chat = () => {
  const navigation = useNavigation<any>();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Use useFocusEffect so it refreshes whenever the user opens the tab
  useFocusEffect(
    React.useCallback(() => {
      fetchJoinedEvents();
    }, [])
  );

  const fetchJoinedEvents = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      // Fetch active (ongoing) events the user has joined
      const activeRes = await axios.get('http://10.0.2.2:3000/api/v1/events/joined-active', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch completed events the user has joined
      const completedRes = await axios.get('http://10.0.2.2:3000/api/v1/events/joined', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Combine both lists
      const allEvents = [...activeRes.data.events, ...completedRes.data.events];

      // Remove duplicates just in case
      const uniqueEvents = Array.from(new Map(allEvents.map(item => [item._id, item])).values());

      setEvents(uniqueEvents);
    } catch (error) {
      console.log('Error fetching joined events');
    } finally {
      setLoading(false);
    }
  };

  const openChat = (event: any) => {
    navigation.navigate('EventChat', {
      eventId: event._id,
      eventTitle: event.title,
    });
  };

  const renderItem = ({ item }: any) => (
    <Pressable style={styles.chatItem} onPress={() => openChat(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.title.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.chatInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventSubtitle}>Tap to open chat</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>{'<'}</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Messages</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : events.length === 0 ? (
        /* Empty State */
        <View style={styles.content}>
          <Image
            source={require('../assets/message.png')}
            style={styles.emptyIcon}
          />

          <Text style={styles.emptyTitle}>No Conversations Yet</Text>

          <Text style={styles.emptySubtitle}>
            Events you join will appear here so you can chat with the group.
          </Text>
        </View>
      ) : (
        /* Event Chat List */
        <FlatList
          data={events}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      )}
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#10151C',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#1A222D',
  },

  backButton: {
    padding: 10,
  },

  backText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 40,
  },

  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 40,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 100,
    height: 100,
    opacity: 0.2,
    marginBottom: 20,
    resizeMode: 'contain',
  },

  emptyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  emptySubtitle: {
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1A222D',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },

  chatInfo: {
    flex: 1,
  },

  eventTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  eventSubtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 3,
  },
});
