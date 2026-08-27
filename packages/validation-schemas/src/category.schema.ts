import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must have at least 2 characters').max(80),
  description: z.string().trim().optional().nullable(),
  image: z.string().trim().min(1, 'Category image URL is required'),
  parentId: z.string().uuid('Invalid parent category UUID').optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const updateCategoryStatusSchema = z.object({
  isActive: z.boolean(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
