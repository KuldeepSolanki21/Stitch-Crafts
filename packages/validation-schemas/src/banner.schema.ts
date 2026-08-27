import { z } from 'zod';

export const createBannerSchema = z.object({
  title: z.string().trim().min(3, 'Banner title must have at least 3 characters'),
  subtitle: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().min(1, 'Banner image URL is required'),
  targetUrl: z.string().trim().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateBannerSchema = createBannerSchema.partial();

export const bannerStatusSchema = z.object({
  isActive: z.boolean(),
});

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
