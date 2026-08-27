import { Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getProfile(req.user!.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Profile retrieved', profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = await userService.updateProfile(req.user!.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Profile updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  async getAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addresses = await userService.getAddresses(req.user!.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Addresses retrieved', addresses);
    } catch (error) {
      next(error);
    }
  }

  async createAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await userService.createAddress(req.user!.id, req.body);
      return sendResponse(res, HTTP_STATUS.CREATED, 'Address created successfully', address);
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await userService.updateAddress(req.params.id, req.user!.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Address updated successfully', address);
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.deleteAddress(req.params.id, req.user!.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Address deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
