import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from './types';

// Pages
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import DrawerNavigator from './DrawerNavigator';
import EventDetails from '../pages/EventDetails';
import Notifications from '../pages/Notifications';
import CategoryResults from '../pages/CategoryResults';
import EventsHosted from '../pages/EventsHosted'; // Add this
import EventsJoined from '../pages/EventsJoined'; // Add this

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login">
            {props => <Login {...props} onLogin={setIsLoggedIn} />}
          </Stack.Screen>
          <Stack.Screen name="SignUp" component={SignUp} />
        </>
      ) : (
        <>
          {/* Main App Container (Drawer) */}
          <Stack.Screen name="MainApp">
            {props => (
              <DrawerNavigator
                {...props}
                onLogout={() => setIsLoggedIn(false)}
              />
            )}
          </Stack.Screen>

          {/* Sub-Screens (These will now support goBack) */}
          <Stack.Screen name="EventDetails" component={EventDetails} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="CategoryResults" component={CategoryResults} />
          <Stack.Screen name="EventsHosted" component={EventsHosted} />
          <Stack.Screen name="EventsJoined" component={EventsJoined} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
