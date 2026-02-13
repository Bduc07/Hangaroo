import { GoogleSignin } from '@react-native-google-signin/google-signin';

// frontend/src/config/googleAuth.js
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId:
      '648562511944-8ge762038einhanai1st5ugc6jbv5pgk.apps.googleusercontent.com', // Your WEB client ID

    offlineAccess: true,
  });
};
