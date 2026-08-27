import { z } from 'zod';

export const subscribeNewsletterSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
});

export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>;
