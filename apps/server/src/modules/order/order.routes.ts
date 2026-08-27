import { Router } from 'express';
import { orderController } from './order.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createOrderSchema } from '@stitch-and-crafts/validation-schemas';

const router = Router();

router.use(authenticateJWT);

router.get('/my-orders', (req, res, next) => orderController.getMyOrders(req as any, res, next));
router.get('/:id', (req, res, next) => orderController.getOrderById(req as any, res, next));
router.get('/:id/track', (req, res, next) => orderController.getOrderTracking(req as any, res, next));
router.post('/:id/cancel', (req, res, next) => orderController.cancelOrder(req as any, res, next));
router.post('/', validateRequest(createOrderSchema), (req, res, next) =>
  orderController.createOrder(req as any, res, next)
);

export default router;
