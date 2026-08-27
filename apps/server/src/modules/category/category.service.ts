import { categoryRepository } from './category.repository';
import { slugify } from '../../utils/slugify.util';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { CreateCategoryInput, UpdateCategoryInput } from '@stitch-and-crafts/validation-schemas';

export class CategoryService {
  async getPublicCategories() {
    return categoryRepository.findAllActiveHierarchy();
  }

  async getCategoryBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category || !category.isActive) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    }
    return category;
  }

  async getAllAdminCategories() {
    return categoryRepository.findAllAdmin();
  }

  async getAdminCategoryById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    }
    return category;
  }

  async createCategory(input: CreateCategoryInput) {
    const existingName = await categoryRepository.findByName(input.name);
    if (existingName) {
      throw new AppError('Category with this name already exists', HTTP_STATUS.CONFLICT);
    }

    let slug = slugify(input.name);
    let counter = 1;
    while (await categoryRepository.findBySlug(slug)) {
      slug = `${slugify(input.name)}-${counter}`;
      counter++;
    }

    if (input.parentId) {
      const parent = await categoryRepository.findById(input.parentId);
      if (!parent) {
        throw new AppError('Parent category not found', HTTP_STATUS.BAD_REQUEST);
      }
    }

    return categoryRepository.create({
      name: input.name,
      slug,
      description: input.description,
      image: input.image,
      parentId: input.parentId || null,
      isActive: input.isActive ?? true,
    });
  }

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    }

    let slug = category.slug;
    if (input.name && input.name !== category.name) {
      const existingName = await categoryRepository.findByName(input.name);
      if (existingName && existingName.id !== id) {
        throw new AppError('Category name already in use', HTTP_STATUS.CONFLICT);
      }
      slug = slugify(input.name);
      let counter = 1;
      while (true) {
        const found = await categoryRepository.findBySlug(slug);
        if (!found || found.id === id) break;
        slug = `${slugify(input.name)}-${counter}`;
        counter++;
      }
    }

    if (input.parentId) {
      if (input.parentId === id) {
        throw new AppError('Category cannot be its own parent', HTTP_STATUS.BAD_REQUEST);
      }
      const parent = await categoryRepository.findById(input.parentId);
      if (!parent) {
        throw new AppError('Parent category not found', HTTP_STATUS.BAD_REQUEST);
      }
    }

    return categoryRepository.update(id, {
      ...(input.name && { name: input.name }),
      ...(input.name && { slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.image && { image: input.image }),
      ...(input.parentId !== undefined && { parentId: input.parentId }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    });
  }

  async updateCategoryStatus(id: string, isActive: boolean) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    }
    return categoryRepository.update(id, { isActive });
  }

  async deleteCategory(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    }

    const productCount = await categoryRepository.countProducts(id);
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete category: ${productCount} products are currently attached to it. Reassign products first.`,
        HTTP_STATUS.CONFLICT
      );
    }

    await categoryRepository.delete(id);
    return { deleted: true };
  }
}

export const categoryService = new CategoryService();
