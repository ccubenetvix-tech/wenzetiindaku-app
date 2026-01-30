/**
 * API Types for Wenzetiindaku Marketplace
 */

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  productCount: number;
  icon?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  primaryImage: string;
  categoryId: string;
  category?: Category;
  storeId: string;
  store?: Store;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  quantity: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Store Types
export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  city: string;
  country: string;
  productCount: number;
  rating: number;
  reviewCount: number;
  categories: string[];
  verified: boolean;
  createdAt: string;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

// User/Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  addresses?: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Search/Filter Types
export interface ProductFilters {
  categoryId?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
}
