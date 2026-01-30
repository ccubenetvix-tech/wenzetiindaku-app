/**
 * Stores Screen
 * List of all stores with search functionality
 */

import { useStores } from '@/src/api';
import { EmptyState, ErrorState, Header, StoreCard, StoreCardSkeleton } from '@/src/components';
import { BorderRadius, Colors, FontSize, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StoresScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    data: stores, 
    isLoading, 
    error, 
    refetch,
    isRefetching,
  } = useStores();

  // Filter stores based on search
  const filteredStores = useMemo(() => {
    if (!stores) return [];
    if (!searchQuery.trim()) return stores;
    
    const query = searchQuery.toLowerCase();
    return stores.filter(store => 
      store.name.toLowerCase().includes(query) ||
      store.city.toLowerCase().includes(query) ||
      store.categories.some(cat => cat.toLowerCase().includes(query))
    );
  }, [stores, searchQuery]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header showSearch={false} title="Stores" />
        <View style={styles.content}>
          {[1, 2, 3].map((i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header showSearch={false} title="Stores" />
        <ErrorState 
          message="Failed to load stores" 
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showSearch={false} title="Stores" />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stores..."
          placeholderTextColor={Colors.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => (
          <StoreCard store={item} variant="vertical" />
        )}
        ListEmptyComponent={
          searchQuery ? (
            <EmptyState
              title="No stores found"
              message={`No stores match "${searchQuery}"`}
              icon="storefront-outline"
            />
          ) : (
            <EmptyState
              title="No stores"
              message="Stores will appear here soon."
              icon="storefront-outline"
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
  content: {
    padding: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: FontSize.md,
    color: Colors.text.primary,
  },
  listContent: {
    paddingBottom: Spacing['4xl'],
  },
});
