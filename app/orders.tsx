/**
 * Orders Screen
 * Fetches order history from real backend: GET /api/customer/orders
 */

import { useCustomerOrders } from '@/src/api/useCustomer';
import { Header } from '@/src/components';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_COLOR: Record<string, string> = {
  pending: Colors.warning || '#F59E0B',
  confirmed: Colors.info || '#3B82F6',
  processing: Colors.info || '#3B82F6',
  shipped: Colors.primary,
  delivered: Colors.success || '#10B981',
  cancelled: Colors.error,
  refunded: Colors.gray?.[500] || '#6B7280',
};

export default function OrdersScreen() {
  const router = useRouter();
  const { data: orders, isLoading, isError, refetch } = useCustomerOrders();

  const renderOrder = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/order/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{item.orderNumber || item.id.slice(0, 8).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[item.status] || Colors.gray?.[400] || '#9CA3AF') + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] || Colors.gray?.[600] || '#4B5563' }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderMeta}>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
          })}
        </Text>
        <Text style={styles.orderItems}>
          {item.items?.length || 0} item{(item.items?.length || 0) !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>${item.total?.toFixed(2) || '0.00'}</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.gray?.[400] || '#9CA3AF'} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Orders" showSearch={false} showBack />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.emptyText}>Failed to load orders</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !orders || orders.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={64} color={Colors.gray?.[300] || '#D1D5DB'} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your order history will appear here</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/products')}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background?.secondary || '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  list: { padding: Spacing.lg, gap: Spacing.md },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  orderNumber: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text?.primary || '#111827' },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full || 999 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  orderMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  orderDate: { fontSize: FontSize.sm, color: Colors.text?.secondary || '#6B7280' },
  orderItems: { fontSize: FontSize.sm, color: Colors.text?.secondary || '#6B7280' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border?.light || '#E5E7EB', paddingTop: Spacing.sm },
  orderTotal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text?.primary || '#111827', marginTop: Spacing.lg },
  emptyText: { fontSize: FontSize.md, color: Colors.text?.secondary || '#6B7280', textAlign: 'center', marginTop: Spacing.sm },
  retryBtn: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg },
  retryText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  shopBtn: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg },
  shopBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
