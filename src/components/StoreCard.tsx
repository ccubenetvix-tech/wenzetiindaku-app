/**
 * Store Card Component
 * Displays a store with logo, name, location, and category tags
 */

import { Store } from '@/src/api';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

interface StoreCardProps {
  store: Store;
  variant?: 'horizontal' | 'vertical';
}

export function StoreCard({ store, variant = 'horizontal' }: StoreCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/store/[id]',
      params: { id: store.id, name: store.name },
    });
  };

  if (variant === 'vertical') {
    return (
      <TouchableOpacity style={styles.verticalCard} onPress={handlePress}>
        <View style={styles.verticalHeader}>
          {store.logo ? (
            <Image source={{ uri: store.logo }} style={styles.verticalLogo} />
          ) : (
            <View style={styles.verticalLogoPlaceholder}>
              <Ionicons name="storefront" size={24} color={Colors.primary} />
            </View>
          )}
          {store.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
            </View>
          )}
        </View>
        
        <Text style={styles.verticalName} numberOfLines={1}>{store.name}</Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
          <Text style={styles.locationText}>{store.city}, {store.country}</Text>
        </View>

        <Text style={styles.productCount}>{store.productCount} Products</Text>

        <View style={styles.tagsContainer}>
          {store.categories.slice(0, 2).map((category, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{category}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.horizontalCard} onPress={handlePress}>
      <View style={styles.horizontalHeader}>
        {store.logo ? (
          <Image source={{ uri: store.logo }} style={styles.horizontalLogo} />
        ) : (
          <View style={styles.horizontalLogoPlaceholder}>
            <Ionicons name="storefront" size={32} color={Colors.primary} />
          </View>
        )}
        {store.verified && (
          <View style={styles.verifiedBadgeHorizontal}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
          </View>
        )}
      </View>

      <View style={styles.horizontalContent}>
        <Text style={styles.horizontalName} numberOfLines={1}>{store.name}</Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
          <Text style={styles.locationText}>{store.city}, {store.country}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="cube-outline" size={14} color={Colors.primary} />
            <Text style={styles.statText}>{store.productCount} Products</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color={Colors.star} />
            <Text style={styles.statText}>{store.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {store.categories.slice(0, 3).map((category, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{category}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Horizontal variant (for home screen carousel)
  horizontalCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
    ...Shadow.md,
  },
  horizontalHeader: {
    height: 100,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  horizontalLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  horizontalLogoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadgeHorizontal: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
  },
  horizontalContent: {
    padding: Spacing.md,
  },
  horizontalName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  // Vertical variant (for stores list)
  verticalCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
    ...Shadow.md,
  },
  verticalHeader: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  verticalLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  verticalLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
  },
  verticalName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  // Shared styles
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  productCount: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
});

export default StoreCard;
