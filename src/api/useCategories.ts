/**
 * React Query Hooks for Categories
 * USE_MOCK is driven by EXPO_PUBLIC_ENABLE_MOCK_DATA env var.
 */

import { FeatureFlags } from '@/src/config';
import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { mockCategories, simulateDelay } from './mockData';
import { ApiResponse, Category } from './types';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: string) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

const USE_MOCK = FeatureFlags.enableMockData;

async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) { await simulateDelay(300); return mockCategories; }
  const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
  return response.data;
}

async function fetchCategory(id: string): Promise<Category> {
  if (USE_MOCK) {
    await simulateDelay(200);
    const category = mockCategories.find(c => c.id === id);
    if (!category) throw new Error('Category not found');
    return category;
  }
  const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
  return response.data;
}

export function useCategories() {
  return useQuery({ queryKey: categoryKeys.lists(), queryFn: fetchCategories, staleTime: 5 * 60 * 1000 });
}

export function useCategory(id: string) {
  return useQuery({ queryKey: categoryKeys.detail(id), queryFn: () => fetchCategory(id), enabled: !!id });
}
