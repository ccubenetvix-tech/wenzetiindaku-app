/**
 * Checkout API Hooks — wired to the real backend endpoints:
 * - GET  /customer/addresses              → saved addresses (snake_case rows, mapped)
 * - POST /customer/addresses              → save address to profile
 * - POST /customer/orders                 → create order(s) (COD or MaishaPay online)
 * - POST /payment/initiate                → re-initiate MaishaPay checkout for an order
 * - POST /customer/orders/verify-payment  → verify MaishaPay payment
 * - GET  /customer/orders/{orderId}       → order details
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import {
    CreateOrderRequest,
    CreateOrderResponse,
    MaishaPayCheckout,
    PaymentResult,
    ShippingAddress,
    VerifyPaymentRequest,
} from './checkoutTypes';
import { apiClient } from './client';

/** Map a snake_case customer_addresses row to the canonical ShippingAddress shape */
function mapAddressRow(row: any): ShippingAddress {
  return {
    id: row?.id,
    label: row?.label ?? 'Home',
    fullName: row?.full_name ?? '',
    email: row?.email ?? '',
    phone: row?.phone ?? '',
    altPhone: row?.alt_phone ?? undefined,
    street1: row?.street1 ?? '',
    street2: row?.street2 ?? undefined,
    city: row?.city ?? '',
    state: row?.state ?? '',
    postalCode: row?.postal_code ?? '',
    country: row?.country ?? '',
    isDefault: row?.is_default ?? false,
  };
}

async function fetchSavedAddresses(): Promise<ShippingAddress[]> {
  const response = await apiClient.get<{
    success: boolean;
    data: { addresses: any[] };
  }>('/customer/addresses');
  return (response.data?.addresses ?? []).map(mapAddressRow);
}

async function saveShippingAddress(
  address: ShippingAddress,
): Promise<ShippingAddress> {
  const payload = {
    label: address.label || 'Home',
    fullName: address.fullName,
    email: address.email,
    phone: address.phone,
    altPhone: address.altPhone,
    street1: address.street1,
    street2: address.street2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
  };
  const response = await apiClient.post<{
    success: boolean;
    data: { address: any };
  }>('/customer/addresses', payload);
  return mapAddressRow(response.data?.address ?? {});
}

/**
 * Create order(s) from the cart.
 * COD → orders are finalized immediately.
 * Online → orders are created pending payment and `payment` contains the
 * MaishaPay hosted checkout payload { url, fields }.
 */
async function createOrder(
  data: CreateOrderRequest,
): Promise<CreateOrderResponse> {
  const response = await apiClient.post<{
    success: boolean;
    message?: string;
    data: CreateOrderResponse;
  }>('/customer/orders', {
    paymentMethod: data.paymentMethod,
    shippingAddress: {
      label: data.shippingAddress.label,
      fullName: data.shippingAddress.fullName,
      email: data.shippingAddress.email,
      phone: data.shippingAddress.phone,
      altPhone: data.shippingAddress.altPhone,
      street1: data.shippingAddress.street1,
      street2: data.shippingAddress.street2,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      postalCode: data.shippingAddress.postalCode,
      country: data.shippingAddress.country,
    },
    saveAddressToProfile: data.saveAddressToProfile ?? false,
    currency: data.currency ?? 'USD',
  });
  return {
    orders: response.data?.orders ?? [],
    payment: response.data?.payment,
  };
}

/**
 * Re-initiate MaishaPay checkout for an existing pending order
 * (e.g. retry after a cancelled payment).
 */
async function initiateMaishaPayment(
  orderId: string,
): Promise<MaishaPayCheckout> {
  const response = await apiClient.post<{
    success: boolean;
    data: { url: string; fields: Record<string, string | number> };
  }>('/payment/initiate', { orderId });
  return { url: response.data?.url ?? '', fields: response.data?.fields ?? {} };
}

/** Verify a MaishaPay payment with the reference returned by the callback. */
async function verifyPayment(data: VerifyPaymentRequest): Promise<PaymentResult> {
  const response = await apiClient.post<{
    success: boolean;
    message?: string;
    data: { orders: any[] };
  }>('/customer/orders/verify-payment', {
    sessionId: data.sessionId,
    status: data.status,
    transactionRefId: data.transactionRefId,
  });
  if (!response.success) {
    return {
      status: 'failed',
      sessionId: data.sessionId,
      message: response.message ?? 'Payment verification failed or pending',
    };
  }
  return { status: 'success', sessionId: data.sessionId };
}

async function getOrder(orderId: string): Promise<any> {
  const response = await apiClient.get<{
    success: boolean;
    data: { order: any };
  }>(`/customer/orders/${orderId}`);
  return response.data?.order ?? null;
}

// React Query Hooks

export function useSavedAddresses() {
  return useQuery({
    queryKey: ['savedAddresses'],
    queryFn: fetchSavedAddresses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSaveShippingAddress() {
  return useMutation({
    mutationFn: saveShippingAddress,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: createOrder,
  });
}

export function useInitiateMaishaPayment() {
  return useMutation({
    mutationFn: initiateMaishaPayment,
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: verifyPayment,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });
}
