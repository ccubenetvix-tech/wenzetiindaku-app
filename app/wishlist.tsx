/**
 * Wishlist Screen
 * Fetches wishlist from real backend: GET /api/customer/wishlist
 */

import { useAddToCart } from '@/src/api/useCart';
import { useRemoveFromWishlist, useWishlist } from '@/src/api/useCustomer';
import { Header } from '@/src/components';
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

export default function WishlistScreen() {
  const router = useRouter();
  const { data: wishlist, isLoading, isError, refetch } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

  const handleRemove = (productId: string) => {
    removeFromWishlist.mutate(productId);
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.productId,
      name: item.product.name,
      price: item.product.price,
      image: item.product.primaryImage,
      storeId: '',
      storeName: item.product.store?.name || '',
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => router.push(`/product/${item.productId}`)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.product.primaryImage }}
          style={styles.image}
          resizeMode="cover"
        />
        {!item.product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <TouchableOpacity onPress={() => router.push(`/product/${item.productId}`)}>
          <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
        </TouchableOpacity>
        {item.product.store?.name && (
          <Text style={styles.storeName}>{item.product.store.name}</Text>
        )}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={Colors.star} />
          <Text style={styles.rating}>{item.product.rating?.toFixed(1) || '0.0'}</Text>
        </View>
        <Text style={styles.price}>${item.product.price?.toFixed(2)}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cartBtn, !item.product.inStock && styles.cartBtnDisabled]}
            onPress={() => handleAddToCart(item)}
            disabled={!item.product.inStock}
          >
            <Ionicons name="cart-outline" size={16} color={Colors.white} />
            <Text style={styles.cartBtnText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemove(item.productId)}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Wishlist" showSearch={false} showBack />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.emptyText}>Failed to load wishlist</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !wishlist || wishlist.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyText}>Save items you love to find them later</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/products')}>
            <Text style={styles.shopBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  list: { padding: Spacing.lg, gap: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  imageContainer: { width: 110, height: 130 },
  image: { width: '100%', height: '100%' },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  info: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary, marginBottom: 2 },
  storeName: { fontSize: FontSize.sm, color: Colors.text.secondary, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rating: { fontSize: FontSize.sm, color: Colors.text.secondary, marginLeft: 3 },
  price: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: Spacing.sm },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  cartBtnDisabled: { backgroundColor: Colors.gray[300] },
  cartBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, marginTop: Spacing.lg },
  emptyText: { fontSize: FontSize.md, color: Colors.text.secondary, textAlign: 'center', marginTop: Spacing.sm },
  retryBtn: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg },
  retryText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  shopBtn: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg },
  shopBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
