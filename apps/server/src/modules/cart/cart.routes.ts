import { Router } from 'express';
import { cartController } from './cart.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { addCartItemSchema, updateCartItemSchema } from '@stitch-and-crafts/validation-schemas';

const router = Router();

router.use(authenticateJWT);

router.get('/', (req, res, next) => cartController.getCart(req as any, res, next));
router.post('/items', validateRequest(addCartItemSchema), (req, res, next) =>
  cartController.addItem(req as any, res, next)
);
router.patch('/items/:id', validateRequest(updateCartItemSchema), (req, res, next) =>
  cartController.updateItemQuantity(req as any, res, next)
);
router.delete('/items/:id', (req, res, next) => cartController.removeItem(req as any, res, next));
router.delete('/', (req, res, next) => cartController.clearCart(req as any, res, next));

export default router;
