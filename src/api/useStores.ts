/**
 * React Query Hooks for Stores
 * USE_MOCK is driven by EXPO_PUBLIC_ENABLE_MOCK_DATA env var.
 */

import { FeatureFlags } from '@/src/config';
import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { mockStores, simulateDelay } from './mockData';
import { ApiResponse, Store } from './types';

export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (filters: string) => [...storeKeys.lists(), { filters }] as const,
  top: () => [...storeKeys.all, 'top'] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: string) => [...storeKeys.details(), id] as const,
};

const USE_MOCK = FeatureFlags.enableMockData;

async function fetchStores(): Promise<Store[]> {
  if (USE_MOCK) { await simulateDelay(300); return mockStores; }
  const response = await apiClient.get<ApiResponse<Store[]>>('/stores');
  return response.data;
}

async function fetchTopStores(): Promise<Store[]> {
  if (USE_MOCK) { await simulateDelay(300); return mockStores.slice(0, 5); }
  const response = await apiClient.get<ApiResponse<Store[]>>('/stores', { top: true, limit: 5 });
  return response.data;
}

async function fetchStore(id: string): Promise<Store> {
  if (USE_MOCK) {
    await simulateDelay(200);
    const store = mockStores.find(s => s.id === id);
    if (!store) throw new Error('Store not found');
    return store;
  }
  const response = await apiClient.get<ApiResponse<Store>>(`/stores/${id}`);
  return response.data;
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
