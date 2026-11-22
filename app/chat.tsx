/**
 * Chat Screen — conversation list
 * GET /chat/conversations with polling; tap a conversation to open the thread.
 */

import { useAuth } from '@/contexts/auth-context';
import { useConversations } from '@/src/api/useChat';
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatRelativeTime(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

export default function ChatScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: conversations, isLoading } = useConversations();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={Colors.gray[300]} />
          <Text style={styles.centerTitle}>Sign in to chat</Text>
          <Text style={styles.centerText}>
            Log in to message vendors about products and orders
          </Text>
          <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/login')}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !conversations?.length ? (
        <View style={styles.center}>
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.gray[300]} />
          <Text style={styles.centerTitle}>No conversations yet</Text>
          <Text style={styles.centerText}>
            Tap “Chat with Vendor” on any product or store to start a conversation
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.convoRow}
              activeOpacity={0.6}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.otherParty?.name ?? 'V').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.convoInfo}>
                <View style={styles.convoTopRow}>
                  <Text style={styles.convoName} numberOfLines={1}>
                    {item.otherParty?.name || 'Vendor'}
                  </Text>
                  <Text style={styles.convoTime}>
                    {formatRelativeTime(item.lastMessageAt || item.updatedAt)}
                  </Text>
                </View>
                <View style={styles.convoBottomRow}>
                  <Text style={styles.convoPreview} numberOfLines={1}>
                    Conversation with {item.otherParty?.name || 'vendor'}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>
                        {item.unreadCount > 9 ? '9+' : item.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  centerTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  centerText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    maxWidth: 280,
    lineHeight: 20,
  },
  signInButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius.md,
    ...Shadow.primary,
  },
  signInButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
  },
  convoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
  },
  convoInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  convoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convoName: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
  },
  convoTime: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.normal,
    color: Colors.text.tertiary,
    marginLeft: Spacing.sm,
  },
  convoBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  convoPreview: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
  },
  unreadBadge: {
    backgroundColor: Colors.secondary,
    minWidth: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: Spacing.sm,
  },
  unreadText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.bold,
    color: Colors.white,
  },
});
