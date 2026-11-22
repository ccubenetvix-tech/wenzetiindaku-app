/**
 * VendorChatButton
 * Starts (or reuses) a conversation with a vendor and opens the chat thread.
 * Used on product detail and store detail screens.
 */

import { useStartConversation } from '@/src/api/useChat';
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
  vendorId: string;
  vendorName?: string;
}

export default function VendorChatButton({ vendorId, vendorName }: Props) {
  const router = useRouter();
  const startConversation = useStartConversation();

  const handleChat = () => {
    if (!vendorId) return;
    startConversation.mutate(vendorId, {
      onSuccess: ({ conversationId }) => {
        if (conversationId) {
          router.push(`/chat/${conversationId}`);
        }
      },
      onError: (err: any) => {
        Alert.alert(
          'Chat Unavailable',
          err?.message || 'Could not start the conversation. Please try again.',
        );
      },
    });
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleChat}
      disabled={startConversation.isPending}
      activeOpacity={0.7}
    >
      {startConversation.isPending ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} />
          <Text style={styles.label}>
            {vendorName ? `Chat with ${vendorName}` : 'Chat with Vendor'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.text.tertiary} />
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryFaded,
    backgroundColor: Colors.primaryFaded,
  },
  label: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semibold,
    color: Colors.primary,
  },
});
