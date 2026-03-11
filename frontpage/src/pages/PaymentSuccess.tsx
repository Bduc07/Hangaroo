import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PaymentSuccess = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.success}>Payment Successful ✅</Text>
      <Text style={styles.txn}>Transaction ID: TEST{Date.now()}</Text>
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
  success: {
    color: '#22C55E',
    fontSize: 24,
    fontWeight: '700',
  },
  txn: {
    color: 'white',
    marginTop: 15,
  },
});

export default PaymentSuccess;
