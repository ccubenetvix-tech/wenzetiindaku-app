/**
 * Account Screen
 * User profile, orders, settings, and about/support
 */

import { useAuth } from '@/contexts/auth-context';
import { Header } from '@/src/components';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WenzeLogo = require('@/assets/images/icon.png');

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  iconColor?: string;
}

function MenuItem({ icon, title, subtitle, onPress, showArrow = true, iconColor = Colors.text.primary }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
      )}
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const handleContact = (type: 'email' | 'phone') => {
    if (type === 'email') {
      Linking.openURL('mailto:wenzetiindaku@outlook.com');
    } else {
      Linking.openURL('tel:+32495846866');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showSearch={false} title="Account" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {isAuthenticated && user ? (
            <>
              <View style={styles.avatarContainer}>
                {user.picture ? (
                  <Image source={{ uri: user.picture }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={32} color={Colors.white} />
                  </View>
                )}
              </View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </>
          ) : (
            <>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color={Colors.white} />
              </View>
              <Text style={styles.userName}>Guest User</Text>
              <TouchableOpacity 
                style={styles.signInButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Account Menu */}
        {isAuthenticated && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>My Account</Text>
            <View style={styles.menuCard}>
              <MenuItem
                icon="cube-outline"
                title="My Orders"
                subtitle="Track and manage orders"
                onPress={() => {/* Navigate to orders */}}
                iconColor={Colors.primary}
              />
              <MenuItem
                icon="heart-outline"
                title="Wishlist"
                subtitle="Your saved items"
                onPress={() => {/* Navigate to wishlist */}}
                iconColor={Colors.error}
              />
              <MenuItem
                icon="location-outline"
                title="Addresses"
                subtitle="Manage delivery addresses"
                onPress={() => {/* Navigate to addresses */}}
                iconColor={Colors.secondary}
              />
              <MenuItem
                icon="card-outline"
                title="Payment Methods"
                subtitle="Manage payment options"
                onPress={() => {/* Navigate to payments */}}
                iconColor={Colors.accent}
              />
            </View>
          </View>
        )}

        {/* Support Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              title="Help Center"
              onPress={() => {/* Navigate to help */}}
              iconColor={Colors.info}
            />
            <MenuItem
              icon="chatbubble-ellipses-outline"
              title="FAQs"
              onPress={() => {/* Navigate to FAQs */}}
              iconColor={Colors.primary}
            />
            <MenuItem
              icon="airplane-outline"
              title="Shipping Info"
              onPress={() => {/* Navigate to shipping */}}
              iconColor={Colors.secondary}
            />
            <MenuItem
              icon="return-up-back-outline"
              title="Returns & Refunds"
              onPress={() => {/* Navigate to returns */}}
              iconColor={Colors.accent}
            />
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactDescription}>
              Your premier multi-vendor marketplace connecting you with the best local and international vendors across Africa and beyond.
            </Text>
            
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleContact('email')}
            >
              <Ionicons name="mail" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>wenzetiindaku@outlook.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleContact('phone')}
            >
              <Ionicons name="call" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>+32 495 84 68 66</Text>
            </TouchableOpacity>
            
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>Kinshasa, R.D. CONGO</Text>
            </View>
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="document-text-outline"
              title="Privacy Policy"
              onPress={() => {/* Navigate to privacy */}}
              iconColor={Colors.gray[600]}
            />
            <MenuItem
              icon="newspaper-outline"
              title="Terms of Service"
              onPress={() => {/* Navigate to terms */}}
              iconColor={Colors.gray[600]}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Cookie Policy"
              onPress={() => {/* Navigate to cookies */}}
              iconColor={Colors.gray[600]}
            />
            <MenuItem
              icon="storefront-outline"
              title="Vendor Terms"
              onPress={() => {/* Navigate to vendor terms */}}
              iconColor={Colors.gray[600]}
            />
          </View>
        </View>

        {/* Sign Out */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        {/* Version */}
        <View style={styles.versionContainer}>
          <Image source={WenzeLogo} style={styles.footerLogo} resizeMode="contain" />
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2025 WENZE TII NDAKU. All rights reserved.</Text>
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    backgroundColor: Colors.white,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
  signInButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius.lg,
  },
  signInButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  menuSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    marginLeft: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  menuCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  menuSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  contactCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  contactDescription: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  contactText: {
    fontSize: FontSize.md,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerLogo: {
    width: 60,
    height: 60,
    marginBottom: Spacing.sm,
  },
  version: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  copyright: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: Spacing['4xl'],
  },
});
