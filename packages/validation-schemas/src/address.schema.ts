import { z } from 'zod';

export const createAddressSchema = z.object({
  addressLine1: z.string().trim().min(3, 'Address line 1 is required'),
  addressLine2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z.string().trim().min(4, 'Postal/ZIP code is required'),
  country: z.string().trim().default('IN'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
