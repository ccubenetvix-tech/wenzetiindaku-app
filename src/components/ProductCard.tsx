/**
 * Product Card Component
 * Displays a product with image, name, rating, price, and add to cart button
 */

import { Product, useCartStore } from '@/src/api';
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
const CARD_WIDTH = (width - Spacing.lg * 2 - Spacing.md) / 2;

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const router = useRouter();
  const { addItem, getItemQuantity } = useCartStore();
  const quantityInCart = getItemQuantity(product.id);

  const handlePress = () => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id },
    });
  };

  const handleAddToCart = () => {
    addItem(product);
    onAddToCart?.();
  };

  // Render star rating
  const renderRating = () => {
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={styles.ratingContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={12} color={Colors.star} />
        ))}
        {hasHalfStar && (
          <Ionicons name="star-half" size={12} color={Colors.star} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Ionicons key={`empty-${i}`} name="star-outline" size={12} color={Colors.starEmpty} />
        ))}
        <Text style={styles.ratingText}>
          {product.rating.toFixed(1)} ({product.reviewCount})
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.primaryImage ? (
          <Image 
            source={{ uri: product.primaryImage }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color={Colors.gray[300]} />
          </View>
        )}
        
        {/* Cart quantity badge */}
        {quantityInCart > 0 && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityBadgeText}>{quantityInCart}</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        {renderRating()}

        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <Text style={styles.comparePrice}>${product.compareAtPrice.toFixed(2)}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={16} color={Colors.white} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: Colors.gray[100],
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBadgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
    minHeight: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratingText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  comparePrice: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    textDecorationLine: 'line-through',
    marginLeft: Spacing.sm,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  addToCartText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});

export default ProductCard;
