import { apiClient } from './api.client';

export const wishlistApi = {
  getWishlist: () => apiClient.get('/wishlist'),
  addToWishlist: (productId: string) => apiClient.post(`/wishlist/${productId}`),
  removeFromWishlist: (productId: string) => apiClient.delete(`/wishlist/${productId}`),
  moveToCart: (productId: string) => apiClient.post(`/wishlist/${productId}/move-to-cart`),
};
