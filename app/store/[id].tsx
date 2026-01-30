/**
 * Store Details Screen
 * Shows store info and its products
 */

import { useProductsByStore, useStore } from '@/src/api';
import { EmptyState, ErrorState, Header, ProductCard, ProductCardSkeleton } from '@/src/components';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StoreDetailsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  
  const { data: store, isLoading: storeLoading, error: storeError, refetch: refetchStore } = useStore(id);
  const { data: products, isLoading: productsLoading, error: productsError, refetch: refetchProducts, isRefetching } = useProductsByStore(id);

  const isLoading = storeLoading || productsLoading;
  const error = storeError || productsError;

  const onRefresh = async () => {
    await Promise.all([refetchStore(), refetchProducts()]);
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header showSearch={false} showBack title={name || 'Store'} />
        <ErrorState 
          message="Failed to load store" 
          onRetry={onRefresh}
        />
      </SafeAreaView>
    );
  }

  const renderHeader = () => {
    if (!store) return null;

    return (
      <View style={styles.storeHeader}>
        <View style={styles.storeInfo}>
          {store.logo ? (
            <Image source={{ uri: store.logo }} style={styles.storeLogo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="storefront" size={32} color={Colors.primary} />
            </View>
          )}
          
          <View style={styles.storeDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.storeName}>{store.name}</Text>
              {store.verified && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
              )}
            </View>
            
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.locationText}>{store.city}, {store.country}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="cube-outline" size={16} color={Colors.primary} />
                <Text style={styles.statText}>{store.productCount} Products</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="star" size={16} color={Colors.star} />
                <Text style={styles.statText}>{store.rating.toFixed(1)} ({store.reviewCount})</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {store.categories.map((category, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{category}</Text>
            </View>
          ))}
        </View>

        {store.description && (
          <Text style={styles.storeDescription}>{store.description}</Text>
        )}

        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>Products</Text>
          <Text style={styles.productsCount}>{products?.length || 0} items</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showSearch={false} showBack title={name || 'Store'} />
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => (
          <ProductCard product={item} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingGrid}>
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No products"
              message="This store hasn't added any products yet."
              icon="cube-outline"
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  storeHeader: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  storeInfo: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  storeLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: Spacing.lg,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  storeDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  storeName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tag: {
    backgroundColor: Colors.primaryFaded,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  storeDescription: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  productsTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  productsCount: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  row: {
    gap: Spacing.md,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
});
