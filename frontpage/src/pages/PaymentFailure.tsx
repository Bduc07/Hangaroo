import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentFailure = () => {
  const navigation = useNavigation<any>();

   return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={[styles.statusIcon, styles.failureIcon]}>
            <Text style={[styles.statusIconText, styles.failureIconText]}>!</Text>
          </View>

          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.message}>
            Unfortunately, your payment could not be processed at this time.
            Please try again or use a different payment method.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.button}
            onPress={() => navigation.navigate('MainApp')}
          >
            <Text style={styles.buttonText}>Go Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  statusIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  failureIcon: {
    backgroundColor: '#ffefed',
  },
  statusIconText: {
    fontSize: 28,
    fontWeight: '800',
  },
  failureIconText: {
    color: '#e53935',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e53935',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5f6c7b',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    backgroundColor: '#0d6efd',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default PaymentFailure;
