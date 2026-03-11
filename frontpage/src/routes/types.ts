export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainApp: undefined; // Drawer
  EventDetails: { eventId: string } | undefined;
  CategoryResults: undefined;
  EventJoined: undefined;
  EventHosted: undefined;
  SelectLocation: {
    onLocationSelect: (coords: { latitude: number; longitude: number }) => void;
  };
};
