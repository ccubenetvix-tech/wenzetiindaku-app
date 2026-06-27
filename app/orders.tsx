/**
 * My Orders Screen
 * Lists all customer orders with status badges and navigation to detail
 */

import { useAuth } from '@/contexts/auth-context';
import { useCustomerOrders, type Order } from '@/src/api/useCustomer';
import { ErrorState } from '@/src/components';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_CONFIG: Record<Order['status'], { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: Colors.warning,       bg: Colors.warningFaded },
  confirmed:  { label: 'Confirmed',  color: Colors.info,          bg: Colors.infoFaded },
  processing: { label: 'Processing', color: Colors.info,          bg: Colors.infoFaded },
  shipped:    { label: 'Shipped',    color: Colors.secondary,     bg: Colors.secondaryFaded },
  delivered:  { label: 'Delivered',  color: Colors.success,       bg: 'rgba(16,185,129,0.1)' },
  cancelled:  { label: 'Cancelled',  color: Colors.error,         bg: 'rgba(239,68,68,0.1)' },
  returned:   { label: 'Returned',   color: Colors.gray[500],     bg: Colors.gray[100] },
};

function StatusBadge({ status }: { status: Order['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const firstImage = order.items[0]?.productImage;
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.productThumb} />
        ) : (
          <View style={[styles.productThumb, styles.thumbPlaceholder]}>
            <Ionicons name="cube-outline" size={24} color={Colors.gray[400]} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.orderNum}>Order #{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{date}</Text>
          <Text style={styles.itemCount}>
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.cardBottom}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.gray[400]} />
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading, isError, refetch } = useCustomerOrders();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>My Orders</Text>
          <View style={{ width: 40 }} />
        </View>
        <ErrorState
          title="Sign in required"
          message="Please sign in to view your orders."
          onRetry={() => router.push('/login')}
          retryLabel="Sign In"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <ErrorState
          title="Could not load orders"
          message="Pull down to try again."
          onRetry={refetch}
        />
      ) : !orders || orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>Start shopping to see your orders here.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.shopBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => router.push({ pathname: '/order-detail', params: { id: item.id } })}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
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
  list: { padding: Spacing.lg, gap: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  productThumb: { width: 60, height: 60, borderRadius: BorderRadius.md },
  thumbPlaceholder: { backgroundColor: Colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  orderNum: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  orderDate: { fontSize: FontSize.sm, color: Colors.text.secondary, marginTop: 2 },
  itemCount: { fontSize: FontSize.sm, color: Colors.text.tertiary, marginTop: 2 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  totalLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.text.secondary },
  totalAmount: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, marginRight: Spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing['4xl'] },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.text.secondary, textAlign: 'center' },
  shopBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  shopBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
