/**
 * React Query Hooks for Stores (Vendors)
 * Vendors are served from /api/products/vendors on the backend.
 * USE_MOCK is driven by EXPO_PUBLIC_ENABLE_MOCK_DATA env var.
 */

import { FeatureFlags } from '@/src/config';
import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { mockStores, simulateDelay } from './mockData';
import { Store } from './types';

export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (filters: string) => [...storeKeys.lists(), { filters }] as const,
  top: () => [...storeKeys.all, 'top'] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: string) => [...storeKeys.details(), id] as const,
};

const USE_MOCK = FeatureFlags.enableMockData;

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
  if (USE_MOCK) { await simulateDelay(300); return mockStores; }
  const response = await apiClient.get<VendorsApiResponse>('/products/vendors');
  return (response.data?.vendors ?? []).map(mapVendorToStore);
}

async function fetchTopStores(): Promise<Store[]> {
  if (USE_MOCK) { await simulateDelay(300); return mockStores.slice(0, 5); }
  const response = await apiClient.get<VendorsApiResponse>('/products/vendors', { limit: 5 });
  return (response.data?.vendors ?? []).map(mapVendorToStore);
}

async function fetchStore(id: string): Promise<Store> {
  if (USE_MOCK) {
    await simulateDelay(200);
    const store = mockStores.find(s => s.id === id);
    if (!store) throw new Error('Store not found');
    return store;
  }
  const response = await apiClient.get<VendorApiResponse>(`/products/vendors/${id}`);
  return mapVendorToStore(response.data?.vendor);
}

export function useStores() {
  return useQuery({ queryKey: storeKeys.lists(), queryFn: fetchStores, staleTime: 5 * 60 * 1000 });
}

export function useTopStores() {
  return useQuery({ queryKey: storeKeys.top(), queryFn: fetchTopStores, staleTime: 5 * 60 * 1000 });
}

export function useStore(id: string) {
  return useQuery({ queryKey: storeKeys.detail(id), queryFn: () => fetchStore(id), enabled: !!id });
}
