import { Router } from 'express';
import { productController } from './product.controller';

const router = Router();

// Public Catalog APIs
router.get('/', (req, res, next) => productController.getProducts(req, res, next));
router.get('/featured', (req, res, next) => productController.getFeaturedProducts(req, res, next));
router.get('/:slug', (req, res, next) => productController.getProductBySlug(req, res, next));
router.get('/:id/related', (req, res, next) => productController.getRelatedProducts(req, res, next));

export default router;
