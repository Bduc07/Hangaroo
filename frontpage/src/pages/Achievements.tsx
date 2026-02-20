import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Achievements = () => {
  // 1. All Hooks must stay at the very top, in the same order every time
  const navigation = useNavigation();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasHosted, setHasHosted] = useState(false);

  const badges = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Joined your first event',
      unlocked: true, // Usually unlocked by default after signup
      icon: '🌱',
    },
    {
      id: '2',
      title: 'Social Butterfly',
      description: 'Earned 250 points',
      unlocked: points >= 250, // Unlocks at 250 pts
      icon: '🦋',
    },
    {
      id: '3',
      title: 'Point Master',
      description: 'Earned 500 points',
      unlocked: points >= 500, // Unlocks at 500 pts
      icon: '💎',
    },
    {
      id: '4',
      title: 'Event Host',
      description: 'Hosted your first event',
      unlocked: hasHosted, // Unlocks if you've created an event
      icon: '🎤',
    },
  ];

  // 2. Wrap fetch logic in useCallback or keep it inside useEffect to prevent re-renders
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // Ensure the URL matches your index.js route: /api/v1/user/profile
      const res = await fetch('http://10.0.2.2:3000/api/v1/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setPoints(data.user.points || 0);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/arrow.png')}
            style={styles.arrowIcon}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Achievements</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#A855F7" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={badges}
          keyExtractor={item => item.id}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#A855F7"
            />
          }
          ListHeaderComponent={
            <View style={styles.pointsCard}>
              <Text style={styles.pointsLabel}>Total Balance</Text>
              <Text style={styles.pointsValue}>{points} PTS</Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min((points / 1000) * 100, 100)}%` },
                  ]}
                />
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[styles.badgeCard, !item.unlocked && { opacity: 0.4 }]}
            >
              <Text style={{ fontSize: 40 }}>
                {item.unlocked ? item.icon : '🔒'}
              </Text>
              <Text style={styles.badgeTitle}>{item.title}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10151C' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginLeft: 55,
    
  },
  arrowIcon: { width: 15, height: 15 },
  pointsCard: {
    backgroundColor: '#1E293B',
    margin: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  pointsLabel: { color: '#94A3B8', fontSize: 14 },
  pointsValue: { color: '#A855F7', fontSize: 48, fontWeight: 'bold' },
  progressBarBg: {
    height: 8,
    width: '100%',
    backgroundColor: '#334155',
    borderRadius: 4,
    marginTop: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 4,
  },
  badgeCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    margin: 10,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  badgeTitle: { color: 'white', marginTop: 10, fontWeight: 'bold' },
});

export default Achievements;
