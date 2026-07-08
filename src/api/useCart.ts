/**
 * Cart Store using Zustand
 * Handles cart state with optimistic updates
 * For authenticated users, useSyncedCart adds backend sync on top.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CartItem, Product } from "./types";
import { useAuth } from "@/contexts/auth-context";
import {
  fetchCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
  clearCartRemote,
} from "./cartApi";

interface CartState {
  items: CartItem[];
  isLoading: boolean;

  // Computed
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;

  // Actions (local, optimistic)
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
}

const TAX_RATE = 0.0; // 0% tax (adjust as needed)
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // Computed values
      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      },

      get tax() {
        return get().subtotal * TAX_RATE;
      },

      get shipping() {
        const subtotal = get().subtotal;
        if (subtotal === 0) return 0;
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      },

      get total() {
        return get().subtotal + get().tax + get().shipping;
      },

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          const newItem: CartItem = {
            id: `cart-item-${product.id}-${Date.now()}`,
            productId: product.id,
            product,
            quantity,
            price: product.price,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find((item) => item.productId === productId);
        return item?.quantity || 0;
      },
    }),
    {
      name: "@wenzetiindaku:cart",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// Selector hooks for better performance
export const useCartItems = () => useCartStore((state) => state.items);

export const useCartItemCount = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

export const useCartSubtotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

export const useCartTotal = () => {
  const subtotal = useCartSubtotal();
  const tax = subtotal * TAX_RATE;
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? SHIPPING_COST : 0;
  return subtotal + tax + shipping;
};

/**
 * Synced cart hook
 * Uses backend /api/cart for authenticated users, falls back to local-only for guests.
 */
export function useSyncedCart() {
  const { isAuthenticated } = useAuth();
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
  } = useCartStore();

  // Load remote cart into local store (call from cart screen when user is logged in)
  async function loadRemoteCart() {
    if (!isAuthenticated) return;
    const remoteItems = await fetchCart();
    // Replace local items with remote items for consistency
    useCartStore.setState({
      items: remoteItems,
    });
  }

  async function add(product: Product, quantity = 1) {
    if (!isAuthenticated) {
      addItem(product, quantity);
      return;
    }
    // Optimistic update: update local first
    addItem(product, quantity);
    try {
      await addToCartApi(product.id, quantity);
    } catch (e) {
      // Optionally: rollback or refetch
      console.warn("Failed to sync addToCart to backend", e);
    }
  }

  async function update(productId: string, quantity: number) {
    if (!isAuthenticated) {
      updateQuantity(productId, quantity);
      return;
    }
    const currentItem = items.find((i) => i.productId === productId);
    updateQuantity(productId, quantity);
    if (!currentItem) return;
    try {
      await updateCartItemApi(currentItem.id, quantity);
    } catch (e) {
      console.warn("Failed to sync updateCartItem to backend", e);
    }
  }

  async function remove(productId: string) {
    if (!isAuthenticated) {
      removeItem(productId);
      return;
    }
    const currentItem = items.find((i) => i.productId === productId);
    removeItem(productId);
    if (!currentItem) return;
    try {
      await removeCartItemApi(currentItem.id);
    } catch (e) {
      console.warn("Failed to sync removeCartItem to backend", e);
    }
  }

  async function clear() {
    if (isAuthenticated) {
      try {
        await clearCartRemote();
      } catch (e) {
        console.warn("Failed to sync clearCart to backend", e);
      }
    }
    clearCart();
  }

  return {
    items,
    add,
    update,
    remove,
    clear,
    loadRemoteCart,
    getItemQuantity,
  };
}
