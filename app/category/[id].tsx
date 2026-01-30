/**
 * Category Products Screen
 * Lists all products in a specific category
 */

import { useProductsByCategory } from '@/src/api';
import { EmptyState, ErrorState, Header, ProductCard, ProductCardSkeleton } from '@/src/components';
import { Colors, Spacing } from '@/src/theme';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoryProductsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  
  const { 
    data: products, 
    isLoading, 
    error, 
    refetch,
    isRefetching,
  } = useProductsByCategory(id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header showSearch={false} showBack title={name || 'Category'} />
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header showSearch={false} showBack title={name || 'Category'} />
        <ErrorState 
          message="Failed to load products" 
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showSearch={false} showBack title={name || 'Category'} />
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => (
          <ProductCard product={item} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No products"
            message="No products found in this category."
            icon="cube-outline"
          />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  listContent: {
    padding: Spacing.lg,
  },
  row: {
    gap: Spacing.md,
  },
});
