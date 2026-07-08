/**
 * React Query Hooks for Products
 * Wires to real backend endpoints:
 * - GET /products → list products (with filters, search, sorting)
 * - GET /products/featured → featured products
 * - GET /products/{productId} → product details
 * - Supports vendor_id filter for products by store
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { Product, ProductFilters } from './types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  byCategory: (categoryId: string) => [...productKeys.all, 'category', categoryId] as const,
  byStore: (storeId: string) => [...productKeys.all, 'store', storeId] as const,
};

// Backend response shapes
interface ProductsApiResponse {
  success: boolean;
  data: {
    products: any[];
    pagination?: object;
  };
}

interface ProductApiResponse {
  success: boolean;
  data: {
    product: any;
  };
}

// Map backend product shape → app Product type
function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug ?? p.name?.toLowerCase().replace(/\s+/g, '-') ?? p.id,
    description: p.description ?? '',
    price: p.price ?? 0,
    compareAtPrice: p.compare_at_price,
    currency: p.currency ?? 'USD',
    images: p.images ?? (p.image_url ? [p.image_url] : []),
    primaryImage: p.images?.[0] ?? p.image_url ?? '',
    categoryId: p.category ?? '',
    storeId: p.vendor_id ?? '',
    rating: p.rating ?? 0,
    reviewCount: p.review_count ?? 0,
    inStock: (p.stock ?? p.quantity ?? 1) > 0,
    quantity: p.stock ?? p.quantity ?? 0,
    tags: p.tags,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  const response = await apiClient.get<ProductsApiResponse>('/products/featured', { limit: 10 });
  return (response.data?.products ?? []).map(mapProduct);
}

async function fetchProducts(filters: ProductFilters): Promise<Product[]> {
  // Map app filter keys → backend query param names
  const params: Record<string, any> = {};
  if (filters.search) params.search = filters.search;
  if (filters.categoryId) params.category = filters.categoryId;
  if (filters.storeId) params.vendor_id = filters.storeId;
  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
  if (filters.sortBy) params.sortBy = filters.sortBy;

  const response = await apiClient.get<ProductsApiResponse>('/products', params);
  return (response.data?.products ?? []).map(mapProduct);
}

async function fetchProduct(id: string): Promise<Product> {
  const response = await apiClient.get<ProductApiResponse>(`/products/${id}`);
  return mapProduct(response.data?.product);
}

async function fetchProductsByCategory(categoryId: string): Promise<Product[]> {
  const response = await apiClient.get<ProductsApiResponse>('/products', { category: categoryId });
  return (response.data?.products ?? []).map(mapProduct);
}

async function fetchProductsByStore(storeId: string): Promise<Product[]> {
  const response = await apiClient.get<ProductsApiResponse>('/products', { vendor_id: storeId });
  return (response.data?.products ?? []).map(mapProduct);
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: fetchFeaturedProducts,
    staleTime: 10 * 60 * 1000,  // 10 min (featured rarely changes)
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({ queryKey: productKeys.list(filters), queryFn: () => fetchProducts(filters), staleTime: 2 * 60 * 1000 });
}

export function useProduct(id: string) {
  return useQuery({ queryKey: productKeys.detail(id), queryFn: () => fetchProduct(id), enabled: !!id });
}

export function useProductsByCategory(categoryId: string) {
  return useQuery({ queryKey: productKeys.byCategory(categoryId), queryFn: () => fetchProductsByCategory(categoryId), enabled: !!categoryId });
}

export function useProductsByStore(storeId: string) {
  return useQuery({ queryKey: productKeys.byStore(storeId), queryFn: () => fetchProductsByStore(storeId), enabled: !!storeId });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: [...productKeys.lists(), 'search', query],
    queryFn: () => fetchProducts({ search: query }),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}
