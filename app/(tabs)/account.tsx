/**
 * Account Tab
 * Profile summary and links to customer areas (orders, wishlist, addresses,
 * profile, legal). Mirrors the website's customer dashboard navigation.
 */

import { useAuth } from '@/contexts/auth-context';
import {
  useCustomerAddresses,
  useCustomerOrders,
  useCustomerProfile,
  useWishlist,
} from '@/src/api/useCustomer';
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string;
  onPress: () => void;
  accent?: boolean;
  isLast?: boolean;
}

function MenuItem({ icon, label, badge, onPress, accent, isLast }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, (!isLast || !!accent) && styles.menuItemBorder]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.menuIconWrap, accent && { backgroundColor: Colors.secondaryFaded }]}>
        <Ionicons name={icon} size={20} color={accent ? Colors.secondary : Colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {badge ? (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={Colors.gray[400]} />
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const { data: profile } = useCustomerProfile();
  const { data: orders } = useCustomerOrders();
  const { data: addresses } = useCustomerAddresses();
  const { data: wishlist } = useWishlist();

  const displayName =
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim()
      : user?.name ?? '';
  const displayEmail = profile?.email ?? user?.email ?? '';
  const initials = displayName
    ? displayName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'W';

  const handleSignOut = () => {
    signOut();
  };

  const orderCount = orders?.length;
  const wishlistCount = wishlist?.length;
  const addressCount = addresses?.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <LinearGradient
          colors={Colors.gradientHero as unknown as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {authLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : isAuthenticated ? (
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {displayName || 'Welcome'}
                </Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {displayEmail}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push('/profile/edit')}
              >
                <Ionicons name="pencil" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.guestBox}>
              <Ionicons name="person-circle-outline" size={48} color={Colors.white} />
              <Text style={styles.guestTitle}>Welcome to Wenze Tii Ndaku</Text>
              <Text style={styles.guestSubtitle}>
                Sign in to track orders, save addresses and more
              </Text>
              <View style={styles.guestActions}>
                <TouchableOpacity
                  style={styles.guestSignIn}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.guestSignInText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.guestSignUp}
                  onPress={() => router.push('/signup')}
                >
                  <Text style={styles.guestSignUpText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Quick stats */}
        {isAuthenticated && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{orderCount ?? 0}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{wishlistCount ?? 0}</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{addressCount ?? 0}</Text>
              <Text style={styles.statLabel}>Addresses</Text>
            </View>
          </View>
        )}

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="receipt-outline"
              label="My Orders"
              badge={orderCount ? String(orderCount) : undefined}
              onPress={() => router.push('/orders')}
            />
            <MenuItem
              icon="heart-outline"
              label="My Wishlist"
              badge={wishlistCount ? String(wishlistCount) : undefined}
              onPress={() => router.push('/wishlist')}
            />
            <MenuItem
              icon="location-outline"
              label="My Addresses"
              badge={addressCount ? String(addressCount) : undefined}
              onPress={() => router.push('/addresses')}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support &amp; Legal</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="chatbubble-ellipses-outline"
              label="Chat & Support"
              accent
              onPress={() => router.push('/chat')}
            />
            <MenuItem
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => router.push('/legal?type=terms')}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => router.push('/legal?type=privacy')}
              isLast
            />
          </View>
        </View>

        {isAuthenticated && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.footerText}>Wenze Tii Ndaku · v1.0.0</Text>
        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['2xl'],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white + '30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white + '60',
  },
  avatarText: {
    fontSize: FontSize['2xl'],
    fontFamily: FontFamily.bold,
    color: Colors.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.white,
  },
  profileEmail: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.normal,
    color: Colors.white + 'CC',
    marginTop: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBox: {
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: Colors.white,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.normal,
    color: Colors.white + 'CC',
    marginTop: Spacing.xs,
    textAlign: 'center',
    maxWidth: 260,
  },
  guestActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  guestSignIn: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  guestSignInText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
  },
  guestSignUp: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  guestSignUpText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing['2xl'],
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.medium,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: FontFamily.medium,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
  menuBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  menuBadgeText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.semibold,
    color: Colors.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error + '40',
    ...Shadow.sm,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.error,
  },
  footerText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.normal,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
