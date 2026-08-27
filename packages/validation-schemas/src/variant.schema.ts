import { z } from 'zod';

export const createVariantSchema = z.object({
  colorName: z.string().trim().min(2, 'Color name is required'),
  colorHex: z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid color HEX code (e.g. #8B4513)'),
  size: z.string().trim().optional().nullable(),
  sku: z.string().trim().min(3, 'Variant SKU must be at least 3 characters'),
  priceDelta: z.number().default(0),
  stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
  images: z.array(z.string()).default([]),
});

export const updateVariantSchema = createVariantSchema.partial();

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
