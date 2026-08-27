import Stripe from 'stripe';
import { ENV } from './env.config';

export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10',
});

