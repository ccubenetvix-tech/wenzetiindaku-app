/**
 * Order Summary Card Component
 * Shows order items and totals
 */

import { OrderSummary } from '@/src/api/checkoutTypes';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OrderSummaryCardProps {
  summary: OrderSummary;
  collapsible?: boolean;
  showItems?: boolean;
}

export function OrderSummaryCard({ 
  summary, 
  collapsible = true,
  showItems = true,
}: OrderSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Summary</Text>
        {collapsible && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={Colors.text.secondary} 
            />
          </TouchableOpacity>
        )}
      </View>

      {(isExpanded || !collapsible) && showItems && (
        <View style={styles.itemsList}>
          {summary.items.map((item) => (
            <View key={item.id} style={styles.item}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.imagePlaceholder]}>
                  <Ionicons name="image-outline" size={16} color={Colors.gray[300]} />
                </View>
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.totalsContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Items ({summary.itemCount})</Text>
          <Text style={styles.value}>${summary.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Shipping</Text>
          <Text style={[styles.value, summary.shipping === 0 && styles.freeShipping]}>
            {summary.shipping === 0 ? 'FREE' : `$${summary.shipping.toFixed(2)}`}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>VAT ({(summary.vatRate * 100).toFixed(0)}%)</Text>
          <Text style={styles.value}>${summary.vat.toFixed(2)}</Text>
        </View>
        {summary.discount && summary.discount > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, styles.discountLabel]}>
              Discount {summary.discountCode ? `(${summary.discountCode})` : ''}
            </Text>
            <Text style={[styles.value, styles.discountValue]}>
              -${summary.discount.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${summary.total.toFixed(2)}</Text>
      </View>

      {/* Security badges */}
      <View style={styles.badges}>
        <View style={styles.badge}>
          <Ionicons name="lock-closed" size={14} color={Colors.secondary} />
          <Text style={styles.badgeText}>SSL Encrypted</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="rocket" size={14} color={Colors.secondary} />
          <Text style={styles.badgeText}>Fast Delivery</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  itemsList: {
    marginBottom: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  imagePlaceholder: {
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  itemQty: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  itemPrice: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.md,
  },
  totalsContainer: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
  value: {
    fontSize: FontSize.md,
    color: Colors.text.primary,
  },
  freeShipping: {
    color: Colors.secondary,
    fontWeight: FontWeight.medium,
  },
  discountLabel: {
    color: Colors.secondary,
  },
  discountValue: {
    color: Colors.secondary,
    fontWeight: FontWeight.medium,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badgeText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
});

export default OrderSummaryCard;
