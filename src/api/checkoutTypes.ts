/**
 * Checkout Types for Wenzetiindaku Marketplace
 * Defines all types for the checkout flow
 */

import { CartItem } from './types';

// Checkout Step Types
export type CheckoutStep = 'shipping' | 'payment' | 'review';

// Shipping Address Types
export interface ShippingAddress {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  saveToProfile?: boolean;
}

export interface ShippingAddressFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Payment Method Types
export type PaymentMethodType = 
  | 'card' 
  | 'mobile_money' 
  | 'bank_transfer' 
  | 'cash_on_delivery'
  | 'cod'
  | 'paypal'
  | 'stripe'
  | 'flutterwave';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  description?: string;
  icon?: string;
  enabled: boolean;
  isAvailable?: boolean;
  config?: {
    publicKey?: string;
    clientToken?: string;
    supportedNetworks?: string[];
  };
}

export interface PaymentIntent {
  id: string;
  clientSecret?: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  paymentMethod: PaymentMethodType;
  redirectUrl?: string;
  metadata?: Record<string, any>;
}

export type PaymentIntentStatus = 
  | 'pending'
  | 'processing'
  | 'requires_action'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

// Card Details (tokenized, never store raw card data)
export interface CardDetails {
  token: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

// Mobile Money Details
export interface MobileMoneyDetails {
  provider: string;
  phoneNumber: string;
  country: string;
}

// Order Types for Checkout
export interface CheckoutOrderItem {
  id: string;
  productId: string;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderSummary {
  items: CheckoutOrderItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  vat: number;
  vatRate: number;
  discount?: number;
  discountCode?: string;
  total: number;
  currency: string;
}

// Checkout Session
export interface CheckoutSession {
  id: string;
  cartId: string;
  userId?: string;
  currentStep: CheckoutStep;
  shippingAddress?: ShippingAddress;
  selectedPaymentMethod?: PaymentMethodType;
  paymentIntent?: PaymentIntent;
  orderSummary: OrderSummary;
  createdAt: string;
  expiresAt: string;
}

// Order Confirmation
export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  status: 'confirmed' | 'processing' | 'pending';
  items: CheckoutOrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethodType;
  transactionId?: string;
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  currency: string;
  estimatedDelivery?: string;
  createdAt: string;
}

// API Request/Response Types
export interface CreateCheckoutSessionRequest {
  cartId?: string;
  items?: CartItem[];
}

export interface CreateCheckoutSessionResponse {
  session: CheckoutSession;
}

export interface SaveShippingAddressRequest {
  sessionId: string;
  address: ShippingAddress;
}

export interface SaveShippingAddressResponse {
  shippingAddressId: string;
  updatedSummary: OrderSummary;
}

export interface GetPaymentMethodsResponse {
  methods: PaymentMethod[];
}

export interface CreatePaymentIntentRequest {
  sessionId: string;
  paymentMethod: PaymentMethodType;
  cardDetails?: CardDetails;
  mobileMoneyDetails?: MobileMoneyDetails;
}

export interface CreatePaymentIntentResponse {
  paymentIntent: PaymentIntent;
}

export interface ConfirmOrderRequest {
  sessionId: string;
  paymentIntentId: string;
  transactionId?: string;
}

export interface ConfirmOrderResponse {
  order: OrderConfirmation;
}

// Validation Helpers
export const COUNTRY_LIST = [
  { code: 'CD', name: 'Democratic Republic of Congo' },
  { code: 'CG', name: 'Republic of Congo' },
  { code: 'BE', name: 'Belgium' },
  { code: 'FR', name: 'France' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CI', name: 'Ivory Coast' },
  { code: 'SN', name: 'Senegal' },
];

export const MOBILE_MONEY_PROVIDERS = [
  { id: 'mpesa', name: 'M-Pesa', countries: ['KE', 'TZ', 'CD'] },
  { id: 'orange_money', name: 'Orange Money', countries: ['CD', 'CM', 'CI', 'SN'] },
  { id: 'airtel_money', name: 'Airtel Money', countries: ['CD', 'KE', 'NG'] },
  { id: 'mtn_momo', name: 'MTN Mobile Money', countries: ['GH', 'CM', 'CI'] },
];
