import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Image,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../routes/types';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CreateNavProp = NativeStackNavigationProp<RootStackParamList, 'MainApp'>;

const categoryMapping: Record<string, string> = {
  Sports: 'Sports',
  Social: 'Festivals',
  Education: 'Workshop',
  Business: 'Business',
  Other: 'Other',
};

const Create = () => {
  const navigation = useNavigation<CreateNavProp>();

  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [category, setCategory] = useState('Sports');
  const [price, setPrice] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Image picker error');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setCoverPhoto(response.assets[0].uri || null);
      }
    });
  };

  const publishEvent = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('maxParticipants', maxParticipants);
      formData.append('startTime', new Date().toISOString());
      formData.append('endTime', new Date().toISOString());
      formData.append('category', categoryMapping[category] || 'Other');
      formData.append('price', price);
      formData.append('paymentMethod', paymentMethod);

      if (coverPhoto) {
        formData.append('coverPhoto', {
          uri: coverPhoto,
          type: 'image/jpeg',
          name: 'event.jpg',
        } as any);
      }

      const response = await fetch('http://10.0.2.2:3000/api/v1/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.error || 'Failed to create event');
        return;
      }

      Alert.alert('Success', 'Event created successfully');
      navigation.navigate('Dashboard'); // ✅ Jump to dashboard
    } catch (err) {
      console.error('Publish Event Error:', err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Back button */}
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Image
          source={require('../assets/arrow.png')}
          style={styles.backArrow}
        />
      </Pressable>

      <Text style={styles.EventText}>New Event</Text>

      <Pressable style={styles.photo} onPress={pickImage}>
        {coverPhoto ? (
          <Image source={{ uri: coverPhoto }} style={styles.coverImage} />
        ) : (
          <Text style={styles.editPhotoText}>Edit Cover Photo</Text>
        )}
      </Pressable>

      {/* Inputs */}
      <Text style={styles.Title}>Event Name</Text>
      <View style={styles.Box}>
        <TextInput
          placeholder="Enter event name"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
          style={{ color: 'white', padding: 15, fontSize: 18 }}
        />
      </View>

      <Text style={styles.Title}>Location</Text>
      <View style={styles.Box}>
        <TextInput
          placeholder="Enter location"
          placeholderTextColor="#888"
          value={location}
          onChangeText={setLocation}
          style={{ color: 'white', padding: 15, fontSize: 18 }}
        />
      </View>

      <Text style={styles.Title}>Description</Text>
      <View style={styles.Box}>
        <TextInput
          placeholder="Enter description"
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ color: 'white', padding: 15, fontSize: 18 }}
        />
      </View>

      <Text style={styles.Title}>Maximum Participants</Text>
      <View style={styles.Box}>
        <TextInput
          placeholder="Enter max participants"
          placeholderTextColor="#888"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          keyboardType="numeric"
          style={{ color: 'white', padding: 15, fontSize: 18 }}
        />
      </View>

      <Text style={styles.Title}>Category</Text>
      <View style={styles.MainCategory}>
        {['Sports', 'Social', 'Education', 'Business', 'Other'].map(item => (
          <Pressable
            key={item}
            style={[
              styles.categorybox,
              category === item && styles.selectedCategory,
            ]}
            onPress={() => setCategory(item)}
          >
            <Text style={styles.categoryText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.Title}>Payment</Text>
      <View style={styles.Box}>
        <TextInput
          placeholder="Amount"
          placeholderTextColor="#888"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={{ color: 'white', padding: 15, fontSize: 18 }}
        />
      </View>

      <View style={styles.Box}>
        <TextInput
          placeholder="Payment Method"
          placeholderTextColor="#888"
          value={paymentMethod}
          onChangeText={setPaymentMethod}
          style={{ color: 'white', padding: 15, fontSize: 18 }}
        />
      </View>

      <Pressable style={styles.publishButton} onPress={publishEvent}>
        <Text style={styles.publishText}>Publish Event</Text>
      </Pressable>
    </ScrollView>
  );
};

export default Create;

// Styles remain same as before

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10151C' },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  backArrow: { width: 24, height: 24 },
  EventText: {
    color: 'white',
    fontSize: 32,
    alignSelf: 'center',
    marginTop: 60,
    fontWeight: 'bold',
  },
  photo: {
    width: '90%',
    height: 180,
    backgroundColor: '#22232A',
    borderColor: '#666666',
    borderWidth: 2,
    marginLeft: 20,
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 10,
  },
  coverImage: { width: '100%', height: '100%' },
  editPhotoText: { color: '#888', fontSize: 16 },
  Title: {
    color: 'white',
    fontSize: 20,
    marginLeft: 20,
    marginTop: 20,
    fontWeight: 'bold',
  },
  Box: {
    width: '90%',
    height: 70,
    backgroundColor: '#22232A',
    borderColor: '#616161',
    borderWidth: 2,
    marginBottom: 30,
    marginLeft: 19,
    justifyContent: 'center',
    borderRadius: 10,
  },
  MainCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  categorybox: {
    width: 100,
    height: 50,
    backgroundColor: '#22232A',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCategory: { backgroundColor: '#3B82F6' },
  categoryText: { color: 'white', fontSize: 16 },
  publishButton: {
    width: '90%',
    height: 60,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  publishText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});
