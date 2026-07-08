import apiClient from "./client";
import { CartItem } from "./types";

interface CartListResponse {
  success: boolean;
  data: {
    cartItems: CartItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

interface CartItemResponse {
  success: boolean;
  message?: string;
  data: {
    cartItem: CartItem;
  };
}

interface CartMessageResponse {
  success: boolean;
  message?: string;
}

export async function fetchCart(page = 1, limit = 50): Promise<CartItem[]> {
  const res = await apiClient.get<CartListResponse>("/cart", { page, limit });
  return res.data?.cartItems ?? [];
}

export async function addToCart(
  productId: string,
  quantity: number,
): Promise<CartItem> {
  const res = await apiClient.post<CartItemResponse>("/cart", {
    productId,
    quantity,
  });
  return res.data.cartItem;
}

export async function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<CartItem> {
  const res = await apiClient.put<CartItemResponse>(`/cart/${itemId}`, {
    quantity,
  });
  return res.data.cartItem;
}

export async function removeCartItem(itemId: string): Promise<void> {
  await apiClient.delete<CartMessageResponse>(`/cart/${itemId}`);
}

export async function clearCartRemote(): Promise<void> {
  await apiClient.delete<CartMessageResponse>("/cart");
}
