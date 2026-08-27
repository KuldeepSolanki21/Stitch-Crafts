import { prisma } from '../../config/database.config';
import { Banner } from '@prisma/client';

export class BannerRepository {
  async findActiveBanners(): Promise<Banner[]> {
    return prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findAllAdmin(): Promise<Banner[]> {
    return prisma.banner.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findById(id: string): Promise<Banner | null> {
    return prisma.banner.findUnique({
      where: { id },
    });
  }

  async create(data: any): Promise<Banner> {
    return prisma.banner.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Banner> {
    return prisma.banner.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.banner.delete({
      where: { id },
    });
  }
}

export const bannerRepository = new BannerRepository();
