/**
 * Checkout Review Screen
 * Step 3: Review order details before final confirmation
 */

import { useConfirmOrder } from '@/src/api/checkoutApi';
import { useCheckoutStore } from '@/src/api/useCheckout';
import { CheckoutStepper } from '@/src/components/CheckoutStepper';
import { OrderSummaryCard } from '@/src/components/OrderSummaryCard';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WenzeLogo = require('@/assets/images/splash-icon.png');

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Credit/Debit Card',
  mobile_money: 'Mobile Money',
  bank_transfer: 'Bank Transfer',
  cod: 'Cash on Delivery',
};

export default function ReviewScreen() {
  const router = useRouter();
  const {
    orderSummary,
    shippingAddress,
    selectedPaymentMethod,
    paymentIntent,
    setStep,
    setOrderConfirmation,
    setLoading,
    isLoading,
    cartItems,
  } = useCheckoutStore();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const confirmOrderMutation = useConfirmOrder();

  useEffect(() => {
    setStep('review');
  }, []);

  // Redirect if missing prerequisites
  if (!orderSummary || cartItems.length === 0) {
    router.replace('/cart');
    return null;
  }

  if (!shippingAddress) {
    router.replace('/checkout/shipping');
    return null;
  }

  if (!selectedPaymentMethod) {
    router.replace('/checkout/payment');
    return null;
  }

  const handleEditShipping = () => {
    router.push('/checkout/shipping');
  };

  const handleEditPayment = () => {
    router.push('/checkout/payment');
  };

  const handlePlaceOrder = async () => {
    if (!termsAccepted) {
      Alert.alert(
        'Accept Terms',
        'Please accept the terms and conditions to place your order.'
      );
      return;
    }

    setLoading(true);

    try {
      const confirmation = await confirmOrderMutation.mutateAsync({
        sessionId: 'checkout-session',
        paymentIntentId: paymentIntent?.id || '',
      });

      setOrderConfirmation(confirmation);

      // Navigate to confirmation screen
      router.replace('/checkout/confirmation');
    } catch (error) {
      Alert.alert(
        'Order Failed',
        'We couldn\'t process your order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Order</Text>
        <Image source={WenzeLogo} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* Stepper */}
      <CheckoutStepper currentStep="review" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <Ionicons name="document-text" size={24} color={Colors.primary} />
          <View style={styles.stepHeaderText}>
            <Text style={styles.stepTitle}>Review Your Order</Text>
            <Text style={styles.stepSubtitle}>
              Please confirm all details before placing your order
            </Text>
          </View>
        </View>

        {/* Shipping Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Shipping Address</Text>
            </View>
            <TouchableOpacity onPress={handleEditShipping} style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={Colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressCard}>
            <Text style={styles.addressName}>
              {shippingAddress.firstName} {shippingAddress.lastName}
            </Text>
            <Text style={styles.addressLine}>
              {shippingAddress.streetAddress}
              {shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ''}
            </Text>
            <Text style={styles.addressLine}>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            </Text>
            <Text style={styles.addressLine}>{shippingAddress.country}</Text>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.contactText}>{shippingAddress.phone}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.contactText}>{shippingAddress.email}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="card" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>
            <TouchableOpacity onPress={handleEditPayment} style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={Colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.paymentIconWrapper}>
              <Ionicons
                name={
                  selectedPaymentMethod.type === 'card'
                    ? 'card'
                    : selectedPaymentMethod.type === 'mobile_money'
                    ? 'phone-portrait'
                    : selectedPaymentMethod.type === 'bank_transfer'
                    ? 'business'
                    : 'cash'
                }
                size={24}
                color={Colors.primary}
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentMethodName}>
                {selectedPaymentMethod.name}
              </Text>
              <Text style={styles.paymentMethodType}>
                {PAYMENT_METHOD_LABELS[selectedPaymentMethod.type]}
              </Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
              <Text style={styles.verifiedText}>Ready</Text>
            </View>
          </View>
        </View>

        {/* Order Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="bag" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Order Items ({orderSummary.itemCount})</Text>
            </View>
          </View>

          <View style={styles.itemsList}>
            {cartItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  index === cartItems.length - 1 && styles.lastItem,
                ]}
              >
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="cube-outline" size={24} color={Colors.gray[400]} />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product?.name || 'Product'}
                  </Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <OrderSummaryCard summary={orderSummary} />
        </View>

        {/* Delivery Estimate */}
        <View style={styles.deliverySection}>
          <Ionicons name="time" size={20} color={Colors.secondary} />
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>Estimated Delivery</Text>
            <Text style={styles.deliveryDate}>
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <TouchableOpacity
            style={styles.termsCheckbox}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && (
                <Ionicons name="checkmark" size={14} color={Colors.white} />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Badges */}
        <View style={styles.securitySection}>
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.secondary} />
            <Text style={styles.securityText}>Secure Checkout</Text>
          </View>
          <View style={styles.securityBadge}>
            <Ionicons name="lock-closed" size={18} color={Colors.secondary} />
            <Text style={styles.securityText}>SSL Encrypted</Text>
          </View>
          <View style={styles.securityBadge}>
            <Ionicons name="refresh" size={18} color={Colors.secondary} />
            <Text style={styles.securityText}>Easy Returns</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total to Pay</Text>
          <Text style={styles.totalAmount}>${orderSummary.total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (!termsAccepted || isLoading) && styles.buttonDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={!termsAccepted || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              <Text style={styles.placeOrderText}>Place Order</Text>
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
    fontWeight: FontWeight.semibold,
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
    flex: 1,
  },
  stepTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  stepSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  editButtonText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.xs,
  },
  addressCard: {
    backgroundColor: Colors.gray[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  addressName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  addressLine: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  contactText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  paymentIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  paymentMethodName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  paymentMethodType: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryFaded,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: FontSize.xs,
    color: Colors.secondary,
    fontWeight: FontWeight.medium,
    marginLeft: 4,
  },
  itemsList: {
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  itemQuantity: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  summarySection: {
    padding: Spacing.lg,
  },
  deliverySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryFaded,
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  deliveryInfo: {
    marginLeft: Spacing.md,
  },
  deliveryTitle: {
    fontSize: FontSize.sm,
    color: Colors.secondary,
    fontWeight: FontWeight.medium,
  },
  deliveryDate: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginTop: 2,
  },
  termsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  securitySection: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  securityText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
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
    color: Colors.text.secondary,
  },
  totalAmount: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  placeOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  placeOrderText: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
