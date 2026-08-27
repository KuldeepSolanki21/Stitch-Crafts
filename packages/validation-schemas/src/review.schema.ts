import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().uuid('Valid product ID required'),
  rating: z.number().int().min(1, 'Minimum 1 star').max(5, 'Maximum 5 stars'),
  title: z.string().trim().min(2, 'Title must have at least 2 characters').optional().nullable(),
  comment: z.string().trim().min(5, 'Review comment must have at least 5 characters'),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().min(2).optional().nullable(),
  comment: z.string().trim().min(5).optional(),
});

export const reviewModerationSchema = z.object({
  isApproved: z.boolean(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
