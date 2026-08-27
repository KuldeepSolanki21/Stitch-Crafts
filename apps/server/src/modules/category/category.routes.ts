import { Router } from 'express';
import { categoryController } from './category.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
} from '@stitch-and-crafts/validation-schemas';

const router = Router();

// Public Routes
router.get('/', (req, res, next) => categoryController.getPublicCategories(req, res, next));
router.get('/:slug', (req, res, next) => categoryController.getCategoryBySlug(req, res, next));

export default router;
