import { apiClient } from './api.client';

export const paymentApi = {
  createRazorpayOrder: (orderId: string) => apiClient.post('/payments/razorpay/create-order', { orderId }),
  verifyRazorpay: (data: any) => apiClient.post('/payments/razorpay/verify', data),
  createStripeIntent: (orderId: string) => apiClient.post('/payments/stripe/create-intent', { orderId }),
};
