import { couponRepository } from './coupon.repository';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { CreateCouponInput, UpdateCouponInput, ValidateCouponInput } from '@stitch-and-crafts/validation-schemas';

export class CouponService {
  async validateCoupon(code: string, subtotal: number) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or inactive coupon code', HTTP_STATUS.BAD_REQUEST);
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      throw new AppError('Coupon has expired', HTTP_STATUS.BAD_REQUEST);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit has been reached', HTTP_STATUS.BAD_REQUEST);
    }

    if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
      throw new AppError(`Minimum order value of ₹${coupon.minOrderValue} required for this coupon`, HTTP_STATUS.BAD_REQUEST);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * Number(coupon.discount)) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
      }
    } else {
      discountAmount = Number(coupon.discount);
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discount: Number(coupon.discount),
      discountAmount: Math.round(discountAmount * 100) / 100,
    };
  }

  async getAllAdminCoupons() {
    return couponRepository.findAllAdmin();
  }

  async getAdminCouponById(id: string) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw new AppError('Coupon not found', HTTP_STATUS.NOT_FOUND);
    }
    return coupon;
  }

  async createCoupon(input: CreateCouponInput) {
    const existing = await couponRepository.findByCode(input.code);
    if (existing) {
      throw new AppError('Coupon code already exists', HTTP_STATUS.CONFLICT);
    }
    return couponRepository.create(input);
  }

  async updateCoupon(id: string, input: UpdateCouponInput) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw new AppError('Coupon not found', HTTP_STATUS.NOT_FOUND);
    }
    if (input.code && input.code !== coupon.code) {
      const existing = await couponRepository.findByCode(input.code);
      if (existing && existing.id !== id) {
        throw new AppError('Coupon code already in use', HTTP_STATUS.CONFLICT);
      }
    }
    return couponRepository.update(id, input);
  }

  async updateCouponStatus(id: string, isActive: boolean) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw new AppError('Coupon not found', HTTP_STATUS.NOT_FOUND);
    }
    return couponRepository.update(id, { isActive });
  }

  async deleteCoupon(id: string) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw new AppError('Coupon not found', HTTP_STATUS.NOT_FOUND);
    }
    await couponRepository.delete(id);
    return { deleted: true };
  }
}

export const couponService = new CouponService();
