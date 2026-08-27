import { bannerRepository } from './banner.repository';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { CreateBannerInput, UpdateBannerInput } from '@stitch-and-crafts/validation-schemas';

export class BannerService {
  async getActiveBanners() {
    return bannerRepository.findActiveBanners();
  }

  async getAllAdminBanners() {
    return bannerRepository.findAllAdmin();
  }

  async getBannerById(id: string) {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw new AppError('Banner not found', HTTP_STATUS.NOT_FOUND);
    }
    return banner;
  }

  async createBanner(input: CreateBannerInput) {
    return bannerRepository.create(input);
  }

  async updateBanner(id: string, input: UpdateBannerInput) {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw new AppError('Banner not found', HTTP_STATUS.NOT_FOUND);
    }
    return bannerRepository.update(id, input);
  }

  async updateBannerStatus(id: string, isActive: boolean) {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw new AppError('Banner not found', HTTP_STATUS.NOT_FOUND);
    }
    return bannerRepository.update(id, { isActive });
  }

  async deleteBanner(id: string) {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw new AppError('Banner not found', HTTP_STATUS.NOT_FOUND);
    }
    await bannerRepository.delete(id);
    return { deleted: true };
  }
}

export const bannerService = new BannerService();
