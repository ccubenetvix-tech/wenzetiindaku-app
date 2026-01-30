import { useProducts } from '@/src/api/useProducts';
import { EmptyState } from '@/src/components/ErrorState';
import { ProductCard } from '@/src/components/ProductCard';
import { BorderRadius, Colors, FontSize, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [searchQuery, setSearchQuery] = useState(q || '');
  const [debouncedQuery, setDebouncedQuery] = useState(q || '');

  const { data: products, isLoading } = useProducts({ search: debouncedQuery });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const recentSearches = ['Electronics', 'Shoes', 'Bags', 'Watches', 'Phones'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {debouncedQuery.length === 0 ? (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => setSearchQuery(search)}
            >
              <Ionicons name="time-outline" size={20} color={Colors.text.secondary} />
              <Text style={styles.suggestionText}>{search}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.suggestionsTitle, { marginTop: Spacing.lg }]}>
            Popular Categories
          </Text>
          <View style={styles.categoriesGrid}>
            {['Fashion', 'Electronics', 'Home & Garden', 'Sports'].map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryChip}
                onPress={() => setSearchQuery(category)}
              >
                <Text style={styles.categoryChipText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.resultsContainer}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <View style={styles.productWrapper}>
              <ProductCard product={item} />
            </View>
          )}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
            </Text>
          }
        />
      ) : (
        <EmptyState
          title="No results found"
          message={`We couldn't find any products matching "${debouncedQuery}"`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  suggestionsContainer: {
    padding: Spacing.lg,
  },
  suggestionsTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  suggestionText: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    color: Colors.primary[700],
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
  resultsContainer: {
    padding: Spacing.md,
  },
  resultsCount: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: Spacing.md,
  },
});
