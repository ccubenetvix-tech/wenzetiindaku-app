/**
 * React Query + Mutation hooks for Customer API
 * Wires to real backend: /api/customer/*
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";
import { Address, Order, User } from "./types";

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const customerKeys = {
  profile: ["customer", "profile"] as const,
  orders: ["customer", "orders"] as const,
  order: (id: string) => ["customer", "orders", id] as const,
  addresses: ["customer", "addresses"] as const,
  wishlist: ["customer", "wishlist"] as const,
};

// ─── Types ───────────────────────────────────────────────────────────────────

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
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  gender?: string;
  address?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface CreateAddressPayload {
  label?: string;
  fullName: string;
  email: string;
  phone: string;
  altPhone?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export type PaymentMethod =
  | "cod"
  | "cash_on_delivery"
  | "cash"
  | "pod"
  | "delivery"
  | "online"
  | "card"
  | "maishapay"
  | "stripe"
  | "upi";

export interface ShippingAddressPayload {
  fullName: string;
  email: string;
  phone: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label?: string;
}

export interface CreateOrderPayload {
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddressPayload;
  saveAddressToProfile?: boolean;
  currency?: "USD" | "CDF";
}

export interface PaymentVerificationPayload {
  sessionId: string;
  status?: string;
  transactionRefId?: string;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * GET /api/customer/profile
 * Backend: { success, data: { customer: { ... } } }
 */
export function useCustomerProfile() {
  return useQuery({
    queryKey: customerKeys.profile,
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: { customer: User };
      }>("/customer/profile");
      return res.data.customer;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * PUT /api/customer/profile
 * Backend: { success, message, data: { customer: { ... } } }
 */
export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      apiClient.put<{
        success: boolean;
        message?: string;
        data: { customer: User };
      }>("/customer/profile", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.profile });
    },
  });
}

// ─── Orders: list & detail ───────────────────────────────────────────────────

/**
 * GET /api/customer/orders
 * Backend: { success, data: { orders, pagination } }
 */
export function useCustomerOrders() {
  return useQuery({
    queryKey: customerKeys.orders,
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: {
          orders: Order[];
          pagination: { page: number; limit: number; total: number };
        };
      }>("/customer/orders");
      return res.data.orders;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * GET /api/customer/orders/:orderId
 * Backend: { success, data: { order } }
 */
export function useCustomerOrder(orderId: string) {
  return useQuery({
    queryKey: customerKeys.order(orderId),
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: { order: Order };
      }>(`/customer/orders/${orderId}`);
      return res.data.order;
    },
    enabled: !!orderId,
  });
}

// ─── Orders: creation + payment verification ─────────────────────────────────

/**
 * POST /api/customer/orders
 * Creates vendor-split orders from cart and initiates payment (MaishaPay or COD).
 * Backend: 201 { success, data: { orders: Order[], payment: { method, ... } } }
 */
export function useCreateOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      apiClient.post<{
        success: boolean;
        message?: string;
        data: {
          orders: Order[];
          payment: {
            method: string;
            status?: string;
            [key: string]: any;
          };
        };
      }>("/customer/orders", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.orders });
    },
  });
}

/**
 * POST /api/customer/orders/verify-payment
 * Verifies MaishaPay/online payment and finalizes the order.
 * Backend: { success, message, data: { orders: [updatedOrder] } }
 */
export function useVerifyPayment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentVerificationPayload) =>
      apiClient.post<{
        success: boolean;
        message?: string;
        data: {
          orders: Order[];
        };
      }>("/customer/orders/verify-payment", payload),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({ queryKey: customerKeys.orders });
      if (variables.sessionId) {
        qc.invalidateQueries({
          queryKey: customerKeys.order(variables.sessionId),
        });
      }
    },
  });
}

// ─── Addresses ───────────────────────────────────────────────────────────────

/**
 * GET /api/customer/addresses
 * Backend: { success, data: { addresses: Address[] } }
 */
export function useCustomerAddresses() {
  return useQuery({
    queryKey: customerKeys.addresses,
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: { addresses: Address[] };
      }>("/customer/addresses");
      return res.data.addresses;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * POST /api/customer/addresses
 * Backend: { success, message, data: { address } }
 */
export function useAddAddress() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      apiClient.post<{
        success: boolean;
        message?: string;
        data: { address: Address };
      }>("/customer/addresses", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.addresses });
    },
  });
}

/**
 * DELETE /api/customer/addresses/:addressId
 * Backend: { success, message }
 */
export function useDeleteAddress() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) =>
      apiClient.delete<{ success: boolean; message?: string }>(
        `/customer/addresses/${addressId}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.addresses });
    },
  });
}

/**
 * PUT /api/customer/addresses/:addressId/set-default
 * Backend: { success, message, data: { address } }
 */
export function useSetDefaultAddress() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) =>
      apiClient.put<{
        success: boolean;
        message?: string;
        data: { address: Address };
      }>(`/customer/addresses/${addressId}/set-default`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.addresses });
    },
  });
}

// ─── Wishlist ────────────────────────────────────────────────────────────────

/**
 * GET /api/customer/wishlist
 * Backend: { success, data: { wishlist } }
 */
export function useWishlist() {
  return useQuery({
    queryKey: customerKeys.wishlist,
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: { wishlist: WishlistItem[] };
      }>("/customer/wishlist");
      return res.data.wishlist;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * POST /api/customer/wishlist
 * Backend: { success, message, data: { wishlistItem } }
 */
export function useAddToWishlist() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      apiClient.post<{ success: boolean; message?: string }>(
        "/customer/wishlist",
        { productId },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.wishlist });
    },
  });
}

/**
 * DELETE /api/customer/wishlist/:productId
 * Backend: { success, message }
 */
export function useRemoveFromWishlist() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      apiClient.delete<{ success: boolean; message?: string }>(
        `/customer/wishlist/${productId}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.wishlist });
    },
  });
}
