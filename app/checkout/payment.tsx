/**
 * Checkout Payment Screen
 * Step 2: Select payment method.
 * The backend supports MaishaPay hosted checkout (online) and Cash on Delivery.
 */

import { PAYMENT_METHODS, PaymentMethod } from '@/src/api/checkoutTypes';
import { useCheckoutStore } from '@/src/api/useCheckout';
import { CheckoutStepper } from '@/src/components/CheckoutStepper';
import { OrderSummaryCard } from '@/src/components/OrderSummaryCard';
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WenzeLogo = require('@/assets/images/splash-icon.png');

// Payment method icons mapping
const PAYMENT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  maishapay: 'phone-portrait',
  online: 'globe',
  cod: 'cash',
};

export default function PaymentScreen() {
  const router = useRouter();
  const {
    orderSummary,
    shippingAddress,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    setStep,
    cartItems,
  } = useCheckoutStore();

  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setStep('payment');
  }, [setStep]);

  // Redirect if missing prerequisites
  if (!orderSummary || cartItems.length === 0) {
    router.replace('/cart');
    return null;
  }

  if (!shippingAddress) {
    router.replace('/checkout/shipping');
    return null;
  }

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    if (navigating) return;
    setNavigating(true);
    setSelectedPaymentMethod(method);
    // Give the store a tick to update before navigating to review
    setTimeout(() => {
      setNavigating(false);
      router.push('/checkout/review');
    }, 50);
  };

  const renderMethodDetails = (method: PaymentMethod) => {
    if (method.type === 'cod') {
      return (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Please have the exact amount (${orderSummary.total.toFixed(2)}) ready
            when the delivery arrives. Our driver may not have change.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.infoBox}>
        <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
        <Text style={styles.infoText}>
          You will be redirected to the secure MaishaPay checkout to complete
          your payment safely.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <Image source={WenzeLogo} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* Stepper */}
      <CheckoutStepper currentStep="payment" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <Ionicons name="card" size={24} color={Colors.primary} />
          <View style={styles.stepHeaderText}>
            <Text style={styles.stepTitle}>Payment Method</Text>
            <Text style={styles.stepSubtitle}>Choose how you&apos;d like to pay</Text>
          </View>
        </View>

        {/* Payment Methods List */}
        <View style={styles.methodsSection}>
          {PAYMENT_METHODS.map((method) => {
            const selected = selectedPaymentMethod?.id === method.id;
            return (
              <View key={method.id}>
                <TouchableOpacity
                  style={[
                    styles.methodCard,
                    selected && styles.methodSelected,
                  ]}
                  onPress={() => handleSelectPaymentMethod(method)}
                >
                  <View style={styles.methodIconWrapper}>
                    <Ionicons
                      name={PAYMENT_ICONS[method.type] || 'card'}
                      size={24}
                      color={selected ? Colors.primary : Colors.gray[500]}
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    {method.description && (
                      <Text style={styles.methodDescription}>{method.description}</Text>
                    )}
                  </View>
                  <View style={styles.radioOuter}>
                    {selected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
                {selected && renderMethodDetails(method)}
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <OrderSummaryCard summary={orderSummary} collapsible />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${orderSummary.total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedPaymentMethod || navigating) && styles.buttonDisabled,
          ]}
          onPress={() => selectedPaymentMethod && handleSelectPaymentMethod(selectedPaymentMethod)}
          disabled={!selectedPaymentMethod || navigating}
        >
          {navigating ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Review Order</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
  },
  scrollView: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stepHeaderText: {
    marginLeft: Spacing.md,
  },
  stepTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
  },
  stepSubtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  methodsSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border.light,
    marginBottom: Spacing.sm,
  },
  methodSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaded,
  },
  methodIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  methodName: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
  },
  methodDescription: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  summarySection: {
    padding: Spacing.lg,
  },
  bottomSpacing: {
    height: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    ...Shadow.lg,
  },
  totalSection: {
    marginRight: Spacing.md,
  },
  totalLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
  },
  totalAmount: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.text.primary,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadow.secondary,
  },
  continueButtonText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.white,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
