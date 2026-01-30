/**
 * Product Details Screen
 * Full product view with image, details, and add to cart
 */

import { useCartStore, useProduct } from '@/src/api';
import { ErrorState, Header } from '@/src/components';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  
  const { data: product, isLoading, error, refetch } = useProduct(id);
  const { addItem, getItemQuantity } = useCartStore();
  
  const quantityInCart = product ? getItemQuantity(product.id) : 0;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      Alert.alert('Added to Cart', `${quantity} x ${product.name} added to your cart`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      router.push('/cart');
    }
  };

  // Render star rating
  const renderRating = () => {
    if (!product) return null;
    
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={styles.ratingContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={18} color={Colors.star} />
        ))}
        {hasHalfStar && (
          <Ionicons name="star-half" size={18} color={Colors.star} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Ionicons key={`empty-${i}`} name="star-outline" size={18} color={Colors.starEmpty} />
        ))}
        <Text style={styles.ratingText}>
          {product.rating.toFixed(1)} ({product.reviewCount} reviews)
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header showSearch={false} showBack title="Product Details" />
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header showSearch={false} showBack title="Product Details" />
        <ErrorState 
          message="Failed to load product details" 
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showSearch={false} showBack title="Product Details" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.primaryImage ? (
            <Image 
              source={{ uri: product.primaryImage }} 
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={80} color={Colors.gray[300]} />
            </View>
          )}
          
          {quantityInCart > 0 && (
            <View style={styles.inCartBadge}>
              <Ionicons name="cart" size={14} color={Colors.white} />
              <Text style={styles.inCartText}>{quantityInCart} in cart</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          
          {renderRating()}

          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <Text style={styles.comparePrice}>${product.compareAtPrice.toFixed(2)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            {product.inStock ? (
              <>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.inStockText}>In Stock</Text>
              </>
            ) : (
              <>
                <Ionicons name="close-circle" size={18} color={Colors.error} />
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </>
            )}
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionLabel}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color={Colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <Ionicons name="cart-outline" size={20} color={Colors.secondary} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.buyNowButton, !product.inStock && styles.disabledButton]}
          onPress={handleBuyNow}
          disabled={!product.inStock}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: width,
    height: width,
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
  inCartBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  inCartText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  infoContainer: {
    padding: Spacing.lg,
  },
  productName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    lineHeight: 30,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  ratingText: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  comparePrice: {
    fontSize: FontSize.lg,
    color: Colors.text.tertiary,
    textDecorationLine: 'line-through',
    marginLeft: Spacing.md,
  },
  discountBadge: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  discountText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  inStockText: {
    fontSize: FontSize.md,
    color: Colors.success,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.xs,
  },
  outOfStockText: {
    fontSize: FontSize.md,
    color: Colors.error,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.xs,
  },
  quantitySection: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
  },
  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
  },
  quantityText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.xl,
  },
  descriptionSection: {
    marginBottom: Spacing['4xl'],
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  actionBar: {
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.md,
    ...Shadow.lg,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  addToCartText: {
    color: Colors.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  buyNowText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  disabledButton: {
    backgroundColor: Colors.gray[300],
  },
});
