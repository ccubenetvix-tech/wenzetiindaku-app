import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeScreen() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="storefront" size={28} color={Colors.primary} />
          <Text style={styles.logoText}>Wenzetiindaku</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color={Colors.gray[600]} />
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.avatarContainer}>
          {user?.picture ? (
            <Image source={{ uri: user.picture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={Colors.white} />
            </View>
          )}
        </View>
        <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      {/* Content Placeholder */}
      <View style={styles.content}>
        <View style={styles.emptyState}>
          <Ionicons name="construct-outline" size={80} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>Coming Soon</Text>
          <Text style={styles.emptySubtitle}>
            We're building something amazing for you.{'\n'}
            Stay tuned for exciting features!
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name="search" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionText}>Browse</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.secondary + '20' }]}>
            <Ionicons name="cart" size={24} color={Colors.secondary} />
          </View>
          <Text style={styles.actionText}>Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.warning + '20' }]}>
            <Ionicons name="heart" size={24} color={Colors.warning} />
          </View>
          <Text style={styles.actionText}>Wishlist</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.info + '20' }]}>
            <Ionicons name="person" size={24} color={Colors.info} />
          </View>
          <Text style={styles.actionText}>Profile</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 8,
  },
  signOutButton: {
    padding: 8,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.gray[50],
  },
  avatarContainer: {
    marginBottom: 16,
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
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    backgroundColor: Colors.white,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});
