import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';

export class CategoryController {
  // Public APIs
  async getPublicCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getPublicCategories();
      return sendResponse(res, HTTP_STATUS.OK, 'Categories fetched successfully', categories);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      return sendResponse(res, HTTP_STATUS.OK, 'Category details retrieved', category);
    } catch (error) {
      next(error);
    }
  }

  // Admin APIs
  async getAllAdminCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAllAdminCategories();
      return sendResponse(res, HTTP_STATUS.OK, 'Admin categories list retrieved', categories);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getAdminCategoryById(req.params.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Category retrieved', category);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.createCategory(req.body);
      return sendResponse(res, HTTP_STATUS.CREATED, 'Category created successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Category updated successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async updateCategoryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.updateCategoryStatus(req.params.id, req.body.isActive);
      return sendResponse(res, HTTP_STATUS.OK, 'Category status updated', category);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryService.deleteCategory(req.params.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
