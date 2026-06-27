/**
 * React Query + Mutation hooks for Customer API
 * Wires to real backend: /api/customer/*
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { Address, Order, User } from './types';

// ─── Query Keys ────────────────────────────────────────────────────────────
export const customerKeys = {
  profile: ['customer', 'profile'] as const,
  orders: ['customer', 'orders'] as const,
  order: (id: string) => ['customer', 'orders', id] as const,
  addresses: ['customer', 'addresses'] as const,
  wishlist: ['customer', 'wishlist'] as const,
};

// ─── Types ──────────────────────────────────────────────────────────────────
export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    primaryImage: string;
    inStock: boolean;
    rating: number;
    store?: { name: string };
  };
  createdAt: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface CreateAddressPayload {
  name: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

// ─── Profile ────────────────────────────────────────────────────────────────
export function useCustomerProfile() {
  return useQuery<User>({
    queryKey: customerKeys.profile,
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: User }>('/customer/profile');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      apiClient.put<{ success: boolean; data: User }>('/customer/profile', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.profile });
    },
  });
}

// ─── Orders ─────────────────────────────────────────────────────────────────
export function useCustomerOrders() {
  return useQuery<Order[]>({
    queryKey: customerKeys.orders,
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Order[] }>('/customer/orders');
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCustomerOrder(orderId: string) {
  return useQuery<Order>({
    queryKey: customerKeys.order(orderId),
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Order }>(
        `/customer/orders/${orderId}`
      );
      return res.data;
    },
    enabled: !!orderId,
  });
}

// ─── Addresses ───────────────────────────────────────────────────────────────
export function useCustomerAddresses() {
  return useQuery<Address[]>({
    queryKey: customerKeys.addresses,
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Address[] }>(
        '/customer/addresses'
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      apiClient.post<{ success: boolean; data: Address }>('/customer/addresses', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.addresses });
    },
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) =>
      apiClient.delete<{ success: boolean }>(`/customer/addresses/${addressId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.addresses });
    },
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) =>
      apiClient.patch<{ success: boolean }>(`/customer/addresses/${addressId}/default`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.addresses });
    },
  });
}

// ─── Wishlist ────────────────────────────────────────────────────────────────
export function useWishlist() {
  return useQuery<WishlistItem[]>({
    queryKey: customerKeys.wishlist,
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: WishlistItem[] }>(
        '/customer/wishlist'
      );
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      apiClient.post<{ success: boolean }>('/customer/wishlist', { productId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.wishlist });
    },
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      apiClient.delete<{ success: boolean }>(`/customer/wishlist/${productId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.wishlist });
    },
  });
}
