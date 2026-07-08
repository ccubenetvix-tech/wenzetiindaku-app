/**
 * React Query Hooks for Stores (Vendors)
 * Wires to real backend endpoints:
 * - GET /products/vendors → list all stores/vendors
 * - GET /products/vendors?limit={limit} → top stores (limit parameter)
 * - GET /products/vendors/{vendorId} → store details
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { Store } from './types';

export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (filters: string) => [...storeKeys.lists(), { filters }] as const,
  top: () => [...storeKeys.all, 'top'] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: string) => [...storeKeys.details(), id] as const,
};

// Backend response shapes
interface VendorsApiResponse {
  success: boolean;
  data: {
    vendors: any[];
    pagination: object;
  };
}

interface VendorApiResponse {
  success: boolean;
  data: {
    vendor: any;
  };
}

// Map backend vendor shape → app Store type
function mapVendorToStore(v: any): Store {
  return {
    id: v.id,
    name: v.business_name,
    slug: v.business_name?.toLowerCase().replace(/\s+/g, '-') ?? v.id,
    description: v.description,
    logo: v.profile_photo ?? v.logo,
    coverImage: v.cover_image,
    city: v.city ?? '',
    country: v.country ?? '',
    productCount: v.product_count ?? 0,
    rating: v.rating ?? 0,
    reviewCount: v.review_count ?? 0,
    categories: v.categories ?? [],
    verified: v.verified ?? false,
    createdAt: v.created_at,
  };
}

async function fetchStores(): Promise<Store[]> {
  const response = await apiClient.get<VendorsApiResponse>('/products/vendors');
  return (response.data?.vendors ?? []).map(mapVendorToStore);
}

async function fetchTopStores(): Promise<Store[]> {
  const response = await apiClient.get<VendorsApiResponse>('/products/vendors', { limit: 5 });
  return (response.data?.vendors ?? []).map(mapVendorToStore);
}

async function fetchStore(id: string): Promise<Store> {
  const response = await apiClient.get<VendorApiResponse>(`/products/vendors/${id}`);
  return mapVendorToStore(response.data?.vendor);
}

export function useStores() {
  return useQuery({
    queryKey: storeKeys.lists(),
    queryFn: fetchStores,
    staleTime: 10 * 60 * 1000,   // 10 min
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useTopStores() {
  return useQuery({
    queryKey: storeKeys.top(),
    queryFn: fetchTopStores,
    staleTime: 10 * 60 * 1000,   // 10 min (stores don't change frequently)
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useStore(id: string) {
  return useQuery({ queryKey: storeKeys.detail(id), queryFn: () => fetchStore(id), enabled: !!id });
}
