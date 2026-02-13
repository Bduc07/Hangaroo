import React,{useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/routes/AppNavigator';
import { configureGoogleSignIn } from './src/config/googleAuth';

const App = () => {
   useEffect(() => {
     configureGoogleSignIn();
   }, []);
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
