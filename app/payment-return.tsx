/**
 * Payment Return Screen
 * Landing point after the MaishaPay hosted checkout (or a cancelled/failed
 * attempt). Verifies the payment server-side via
 * POST /customer/orders/verify-payment, then shows the outcome.
 */

import { useVerifyPayment } from '@/src/api/checkoutApi';
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Outcome = 'verifying' | 'success' | 'failed' | 'cancelled' | 'pending';

export default function PaymentReturnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    status?: string;
    sessionId?: string;
    transactionRefId?: string;
  }>();

  const verifyPayment = useVerifyPayment();
  const [outcome, setOutcome] = useState<Outcome>('verifying');
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const status = params.status ?? '';

    // Cancelled in the WebView — order stays pending, no verification needed
    if (status === 'cancelled' || (!params.sessionId && !status)) {
      setOutcome('cancelled');
      return;
    }

    // Server-side verification with the callback params
    verifyPayment
      .mutateAsync({
        sessionId: params.sessionId ?? '',
        status,
        transactionRefId: params.transactionRefId,
      })
      .then((result) => {
        setOutcome(result.status === 'success' ? 'success' : 'failed');
      })
      .catch(() => setOutcome('failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goOrders = () => router.replace('/orders');
  const goHome = () => router.replace('/(tabs)');

  const content = {
    verifying: {
      icon: null,
      title: 'Verifying Payment',
      message: 'Please wait while we confirm your payment…',
      primaryLabel: null,
      secondaryLabel: null,
    },
    success: {
      icon: 'checkmark-circle' as const,
      iconColor: Colors.success,
      title: 'Payment Successful!',
      message:
        'Your payment has been confirmed and your order is being processed. You will receive an order confirmation email shortly.',
      primaryLabel: 'View My Orders',
      secondaryLabel: 'Continue Shopping',
    },
    failed: {
      icon: 'close-circle' as const,
      iconColor: Colors.error,
      title: 'Payment Failed',
      message:
        'We could not verify your payment. If you were charged, the payment may still be processing — check your orders before retrying.',
      primaryLabel: 'View My Orders',
      secondaryLabel: 'Back to Shopping',
    },
    cancelled: {
      icon: 'information-circle' as const,
      iconColor: Colors.info,
      title: 'Payment Cancelled',
      message:
        'Your order was saved but remains unpaid. You can retry payment from your order history.',
      primaryLabel: 'View My Orders',
      secondaryLabel: 'Continue Shopping',
    },
    pending: {
      icon: 'time' as const,
      iconColor: Colors.warning,
      title: 'Payment Pending',
      message: 'Your payment is still processing. Please check your orders shortly.',
      primaryLabel: 'View My Orders',
      secondaryLabel: null,
    },
  }[outcome];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {outcome === 'verifying' ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: (content.iconColor ?? Colors.primary) + '15' },
            ]}
          >
            {content.icon && (
              <Ionicons name={content.icon} size={56} color={content.iconColor} />
            )}
          </View>
        )}

        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.message}>{content.message}</Text>

        <View style={styles.actions}>
          {content.primaryLabel && outcome !== 'verifying' && (
            <TouchableOpacity style={styles.primaryButton} onPress={goOrders}>
              <Text style={styles.primaryButtonText}>{content.primaryLabel}</Text>
            </TouchableOpacity>
          )}
          {content.secondaryLabel && outcome !== 'verifying' && (
            <TouchableOpacity style={styles.secondaryButton} onPress={goHome}>
              <Text style={styles.secondaryButtonText}>{content.secondaryLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontSize: FontSize['2xl'],
    fontFamily: FontFamily.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['3xl'],
    maxWidth: 320,
  },
  actions: {
    width: '100%',
    maxWidth: 360,
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  secondaryButtonText: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.medium,
  },
});
