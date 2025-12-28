import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../routes/types';

type EventsHostedNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'EventsHosted'
>;

const EventsJoined = () => {
  const navigation = useNavigation<EventsHostedNavProp>();
  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <Pressable style={styles.backArrow} onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/arrow.png')}
          style={styles.arrowIcon}
        />
      </Pressable>
      <View style={styles.Event}></View>
      <View style={styles.Event}></View>
      <View style={styles.Event}></View>
      <View style={styles.Event}></View>
      <View style={styles.Event}></View>
    </View>
  );
};

export default EventsJoined;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
    justifyContent: 'space-around',
  },
  Event: {
    width: '83%',
    height: 130,
    backgroundColor: '#22232A',
    borderRadius: 5,
    marginLeft: 43,
  },
  backArrow: {
    position: 'absolute',
    top: 55,
    left: 10,
    zIndex: 10,
  },

  arrowIcon: {
    width: 24,
    height: 24,
  },
});
