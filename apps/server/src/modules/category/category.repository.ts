import { prisma } from '../../config/database.config';
import { Category } from '@prisma/client';

export class CategoryRepository {
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        children: { where: { isActive: true } },
        parent: true,
      },
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async findAllAdmin(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        children: true,
        parent: true,
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findAllActiveHierarchy() {
    return prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null, // Roots
      },
      include: {
        children: {
          where: { isActive: true },
          include: {
            _count: { select: { products: { where: { isPublished: true } } } },
          },
        },
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string | null;
    image: string;
    parentId?: string | null;
    isActive?: boolean;
  }): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
      include: { parent: true, children: true },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }

  async countProducts(categoryId: string): Promise<number> {
    return prisma.product.count({
      where: { categoryId },
    });
  }
}

export const categoryRepository = new CategoryRepository();
