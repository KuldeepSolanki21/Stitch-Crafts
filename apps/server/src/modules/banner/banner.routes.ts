import { Router } from 'express';
import { bannerController } from './banner.controller';

const router = Router();

// Public Hero Banners
router.get('/', (req, res, next) => bannerController.getActiveBanners(req, res, next));

export default router;
