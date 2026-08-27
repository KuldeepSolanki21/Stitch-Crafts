import { apiClient } from './api.client';

export const orderApi = {
  getCheckoutPreview: (data: any) => apiClient.post('/checkout/preview', data),
  createOrder: (data: any) => apiClient.post('/orders', data),
  getMyOrders: (page = 1) => apiClient.get('/orders/my-orders', { params: { page } }),
  getOrderById: (id: string) => apiClient.get(`/orders/${id}`),
  getOrderTracking: (id: string) => apiClient.get(`/orders/${id}/track`),
  cancelOrder: (id: string) => apiClient.post(`/orders/${id}/cancel`),
  validateCoupon: (code: string, subtotal: number) => apiClient.post('/coupons/validate', { code, subtotal }),
};
