/**
 * Checkout Layout
 * Wraps checkout screens with common header and stepper
 */

import { Stack } from 'expo-router';
import React from 'react';

export default function CheckoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="shipping" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="review" />
      <Stack.Screen name="confirmation" />
    </Stack>
  );
}
