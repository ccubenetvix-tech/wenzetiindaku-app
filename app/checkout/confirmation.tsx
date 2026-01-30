/**
 * Checkout Confirmation Screen
 * Order placed successfully - show confirmation and next steps
 */

import { useCartStore } from '@/src/api/useCart';
import { useCheckoutStore } from '@/src/api/useCheckout';
import { logger } from '@/src/config';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Animated,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WenzeLogo = require('@/assets/images/splash-icon.png');

export default function ConfirmationScreen() {
  const router = useRouter();
  const { orderConfirmation, shippingAddress, resetCheckout } = useCheckoutStore();
  const clearCart = useCartStore((state) => state.clearCart);

  // Animation value for success checkmark
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Clear the cart after successful order
    clearCart();

    // Animate the success icon
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  // Redirect if no order confirmation
  if (!orderConfirmation) {
    router.replace('/cart');
    return null;
  }

  const handleContinueShopping = () => {
    resetCheckout();
    router.replace('/(tabs)');
  };

  const handleViewOrder = () => {
    // Navigate to orders (would need orders screen) - for now go home
    router.replace('/(tabs)');
  };

  const handleShareOrder = async () => {
    try {
      await Share.share({
        message: `I just placed an order on Wenze Tii Ndaku! Order #${orderConfirmation.orderNumber}`,
        title: 'My Order',
      });
    } catch (error) {
      logger.warn('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.headerLogoContainer}>
          <Image source={WenzeLogo} style={styles.logoImage} resizeMode="contain" />
          <View>
            <Text style={styles.logoText}>WENZE</Text>
            <Text style={styles.logoTextGreen}>TII NDAKU</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <View style={styles.successSection}>
          <Animated.View
            style={[
              styles.successIconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.successIconOuter}>
              <View style={styles.successIconInner}>
                <Ionicons name="checkmark" size={48} color={Colors.white} />
              </View>
            </View>
          </Animated.View>

          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for shopping with Wenze Tii Ndaku
          </Text>
        </View>

        {/* Order Number Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderCardHeader}>
            <Text style={styles.orderNumberLabel}>Order Number</Text>
            <TouchableOpacity onPress={handleShareOrder} style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.orderNumber}>{orderConfirmation.orderNumber}</Text>
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Transaction ID:</Text>
            <Text style={styles.transactionId}>{orderConfirmation.transactionId}</Text>
          </View>
        </View>

        {/* Order Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconWrapper}>
              <Ionicons name="time" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Order Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {orderConfirmation.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconActive}>
                <Ionicons name="checkmark" size={14} color={Colors.white} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Order Placed</Text>
                <Text style={styles.timelineDate}>
                  {formatDate(orderConfirmation.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.timelineConnector} />
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconPending}>
                <Ionicons name="cube" size={14} color={Colors.gray[400]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitlePending}>Processing</Text>
                <Text style={styles.timelineDatePending}>
                  Expected within 24 hours
                </Text>
              </View>
            </View>
            <View style={styles.timelineConnector} />
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconPending}>
                <Ionicons name="car" size={14} color={Colors.gray[400]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitlePending}>Shipping</Text>
                <Text style={styles.timelineDatePending}>
                  We'll notify you when shipped
                </Text>
              </View>
            </View>
            <View style={styles.timelineConnector} />
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconPending}>
                <Ionicons name="home" size={14} color={Colors.gray[400]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitlePending}>Estimated Delivery</Text>
                <Text style={styles.timelineDateHighlight}>
                  {orderConfirmation.estimatedDelivery 
                    ? formatDate(orderConfirmation.estimatedDelivery)
                    : 'TBD'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        {shippingAddress && (
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <Text style={styles.addressTitle}>Delivery Address</Text>
            </View>
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
            <Text style={styles.addressLine}>{shippingAddress.phone}</Text>
          </View>
        )}

        {/* Payment Summary */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <Ionicons name="card" size={20} color={Colors.primary} />
            <Text style={styles.paymentTitle}>Payment Summary</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total Paid</Text>
            <Text style={styles.paymentAmount}>
              ${orderConfirmation.total.toFixed(2)}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method</Text>
            <Text style={styles.paymentMethod}>
              {orderConfirmation.paymentMethod}
            </Text>
          </View>
        </View>

        {/* What's Next */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>What's Next?</Text>
          <View style={styles.nextStepsList}>
            <View style={styles.nextStepItem}>
              <View style={styles.nextStepNumber}>
                <Text style={styles.nextStepNumberText}>1</Text>
              </View>
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepItemTitle}>Order Confirmation Email</Text>
                <Text style={styles.nextStepItemDescription}>
                  We've sent a confirmation to {shippingAddress?.email}
                </Text>
              </View>
            </View>
            <View style={styles.nextStepItem}>
              <View style={styles.nextStepNumber}>
                <Text style={styles.nextStepNumberText}>2</Text>
              </View>
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepItemTitle}>Shipping Updates</Text>
                <Text style={styles.nextStepItemDescription}>
                  You'll receive SMS & email updates when your order ships
                </Text>
              </View>
            </View>
            <View style={styles.nextStepItem}>
              <View style={styles.nextStepNumber}>
                <Text style={styles.nextStepNumberText}>3</Text>
              </View>
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepItemTitle}>Track Your Order</Text>
                <Text style={styles.nextStepItemDescription}>
                  View order status anytime in your profile
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpText}>Need help with your order?</Text>
          <TouchableOpacity style={styles.helpLink}>
            <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
            <Text style={styles.helpLinkText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.viewOrderButton} onPress={handleViewOrder}>
          <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
          <Text style={styles.viewOrderText}>View Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueShoppingButton}
          onPress={handleContinueShopping}
        >
          <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
  },
  logoText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  logoTextGreen: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
  },
  successIconContainer: {
    marginBottom: Spacing.lg,
  },
  successIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  orderNumberLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  shareButton: {
    padding: Spacing.xs,
  },
  orderNumber: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  transactionLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  transactionId: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
  },
  statusCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  statusTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondaryFaded,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  statusBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.secondary,
    fontWeight: FontWeight.semibold,
  },
  timeline: {
    paddingLeft: Spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIconActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineContent: {
    marginLeft: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  timelineTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  timelineTitlePending: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.gray[500],
  },
  timelineDate: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  timelineDatePending: {
    fontSize: FontSize.xs,
    color: Colors.gray[400],
    marginTop: 2,
  },
  timelineDateHighlight: {
    fontSize: FontSize.xs,
    color: Colors.secondary,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  timelineConnector: {
    width: 2,
    height: 24,
    backgroundColor: Colors.gray[200],
    marginLeft: 11,
  },
  addressCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addressTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
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
  paymentCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  paymentTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  paymentLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  paymentAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.secondary,
  },
  paymentMethod: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  nextStepsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  nextStepsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  nextStepsList: {
    gap: Spacing.md,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nextStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepNumberText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  nextStepContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nextStepItemTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  nextStepItemDescription: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  helpSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  helpText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  helpLinkText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
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
    gap: Spacing.md,
    ...Shadow.lg,
  },
  viewOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: Spacing.xs,
  },
  viewOrderText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  continueShoppingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  continueShoppingText: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
});
