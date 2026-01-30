import { useProducts } from '@/src/api/useProducts';
import { EmptyState, ErrorState } from '@/src/components/ErrorState';
import { ProductCard } from '@/src/components/ProductCard';
import { Skeleton } from '@/src/components/Skeleton';
import { BorderRadius, Colors, FontSize, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ProductsScreen() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortOptions, setShowSortOptions] = useState(false);

  const { data: products, isLoading, error, refetch } = useProducts();

  const sortedProducts = products
    ? [...products].sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      })
    : [];

  const renderHeader = () => (
    <View style={styles.filterBar}>
      <Text style={styles.productCount}>
        {sortedProducts.length} Product{sortedProducts.length !== 1 ? 's' : ''}
      </Text>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setShowSortOptions(!showSortOptions)}
      >
        <Ionicons name="funnel-outline" size={18} color={Colors.text.secondary} />
        <Text style={styles.sortButtonText}>
          {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
        </Text>
        <Ionicons
          name={showSortOptions ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.text.secondary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderSortOptions = () =>
    showSortOptions && (
      <View style={styles.sortOptionsContainer}>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortOption,
              sortBy === option.value && styles.sortOptionActive,
            ]}
            onPress={() => {
              setSortBy(option.value);
              setShowSortOptions(false);
            }}
          >
            <Text
              style={[
                styles.sortOptionText,
                sortBy === option.value && styles.sortOptionTextActive,
              ]}
            >
              {option.label}
            </Text>
            {sortBy === option.value && (
              <Ionicons name="checkmark" size={18} color={Colors.primary[600]} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={styles.skeletonItem}>
            <Skeleton height={150} borderRadius={BorderRadius.lg} />
            <Skeleton height={16} width="80%" style={{ marginTop: Spacing.sm }} />
            <Skeleton height={14} width="60%" style={{ marginTop: Spacing.xs }} />
            <Skeleton height={20} width="40%" style={{ marginTop: Spacing.sm }} />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Products</Text>
        <TouchableOpacity
          onPress={() => router.push('/search')}
          style={styles.searchButton}
        >
          <Ionicons name="search" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        renderSkeleton()
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : sortedProducts.length === 0 ? (
        <EmptyState
          title="No products available"
          message="Check back later for new products"
        />
      ) : (
        <FlatList
          data={sortedProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderSortOptions()}
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.productWrapper}>
              <ProductCard product={item} />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  searchButton: {
    padding: Spacing.xs,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  productCount: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
  },
  sortButtonText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  sortOptionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...StyleSheet.flatten([
      {
        shadowColor: Colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    ]),
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  sortOptionActive: {
    backgroundColor: Colors.primary[50],
  },
  sortOptionText: {
    fontSize: FontSize.md,
    color: Colors.text.primary,
  },
  sortOptionTextActive: {
    color: Colors.primary[600],
    fontWeight: '600',
  },
  listContainer: {
    padding: Spacing.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  skeletonContainer: {
    padding: Spacing.md,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonItem: {
    width: '48%',
    marginBottom: Spacing.lg,
  },
});
