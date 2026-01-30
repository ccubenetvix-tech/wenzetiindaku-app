/**
 * Cart Screen
 * Shopping cart with items, quantities, and checkout
 */

import { CartItem, useCartStore } from '@/src/api';
import { EmptyState, Header } from '@/src/components';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function CartItemCard({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleRemove = () => {
    Alert.alert(
      'Remove Item',
      `Remove ${item.product.name} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeItem(item.productId),
        },
      ]
    );
  };

  return (
    <View style={styles.cartItem}>
      <View style={styles.itemImageContainer}>
        {item.product.primaryImage ? (
          <Image source={{ uri: item.product.primaryImage }} style={styles.itemImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={24} color={Colors.gray[300]} />
          </View>
        )}
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        
        <View style={styles.quantityRow}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.productId, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.productId, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleRemove}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 50 ? 0 : (subtotal > 0 ? 5 : 0);
  const tax = 0; // No tax for now
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    // Navigate to checkout flow
    router.push('/checkout');
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: clearCart,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showSearch={false} showBack title="Shopping Cart" />

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Browse products and add items to your cart"
          icon="cart-outline"
          actionLabel="Start Shopping"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <>
          <View style={styles.cartHeader}>
            <Text style={styles.itemCount}>{items.length} items</Text>
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <CartItemCard item={item} />}
          />

          {/* Order Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </Text>
            </View>

            {subtotal < 50 && subtotal > 0 && (
              <Text style={styles.freeShippingNote}>
                Add ${(50 - subtotal).toFixed(2)} more for free shipping
              </Text>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Ionicons name="lock-closed" size={18} color={Colors.white} />
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  itemCount: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
  clearText: {
    fontSize: FontSize.md,
    color: Colors.error,
    fontWeight: FontWeight.medium,
  },
  listContent: {
    padding: Spacing.lg,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.gray[100],
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
  },
  quantityText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.md,
  },
  itemTotal: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    ...Shadow.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: FontSize.md,
    color: Colors.text.primary,
    fontWeight: FontWeight.medium,
  },
  freeShippingNote: {
    fontSize: FontSize.sm,
    color: Colors.secondary,
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  checkoutText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
