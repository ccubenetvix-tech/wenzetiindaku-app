/**
 * Chat hooks — wired to the real backend /api/chat endpoints:
 * - GET  /chat/conversations                       → list conversations
 * - POST /chat/conversations { vendorId }          → start/get conversation
 * - GET  /chat/conversations/:id/messages          → thread (decrypted server-side)
 * - POST /chat/conversations/:id/messages { content } → send
 * - PUT  /chat/conversations/:id/read              → mark thread read
 * - GET  /chat/unread-count                        → total unread badge
 *
 * The app uses REST polling for new messages (the website does the same on
 * serverless deployments, where socket.io is unavailable).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface ChatParty {
  id: string;
  name: string;
  email: string;
  profilePhoto: string | null;
}

export interface Conversation {
  id: string;
  otherParty: ChatParty;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderRole: 'customer' | 'vendor';
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, 'messages', conversationId] as const,
  unread: () => [...chatKeys.all, 'unread-count'] as const,
};

async function fetchConversations(): Promise<Conversation[]> {
  const res = await apiClient.get<{
    success: boolean;
    data: { conversations: Conversation[] };
  }>('/chat/conversations');
  return res.data?.conversations ?? [];
}

async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const res = await apiClient.get<{
    success: boolean;
    data: { messages: ChatMessage[] };
  }>(`/chat/conversations/${conversationId}/messages`);
  return res.data?.messages ?? [];
}

async function fetchUnreadCount(): Promise<number> {
  const res = await apiClient.get<{
    success: boolean;
    data: { unreadCount: number };
  }>('/chat/unread-count');
  return res.data?.unreadCount ?? 0;
}

export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: fetchConversations,
    refetchInterval: 15 * 1000, // poll for new conversations/messages
  });
}

export function useChatMessages(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 5 * 1000, // poll for new messages while the thread is open
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: chatKeys.unread(),
    queryFn: fetchUnreadCount,
    refetchInterval: 30 * 1000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) =>
      apiClient.post<{
        success: boolean;
        data: { message: ChatMessage };
      }>(`/chat/conversations/${conversationId}/messages`, { content }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

export function useMarkConversationRead() {
  return useMutation({
    mutationFn: (conversationId: string) =>
      apiClient.put<{ success: boolean }>(
        `/chat/conversations/${conversationId}/read`,
        {},
      ),
  });
}

/** Start (or return the existing) conversation with a vendor → conversationId */
export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      vendorId: string,
    ): Promise<{ conversationId: string }> => {
      const res = await apiClient.post<{
        success: boolean;
        data: { conversationId: string };
      }>('/chat/conversations', { vendorId });
      return { conversationId: res.data?.conversationId ?? '' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}
