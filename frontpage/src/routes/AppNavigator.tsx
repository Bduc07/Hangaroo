import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import type { RootStackParamList } from './types';

// Pages
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import DrawerNavigator from './DrawerNavigator';
import EventDetails from '../pages/EventDetails';
import Notifications from '../pages/Notifications';
import CategoryResults from '../pages/CategoryResults';
import EventsHosted from '../pages/EventsHosted';
import EventsJoined from '../pages/EventsJoined';
import PaymentScreen from '../pages/PaymentScreen';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFailure from '../pages/PaymentFailure';
import SelectLocation from '../pages/SelectLocation';
import Chat from '../pages/Chat';
import EventChat from '../pages/EventChat';
import EsewaPayment from '../pages/EsewaPayment';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsLoggedIn(!!token);
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  // Show a loading spinner while checking AsyncStorage to prevent "flash"
  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF3E61" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        // --- AUTH STACK ---
        <Stack.Group screenOptions={{ animation: 'fade' }}>
          <Stack.Screen name="Login">
            {props => <Login {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
          <Stack.Screen name="SignUp" component={SignUp} />
        </Stack.Group>
      ) : (
        // --- APP STACK ---
        <Stack.Group>
          <Stack.Screen name="MainApp">
            {props => (
              <DrawerNavigator
                {...props}
                onLogout={async () => {
                  await AsyncStorage.removeItem('token');
                  setIsLoggedIn(false);
                }}
              />
            )}
          </Stack.Screen>

          {/* Sub-Screens */}
          <Stack.Screen name="EventDetails" component={EventDetails} />
          <Stack.Screen name="EsewaPayment" component={EsewaPayment} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="CategoryResults" component={CategoryResults} />
          <Stack.Screen name="EventsHosted" component={EventsHosted} />
          <Stack.Screen name="EventsJoined" component={EventsJoined} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="EventChat" component={EventChat} />
          <Stack.Screen
            name="SelectLocation"
            component={SelectLocation}
            options={{ title: 'Pick Location', headerShown: true }}
          />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
          <Stack.Screen name="PaymentFailure" component={PaymentFailure} />
       
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
