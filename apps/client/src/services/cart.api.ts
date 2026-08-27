import { apiClient } from './api.client';

export const cartApi = {
  getCart: () => apiClient.get('/cart'),
  addItem: (data: { productId: string; variantId?: string | null; quantity: number }) => apiClient.post('/cart/items', data),
  updateQuantity: (itemId: string, quantity: number) => apiClient.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),
  clearCart: () => apiClient.delete('/cart'),
};
