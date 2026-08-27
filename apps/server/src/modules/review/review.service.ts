import { reviewRepository } from './review.repository';
import { productRepository } from '../product/product.repository';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { CreateReviewInput, UpdateReviewInput } from '@stitch-and-crafts/validation-schemas';

export class ReviewService {
  async getProductReviews(productId: string) {
    const reviews = await reviewRepository.findByProduct(productId);
    const totalReviews = reviews.length;

    let ratingBreakdown: Record<string, number> = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    let sum = 0;

    reviews.forEach((r) => {
      sum += r.rating;
      const key = String(r.rating);
      if (ratingBreakdown[key] !== undefined) {
        ratingBreakdown[key]++;
      }
    });

    const averageRating = totalReviews > 0 ? Math.round((sum / totalReviews) * 10) / 10 : 5.0;

    return {
      averageRating,
      totalReviews,
      ratingBreakdown,
      reviews,
    };
  }

  async createReview(userId: string, input: CreateReviewInput) {
    const product = await productRepository.findById(input.productId);
    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    const existingReview = await reviewRepository.findByUserAndProduct(userId, input.productId);
    if (existingReview) {
      throw new AppError('You have already submitted a review for this handcrafted item', HTTP_STATUS.CONFLICT);
    }

    // Check if user is a verified buyer who received the item
    const deliveredOrder = await reviewRepository.findUserDeliveredProductOrder(userId, input.productId);
    const isVerified = !!deliveredOrder;

    return reviewRepository.create({
      userId,
      productId: input.productId,
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      isVerified,
    });
  }

  async updateReview(id: string, userId: string, input: UpdateReviewInput) {
    const review = await reviewRepository.findById(id);
    if (!review || review.userId !== userId) {
      throw new AppError('Review not found or unauthorized', HTTP_STATUS.NOT_FOUND);
    }
    return reviewRepository.update(id, input);
  }

  async deleteReview(id: string, userId?: string, isAdmin = false) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }
    if (!isAdmin && review.userId !== userId) {
      throw new AppError('Unauthorized', HTTP_STATUS.FORBIDDEN);
    }
    await reviewRepository.delete(id);
    return { deleted: true };
  }

  async getAllAdminReviews() {
    return reviewRepository.findAllAdmin();
  }

  async updateReviewApproval(id: string, isApproved: boolean) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }
    return reviewRepository.update(id, { isApproved });
  }
}

export const reviewService = new ReviewService();
