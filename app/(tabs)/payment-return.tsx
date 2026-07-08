// app/(tabs)/payment-return.tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useVerifyPayment } from '@/src/api/useCustomer';
import { useCheckoutStore } from '@/src/api/useCheckout';

interface Props {
  sessionId: string;
  status?: string;
  transactionRefId?: string;
}

export default function PaymentReturnScreen({ sessionId, status, transactionRefId }: Props) {
  const verifyPayment = useVerifyPayment();
  const { setOrderConfirmation, setError, resetCheckout } = useCheckoutStore();

  useEffect(() => {
    const run = async () => {
      try {
        const res = await verifyPayment.mutateAsync({
          sessionId,
          status,
          transactionRefId,
        });
        const updatedOrders = res.data.data.orders;
        setOrderConfirmation({
          orders: updatedOrders,
          payment: { method: 'maishapay', status: 'paid' },
        });
        resetCheckout();
      } catch (e: any) {
        setError(e.message || 'Payment verification failed. Please contact support.');
      }
    };

    run();
  }, [sessionId, status, transactionRefId, verifyPayment, setOrderConfirmation, setError, resetCheckout]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Verifying your payment...</Text>
    </View>
  );
}