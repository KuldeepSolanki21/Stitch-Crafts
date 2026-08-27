import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';

export class AnalyticsController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getOverview();
      return sendResponse(res, HTTP_STATUS.OK, 'Analytics overview', data);
    } catch (error) {
      next(error);
    }
  }

  async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getRevenueTrends();
      return sendResponse(res, HTTP_STATUS.OK, 'Revenue trends', data);
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getTopProducts();
      return sendResponse(res, HTTP_STATUS.OK, 'Top selling products', data);
    } catch (error) {
      next(error);
    }
  }

  async getCategorySales(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getCategorySales();
      return sendResponse(res, HTTP_STATUS.OK, 'Category revenue metrics', data);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
