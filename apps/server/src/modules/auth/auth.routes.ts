import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '@stitch-and-crafts/validation-schemas';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { authRateLimiter } from '../../middlewares/rate-limiter.middleware';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest(loginSchema),
  authController.login
);

router.post(
  '/logout',
  authenticateJWT,
  authController.logout
);

router.post(
  '/refresh-token',
  authRateLimiter,
  authController.refreshToken
);

export default router;
