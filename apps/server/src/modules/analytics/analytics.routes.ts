import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(authenticateJWT, requireRoles('ADMIN', 'SUPER_ADMIN'));

router.get('/overview', (req, res, next) => analyticsController.getOverview(req, res, next));
router.get('/revenue', (req, res, next) => analyticsController.getRevenue(req, res, next));
router.get('/products', (req, res, next) => analyticsController.getTopProducts(req, res, next));
router.get('/categories', (req, res, next) => analyticsController.getCategorySales(req, res, next));

export default router;
