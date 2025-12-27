import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ onLogout }) => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
      }}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Profile">
        {props => <Profile {...props} onLogout={onLogout} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
