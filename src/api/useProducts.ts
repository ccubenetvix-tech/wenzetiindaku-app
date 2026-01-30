/**
 * React Query Hooks for Products
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { mockProducts, simulateDelay } from './mockData';
import { ApiResponse, Product, ProductFilters } from './types';

// Query keys
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

// ========================================
// USE MOCK DATA (set to false for real API)
// ========================================
const USE_MOCK = true;

// Fetch featured products
async function fetchFeaturedProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    await simulateDelay(400);
    return mockProducts;
  }
  
  const response = await apiClient.get<ApiResponse<Product[]>>('/products', {
    featured: true,
    limit: 10,
  });
  return response.data;
}

// Fetch products with filters
async function fetchProducts(filters: ProductFilters): Promise<Product[]> {
  if (USE_MOCK) {
    await simulateDelay(400);
    let filtered = [...mockProducts];
    
    if (filters.categoryId) {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters.storeId) {
      filtered = filtered.filter(p => p.storeId === filters.storeId);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!);
    }
    
    // Sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }
    
    return filtered;
  }
  
  const response = await apiClient.get<ApiResponse<Product[]>>('/products', filters as any);
  return response.data;
}

// Fetch single product
async function fetchProduct(id: string): Promise<Product> {
  if (USE_MOCK) {
    await simulateDelay(200);
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  }
  
  const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data;
}

// Fetch products by category
async function fetchProductsByCategory(categoryId: string): Promise<Product[]> {
  if (USE_MOCK) {
    await simulateDelay(300);
    return mockProducts.filter(p => p.categoryId === categoryId);
  }
  
  const response = await apiClient.get<ApiResponse<Product[]>>('/products', {
    categoryId,
  });
  return response.data;
}

// Fetch products by store
async function fetchProductsByStore(storeId: string): Promise<Product[]> {
  if (USE_MOCK) {
    await simulateDelay(300);
    return mockProducts.filter(p => p.storeId === storeId);
  }
  
  const response = await apiClient.get<ApiResponse<Product[]>>(`/stores/${storeId}/products`);
  return response.data;
}

// Hooks
export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: fetchFeaturedProducts,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
}

export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: productKeys.byCategory(categoryId),
    queryFn: () => fetchProductsByCategory(categoryId),
    enabled: !!categoryId,
  });
}

export function useProductsByStore(storeId: string) {
  return useQuery({
    queryKey: productKeys.byStore(storeId),
    queryFn: () => fetchProductsByStore(storeId),
    enabled: !!storeId,
  });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: [...productKeys.lists(), 'search', query],
    queryFn: () => fetchProducts({ search: query }),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}
