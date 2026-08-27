import { Response, NextFunction } from 'express';
import { cartService } from './cart.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class CartController {
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.getFormattedCart(req.user!.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Cart retrieved', cart);
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.addItem(req.user!.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Item added to cart', cart);
    } catch (error) {
      next(error);
    }
  }

  async updateItemQuantity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.updateItemQuantity(req.user!.id, req.params.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Cart item updated', cart);
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.removeItem(req.user!.id, req.params.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Cart item removed', cart);
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.clearCart(req.user!.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Cart cleared', cart);
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
