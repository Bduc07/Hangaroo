import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../routes/types';
import BASE_URL from '../config/baseUrl';

type EsewaPaymentRouteProp = RouteProp<RootStackParamList, 'EsewaPayment'>;

const EsewaPayment = () => {
  const route = useRoute<EsewaPaymentRouteProp>();
  const { amount, eventId, transaction_uuid } = route.params;

  const [_loading, setLoading] = useState(false);
  const [showWebview, setShowWebview] = useState(false);
  const [esewaFormHtml, setEsewaFormHtml] = useState<string>('');
  const hasHandledCallback = useRef(false);
  const hasStartedPayment = useRef(false);

  useEffect(() => {
    if (hasStartedPayment.current) {
      return;
    }

    hasStartedPayment.current = true;

    const startPayment = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.post(
          `${BASE_URL}/api/v1/events/generate-signature`,
          {
            total_amount: amount,
            transaction_uuid: transaction_uuid,
            product_code: 'EPAYTEST',
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const { signature } = response.data;
        const htmlForm = `
          <html>
            <body>
              <form id="esewaForm" method="POST" action="https://rc-epay.esewa.com.np/api/epay/main/v2/form">
                <input type="hidden" name="amount" value="${amount}" />
                <input type="hidden" name="tax_amount" value="0" />
                <input type="hidden" name="total_amount" value="${amount}" />
                <input type="hidden" name="transaction_uuid" value="${transaction_uuid}" />
                <input type="hidden" name="product_code" value="EPAYTEST" />
                <input type="hidden" name="product_service_charge" value="0" />
                <input type="hidden" name="product_delivery_charge" value="0" />
                <input type="hidden" name="signature" value="${signature}" />
                <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code" />
                <input type="hidden" name="success_url" value="${BASE_URL}/api/v1/events/payment-success" />
                <input type="hidden" name="failure_url" value="${BASE_URL}/api/v1/events/payment-failure" />
              </form>
              <script>
                document.getElementById('esewaForm').submit();
              </script>
            </body>
          </html>
        `;

        setEsewaFormHtml(htmlForm);
        hasHandledCallback.current = false;
        setShowWebview(true);
      } catch (error: any) {
        console.error('Payment Error:', error);
        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: error.response?.data?.message || 'Something went wrong',
        });
      } finally {
        setLoading(false);
      }
    };

    startPayment();
  }, [amount, eventId, transaction_uuid]);

  const navigation = useNavigation<any>();

  const verifyPaymentWithServer = async (encodedData?: string | null) => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(
      `${BASE_URL}/api/v1/events/verify-payment`,
      {
        encodedData: encodedData || undefined,
        eventId,
        total_amount: amount,
        transaction_uuid,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!response.data.success) {
      throw new Error('Verification failed');
    }

    return response.data;
  };

  const handleWebviewNavigation = async (event: any) => {
    const url = event.url;

    if (!url || hasHandledCallback.current) {
      return;
    }

    if (url.includes('payment-success')) {
      hasHandledCallback.current = true;
      setShowWebview(false);

      const dataMatch = url.match(/[?&]data=([^&]+)/);
      const data = dataMatch ? decodeURIComponent(dataMatch[1]) : null;

      try {
        await verifyPaymentWithServer(data);
        Toast.show({
          type: 'success',
          text1: 'Payment Successful',
          text2: 'Order completed!',
        });
        navigation.navigate('PaymentSuccess', {
          amount: amount,
          transactionId: transaction_uuid,
        });
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2:
            error.response?.data?.message || 'Could not verify payment.',
        });
        navigation.navigate('PaymentFailure');
      }
    } else if (url.includes('payment-failure')) {
      hasHandledCallback.current = true;
      setShowWebview(false);
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: 'Please try again.',
      });
      navigation.navigate('PaymentFailure');
    }
  };

  if (showWebview && esewaFormHtml) {
    return (
      <WebView
        originWhitelist={['*']}
        source={{ html: esewaFormHtml }}
        onNavigationStateChange={handleWebviewNavigation}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.title}>Redirecting to eSewa...</Text>
      <Text style={styles.subtitle}>Please wait while we prepare your payment.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default EsewaPayment;
