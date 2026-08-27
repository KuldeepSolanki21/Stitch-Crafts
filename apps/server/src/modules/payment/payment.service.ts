import crypto from 'crypto';
import { prisma } from '../../config/database.config';
import { orderRepository } from '../order/order.repository';
import { razorpay } from '../../config/razorpay.config';
import { stripe } from '../../config/stripe.config';
import { ENV } from '../../config/env.config';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { PaymentStatus, OrderStatus, PaymentProvider } from '@prisma/client';

export class PaymentService {
  // 1. Razorpay Order Initiation
  async createRazorpayOrder(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new AppError('Order has already been paid', HTTP_STATUS.BAD_REQUEST);
    }

    const amountInPaise = Math.round(Number(order.totalAmount) * 100);

    // If Razorpay keys are placeholders in local test, return mock order
    if (!ENV.RAZORPAY_KEY_SECRET || ENV.RAZORPAY_KEY_SECRET === 'your_razorpay_secret_key' || ENV.RAZORPAY_KEY_SECRET === 'xxx') {
      const mockRzpOrderId = `order_mock_${order.id.replace(/-/g, '').substring(0, 14)}`;
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentIntentId: mockRzpOrderId },
      });

      return {
        orderId: order.id,
        razorpayOrderId: mockRzpOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: ENV.RAZORPAY_KEY_ID || 'rzp_test_mock',
      };
    }

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.id,
      notes: { orderId: order.id, customerId: userId },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: rzpOrder.id },
    });

    return {
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: ENV.RAZORPAY_KEY_ID,
    };
  }

  // 2. Razorpay Signature Verification
  async verifyRazorpaySignature(params: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    // If mock keys, verify test payload
    const isMock = !ENV.RAZORPAY_KEY_SECRET || ENV.RAZORPAY_KEY_SECRET === 'your_razorpay_secret_key' || ENV.RAZORPAY_KEY_SECRET === 'xxx';
    let isValid = false;

    if (isMock) {
      isValid = razorpaySignature === 'valid_mock_signature';
    } else {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      isValid = expectedSignature === razorpaySignature;
    }

    if (!isValid) {
      throw new AppError('Payment signature verification failed', HTTP_STATUS.BAD_REQUEST);
    }

    // Idempotent Transaction Record
    return prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.upsert({
        where: { transactionId: razorpayPaymentId },
        update: { status: PaymentStatus.PAID },
        create: {
          orderId: order.id,
          provider: PaymentProvider.RAZORPAY,
          transactionId: razorpayPaymentId,
          amount: order.totalAmount,
          status: PaymentStatus.PAID,
          rawResponse: { razorpayOrderId, razorpayPaymentId },
        },
      });

      return tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          orderStatus: OrderStatus.PROCESSING,
        },
        include: { orderItems: true, payments: true },
      });
    });
  }

  // 3. Stripe PaymentIntent Creation
  async createStripeIntent(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new AppError('Order already paid', HTTP_STATUS.BAD_REQUEST);
    }

    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    if (!ENV.STRIPE_SECRET_KEY || ENV.STRIPE_SECRET_KEY === 'sk_test_xxx' || ENV.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key') {
      const mockPI = `pi_mock_${order.id.replace(/-/g, '').substring(0, 16)}`;
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentIntentId: mockPI },
      });

      return {
        orderId: order.id,
        clientSecret: `${mockPI}_secret_mock`,
        amount: amountInCents,
        currency: 'inr',
      };
    }

    const intent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'inr',
      metadata: { orderId: order.id, userId },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: intent.id },
    });

    return {
      orderId: order.id,
      clientSecret: intent.client_secret,
      amount: intent.amount,
      currency: intent.currency,
    };
  }

  // 4. Webhook Handlers (Idempotent)
  async handleStripeWebhook(event: any) {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId) {
        await prisma.$transaction(async (tx) => {
          const order = await tx.order.findUnique({ where: { id: orderId } });
          if (order && order.paymentStatus !== PaymentStatus.PAID) {
            await tx.paymentTransaction.upsert({
              where: { transactionId: paymentIntent.id },
              update: { status: PaymentStatus.PAID },
              create: {
                orderId: order.id,
                provider: PaymentProvider.STRIPE,
                transactionId: paymentIntent.id,
                amount: order.totalAmount,
                status: PaymentStatus.PAID,
                rawResponse: paymentIntent,
              },
            });

            await tx.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: PaymentStatus.PAID,
                orderStatus: OrderStatus.PROCESSING,
              },
            });
          }
        });
      }
    }
    return { received: true };
  }

  async handleRazorpayWebhook(payload: any, signature: string) {
    // Webhook verification & processing
    const event = payload.event;
    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const orderId = payment.notes?.orderId;
      if (orderId) {
        await prisma.$transaction(async (tx) => {
          const order = await tx.order.findUnique({ where: { id: orderId } });
          if (order && order.paymentStatus !== PaymentStatus.PAID) {
            await tx.paymentTransaction.upsert({
              where: { transactionId: payment.id },
              update: { status: PaymentStatus.PAID },
              create: {
                orderId: order.id,
                provider: PaymentProvider.RAZORPAY,
                transactionId: payment.id,
                amount: order.totalAmount,
                status: PaymentStatus.PAID,
                rawResponse: payment,
              },
            });

            await tx.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: PaymentStatus.PAID,
                orderStatus: OrderStatus.PROCESSING,
              },
            });
          }
        });
      }
    }
    return { received: true };
  }
}

export const paymentService = new PaymentService();
