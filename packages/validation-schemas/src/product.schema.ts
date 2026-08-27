import { z } from 'zod';
import { createVariantSchema } from './variant.schema';

export const createProductSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  details: z.record(z.any()).optional().nullable(),
  price: z.number().positive('Price must be greater than 0'),
  discountPrice: z.number().positive('Discount price must be greater than 0').optional().nullable(),
  stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
  sku: z.string().trim().min(3, 'SKU must be at least 3 characters'),
  images: z.array(z.string()).min(1, 'At least one product image is required'),
  categoryId: z.string().uuid('Valid Category ID is required'),
  featured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(true),
  variants: z.array(createVariantSchema).optional(),
}).refine(data => {
  if (data.discountPrice !== undefined && data.discountPrice !== null) {
    return data.discountPrice < data.price;
  }
  return true;
}, {
  message: 'Discount price must be less than regular price',
  path: ['discountPrice'],
});

export const updateProductSchema = z.object({
  title: z.string().trim().min(3).max(150).optional(),
  description: z.string().trim().min(10).optional(),
  details: z.record(z.any()).optional().nullable(),
  price: z.number().positive().optional(),
  discountPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().nonnegative().optional(),
  sku: z.string().trim().min(3).optional(),
  images: z.array(z.string()).min(1).optional(),
  categoryId: z.string().uuid().optional(),
  featured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
}).refine(data => {
  if (data.price !== undefined && data.discountPrice !== undefined && data.discountPrice !== null) {
    return data.discountPrice < data.price;
  }
  return true;
}, {
  message: 'Discount price must be less than regular price',
  path: ['discountPrice'],
});

export const updateProductStatusSchema = z.object({
  isPublished: z.boolean(),
});

export const updateProductFeaturedSchema = z.object({
  featured: z.boolean(),
});

export const queryProductSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'oldest', 'name_asc', 'name_desc', 'featured']).default('newest'),
  featured: z.coerce.boolean().optional(),
  color: z.string().trim().optional(),
  size: z.string().trim().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type QueryProductInput = z.infer<typeof queryProductSchema>;
