import { Router } from 'express';
import { couponController } from './coupon.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { validateCouponSchema } from '@stitch-and-crafts/validation-schemas';

const router = Router();

// Public Coupon Validation
router.post('/validate', validateRequest(validateCouponSchema), (req, res, next) =>
  couponController.validate(req, res, next)
);

export default router;
