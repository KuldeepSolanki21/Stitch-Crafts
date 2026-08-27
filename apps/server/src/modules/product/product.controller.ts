import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { queryProductSchema } from '@stitch-and-crafts/validation-schemas';

export class ProductController {
  // Public APIs
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = queryProductSchema.parse(req.query);
      const result = await productService.getPublishedProducts(query);
      return sendResponse(res, HTTP_STATUS.OK, 'Products retrieved successfully', result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getProductBySlug(req.params.slug);
      return sendResponse(res, HTTP_STATUS.OK, 'Product details retrieved', product);
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.getFeaturedProducts();
      return sendResponse(res, HTTP_STATUS.OK, 'Featured products retrieved', products);
    } catch (error) {
      next(error);
    }
  }

  async getRelatedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.getRelatedProducts(req.params.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Related products retrieved', products);
    } catch (error) {
      next(error);
    }
  }

  // Admin APIs
  async getAllAdminProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.getAllAdminProducts(req.query);
      return sendResponse(res, HTTP_STATUS.OK, 'Admin products list retrieved', result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getAdminProductById(req.params.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Product retrieved', product);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.createProduct(req.body);
      return sendResponse(res, HTTP_STATUS.CREATED, 'Product created successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Product updated successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async updateProductStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.updateProductStatus(req.params.id, req.body.isPublished);
      return sendResponse(res, HTTP_STATUS.OK, 'Product publishing status updated', product);
    } catch (error) {
      next(error);
    }
  }

  async updateProductFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.updateProductFeatured(req.params.id, req.body.featured);
      return sendResponse(res, HTTP_STATUS.OK, 'Product featured status updated', product);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.deleteProduct(req.params.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Variant Admin Handlers
  async createVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const variant = await productService.createVariant(req.params.productId, req.body);
      return sendResponse(res, HTTP_STATUS.CREATED, 'Product variant added', variant);
    } catch (error) {
      next(error);
    }
  }

  async getVariants(req: Request, res: Response, next: NextFunction) {
    try {
      const variants = await productService.getVariantsByProductId(req.params.productId);
      return sendResponse(res, HTTP_STATUS.OK, 'Product variants retrieved', variants);
    } catch (error) {
      next(error);
    }
  }

  async updateVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const variant = await productService.updateVariant(req.params.productId, req.params.variantId, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Product variant updated', variant);
    } catch (error) {
      next(error);
    }
  }

  async deleteVariant(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.deleteVariant(req.params.productId, req.params.variantId);
      return sendResponse(res, HTTP_STATUS.OK, 'Product variant deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
