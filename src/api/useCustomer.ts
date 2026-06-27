/**
 * React Query Hooks for Customer - Orders, Wishlist, Profile, Addresses
 * Wired to the real backend at /api/customer/*
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  phone?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  vendorName: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  items: OrderItem[];
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  storeName: string;
  inStock: boolean;
  addedAt: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  picture?: string;
  createdAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const customerKeys = {
  all: ['customer'] as const,
  profile: () => [...customerKeys.all, 'profile'] as const,
  orders: () => [...customerKeys.all, 'orders'] as const,
  order: (id: string) => [...customerKeys.orders(), id] as const,
  wishlist: () => [...customerKeys.all, 'wishlist'] as const,
  addresses: () => [...customerKeys.all, 'addresses'] as const,
};

// ─── Profile ──────────────────────────────────────────────────────────────────

async function fetchProfile(): Promise<CustomerProfile> {
  const res = await apiClient.get<{ success: boolean; customer: CustomerProfile }>('/customer/profile');
  return res.customer;
}

export function useCustomerProfile() {
  return useQuery({
    queryKey: customerKeys.profile(),
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      apiClient.put<{ success: boolean; customer: CustomerProfile }>('/customer/profile', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.profile() });
    },
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

async function fetchOrders(): Promise<Order[]> {
  const res = await apiClient.get<{ success: boolean; orders: Order[] }>('/customer/orders');
  return res.orders;
}

async function fetchOrderDetail(orderId: string): Promise<Order> {
  const res = await apiClient.get<{ success: boolean; order: Order }>(`/customer/orders/${orderId}`);
  return res.order;
}

export function useCustomerOrders() {
  return useQuery({
    queryKey: customerKeys.orders(),
    queryFn: fetchOrders,
    staleTime: 2 * 60 * 1000,
  });
}

export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: customerKeys.order(orderId),
    queryFn: () => fetchOrderDetail(orderId),
    enabled: !!orderId,
  });
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

async function fetchWishlist(): Promise<WishlistItem[]> {
  const res = await apiClient.get<{ success: boolean; wishlist: WishlistItem[] }>('/customer/wishlist');
  return res.wishlist;
}

export function useWishlist() {
  return useQuery({
    queryKey: customerKeys.wishlist(),
    queryFn: fetchWishlist,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      apiClient.post<{ success: boolean }>('/customer/wishlist', { productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.wishlist() });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (wishlistItemId: string) =>
      apiClient.delete<{ success: boolean }>(`/customer/wishlist/${wishlistItemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.wishlist() });
    },
  });
}

// ─── Addresses ────────────────────────────────────────────────────────────────

async function fetchAddresses(): Promise<Address[]> {
  const res = await apiClient.get<{ success: boolean; addresses: Address[] }>('/customer/addresses');
  return res.addresses;
}

export function useAddresses() {
  return useQuery({
    queryKey: customerKeys.addresses(),
    queryFn: fetchAddresses,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (address: Omit<Address, 'id'>) =>
      apiClient.post<{ success: boolean; address: Address }>('/customer/addresses', address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Address) =>
      apiClient.put<{ success: boolean; address: Address }>(`/customer/addresses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) =>
      apiClient.delete<{ success: boolean }>(`/customer/addresses/${addressId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
  });
}
