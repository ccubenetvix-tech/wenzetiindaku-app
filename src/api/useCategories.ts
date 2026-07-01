/**
 * React Query Hooks for Categories
 * Backend returns string[] of category names from /api/categories.
 * Mapped to Category objects for app compatibility.
 * USE_MOCK is driven by EXPO_PUBLIC_ENABLE_MOCK_DATA env var.
 */

import { FeatureFlags } from '@/src/config';
import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { mockCategories, simulateDelay } from './mockData';
import { Category } from './types';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: string) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

const USE_MOCK = FeatureFlags.enableMockData;

// Backend returns { success: true, data: string[] }
interface CategoriesApiResponse {
  success: boolean;
  data: string[];
}

// Map a raw category string → Category object for app compatibility
function mapStringToCategory(name: string, index: number): Category {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description: '',
    productCount: 0,
  };
}

async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) { await simulateDelay(300); return mockCategories; }
  const response = await apiClient.get<CategoriesApiResponse>('/categories');
  const raw = response.data ?? [];
  // Handle both string[] (backend) and Category[] (future)
  return raw.map((item: any, i: number) =>
    typeof item === 'string' ? mapStringToCategory(item, i) : item
  );
}

async function fetchCategory(id: string): Promise<Category> {
  if (USE_MOCK) {
    await simulateDelay(200);
    const category = mockCategories.find(c => c.id === id);
    if (!category) throw new Error('Category not found');
    return category;
  }
  // Backend has no single-category endpoint — derive from list
  const categories = await fetchCategories();
  const found = categories.find(c => c.id === id || c.slug === id);
  if (!found) throw new Error('Category not found');
  return found;
}

export function useCategories() {
  return useQuery({ queryKey: categoryKeys.lists(), queryFn: fetchCategories, staleTime: 5 * 60 * 1000 });
}

export function useCategory(id: string) {
  return useQuery({ queryKey: categoryKeys.detail(id), queryFn: () => fetchCategory(id), enabled: !!id });
}
