/**
 * Categories Screen
 * Full list of all product categories
 */

import { useCategories } from '@/src/api';
import { CategoryCard, CategoryCardSkeleton, EmptyState, ErrorState, Header } from '@/src/components';
import { Colors, Spacing } from '@/src/theme';
import React from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const { 
    data: categories, 
    isLoading, 
    error, 
    refetch,
    isRefetching,
  } = useCategories();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header showSearch={false} title="Categories" />
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.gridItem}>
              <CategoryCardSkeleton />
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header showSearch={false} title="Categories" />
        <ErrorState 
          message="Failed to load categories" 
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showSearch={false} title="Categories" />
      
      <FlatList
        data={categories}
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
          <View style={styles.gridItem}>
            <CategoryCard category={item} variant="grid" />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No categories"
            message="Categories will appear here soon."
            icon="grid-outline"
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
    padding: Spacing.md,
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
  },
  listContent: {
    padding: Spacing.md,
  },
  row: {
    gap: Spacing.sm,
  },
});
