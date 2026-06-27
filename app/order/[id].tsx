/**
 * Order Detail Screen
 * Fetches single order from real backend: GET /api/customer/orders/:id
 */

import { useCustomerOrder } from '@/src/api/useCustomer';
import { Header } from '@/src/components';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, isError } = useCustomerOrder(id || '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Order Details" showSearch={false} showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Order Details" showSearch={false} showBack />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>Failed to load order</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={`Order #${order.orderNumber || order.id.slice(0, 8).toUpperCase()}`} showSearch={false} showBack />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Tracker */}
        {currentStep >= 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <View style={styles.stepsRow}>
              {STATUS_STEPS.map((step, idx) => (
                <React.Fragment key={step}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepDot, idx <= currentStep && styles.stepDotActive]}>
                      {idx < currentStep && <Ionicons name="checkmark" size={12} color={Colors.white} />}
                    </View>
                    <Text style={[styles.stepLabel, idx <= currentStep && styles.stepLabelActive]}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </Text>
                  </View>
                  {idx < STATUS_STEPS.length - 1 && (
                    <View style={[styles.stepLine, idx < currentStep && styles.stepLineActive]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items ({order.items?.length || 0})</Text>
          {order.items?.map(item => (
            <View key={item.id} style={styles.itemRow}>
              {item.product?.primaryImage ? (
                <Image source={{ uri: item.product.primaryImage }} style={styles.itemImage} />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="image-outline" size={24} color={Colors.gray?.[400] || '#9CA3AF'} />
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product?.name || 'Product'}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <Text style={styles.addressText}>{order.shippingAddress.name}</Text>
            <Text style={styles.addressText}>{order.shippingAddress.street}</Text>
            <Text style={styles.addressText}>
              {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.postalCode}
            </Text>
            <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>${order.subtotal?.toFixed(2)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Shipping</Text><Text style={styles.summaryValue}>${order.shipping?.toFixed(2)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tax</Text><Text style={styles.summaryValue}>${order.tax?.toFixed(2)}</Text></View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total?.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background?.secondary || '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text?.primary || '#111827', marginBottom: Spacing.md },
  stepsRow: { flexDirection: 'row', alignItems: 'center' },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.gray?.[200] || '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepDotActive: { backgroundColor: Colors.primary },
  stepLabel: { fontSize: 9, color: Colors.text?.secondary || '#6B7280', textAlign: 'center' },
  stepLabelActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.gray?.[200] || '#E5E7EB', marginBottom: 16 },
  stepLineActive: { backgroundColor: Colors.primary },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  itemImage: { width: 60, height: 60, borderRadius: BorderRadius.md, marginRight: Spacing.md },
  itemImagePlaceholder: { width: 60, height: 60, borderRadius: BorderRadius.md, backgroundColor: Colors.gray?.[100] || '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text?.primary || '#111827' },
  itemQty: { fontSize: FontSize.xs, color: Colors.text?.secondary || '#6B7280', marginTop: 2 },
  itemPrice: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text?.primary || '#111827' },
  addressText: { fontSize: FontSize.sm, color: Colors.text?.secondary || '#6B7280', lineHeight: 22 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.text?.secondary || '#6B7280' },
  summaryValue: { fontSize: FontSize.sm, color: Colors.text?.primary || '#111827' },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border?.light || '#E5E7EB', paddingTop: Spacing.sm, marginTop: Spacing.sm },
  totalLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text?.primary || '#111827' },
  totalValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  errorText: { fontSize: FontSize.md, color: Colors.text?.secondary || '#6B7280', marginTop: Spacing.md },
});
