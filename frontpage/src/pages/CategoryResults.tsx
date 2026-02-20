import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CategoryResults = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  // Destructure category from route params
  const { category } = route.params;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilteredEvents = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        // Matches your backend route: /api/v1/events/category/:category
        const res = await fetch(
          `http://10.0.2.2:3000/api/v1/events/category/${category}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const data = await res.json();

        if (data.success) {
          setEvents(data.events);
        } else {
          console.error('Data fetch unsuccessful:', data.message);
        }
      } catch (err) {
        console.error('Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredEvents();
  }, [category]);

  const renderEventItem = ({ item }: { item: any }) => (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
      onPress={() => navigation.navigate('EventDetails', { eventId: item._id })}
    >
      {/* Event Image */}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ color: '#666' }}>No Image Available</Text>
        </View>
      )}

      {/* Content Container */}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <Text style={styles.info} numberOfLines={1}>
              📍{' '}
              {typeof item.location === 'object'
                ? item.location.address
                : item.location}
            </Text>
          </View>
          <Text style={styles.priceTag}>
            {item.payment?.amount > 0 ? `Rs. ${item.payment.amount}` : 'FREE'}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: 'white', marginTop: 10 }}>
          Loading {category} events...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Navigation */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image
            source={require('../assets/arrow.png')}
            style={styles.backArrow}
          />
        </Pressable>
        <Text style={styles.headerText}>{category} Events</Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={item => item._id}
        renderItem={renderEventItem}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>
              No {category} events available right now.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#10151C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  backButton: {
    marginRight: 15,
  },
  backArrow: {
    width: 20,
    height: 20,

  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#22232A',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  image: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 15,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  desc: {
    color: '#ccc',
    fontSize: 14,
    marginVertical: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#444',
    paddingTop: 10,
  },
  locationContainer: {
    flex: 1,
    marginRight: 10,
  },
  info: {
    color: '#888',
    fontSize: 13,
  },
  priceTag: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CategoryResults;
