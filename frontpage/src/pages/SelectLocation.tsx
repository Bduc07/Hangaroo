import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Platform,
  PermissionsAndroid,
  Pressable,
  TextInput,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../routes/types'; // your navigation types

type Props = NativeStackScreenProps<RootStackParamList, 'SelectLocation'>;

export default function SelectLocation({ navigation, route }: Props) {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [region, setRegion] = useState({
    latitude: 27.7172,
    longitude: 85.324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedMarker, setSelectedMarker] = useState({
    latitude: 27.7172,
    longitude: 85.324,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need your location to show it on the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED)
        setHasLocationPermission(true);
      else Alert.alert('Location permission denied');
    } else {
      setHasLocationPermission(true);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery,
        )}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'HangarooApp/1.0',
          },
        }
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        setRegion({
          ...region,
          latitude: lat,
          longitude: lon,
        });
        setSelectedMarker({
          latitude: lat,
          longitude: lon,
        });
        setLocationName(data[0].display_name);
      } else {
        Alert.alert('Not Found', 'Could not find that location');
      }
    } catch (err) {
      console.log('Search error:', err);
      Alert.alert('Error', 'Failed to search location');
    }
  };

  const onMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedMarker({ latitude, longitude });
    setRegion({ ...region, latitude, longitude });

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'HangarooApp/1.0',
          },
        }
      );
      const data = await res.json();
      if (data && data.display_name) {
        setLocationName(data.display_name);
      } else {
        setLocationName('');
      }
    } catch (err) {
      console.log('Reverse geocoding error:', err);
    }
  };

  const confirmLocation = () => {
    navigation.navigate('MainApp', {
      screen: 'Create Event',
      merge: true,
      params: {
        selectedLocation: selectedMarker,
        locationName: locationName || searchQuery,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Event Location</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchLocation}
        />
        <Pressable style={styles.searchButton} onPress={searchLocation}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton
        mapType="standard"
        onPress={onMapPress}
      >
        <Marker coordinate={selectedMarker} title="Selected Location" />
      </MapView>

      <Pressable style={styles.confirmButton} onPress={confirmLocation}>
        <Text style={styles.confirmText}>Confirm Location</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  map: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9'
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 8
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  confirmText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
