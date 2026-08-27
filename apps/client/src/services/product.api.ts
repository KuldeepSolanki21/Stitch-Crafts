import { apiClient } from './api.client';

export const productApi = {
  getProducts: (params?: any) => apiClient.get('/products', { params }),
  getProductBySlug: (slug: string) => apiClient.get(`/products/${slug}`),
  getFeaturedProducts: () => apiClient.get('/products/featured'),
  getRelatedProducts: (id: string) => apiClient.get(`/products/${id}/related`),
  getCategories: () => apiClient.get('/categories'),
  getCategoryBySlug: (slug: string) => apiClient.get(`/categories/${slug}`),
};
