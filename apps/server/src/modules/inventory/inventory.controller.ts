import { Request, Response, NextFunction } from 'express';
import { inventoryService } from './inventory.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { queryInventorySchema } from '@stitch-and-crafts/validation-schemas';

export class InventoryController {
  async getInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const query = queryInventorySchema.parse(req.query);
      const result = await inventoryService.getInventory(query);
      return sendResponse(res, HTTP_STATUS.OK, 'Inventory stock audit list retrieved', result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await inventoryService.getProductInventory(req.params.productId);
      return sendResponse(res, HTTP_STATUS.OK, 'Product inventory retrieved', item);
    } catch (error) {
      next(error);
    }
  }

  async updateProductStock(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await inventoryService.updateProductStock(req.params.productId, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Product stock updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  async updateVariantStock(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await inventoryService.updateVariantStock(req.params.variantId, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Variant stock updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
