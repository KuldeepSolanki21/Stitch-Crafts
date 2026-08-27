import { z } from 'zod';

export const updateStockSchema = z.object({
  stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
});

export const queryInventorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).default('ALL'),
  search: z.string().trim().optional(),
});

export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type QueryInventoryInput = z.infer<typeof queryInventorySchema>;
