import { prisma } from '../../config/database.config';
import { Coupon } from '@prisma/client';

export class CouponRepository {
  async findByCode(code: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
  }

  async findById(id: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({
      where: { id },
    });
  }

  async findAllAdmin(): Promise<Coupon[]> {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { orders: true } },
      },
    });
  }

  async create(data: any): Promise<Coupon> {
    return prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase().trim(),
        expiryDate: new Date(data.expiryDate),
      },
    });
  }

  async update(id: string, data: any): Promise<Coupon> {
    return prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        ...(data.code && { code: data.code.toUpperCase().trim() }),
        ...(data.expiryDate && { expiryDate: new Date(data.expiryDate) }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.coupon.delete({
      where: { id },
    });
  }

  async incrementUsage(id: string) {
    return prisma.coupon.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
  }
}

export const couponRepository = new CouponRepository();
