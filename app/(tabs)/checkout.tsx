// app/(tabs)/checkout.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useCheckoutStore, calculateOrderSummary } from '@/src/api/useCheckout';
import { useSyncedCart } from '@/src/api/useCart';
import { useCreateOrder, useVerifyPayment } from '@/src/api/useCustomer';

export default function CheckoutScreen() {
  const {
    shippingAddress,
    selectedPaymentMethod,
    setOrderSummary,
    setOrderConfirmation,
    setLoading,
    setError,
    resetCheckout,
    orderSummary,
    currentStep,
    canProceedToPayment,
    canProceedToReview,
  } = useCheckoutStore();

  const { items } = useSyncedCart();
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();

  const handleProceedToPayment = () => {
    if (!canProceedToPayment()) {
      setError('Please complete your shipping details.');
      return;
    }
    // advance to payment step in UI
  };

  const handleConfirmOrder = async () => {
    if (!shippingAddress || !selectedPaymentMethod) {
      setError('Please complete shipping and payment selection.');
      return;
    }

    try {
      setLoading(true);
      const summary = calculateOrderSummary(items);
      setOrderSummary(summary);

      const res = await createOrder.mutateAsync({
        paymentMethod: selectedPaymentMethod.method,
        shippingAddress: {
          fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          street1: shippingAddress.streetAddress,
          street2: shippingAddress.apartment,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          label: shippingAddress.label,
        },
        saveAddressToProfile: shippingAddress.saveToProfile,
        currency: summary.currency === 'USD' ? 'USD' : 'CDF',
      });

      const payload = res.data;
      const orders = payload.data.orders;
      const payment = payload.data.payment;

      setOrderConfirmation({
        orders,
        payment,
      });

      if (payment.method === 'maishapay') {
        // Navigate to MaishaPay payment screen (using payment.sessionId, redirectUrl, etc.)
      } else {
        // COD / offline payment: show confirmation and reset
        resetCheckout();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Checkout – step: {currentStep}</Text>
      {orderSummary && (
        <Text>
          Total: {orderSummary.total} {orderSummary.currency}
        </Text>
      )}
      <Button title="Proceed to payment" onPress={handleProceedToPayment} />
      <Button title="Confirm order" onPress={handleConfirmOrder} />
    </View>
  );
}