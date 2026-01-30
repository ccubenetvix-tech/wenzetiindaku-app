/**
 * Hero Banner Component
 * Main hero section for the home screen
 */

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export function HeroBanner() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.badge}>
            <Ionicons name="star" size={12} color={Colors.accent} />
            <Text style={styles.badgeText}>Premium Marketplace</Text>
          </View>

          <Text style={styles.title}>Your Premium{'\n'}Marketplace</Text>
          
          <Text style={styles.subtitle}>
            Discover millions of products from trusted sellers worldwide. Shop with confidence and get the best deals.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/categories')}
            >
              <Text style={styles.primaryButtonText}>Start Shopping</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => {/* Navigate to vendor signup */}}
            >
              <Ionicons name="storefront-outline" size={18} color={Colors.white} />
              <Text style={styles.secondaryButtonText}>Sell on Platform</Text>
            </TouchableOpacity>
          </View>

          {/* Feature badges */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.secondary} />
              <Text style={styles.featureText}>Secure</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="headset" size={16} color={Colors.secondary} />
              <Text style={styles.featureText}>24/7 Support</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="pricetag" size={16} color={Colors.secondary} />
              <Text style={styles.featureText}>Best Prices</Text>
            </View>
          </View>
        </View>

        {/* Decorative elements */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    zIndex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  badgeText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.xs,
  },
  title: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.md,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  secondaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  features: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  decorCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -30,
    right: 50,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export default HeroBanner;
