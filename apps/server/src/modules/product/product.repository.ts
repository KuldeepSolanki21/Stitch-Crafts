import { prisma } from '../../config/database.config';
import { Product, ProductVariant, Prisma } from '@prisma/client';
import { QueryProductInput } from '@stitch-and-crafts/validation-schemas';

export class ProductRepository {
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  async findBySku(sku: string) {
    return prisma.product.findUnique({
      where: { sku },
    });
  }

  async findVariantBySku(sku: string) {
    return prisma.productVariant.findUnique({
      where: { sku },
    });
  }

  async findVariantById(id: string) {
    return prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  async findPublished(query: QueryProductInput) {
    const { page = 1, limit = 20, search, category, minPrice, maxPrice, sort, featured, color, size } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isPublished: true,
      category: {
        isActive: true,
        ...(category && { slug: category }),
      },
      ...(featured !== undefined && { featured }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { category: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(color || size
        ? {
            variants: {
              some: {
                ...(color && { colorName: { contains: color, mode: 'insensitive' } }),
                ...(size && { size: { equals: size, mode: 'insensitive' } }),
              },
            },
          }
        : {}),
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'name_asc') orderBy = { title: 'asc' };
    if (sort === 'name_desc') orderBy = { title: 'desc' };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllAdmin(query: any) {
    const { page = 1, limit = 20, search, categoryId, isPublished, featured } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProductWhereInput = {
      ...(categoryId && { categoryId }),
      ...(isPublished !== undefined && { isPublished: isPublished === 'true' || isPublished === true }),
      ...(featured !== undefined && { featured: featured === 'true' || featured === true }),
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
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          variants: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  async findFeatured(limit = 8) {
    return prisma.product.findMany({
      where: {
        featured: true,
        isPublished: true,
        category: { isActive: true },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  async findRelated(productId: string, categoryId: string, limit = 4) {
    return prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        isPublished: true,
        category: { isActive: true },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  async createProduct(data: any) {
    const { variants, ...productData } = data;
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: productData,
      });

      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v: any) => ({
            ...v,
            productId: product.id,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: { category: true, variants: true },
      });
    });
  }

  async updateProduct(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true, variants: true },
    });
  }

  async deleteProduct(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  // Variant operations
  async createVariant(productId: string, data: any): Promise<ProductVariant> {
    return prisma.productVariant.create({
      data: {
        ...data,
        productId,
      },
    });
  }

  async updateVariant(id: string, data: any): Promise<ProductVariant> {
    return prisma.productVariant.update({
      where: { id },
      data,
    });
  }

  async deleteVariant(id: string): Promise<void> {
    await prisma.productVariant.delete({
      where: { id },
    });
  }
}

export const productRepository = new ProductRepository();
