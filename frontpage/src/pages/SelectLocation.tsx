import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Platform,
  PermissionsAndroid,
  Pressable,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './typ'; // your navigation types

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

  const onMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedMarker({ latitude, longitude });
    setRegion({ ...region, latitude, longitude });
  };

  const confirmLocation = () => {
    if (route.params?.onLocationSelect) {
      route.params.onLocationSelect(selectedMarker); // pass back to Create Event
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Event Location</Text>
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
  confirmButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  confirmText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
