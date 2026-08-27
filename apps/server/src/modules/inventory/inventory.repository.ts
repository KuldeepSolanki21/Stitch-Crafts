import { prisma } from '../../config/database.config';
import { Prisma } from '@prisma/client';

export class InventoryRepository {
  async getInventoryList(query: any) {
    const { page = 1, limit = 20, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProductWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { stock: 'asc' },
        include: {
          category: { select: { name: true } },
          variants: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getProductStock(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        sku: true,
        stock: true,
        variants: {
          select: {
            id: true,
            colorName: true,
            size: true,
            sku: true,
            stock: true,
          },
        },
      },
    });
  }

  async updateProductStock(productId: string, stock: number) {
    return prisma.product.update({
      where: { id: productId },
      data: { stock },
    });
  }

  async updateVariantStock(variantId: string, stock: number) {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });
  }
}

export const inventoryRepository = new InventoryRepository();
