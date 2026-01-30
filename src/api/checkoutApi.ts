/**
 * Checkout API Hooks
 * API integration for checkout flow
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import {
    ConfirmOrderRequest,
    ConfirmOrderResponse,
    CreatePaymentIntentRequest,
    CreatePaymentIntentResponse,
    GetPaymentMethodsResponse,
    OrderConfirmation,
    PaymentIntent,
    PaymentMethod,
    SaveShippingAddressRequest,
    SaveShippingAddressResponse,
    ShippingAddress,
} from './checkoutTypes';
import { apiClient } from './client';
import { FeatureFlags } from '@/src/config';

// Mock Data (only used when FeatureFlags.enableMockData is true)
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-card',
    type: 'card',
    name: 'Credit/Debit Card',
    description: 'Pay securely with Visa, Mastercard, or American Express',
    icon: 'card-outline',
    enabled: true,
    config: {
      supportedNetworks: ['visa', 'mastercard', 'amex'],
    },
  },
  {
    id: 'pm-mobile-money',
    type: 'mobile_money',
    name: 'Mobile Money',
    description: 'Pay with M-Pesa, Orange Money, or Airtel Money',
    icon: 'phone-portrait-outline',
    enabled: true,
  },
  {
    id: 'pm-bank',
    type: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer (may take 1-2 business days)',
    icon: 'business-outline',
    enabled: true,
  },
  {
    id: 'pm-cod',
    type: 'cash_on_delivery',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: 'cash-outline',
    enabled: true,
  },
];

const mockSavedAddresses: ShippingAddress[] = [
  {
    id: 'addr-1',
    firstName: 'VVS',
    lastName: 'Basanth',
    email: 'vvs.pedapati@gmail.com',
    phone: '+32 495 84 68 66',
    streetAddress: '123 Avenue de la Gombe',
    apartment: 'Apt 4B',
    city: 'Kinshasa',
    state: 'Kinshasa',
    postalCode: '12345',
    country: 'CD',
    isDefault: true,
  },
];

// API Functions
async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  if (FeatureFlags.enableMockData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPaymentMethods;
  }
  const response = await apiClient.get<GetPaymentMethodsResponse>('/checkout/payment-methods');
  return response.methods;
}

async function fetchSavedAddresses(): Promise<ShippingAddress[]> {
  if (FeatureFlags.enableMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSavedAddresses;
  }
  const response = await apiClient.get<{ addresses: ShippingAddress[] }>('/user/addresses');
  return response.addresses;
}

async function saveShippingAddress(data: SaveShippingAddressRequest): Promise<SaveShippingAddressResponse> {
  if (FeatureFlags.enableMockData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      shippingAddressId: `addr-${Date.now()}`,
      updatedSummary: {
        items: [],
        itemCount: 0,
        subtotal: 0,
        shipping: 10,
        vat: 0,
        vatRate: 0.16,
        total: 0,
        currency: 'USD',
      },
    };
  }
  const response = await apiClient.post<SaveShippingAddressResponse>('/checkout/shipping', data);
  return response;
}

async function createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
  if (FeatureFlags.enableMockData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate different payment flows based on method
    if (data.paymentMethod === 'mobile_money') {
      return {
        id: `pi-${Date.now()}`,
        amount: 0, // Will be filled from order summary
        currency: 'USD',
        status: 'requires_action',
        paymentMethod: data.paymentMethod,
        redirectUrl: 'https://example.com/mobile-money-payment',
      };
    }
    
    if (data.paymentMethod === 'card') {
      return {
        id: `pi-${Date.now()}`,
        clientSecret: `secret_${Date.now()}`,
        amount: 0,
        currency: 'USD',
        status: 'processing',
        paymentMethod: data.paymentMethod,
      };
    }
    
    // For COD and bank transfer
    return {
      id: `pi-${Date.now()}`,
      amount: 0,
      currency: 'USD',
      status: 'pending',
      paymentMethod: data.paymentMethod,
    };
  }
  
  const response = await apiClient.post<CreatePaymentIntentResponse>('/checkout/create-payment-intent', data);
  return response.paymentIntent;
}

async function confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
  if (FeatureFlags.enableMockData) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      id: paymentIntentId,
      amount: 0,
      currency: 'USD',
      status: 'succeeded',
      paymentMethod: 'card',
    };
  }
  const response = await apiClient.post<{ paymentIntent: PaymentIntent }>(`/checkout/confirm-payment/${paymentIntentId}`);
  return response.paymentIntent;
}

async function confirmOrder(data: ConfirmOrderRequest): Promise<OrderConfirmation> {
  if (FeatureFlags.enableMockData) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      orderId: `order-${Date.now()}`,
      orderNumber: `WTN-${Date.now().toString().slice(-8)}`,
      status: 'confirmed',
      items: [],
      shippingAddress: mockSavedAddresses[0],
      paymentMethod: 'card',
      transactionId: `txn-${Date.now()}`,
      subtotal: 0,
      shipping: 10,
      vat: 0,
      total: 0,
      currency: 'USD',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
  }
  const response = await apiClient.post<ConfirmOrderResponse>('/checkout/confirm-order', data);
  return response.order;
}

async function getOrder(orderId: string): Promise<OrderConfirmation> {
  if (FeatureFlags.enableMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      orderId,
      orderNumber: `WTN-${orderId.slice(-8)}`,
      status: 'confirmed',
      items: [],
      shippingAddress: mockSavedAddresses[0],
      paymentMethod: 'card',
      transactionId: `txn-${Date.now()}`,
      subtotal: 100,
      shipping: 10,
      vat: 16,
      total: 126,
      currency: 'USD',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
  }
  const response = await apiClient.get<{ order: OrderConfirmation }>(`/orders/${orderId}`);
  return response.order;
}

// React Query Hooks
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: fetchPaymentMethods,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

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

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: createPaymentIntent,
  });
}

export function useConfirmPayment() {
  return useMutation({
    mutationFn: confirmPayment,
  });
}

export function useConfirmOrder() {
  return useMutation({
    mutationFn: confirmOrder,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });
}
