/**
 * Checkout Types for Wenzetiindaku Marketplace
 * Defines all types for the checkout flow.
 *
 * Address shape and payment methods follow the real backend contract:
 * - POST /customer/orders      { paymentMethod: 'cod' | 'online', shippingAddress, saveAddressToProfile }
 * - POST /payment/initiate     { orderId } → { url, fields } (MaishaPay hosted checkout)
 * - POST /customer/orders/verify-payment { sessionId, status, transactionRefId }
 */

// Checkout Step Types
export type CheckoutStep = 'shipping' | 'payment' | 'review';

// Shipping Address Types — canonical shape used by the backend
// (orders.shipping_address JSONB + customer_addresses via API mapping)
export interface ShippingAddress {
  id?: string;
  label?: string; // Home / Work / Other
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
  saveToProfile?: boolean;
}

export interface ShippingAddressFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  street1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Payment Method Types — the backend supports COD and MaishaPay online checkout
export type PaymentMethodType = 'online' | 'cod' | 'maishapay';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  description?: string;
  enabled: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'maishapay',
    type: 'maishapay',
    name: 'Pay Online (MaishaPay)',
    description: 'Pay securely online with card or mobile money',
    enabled: true,
  },
  {
    id: 'cod',
    type: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay with cash when your order arrives',
    enabled: true,
  },
];

// MaishaPay hosted checkout payload returned by the backend
// ({ url, fields } — the fields are POSTed to the url)
export interface MaishaPayCheckout {
  url: string;
  fields: Record<string, string | number>;
}

export interface PaymentResult {
  status: 'success' | 'failed' | 'cancelled';
  sessionId?: string;
  transactionRefId?: string;
  message?: string;
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
export interface CreateOrderRequest {
  paymentMethod: PaymentMethodType;
  shippingAddress: ShippingAddress;
  saveAddressToProfile?: boolean;
  currency?: string;
}

export interface CreateOrderResponse {
  orders: any[];
  payment?: {
    method: string;
    url?: string;
    fields?: Record<string, string | number>;
  };
}

export interface VerifyPaymentRequest {
  sessionId: string;
  status?: string;
  transactionRefId?: string;
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
