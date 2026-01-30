/**
 * React Query Hooks for Categories
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { mockCategories, simulateDelay } from './mockData';
import { ApiResponse, Category } from './types';

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: string) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// ========================================
// USE MOCK DATA (set to false for real API)
// ========================================
const USE_MOCK = true;

// Fetch all categories
async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) {
    await simulateDelay(300);
    return mockCategories;
  }
  
  const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
  return response.data;
}

// Fetch single category
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

// Hooks
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => fetchCategory(id),
    enabled: !!id,
  });
}
