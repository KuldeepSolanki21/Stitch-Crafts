import { Response, NextFunction } from 'express';
import { orderService } from './order.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class OrderController {
  async checkoutPreview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const preview = await orderService.getCheckoutPreview(req.user!.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Checkout preview calculated', preview);
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.createOrder(req.user!.id, req.body);
      return sendResponse(res, HTTP_STATUS.CREATED, 'Order placed successfully', order);
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await orderService.getMyOrders(req.user!.id, page, limit);
      return sendResponse(res, HTTP_STATUS.OK, 'Orders retrieved', result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user!.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Order details retrieved', order);
    } catch (error) {
      next(error);
    }
  }

  async getOrderTracking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tracking = await orderService.getOrderTracking(req.params.id, req.user!.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Order tracking timeline', tracking);
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cancelled = await orderService.cancelCustomerOrder(req.params.id, req.user!.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Order cancelled successfully', cancelled);
    } catch (error) {
      next(error);
    }
  }

  // Admin Controllers
  async getAllAdminOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await orderService.getAllAdminOrders(req.query);
      return sendResponse(res, HTTP_STATUS.OK, 'Admin orders list', result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Admin order details', order);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = await orderService.updateOrderStatus(req.params.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Order status updated', updated);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderTracking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = await orderService.updateOrderTracking(req.params.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Airway bill tracking updated', updated);
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
