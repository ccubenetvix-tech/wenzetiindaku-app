/**
 * Checkout Store using Zustand
 * Manages checkout flow state with persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
    CheckoutStep,
    OrderConfirmation,
    OrderSummary,
    PaymentIntent,
    PaymentMethod,
    ShippingAddress,
    ShippingAddressFormErrors
} from './checkoutTypes';
import { CartItem } from './types';

interface CheckoutState {
  // Session
  sessionId: string | null;
  currentStep: CheckoutStep;
  isLoading: boolean;
  error: string | null;

  // Shipping
  shippingAddress: ShippingAddress | null;
  savedAddresses: ShippingAddress[];
  shippingErrors: ShippingAddressFormErrors;

  // Payment
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  paymentIntent: PaymentIntent | null;

  // Order Summary
  orderSummary: OrderSummary | null;
  cartItems: CartItem[];

  // Confirmation
  orderConfirmation: OrderConfirmation | null;

  // Actions
  initCheckout: (items: CartItem[], summary: OrderSummary) => void;
  setStep: (step: CheckoutStep) => void;
  setShippingAddress: (address: Partial<ShippingAddress>) => void;
  validateShippingAddress: () => boolean;
  setShippingErrors: (errors: ShippingAddressFormErrors) => void;
  setSavedAddresses: (addresses: ShippingAddress[]) => void;
  selectSavedAddress: (addressId: string) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  setPaymentIntent: (intent: PaymentIntent) => void;
  setOrderSummary: (summary: OrderSummary) => void;
  setOrderConfirmation: (confirmation: OrderConfirmation) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetCheckout: () => void;
  canProceedToPayment: () => boolean;
  canProceedToReview: () => boolean;
}

const VAT_RATE = 0.16; // 16% VAT
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 10;

const initialShippingAddress: ShippingAddress = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  streetAddress: '',
  apartment: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'CD',
  saveToProfile: false,
};

const initialState = {
  sessionId: null,
  currentStep: 'shipping' as CheckoutStep,
  isLoading: false,
  error: null,
  shippingAddress: initialShippingAddress,
  savedAddresses: [],
  shippingErrors: {},
  paymentMethods: [],
  selectedPaymentMethod: null,
  paymentIntent: null,
  orderSummary: null,
  cartItems: [],
  orderConfirmation: null,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initCheckout: (items: CartItem[], summary: OrderSummary) => {
        set({
          sessionId: `checkout-${Date.now()}`,
          cartItems: items,
          orderSummary: summary,
          currentStep: 'shipping',
          error: null,
        });
      },

      setStep: (step: CheckoutStep) => {
        set({ currentStep: step, error: null });
      },

      setShippingAddress: (address: Partial<ShippingAddress>) => {
        const current = get().shippingAddress || initialShippingAddress;
        set({
          shippingAddress: { ...current, ...address },
          shippingErrors: {},
        });
      },

      validateShippingAddress: (): boolean => {
        const address = get().shippingAddress;
        const errors: ShippingAddressFormErrors = {};

        if (!address) {
          set({ shippingErrors: { firstName: 'Address required' } });
          return false;
        }

        if (!address.firstName?.trim()) {
          errors.firstName = 'First name is required';
        }
        if (!address.lastName?.trim()) {
          errors.lastName = 'Last name is required';
        }
        if (!address.email?.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
          errors.email = 'Please enter a valid email';
        }
        if (!address.phone?.trim()) {
          errors.phone = 'Phone number is required';
        } else if (!/^[\d\s\+\-\(\)]{7,20}$/.test(address.phone)) {
          errors.phone = 'Please enter a valid phone number';
        }
        if (!address.streetAddress?.trim()) {
          errors.streetAddress = 'Street address is required';
        }
        if (!address.city?.trim()) {
          errors.city = 'City is required';
        }
        if (!address.state?.trim()) {
          errors.state = 'State/Province is required';
        }
        if (!address.postalCode?.trim()) {
          errors.postalCode = 'Postal code is required';
        }
        if (!address.country?.trim()) {
          errors.country = 'Country is required';
        }

        set({ shippingErrors: errors });
        return Object.keys(errors).length === 0;
      },

      setShippingErrors: (errors: ShippingAddressFormErrors) => {
        set({ shippingErrors: errors });
      },

      setSavedAddresses: (addresses: ShippingAddress[]) => {
        set({ savedAddresses: addresses });
      },

      selectSavedAddress: (addressId: string) => {
        const addresses = get().savedAddresses;
        const selected = addresses.find(a => a.id === addressId);
        if (selected) {
          set({ shippingAddress: { ...selected }, shippingErrors: {} });
        }
      },

      setPaymentMethods: (methods: PaymentMethod[]) => {
        set({ paymentMethods: methods });
      },

      setSelectedPaymentMethod: (method: PaymentMethod) => {
        set({ selectedPaymentMethod: method, error: null });
      },

      setPaymentIntent: (intent: PaymentIntent) => {
        set({ paymentIntent: intent });
      },

      setOrderSummary: (summary: OrderSummary) => {
        set({ orderSummary: summary });
      },

      setOrderConfirmation: (confirmation: OrderConfirmation) => {
        set({ orderConfirmation: confirmation });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      resetCheckout: () => {
        set(initialState);
      },

      canProceedToPayment: (): boolean => {
        return get().validateShippingAddress();
      },

      canProceedToReview: (): boolean => {
        const state = get();
        return !!(
          state.shippingAddress &&
          state.selectedPaymentMethod &&
          state.paymentIntent?.status === 'succeeded'
        );
      },
    }),
    {
      name: 'wenze-checkout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        shippingAddress: state.shippingAddress,
        currentStep: state.currentStep,
        selectedPaymentMethod: state.selectedPaymentMethod,
        cartItems: state.cartItems,
        orderSummary: state.orderSummary,
      }),
    }
  )
);

// Helper functions
export function calculateOrderSummary(items: CartItem[]): OrderSummary {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (subtotal > 0 ? SHIPPING_COST : 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + shipping + vat;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: items.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      image: item.product.primaryImage,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: item.price * item.quantity,
    })),
    itemCount,
    subtotal,
    shipping,
    vat,
    vatRate: VAT_RATE,
    total,
    currency: 'USD',
  };
}

// Selector hooks
export const useCheckoutStep = () => useCheckoutStore((state) => state.currentStep);
export const useShippingAddress = () => useCheckoutStore((state) => state.shippingAddress);
export const useOrderSummary = () => useCheckoutStore((state) => state.orderSummary);
export const useCheckoutLoading = () => useCheckoutStore((state) => state.isLoading);
export const useCheckoutError = () => useCheckoutStore((state) => state.error);
