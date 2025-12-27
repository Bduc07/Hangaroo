import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from './types';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import DrawerNavigator from './DrawerNavigator';

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

  if (isLoggedIn === null) return null; // splash screen could be here

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="MainApp">
          {props => (
            <DrawerNavigator {...props} onLogout={() => setIsLoggedIn(false)} />
          )}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Login">
            {props => <Login {...props} onLogin={setIsLoggedIn} />}
          </Stack.Screen>
          <Stack.Screen name="SignUp" component={SignUp} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
