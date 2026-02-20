import React from 'react';
import { Image } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import EventsHosted from '../pages/EventsHosted';
import EventsJoined from '../pages/EventsJoined';
import Achievements from '../pages/Achievements';
import Create from '../pages/Create';
import ManageEvents from '../pages/ManageEvents';
import EventManagement from '../pages/EventManagement';

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ onLogout }) => {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        drawerStyle: { backgroundColor: '#10151C', width: 260 },
        drawerItemStyle: { 
          marginVertical: 10, 
          borderRadius: 10,
          paddingHorizontal: 10,
        },
        drawerLabelStyle: { 
          fontSize: 16, 
          marginLeft: 15, // Your requested space between icon and words
          color: 'white' 
        },
        // This adds a subtle dark-grey highlight that blends with your background
        drawerActiveBackgroundColor: '#1E293B', 
        drawerActiveTintColor: '#3B82F6', // Words turn blue when selected
        drawerInactiveTintColor: '#B0B0B0',
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          drawerIcon: ({ size }) => (
            <Image
              source={require('../assets/home.png')}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Profile"
        component={Profile}
        initialParams={{ onLogout }}
        options={{
          drawerIcon: ({ size }) => (
            <Image
              source={require('../assets/profile.png')}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Create Event"
        component={Create}
        options={{
          drawerIcon: ({ size }) => (
            <Image
              source={require('../assets/create.png')}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Drawer.Screen
        name="ManageEvents"
        component={ManageEvents}
        options={{
          drawerLabel: 'Manage Events',
          drawerIcon: ({ size }) => (
            <Image
              source={require('../assets/manage.png')}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Events Hosted"
        component={EventsHosted}
        options={{
          drawerIcon: ({ size }) => (
            <Image
              source={require('../assets/hosted.png')}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Events Joined"
        component={EventsJoined}
        options={{
          drawerIcon: ({ size }) => (
            <Image
              source={require('../assets/joined.png')}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Achievements"
        component={Achievements}
        options={{
          drawerIcon: ({ size }) => (
            <Image
              source={require('../assets/achievement.png')}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* Hidden from sidebar */}
      <Drawer.Screen
        name="EventManagement"
        component={EventManagement}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;