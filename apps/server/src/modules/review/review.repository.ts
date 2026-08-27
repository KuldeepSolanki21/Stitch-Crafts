import { prisma } from '../../config/database.config';
import { Review } from '@prisma/client';

export class ReviewRepository {
  async findByProduct(productId: string) {
    return prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });
  }

  async findUserDeliveredProductOrder(userId: string, productId: string) {
    return prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          orderStatus: 'DELIVERED',
        },
      },
    });
  }

  async findByUserAndProduct(userId: string, productId: string) {
    return prisma.review.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
  }

  async findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        product: { select: { title: true } },
        user: { select: { name: true, email: true } },
      },
    });
  }

  async findAllAdmin() {
    return prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { title: true, images: true } },
        user: { select: { name: true, email: true } },
      },
    });
  }

  async create(data: {
    userId: string;
    productId: string;
    rating: number;
    title?: string | null;
    comment: string;
    isVerified: boolean;
  }): Promise<Review> {
    return prisma.review.create({
      data,
      include: { user: { select: { name: true } } },
    });
  }

  async update(id: string, data: any): Promise<Review> {
    return prisma.review.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.review.delete({
      where: { id },
    });
  }
}

export const reviewRepository = new ReviewRepository();
