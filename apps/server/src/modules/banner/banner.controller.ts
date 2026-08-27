import { Request, Response, NextFunction } from 'express';
import { bannerService } from './banner.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';

export class BannerController {
  async getActiveBanners(req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await bannerService.getActiveBanners();
      return sendResponse(res, HTTP_STATUS.OK, 'Hero banners retrieved', banners);
    } catch (error) {
      next(error);
    }
  }

  async getAllAdminBanners(req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await bannerService.getAllAdminBanners();
      return sendResponse(res, HTTP_STATUS.OK, 'Admin banners list', banners);
    } catch (error) {
      next(error);
    }
  }

  async getBannerById(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.getBannerById(req.params.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Banner details', banner);
    } catch (error) {
      next(error);
    }
  }

  async createBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.createBanner(req.body);
      return sendResponse(res, HTTP_STATUS.CREATED, 'Banner created', banner);
    } catch (error) {
      next(error);
    }
  }

  async updateBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.updateBanner(req.params.id, req.body);
      return sendResponse(res, HTTP_STATUS.OK, 'Banner updated', banner);
    } catch (error) {
      next(error);
    }
  }

  async updateBannerStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.updateBannerStatus(req.params.id, req.body.isActive);
      return sendResponse(res, HTTP_STATUS.OK, 'Banner status updated', banner);
    } catch (error) {
      next(error);
    }
  }

  async deleteBanner(req: Request, res: Response, next: NextFunction) {
    try {
      await bannerService.deleteBanner(req.params.id);
      return sendResponse(res, HTTP_STATUS.OK, 'Banner deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const bannerController = new BannerController();
