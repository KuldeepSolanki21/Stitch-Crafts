import { Router } from 'express';
import { reviewController } from './review.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createReviewSchema, updateReviewSchema } from '@stitch-and-crafts/validation-schemas';

const router = Router();

// Public Reviews list
router.get('/product/:productId', (req, res, next) => reviewController.getProductReviews(req, res, next));

// Customer Review Actions
router.post('/', authenticateJWT, validateRequest(createReviewSchema), (req, res, next) =>
  reviewController.createReview(req as any, res, next)
);
router.patch('/:id', authenticateJWT, validateRequest(updateReviewSchema), (req, res, next) =>
  reviewController.updateReview(req as any, res, next)
);
router.delete('/:id', authenticateJWT, (req, res, next) =>
  reviewController.deleteReview(req as any, res, next)
);

export default router;
