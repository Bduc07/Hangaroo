import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import EventsHosted from '../pages/EventsHosted';
import EventsJoined from '../pages/EventsJoined';
import Achievements from '../pages/Achievements';
import Create from '../pages/Create';

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ onLogout }) => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',

        // ✅ Drawer background color
        drawerStyle: {
          backgroundColor: '#10151C',
          width: 260,
        },

        // ✅ Drawer item spacing
        drawerItemStyle: {
          marginVertical: 8,
          borderRadius: 10,
        },

        // ✅ Label styling
        drawerLabelStyle: {
          color: 'white',
          fontSize: 16,
          marginLeft: -10,
        },

        // ✅ Active / inactive colors
        drawerActiveBackgroundColor: '#22232A',
        drawerActiveTintColor: '#3B82F6',
        drawerInactiveTintColor: '#B0B0B0',
      }}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} />

      <Drawer.Screen name="Profile">
        {props => <Profile {...props} onLogout={onLogout} />}
      </Drawer.Screen>

      <Drawer.Screen name="Events Hosted" component={EventsHosted} />
      <Drawer.Screen name="Events Joined" component={EventsJoined} />
      <Drawer.Screen name="Achievements" component={Achievements} />
      <Drawer.Screen name="Create Event" component={Create} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
