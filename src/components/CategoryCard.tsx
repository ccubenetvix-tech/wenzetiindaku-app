/**
 * Category Card Component
 * Displays a category with image, name, and product count
 */

import { Category } from '@/src/api';
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
const CARD_WIDTH = width * 0.42;

interface CategoryCardProps {
  category: Category;
  variant?: 'horizontal' | 'grid';
}

export function CategoryCard({ category, variant = 'horizontal' }: CategoryCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/category/[id]',
      params: { id: category.id, name: category.name },
    });
  };

  if (variant === 'grid') {
    return (
      <TouchableOpacity style={styles.gridCard} onPress={handlePress}>
        <View style={styles.gridImageContainer}>
          {category.image ? (
            <Image source={{ uri: category.image }} style={styles.gridImage} />
          ) : (
            <View style={styles.gridImagePlaceholder}>
              <Ionicons 
                name={(category.icon as any) || 'grid-outline'} 
                size={32} 
                color={Colors.primary} 
              />
            </View>
          )}
        </View>
        <View style={styles.gridContent}>
          <Text style={styles.gridTitle} numberOfLines={2}>{category.name}</Text>
          <Text style={styles.gridDescription} numberOfLines={2}>
            {category.description}
          </Text>
          <Text style={styles.productCount}>{category.productCount} Products</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.horizontalCard} onPress={handlePress}>
      <View style={styles.horizontalImageContainer}>
        {category.image ? (
          <Image source={{ uri: category.image }} style={styles.horizontalImage} />
        ) : (
          <View style={styles.horizontalImagePlaceholder}>
            <Ionicons 
              name={(category.icon as any) || 'grid-outline'} 
              size={28} 
              color={Colors.primary} 
            />
          </View>
        )}
      </View>
      <View style={styles.horizontalContent}>
        <Text style={styles.horizontalTitle} numberOfLines={1}>{category.name}</Text>
        <Text style={styles.horizontalDescription} numberOfLines={1}>
          {category.description}
        </Text>
        <Text style={styles.productCount}>{category.productCount} Products</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Horizontal variant (carousel)
  horizontalCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
    ...Shadow.md,
  },
  horizontalImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.gray[100],
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  horizontalImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryFaded,
  },
  horizontalContent: {
    padding: Spacing.md,
  },
  horizontalTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  horizontalDescription: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },

  // Grid variant
  gridCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    margin: Spacing.xs,
    overflow: 'hidden',
    ...Shadow.md,
  },
  gridImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.gray[100],
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryFaded,
  },
  gridContent: {
    padding: Spacing.md,
  },
  gridTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  gridDescription: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },

  // Shared
  productCount: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
});

export default CategoryCard;
