import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().trim().min(7, 'Invalid phone number').max(20).optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
