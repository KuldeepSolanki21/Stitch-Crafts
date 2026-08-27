export interface IPaymentIntentRequest {
  orderId: string;
  amount: number;
  currency: string;
  provider: 'STRIPE' | 'RAZORPAY';
}

export interface IPaymentVerification {
  orderId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  stripePaymentIntentId?: string;
}
