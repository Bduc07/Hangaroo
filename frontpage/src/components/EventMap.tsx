import React from 'react';
import { View, Button, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';

// Define the event type
type Event = {
  latitude: number;
  longitude: number;
  title: string;
};

type Props = {
  event: Event;
};

const EventMap: React.FC<Props> = ({ event }) => {
  const openDirections = () => {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`,
    );
  };

  const initialRegion: Region = {
    latitude: event.latitude,
    longitude: event.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_DEFAULT} // Free OpenStreetMap tiles
        showsUserLocation={true}
        initialRegion={initialRegion}
      >
        <Marker
          coordinate={{ latitude: event.latitude, longitude: event.longitude }}
          title={event.title}
        />
      </MapView>

      <Button title="Get Directions" onPress={openDirections} />
    </View>
  );
};

export default EventMap;
