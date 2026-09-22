/**
 * Order Detail Screen
 * Shows full breakdown of a single order including items, address, tracking
 */

import { useOrderDetail, type OrderItem } from '@/src/api/useCustomer';
import { ErrorState } from '@/src/components';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function OrderProgress({ status }: { status: string }) {
  const currentIndex = STATUS_STEPS.indexOf(status);
  if (currentIndex === -1) return null; // cancelled or returned
  return (
    <View style={styles.progressRow}>
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIndex;
        return (
          <React.Fragment key={step}>
            <View style={styles.stepCol}>
              <View style={[styles.stepDot, done && styles.stepDotDone]}>
                {done && <Ionicons name="checkmark" size={12} color={Colors.white} />}
              </View>
              <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </Text>
            </View>
            {idx < STATUS_STEPS.length - 1 && (
              <View style={[styles.stepLine, done && idx < currentIndex && styles.stepLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function ItemRow({ item }: { item: OrderItem }) {
  return (
    <View style={styles.itemRow}>
      <Image source={{ uri: item.productImage }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
        <Text style={styles.itemVendor}>{item.vendorName}</Text>
        <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useOrderDetail(id ?? '');

  const date = order
    ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Order Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : isError || !order ? (
        <ErrorState title="Order not found" message="Could not load this order." onRetry={refetch} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header info */}
          <View style={styles.section}>
            <Text style={styles.orderNum}>Order #{order.orderNumber}</Text>
            <Text style={styles.orderDate}>Placed on {date}</Text>
            {order.trackingNumber && (
              <View style={styles.trackingRow}>
                <Ionicons name="location-outline" size={16} color={Colors.secondary} />
                <Text style={styles.trackingText}>Tracking: {order.trackingNumber}</Text>
              </View>
            )}
          </View>

          {/* Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <OrderProgress status={order.status} />
          </View>

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
            {order.items.map((item) => <ItemRow key={item.id} item={item} />)}
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressBox}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.addressLabel}>{order.shippingAddress.label}</Text>
                <Text style={styles.addressText}>
                  {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </Text>
                <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
              </View>
            </View>
          </View>

          {/* Payment Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>${order.shippingCost.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>${order.tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: Spacing['4xl'] }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  orderNum: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text.primary },
  orderDate: { fontSize: FontSize.md, color: Colors.text.secondary, marginTop: Spacing.xs },
  trackingRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.xs },
  trackingText: { fontSize: FontSize.sm, color: Colors.secondary, fontWeight: FontWeight.medium },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text.primary, marginBottom: Spacing.md },
  progressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepCol: { alignItems: 'center', width: 56 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  stepDotDone: { backgroundColor: Colors.secondary },
  stepLabel: { fontSize: FontSize.xs, color: Colors.text.tertiary, textAlign: 'center' },
  stepLabelDone: { color: Colors.secondary, fontWeight: FontWeight.medium },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.gray[200], marginTop: 11 },
  stepLineDone: { backgroundColor: Colors.secondary },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border.light },
  itemImage: { width: 56, height: 56, borderRadius: BorderRadius.md, backgroundColor: Colors.gray[100] },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text.primary },
  itemVendor: { fontSize: FontSize.sm, color: Colors.text.secondary, marginTop: 2 },
  itemQty: { fontSize: FontSize.sm, color: Colors.text.tertiary, marginTop: 2 },
  itemPrice: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  addressBox: { flexDirection: 'row', alignItems: 'flex-start' },
  addressLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary, marginBottom: 4 },
  addressText: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },
  summaryBox: { gap: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.md, color: Colors.text.secondary },
  summaryValue: { fontSize: FontSize.md, color: Colors.text.primary },
  totalRow: { paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border.light, marginTop: Spacing.xs },
  totalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  totalAmount: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
});
