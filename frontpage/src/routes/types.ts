export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainApp: { screen: string; params?: any; merge?: boolean } | undefined; // Drawer
  EventDetails: { eventId: string } | undefined;
  CategoryResults: undefined;
  EventJoined: undefined;
  EventHosted: undefined;
  SelectLocation: undefined;
  Chat: undefined;
  EsewaPayment: { amount: number; eventId: string; transaction_uuid: string };
  PaymentSuccess: { amount: number; transactionId: string };
  PaymentFailure: undefined;
};
