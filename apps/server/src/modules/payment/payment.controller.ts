import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class PaymentController {
  async createRazorpayOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.createRazorpayOrder(req.body.orderId, req.user!.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Razorpay order created', result);
    } catch (error) {
      next(error);
    }
  }

  async verifyRazorpay(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.verifyRazorpaySignature(req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Payment verified successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async createStripeIntent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.createStripeIntent(req.body.orderId, req.user!.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Stripe payment intent created', result);
    } catch (error) {
      next(error);
    }
  }

  async stripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.handleStripeWebhook(req.body);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async razorpayWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const result = await paymentService.handleRazorpayWebhook(req.body, signature);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
