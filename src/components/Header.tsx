/**
 * Header Component
 * App header with logo, search bar, and cart icon
 */

import { useCartItemCount } from '@/src/api';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WenzeLogo = require('@/assets/images/splash-icon.png');

interface HeaderProps {
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onSearchSubmit?: () => void;
  title?: string;
  showBack?: boolean;
}

export function Header({
  showSearch = true,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  title,
  showBack = false,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cartItemCount = useCartItemCount();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <Image source={WenzeLogo} style={styles.logoImage} resizeMode="contain" />
            <View>
              <Text style={styles.logoText}>WENZE</Text>
              <Text style={styles.logoTextGreen}>TII NDAKU</Text>
            </View>
          </View>
        )}

        {title && (
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        )}

        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="cart-outline" size={24} color={Colors.text.primary} />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products, brands and more…"
            placeholderTextColor={Colors.gray[400]}
            value={searchValue}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    ...Shadow.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoImage: {
    width: 36,
    height: 36,
    marginRight: Spacing.sm,
  },
  logoText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  logoTextGreen: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.secondary,
    letterSpacing: 1,
    marginTop: -2,
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  cartButton: {
    padding: Spacing.xs,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
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
});

export default Header;
