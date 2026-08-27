import { Request, Response, NextFunction } from 'express';
import { reviewService } from './review.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class ReviewController {
  async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reviewService.getProductReviews(req.params.productId);
      return sendResponse(res, HTTP_STATUS.OK, 'Product reviews and ratings', data);
    } catch (error) {
      next(error);
    }
  }

  async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.createReview(req.user!.id, req.body);
      return sendResponse(res, HTTP_STATUS.CREATED, 'Review submitted successfully', review);
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.updateReview(req.params.id, req.user!.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Review updated', review);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
      await reviewService.deleteReview(req.params.id, req.user?.id, isAdmin);
      return sendResponse(res, HTTP_STATUS.OK, 'Review removed');
    } catch (error) {
      next(error);
    }
  }

  async getAllAdminReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewService.getAllAdminReviews();
      return sendResponse(res, HTTP_STATUS.OK, 'Admin reviews list', reviews);
    } catch (error) {
      next(error);
    }
  }

  async updateApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.updateReviewApproval(req.params.id, req.body.isApproved);
      return sendResponse(res, HTTP_STATUS.OK, 'Review moderation updated', review);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
