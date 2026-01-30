/**
 * Loading Skeleton Components
 * Skeleton loaders for various content types
 */

import { BorderRadius, Colors, Spacing } from '@/src/theme';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ 
  width: skeletonWidth = '100%', 
  height = 20, 
  borderRadius = BorderRadius.md,
  style 
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: skeletonWidth,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  const cardWidth = (width - Spacing.lg * 2 - Spacing.md) / 2;

  return (
    <View style={[styles.productCard, { width: cardWidth }]}>
      <Skeleton width="100%" height={cardWidth} borderRadius={BorderRadius.lg} />
      <View style={styles.productContent}>
        <Skeleton width="100%" height={16} style={{ marginBottom: Spacing.sm }} />
        <Skeleton width="60%" height={14} style={{ marginBottom: Spacing.sm }} />
        <Skeleton width="40%" height={20} style={{ marginBottom: Spacing.md }} />
        <Skeleton width="100%" height={36} borderRadius={BorderRadius.md} />
      </View>
    </View>
  );
}

export function CategoryCardSkeleton() {
  return (
    <View style={styles.categoryCard}>
      <Skeleton width="100%" height={100} borderRadius={0} />
      <View style={styles.categoryContent}>
        <Skeleton width="80%" height={16} style={{ marginBottom: Spacing.xs }} />
        <Skeleton width="100%" height={14} style={{ marginBottom: Spacing.sm }} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
}

export function StoreCardSkeleton() {
  return (
    <View style={styles.storeCard}>
      <View style={styles.storeHeader}>
        <Skeleton width={70} height={70} borderRadius={35} />
      </View>
      <View style={styles.storeContent}>
        <Skeleton width="60%" height={18} style={{ marginBottom: Spacing.xs }} />
        <Skeleton width="50%" height={14} style={{ marginBottom: Spacing.sm }} />
        <Skeleton width="40%" height={14} style={{ marginBottom: Spacing.md }} />
        <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
          <Skeleton width={60} height={22} borderRadius={BorderRadius.sm} />
          <Skeleton width={60} height={22} borderRadius={BorderRadius.sm} />
        </View>
      </View>
    </View>
  );
}

export function HeroBannerSkeleton() {
  return (
    <View style={styles.heroBanner}>
      <Skeleton width="60%" height={32} style={{ marginBottom: Spacing.md }} />
      <Skeleton width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
      <Skeleton width="90%" height={16} style={{ marginBottom: Spacing.xl }} />
      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <Skeleton width={140} height={44} borderRadius={BorderRadius.lg} />
        <Skeleton width={140} height={44} borderRadius={BorderRadius.lg} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.gray[200],
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  productContent: {
    padding: Spacing.md,
  },
  categoryCard: {
    width: width * 0.42,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  categoryContent: {
    padding: Spacing.md,
  },
  storeCard: {
    width: width * 0.7,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  storeHeader: {
    height: 100,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeContent: {
    padding: Spacing.md,
  },
  heroBanner: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing['3xl'],
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.xl,
  },
});

export default Skeleton;
