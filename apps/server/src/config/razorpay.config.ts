import Razorpay from 'razorpay';
import { ENV } from './env.config';

export const razorpay = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: ENV.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder',
});

