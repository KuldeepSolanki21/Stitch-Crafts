import { Router } from 'express';
import { mediaController } from './media.controller';
import { upload } from '../../middlewares/upload.middleware';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(authenticateJWT, requireRoles('ADMIN', 'SUPER_ADMIN'));

router.post('/upload', upload.single('image'), (req, res, next) =>
  mediaController.uploadSingle(req, res, next)
);

router.delete('/:publicId', (req, res, next) =>
  mediaController.deleteMedia(req, res, next)
);

export default router;
