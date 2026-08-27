import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().trim().min(3, 'Coupon code must have at least 3 characters').toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discount: z.number().positive('Discount must be positive'),
  minOrderValue: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  expiryDate: z.string().datetime('Expiry date must be a valid ISO string'),
  isActive: z.boolean().optional().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, 'Coupon code required').toUpperCase(),
  subtotal: z.number().positive().optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
