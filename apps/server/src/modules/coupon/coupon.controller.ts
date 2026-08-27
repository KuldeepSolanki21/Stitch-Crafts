import { Request, Response, NextFunction } from 'express';
import { couponService } from './coupon.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';

export class CouponController {
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, subtotal = 0 } = req.body;
      const result = await couponService.validateCoupon(code, Number(subtotal));
      return sendResponse(res, HTTP_STATUS.OK, 'Coupon is valid', result);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await couponService.getAllAdminCoupons();
      return sendResponse(res, HTTP_STATUS.OK, 'Coupons list retrieved', coupons);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.getAdminCouponById(req.params.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Coupon details retrieved', coupon);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.createCoupon(req.body);
      return sendResponse(res, HTTP_STATUS.CREATED, 'Coupon created successfully', coupon);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.updateCoupon(req.params.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Coupon updated successfully', coupon);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.updateCouponStatus(req.params.id, req.body.isActive);
      return sendResponse(res, HTTP_STATUS.OK, 'Coupon status updated', coupon);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await couponService.deleteCoupon(req.params.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Coupon deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const couponController = new CouponController();
