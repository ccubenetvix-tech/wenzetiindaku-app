/**
 * Home Screen
 * Main marketplace landing page with hero, categories, products, and stores
 */

import {
    useCategories,
    useFeaturedProducts,
    useTopStores,
} from '@/src/api';
import {
    CategoryCard,
    CategoryCardSkeleton,
    ErrorState,
    Header,
    HeroBanner,
    ProductCard,
    ProductCardSkeleton,
    SectionHeader,
    StoreCard,
    StoreCardSkeleton,
} from '@/src/components';
import { Colors, Spacing } from '@/src/theme';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Data queries
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const { 
    data: products, 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts,
  } = useFeaturedProducts();

  const { 
    data: stores, 
    isLoading: storesLoading, 
    error: storesError,
    refetch: refetchStores,
  } = useTopStores();

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchCategories(),
      refetchProducts(),
      refetchStores(),
    ]);
    setRefreshing(false);
  }, []);

  // Search submit
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/search',
        params: { q: searchQuery },
      });
    }
  };

  // Add to cart feedback
  const handleAddToCart = () => {
    // Could show a toast notification here
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Hero Banner */}
        <HeroBanner />

        {/* Shop by Category Section */}
        <SectionHeader
          title="Shop by Category"
          subtitle="Explore our wide range of product categories"
          onViewAll={() => router.push('/(tabs)/categories')}
        />
        
        {categoriesLoading ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {[1, 2, 3].map((i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </ScrollView>
        ) : categoriesError ? (
          <View style={styles.errorContainer}>
            <ErrorState 
              message="Failed to load categories" 
              onRetry={refetchCategories}
            />
          </View>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <CategoryCard category={item} variant="horizontal" />
            )}
          />
        )}

        {/* Featured Products Section */}
        <SectionHeader
          title="Featured Products"
          subtitle="Handpicked products just for you"
          onViewAll={() => router.push('/products')}
          viewAllText="View All Products"
        />

        {productsLoading ? (
          <View style={styles.productsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </View>
        ) : productsError ? (
          <View style={styles.errorContainer}>
            <ErrorState 
              message="Failed to load products" 
              onRetry={refetchProducts}
            />
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {products?.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </View>
        )}

        {/* Top Stores Section */}
        <SectionHeader
          title="Top Stores"
          subtitle="Discover amazing stores"
          onViewAll={() => router.push('/(tabs)/stores')}
        />

        {storesLoading ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {[1, 2, 3].map((i) => (
              <StoreCardSkeleton key={i} />
            ))}
          </ScrollView>
        ) : storesError ? (
          <View style={styles.errorContainer}>
            <ErrorState 
              message="Failed to load stores" 
              onRetry={refetchStores}
            />
          </View>
        ) : (
          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <StoreCard store={item} variant="horizontal" />
            )}
          />
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  errorContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  bottomSpacing: {
    height: Spacing['4xl'],
  },
});
