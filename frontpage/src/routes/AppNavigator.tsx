import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from './types';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import DrawerNavigator from './DrawerNavigator';
import EventDetails from '../pages/EventDetails'; // ✅ Add your EventDetails screen

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

  if (isLoggedIn === null) return null; // optional: splash screen

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
          {/* Drawer screens */}
          <Stack.Screen name="MainApp">
            {props => (
              <DrawerNavigator
                {...props}
                onLogout={() => setIsLoggedIn(false)}
              />
            )}
          </Stack.Screen>

          {/* Screens outside drawer */}
          <Stack.Screen name="EventDetails" component={EventDetails} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
