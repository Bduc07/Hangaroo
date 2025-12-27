import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const Dashboard = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.firstRow}>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Image source={require('../assets/Boy.png')} style={styles.Boylogo} />
        </Pressable>

        <View style={styles.searchBox}>
          <Image source={require('../assets/Search.png')} style={styles.logo} />
        </View>

        <Image
          source={require('../assets/Bellring.png')}
          style={styles.Bellring}
        />
      </View>

      {/* Circle Preferences */}
      <View style={styles.CircleBox}>
        <Image
          source={require('../assets/Football.png')}
          style={styles.Image}
        />
        <Image
          source={require('../assets/Basketball.png')}
          style={styles.Image}
        />
        <Image source={require('../assets/Dance.png')} style={styles.Image} />
        <Image
          source={require('../assets/Hackathon.png')}
          style={styles.Image}
        />
        <Image source={require('../assets/Hiking.png')} style={styles.Image} />
      </View>

      <View style={styles.ChooseBox}>
        <Text style={styles.ChooseText}>Preference</Text>
      </View>

      {/* Event Boxes */}
      <View style={styles.EventBox}>
        <View style={styles.Event}></View>
        <View style={styles.Event}></View>
        <View style={styles.Event}></View>
        <View style={styles.Event}></View>
      </View>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
    paddingHorizontal: 10,
    paddingTop: 50,
  },
  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  Boylogo: { width: 40, height: 40, borderRadius: 20 },
  searchBox: {
    width: '60%',
    height: 50,
    backgroundColor: '#162233',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#122035',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  logo: { width: 25, height: 25 },
  Bellring: { width: 30, height: 30 },

  CircleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  Image: { width: 70, height: 70, borderRadius: 35 },

  ChooseBox: {
    width: 120,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
  ChooseText: { textAlign: 'center', fontWeight: '700' },

  EventBox: { marginTop: 30 },
  Event: {
    width: '100%',
    height: 130,
    backgroundColor: '#22232A',
    borderRadius: 5,
    marginBottom: 15,
  },
});
