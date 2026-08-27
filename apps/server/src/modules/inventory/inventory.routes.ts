import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { updateStockSchema } from '@stitch-and-crafts/validation-schemas';

const router = Router();

router.use(authenticateJWT, requireRoles('ADMIN', 'SUPER_ADMIN'));

router.get('/', (req, res, next) => inventoryController.getInventory(req, res, next));
router.get('/:productId', (req, res, next) => inventoryController.getProductInventory(req, res, next));
router.patch('/:productId', validateRequest(updateStockSchema), (req, res, next) =>
  inventoryController.updateProductStock(req, res, next)
);
router.patch('/variant/:variantId', validateRequest(updateStockSchema), (req, res, next) =>
  inventoryController.updateVariantStock(req, res, next)
);

export default router;
