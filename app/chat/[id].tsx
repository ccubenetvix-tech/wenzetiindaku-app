/**
 * Chat Thread Screen
 * GET /chat/conversations/:id/messages (5s polling), POST to send,
 * marks the conversation read on open.
 */

import { useAuth } from '@/contexts/auth-context';
import {
  useChatMessages,
  useConversations,
  useMarkConversationRead,
  useSendMessage,
} from '@/src/api/useChat';
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatThreadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const conversationId = id ?? '';

  const { data: messages, isLoading } = useChatMessages(conversationId);
  const { data: conversations } = useConversations();
  const sendMessage = useSendMessage();
  const markRead = useMarkConversationRead();

  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const conversation = conversations?.find((c) => c.id === conversationId);
  const vendorName = conversation?.otherParty?.name ?? 'Vendor';

  // Mark read when opening the thread
  useEffect(() => {
    if (conversationId && isAuthenticated) {
      markRead.mutate(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isAuthenticated]);

  // Scroll to the newest message
  useEffect(() => {
    if (messages?.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages?.length]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={Colors.gray[300]} />
          <Text style={styles.emptyText}>Please sign in to view this conversation</Text>
          <TouchableOpacity
            style={[styles.sendButton, { marginTop: Spacing.lg }]}
            onPress={() => router.replace('/login')}
          >
            <Ionicons name="log-in-outline" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSend = () => {
    const content = draft.trim();
    if (!content || sendMessage.isPending) return;
    sendMessage.mutate(
      { conversationId, content },
      {
        onSuccess: () => setDraft(''),
        onError: (e: any) =>
          console.warn('Failed to send message:', e?.message),
      },
    );
  };

  const renderMessage = ({ item }: { item: any }) => {
    const mine = item.senderRole === 'customer';
    const time = new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <View style={[styles.messageRow, mine && styles.messageRowMine]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
            {item.content}
          </Text>
          <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>{time}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {vendorName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {vendorName}
          </Text>
          <Text style={styles.headerSubtitle}>Usually replies within a day</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages ?? []}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="chatbubble-ellipses-outline" size={40} color={Colors.gray[300]} />
                <Text style={styles.emptyText}>
                  Say hello to {vendorName} — ask about products, sizes or delivery
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message…"
            placeholderTextColor={Colors.gray[400]}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!draft.trim() || sendMessage.isPending) && styles.sendDisabled]}
            onPress={handleSend}
            disabled={!draft.trim() || sendMessage.isPending}
          >
            {sendMessage.isPending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: Spacing.sm,
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
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  headerName: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  emptyText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    maxWidth: 260,
    lineHeight: 20,
  },
  listContent: {
    padding: Spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    justifyContent: 'flex-start',
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.sm,
  },
  bubbleTheirs: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  bubbleText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.normal,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: Colors.white,
  },
  bubbleTime: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.normal,
    color: Colors.text.tertiary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeMine: {
    color: Colors.white + '99',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    fontFamily: FontFamily.normal,
    color: Colors.text.primary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.5,
  },
});
