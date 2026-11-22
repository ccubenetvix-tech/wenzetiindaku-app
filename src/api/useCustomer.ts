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

// ─── API Row Mappers (backend returns snake_case) ────────────────────────────

/** Map a snake_case customer_addresses row to the canonical Address shape */
export function mapAddressRow(row: any): Address {
  return {
    id: row?.id,
    label: row?.label ?? "Home",
    fullName: row?.full_name ?? "",
    email: row?.email ?? "",
    phone: row?.phone ?? "",
    altPhone: row?.alt_phone ?? undefined,
    street1: row?.street1 ?? "",
    street2: row?.street2 ?? undefined,
    city: row?.city ?? "",
    state: row?.state ?? "",
    postalCode: row?.postal_code ?? "",
    country: row?.country ?? "",
    isDefault: row?.is_default ?? false,
  };
}

/**
 * Map a snake_case orders row (with order_items) to the app's Order shape.
 * total_amount holds the item total (VAT included in prices, no shipping),
 * so subtotal is derived from items and shipping/tax are 0.
 */
export function mapOrderRow(row: any): Order {
  const items = (row?.order_items ?? []).map((it: any) => ({
    id: it?.id,
    productId: it?.product_id,
    product: it?.product,
    quantity: it?.quantity,
    price: Number(it?.price) || 0,
  }));
  const subtotal = items.reduce(
    (sum: number, it: any) => sum + it.price * it.quantity,
    0,
  );
  const shipping = row?.shipping_address ?? row?.shippingAddress;
  return {
    id: row?.id,
    orderNumber: row?.order_number ?? row?.id ?? "",
    status: (row?.status ?? "pending") as Order["status"],
    paymentStatus: row?.payment_status,
    items,
    subtotal,
    tax: 0,
    shipping: 0,
    total: Number(row?.total_amount) || subtotal,
    shippingAddress: shipping
      ? {
          label: shipping.label,
          fullName: shipping.fullName,
          email: shipping.email,
          phone: shipping.phone,
          street1: shipping.street1,
          street2: shipping.street2,
          city: shipping.city,
          state: shipping.state,
          postalCode: shipping.postalCode,
          country: shipping.country,
        }
      : undefined,
    paymentMethod: row?.payment_method ?? "",
    createdAt: row?.created_at,
    updatedAt: row?.updated_at ?? row?.created_at,
  };
}

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

// Order creation / payment-verification payload types live in ./checkoutTypes
// (CreateOrderRequest, VerifyPaymentRequest); hooks live in ./checkoutApi.

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
          orders: any[];
          pagination: { page: number; limit: number; total: number };
        };
      }>("/customer/orders");
      return (res.data.orders ?? []).map(mapOrderRow);
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
        data: { order: any };
      }>(`/customer/orders/${orderId}`);
      return mapOrderRow(res.data.order);
    },
    enabled: !!orderId,
  });
}

// ─── Orders: creation + payment verification ─────────────────────────────────
// Order creation and payment verification now live in ./checkoutApi
// (useCreateOrder, useVerifyPayment) which matches the backend contract.

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
        data: { addresses: any[] };
      }>("/customer/addresses");
      return (res.data.addresses ?? []).map(mapAddressRow);
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
