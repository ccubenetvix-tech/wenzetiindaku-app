/**
 * Checkout Index Screen
 * Entry point that redirects to shipping step
 */

import { useCartStore } from '@/src/api/useCart';
import { calculateOrderSummary, useCheckoutStore } from '@/src/api/useCheckout';
import { Colors } from '@/src/theme';
import { Redirect, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function CheckoutIndex() {
  const router = useRouter();
  const { items } = useCartStore();
  const { initCheckout, orderSummary } = useCheckoutStore();

  useEffect(() => {
    if (items.length > 0) {
      const summary = calculateOrderSummary(items);
      initCheckout(items, summary);
      router.replace('/checkout/shipping');
    }
  }, []);

  // If cart is empty, redirect back
  if (items.length === 0) {
    return <Redirect href="/cart" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Preparing checkout...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
});
