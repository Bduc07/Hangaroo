import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const PaymentScreen = ({ navigation, route }: any) => {
  const { amount } = route.params;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('PaymentSuccess');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan to Pay</Text>
      <Text style={styles.subtitle}>Demo Mode - eSewa Test</Text>

      <View style={styles.qrBox}>
        <QRCode value={`DEMO_PAYMENT_${amount}_${Date.now()}`} size={200} />
      </View>

      <Text style={styles.amount}>Amount: Rs. {amount}</Text>

      <ActivityIndicator
        size="large"
        color="#2563EB"
        style={{ marginTop: 20 }}
      />
      <Text style={styles.processing}>Processing Payment...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    marginBottom: 20,
  },
  qrBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
  },
  amount: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  processing: {
    color: '#9CA3AF',
    marginTop: 10,
  },
});

export default PaymentScreen;
