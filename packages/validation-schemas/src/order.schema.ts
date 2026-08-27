import { z } from 'zod';

export const checkoutPreviewSchema = z.object({
  addressId: z.string().uuid('Valid shipping address ID required'),
  couponCode: z.string().trim().optional().nullable(),
  paymentProvider: z.enum(['STRIPE', 'RAZORPAY', 'COD']).default('COD'),
});

export const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid('Valid shipping address ID required'),
  couponCode: z.string().trim().optional().nullable(),
  paymentProvider: z.enum(['STRIPE', 'RAZORPAY', 'COD']),
  notes: z.string().trim().optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  paymentStatus: z.enum(['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED']).optional(),
});

export const updateOrderTrackingSchema = z.object({
  trackingNumber: z.string().trim().min(3, 'Tracking number is required'),
  trackingCarrier: z.string().trim().min(2, 'Carrier name is required'),
});

export const addCartItemSchema = z.object({
  productId: z.string().uuid('Valid product ID required'),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().positive('Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export type CheckoutPreviewInput = z.infer<typeof checkoutPreviewSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderTrackingInput = z.infer<typeof updateOrderTrackingSchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
