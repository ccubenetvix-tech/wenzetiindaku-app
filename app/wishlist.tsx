/**
 * Wishlist Screen
 * Shows all customer saved items, allows remove and add-to-cart
 */

import { useAuth } from '@/contexts/auth-context';
import { useRemoveFromWishlist, useWishlist, type WishlistItem } from '@/src/api/useCustomer';
import { useCartStore } from '@/src/api/useCart';
import { ErrorState } from '@/src/components';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function WishlistCard({ item, onRemove, onAddToCart }: {
  item: WishlistItem;
  onRemove: () => void;
  onAddToCart: () => void;
}) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.storeName}>{item.storeName}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        {!item.inStock && <Text style={styles.outOfStock}>Out of Stock</Text>}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onRemove} style={styles.iconBtn}>
          <Ionicons name="heart" size={22} color={Colors.error} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAddToCart}
          style={[styles.addBtn, !item.inStock && styles.addBtnDisabled]}
          disabled={!item.inStock}
        >
          <Ionicons name="bag-add-outline" size={16} color={Colors.white} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WishlistScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: wishlist, isLoading, isError, refetch } = useWishlist();
  const { mutate: removeItem } = useRemoveFromWishlist();
  const { addItem } = useCartStore();

  const handleRemove = (item: WishlistItem) => {
    Alert.alert('Remove from Wishlist', `Remove "${item.name}" from your wishlist?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(item.id) },
    ]);
  };

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      storeId: '',
      storeName: item.storeName,
      quantity: 1,
    });
    router.push('/cart');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Wishlist</Text>
          <View style={{ width: 40 }} />
        </View>
        <ErrorState
          title="Sign in required"
          message="Please sign in to view your wishlist."
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
        <Text style={styles.title}>Wishlist</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : isError ? (
        <ErrorState title="Could not load wishlist" message="Pull down to try again." onRetry={refetch} />
      ) : !wishlist || wishlist.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>Save items you love for later.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.shopBtnText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <WishlistCard
              item={item}
              onRemove={() => handleRemove(item)}
              onAddToCart={() => handleAddToCart(item)}
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
    flexDirection: 'row',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  image: { width: 96, height: 96 },
  info: { flex: 1, padding: Spacing.md, justifyContent: 'center', gap: 2 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text.primary },
  storeName: { fontSize: FontSize.sm, color: Colors.text.secondary },
  price: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary, marginTop: 4 },
  outOfStock: { fontSize: FontSize.xs, color: Colors.error, fontWeight: FontWeight.medium },
  actions: { padding: Spacing.md, justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { padding: Spacing.sm },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  addBtnDisabled: { backgroundColor: Colors.gray[300] },
  addBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
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
