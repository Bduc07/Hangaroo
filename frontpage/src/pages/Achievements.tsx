import { StyleSheet, View, Image, Pressable } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../routes/types';

type AchievementsNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Achievements'
>;

const Achievements = () => {
  const navigation = useNavigation<AchievementsNavProp>();

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <Pressable style={styles.backArrow} onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/arrow.png')}
          style={styles.arrowIcon}
        />
      </Pressable>
    </View>
  );
};

export default Achievements;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
  },
  backArrow: {
    position: 'absolute',
    top: 55,
    left: 20,
    zIndex: 10,
  },
  arrowIcon: {
    width: 24,
    height: 24,
  },
});
