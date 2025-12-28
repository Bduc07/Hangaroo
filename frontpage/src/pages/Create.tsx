import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../routes/types';

import React from 'react';
type CreateNavProp = NativeStackNavigationProp<RootStackParamList, 'Create'>;
const Create = () => {
  const navigation = useNavigation<CreateNavProp>();
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Image
          source={require('../assets/arrow.png')}
          style={styles.backArrow}
        />
      </Pressable>

      {/* Header */}
      <Text style={styles.EventText}>New Event</Text>

      {/* Cover Photo Box */}
      <View style={styles.photo}>
        <Text style={styles.editPhotoText}>Edit Cover Photo</Text>
      </View>

      {/* Event Name */}
      <Text style={styles.Title}>Event Name</Text>
      <View style={styles.Box1} />

      {/* Location */}
      <Text style={styles.location}>Location</Text>
      <View style={styles.Box2} />

      <Text style={styles.location}>Description</Text>
      <View style={styles.Box3} />
      <Text style={styles.location}>Maximum Participants</Text>
      <View style={styles.Box3} />

      {/* Date & Time */}
      <Text style={styles.Time}>Date & Time</Text>
      <View style={styles.startBox}>
        <Text style={styles.startText}>Starts Today, 8:00</Text>
      </View>
      <View style={styles.endBox}>
        <Text style={styles.endText}>Ends Today, 11:00</Text>
      </View>

      {/* Category */}
      <Text style={styles.category}>Category</Text>
      <View style={styles.MainCategory}>
        <View style={[styles.categorybox, styles.selectedCategory]}>
          <Text style={styles.categoryText}>Party</Text>
        </View>
        <View style={styles.categorybox}>
          <Text style={styles.categoryText}>Music</Text>
        </View>
        <View style={styles.categorybox}>
          <Text style={styles.categoryText}>Workshop</Text>
        </View>
        <View style={styles.categorybox}>
          <Text style={styles.categoryText}>Business</Text>
        </View>
      </View>
      <Text style={styles.paymentTitle}>Payment Details</Text>
      <View style={styles.paymentHeader}>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={styles.paymentMethodLabel}>Payment Method</Text>
      </View>

      <View style={styles.payment}>
        <View style={styles.priceBox}>
          <Text style={styles.priceText}>$ 0.00</Text>
        </View>

        <View style={styles.paymentMethodBox}>
          <Text style={styles.paymentMethodText}>Bank Transfer</Text>
        </View>
      </View>
      {/* Publish Button */}
      <View style={styles.publishButton}>
        <Text style={styles.publishText}>Publish Event</Text>
      </View>
    </ScrollView>
  );
};

export default Create;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },

  backArrow: {
    width: 24,
    height: 24,
  },

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
    backgroundColor: 'black',
    borderColor: '#666666',
    borderWidth: 2,
    marginLeft: 20,
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoText: {
    color: '#888',
    fontSize: 16,
  },
  Box1: {
    width: '90%',
    height: 70,
    borderRadius: 5,
    backgroundColor: '#22232A',
    borderColor: '#616161',
    borderWidth: 2,
    marginBottom: 30,
    marginLeft: 19,
  },
  Box2: {
    width: '90%',
    height: 70,
    borderRadius: 5,
    backgroundColor: '#22232A',
    borderColor: '#616161',
    borderWidth: 2,
    marginBottom: 35,
    marginLeft: 19,
  },
  Box3: {
    width: '90%',
    height: 70,
    borderRadius: 5,
    backgroundColor: '#22232A',
    borderColor: '#616161',
    borderWidth: 2,
    marginBottom: 35,
    marginLeft: 19,
  },
  Box4: {
    width: '90%',
    height: 70,
    borderRadius: 5,
    backgroundColor: '#22232A',
    borderColor: '#616161',
    borderWidth: 2,
    marginBottom: 35,
    marginLeft: 19,
  },
  Title: {
    color: 'white',
    fontSize: 20,
    marginLeft: 20,
    marginTop: 20,
    fontWeight: 'bold',
  },
  location: {
    color: 'white',
    fontSize: 20,
    marginLeft: 20,
    fontWeight: 'bold',
  },
  Time: {
    color: 'white',
    fontSize: 20,
    marginLeft: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  startBox: {
    width: '90%',
    height: 70,
    borderRadius: 5,
    backgroundColor: '#22232A',
    borderColor: '#616161',
    borderWidth: 2,
    marginLeft: 19,
    justifyContent: 'center',
  },
  startText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 15,
  },
  endBox: {
    width: '90%',
    height: 70,
    borderRadius: 5,
    backgroundColor: '#22232A',
    borderColor: '#616161',
    borderWidth: 2,
    marginTop: 10,
    marginLeft: 19,
    justifyContent: 'center',
  },
  endText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 15,
  },
  category: {
    color: 'white',
    fontSize: 20,
    marginLeft: 20,
    marginTop: 25,
    fontWeight: 'bold',
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
  selectedCategory: {
    backgroundColor: '#3B82F6', // blue like in the screenshot for "Party"
  },
  categoryText: {
    color: 'white',
    fontSize: 16,
  },

  // Payment Section
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },

  payment: {
    flexDirection: 'row',
  },
  paymentTitle: {
    color: 'white',
    fontSize: 20,
    marginLeft: 20,
    marginTop: 30,
    fontWeight: 'bold',
  },
  priceLabel: {
    color: 'white',
    fontSize: 18,
    marginRight: 90,
    marginTop: 20,
  },
  priceBox: {
    width: '30%',
    height: 70,
    borderRadius: 5,
    backgroundColor: '#22232A',
    borderColor: '#616161',
    borderWidth: 2,
    marginLeft: 19,
    marginTop: 10,
    justifyContent: 'center',
    paddingLeft: 15,
  },
  priceText: {
    color: 'white',
    fontSize: 20,
    marginLeft: 5,
  },
  paymentMethodLabel: {
    color: 'white',
    fontSize: 18,
    marginLeft: 20,
    marginTop: 20,
  },
  paymentMethodBox: {
    width: '60%',
    height: 70,
    borderRadius: 5,
    backgroundColor: '#22232A',
    borderColor: '#616161',
    borderWidth: 2,
    marginLeft: 19,
    marginTop: 10,
    justifyContent: 'center',
    paddingLeft: 15,
    marginBottom: 30,
  },
  paymentMethodText: {
    color: 'white',
    fontSize: 18,
  },
  publishButton: {
    width: '90%',
    height: 60,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  publishText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
