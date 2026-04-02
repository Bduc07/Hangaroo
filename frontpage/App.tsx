import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/routes/AppNavigator';
import { configureGoogleSignIn } from './src/config/googleAuth';

const App = () => {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;
