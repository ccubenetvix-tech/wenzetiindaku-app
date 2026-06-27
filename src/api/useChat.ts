/**
 * Chat hooks - uses backend /api/customer/chat or /api/chat endpoints
 * Falls back gracefully if backend endpoint is not yet wired.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'vendor' | 'admin';
  content: string;
  type: 'text' | 'image';
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorLogo?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
};

async function fetchConversations(): Promise<Conversation[]> {
  const res = await apiClient.get<{ success: boolean; conversations: Conversation[] }>('/customer/conversations');
  return res.conversations;
}

async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const res = await apiClient.get<{ success: boolean; messages: ChatMessage[] }>(
    `/customer/conversations/${conversationId}/messages`
  );
  return res.messages;
}

export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: fetchConversations,
    staleTime: 30 * 1000,
  });
}

export function useChatMessages(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 5000, // poll every 5s for new messages
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      type = 'text',
    }: {
      conversationId: string;
      content: string;
      type?: 'text' | 'image';
    }) =>
      apiClient.post<{ success: boolean; message: ChatMessage }>(
        `/customer/conversations/${conversationId}/messages`,
        { content, type }
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vendorId: string) =>
      apiClient.post<{ success: boolean; conversation: Conversation }>('/customer/conversations', { vendorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}
