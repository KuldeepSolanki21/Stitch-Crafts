import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';

const router = Router();

// Customer Gateway Invocations
router.post('/razorpay/create-order', authenticateJWT, (req, res, next) =>
  paymentController.createRazorpayOrder(req as any, res, next)
);
router.post('/razorpay/verify', authenticateJWT, (req, res, next) =>
  paymentController.verifyRazorpay(req as any, res, next)
);
router.post('/stripe/create-intent', authenticateJWT, (req, res, next) =>
  paymentController.createStripeIntent(req as any, res, next)
);

// Asynchronous Webhooks (Public with internal verification)
router.post('/webhook/stripe', (req, res, next) => paymentController.stripeWebhook(req, res, next));
router.post('/webhook/razorpay', (req, res, next) => paymentController.razorpayWebhook(req, res, next));

export default router;
