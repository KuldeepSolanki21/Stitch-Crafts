import { Router } from 'express';
import { userController } from './user.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
} from '@stitch-and-crafts/validation-schemas';

const router = Router();

// Profile Routes
router.get('/me', authenticateJWT, userController.getProfile);
router.patch('/me', authenticateJWT, validateRequest(updateProfileSchema), userController.updateProfile);

// Address Management
router.get('/me/addresses', authenticateJWT, userController.getAddresses);
router.post('/me/addresses', authenticateJWT, validateRequest(createAddressSchema), userController.createAddress);
router.patch('/me/addresses/:id', authenticateJWT, validateRequest(updateAddressSchema), userController.updateAddress);
router.delete('/me/addresses/:id', authenticateJWT, userController.deleteAddress);

export default router;
