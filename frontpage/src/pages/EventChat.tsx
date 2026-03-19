import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = 'http://10.0.2.2:3000';
const socket = io(SOCKET_URL);

const EventChat = ({ route }: any) => {
  const { eventId, eventTitle } = route.params;

  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadUser();
    loadMessages();

    // If already connected, join the room immediately
    if (socket.connected) {
      console.log('Socket already connected', socket.id);
      socket.emit('join_event', eventId);
      setIsConnected(true);
    }

    // Connect & Disconnect Listeners
    socket.on('connect', () => {
      console.log('Socket connected', socket.id);
      setIsConnected(true);
      socket.emit('join_event', eventId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('receive_message', msg => {
      if (msg.senderId && msg.senderName) {
        setMessages(prev => [...prev, msg]);
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      } else {
        console.warn('❌ senderId or senderName missing');
      }
    });

    return () => {
      socket.emit('leave_event', eventId);
      socket.off('receive_message');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Fallback for basic functionality if user is not logged in
        generateGuest();
        return;
      }

      const res = await axios.get(`${SOCKET_URL}/api/v1/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = res.data?.user;
      if (user && user._id) {
        setUserId(user._id);
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        setUserName(name || 'Anonymous User');
      } else {
        generateGuest();
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      generateGuest();
    }
  };

  const generateGuest = () => {
    const randomId = 'guest_' + Math.random().toString(36).substring(7);
    setUserId(randomId);
    setUserName('Guest ' + randomId.substring(6, 10));
  };

  const loadMessages = async () => {
    try {
      const res = await axios.get(`${SOCKET_URL}/api/chat/messages/${eventId}`);
      setMessages(res.data);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        200,
      );
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    if (!userId || !userName) return Alert.alert('Error', 'User info missing');

    const msgData = {
      eventId,
      senderId: userId,
      senderName: userName,
      text: message.trim(),
      createdAt: new Date().toISOString(), // Optimistic dummy timestamp
    };

    socket.emit('send_message', msgData);

    setMessages(prev => [...prev, msgData]);
    setMessage('');
    // Auto-scrolling is handled via FlatList's onContentSizeChange
  };

  const renderMessage = ({ item }: any) => {
    const isMyMessage = item.senderId === userId;
    
    // Attempt formatting time gracefully
    let timeString = '';
    if (item.createdAt) {
      timeString = new Date(item.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        <Text style={styles.messageText}>{item.text}</Text>
        {!!timeString && (
          <Text style={styles.timestampText}>{timeString}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{eventTitle}</Text>
        <Text style={[styles.statusText, isConnected ? styles.connected : styles.disconnected]}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 15 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type message..."
            placeholderTextColor="#888"
            style={styles.input}
          />
          <Pressable style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EventChat;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#10151C' },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1A222D',
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  statusText: { fontSize: 12, marginTop: 2 },
  connected: { color: '#4ADE80' },
  disconnected: { color: '#F87171' },
  messageContainer: {
    maxWidth: '75%',
    padding: 10,
    marginVertical: 6,
    borderRadius: 10,
  },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#2563EB' },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: '#1A222D' },
  senderName: { color: '#4DA6FF', fontSize: 12, marginBottom: 3 },
  messageText: { color: 'white', fontSize: 15 },
  timestampText: { 
    color: 'rgba(255,255,255,0.6)', 
    fontSize: 10, 
    alignSelf: 'flex-end', 
    marginTop: 4 
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#1A222D',
  },
  input: {
    flex: 1,
    backgroundColor: '#1A222D',
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  sendText: { color: 'white', fontWeight: 'bold' },
});
  
  