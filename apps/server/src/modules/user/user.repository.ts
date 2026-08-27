import { prisma } from '../../config/database.config';
import { Address } from '@prisma/client';

export class UserRepository {
  async findProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string | null }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: { userId, isDeleted: false },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getAddressById(id: string, userId: string): Promise<Address | null> {
    return prisma.address.findFirst({
      where: { id, userId, isDeleted: false },
    });
  }

  async createAddress(userId: string, data: any): Promise<Address> {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.address.create({
        data: {
          ...data,
          userId,
        },
      });
    });
  }

  async updateAddress(id: string, userId: string, data: any): Promise<Address> {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.address.update({
        where: { id },
        data,
      });
    });
  }

  async deleteAddress(id: string, userId: string): Promise<void> {
    const address = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) return;

    const orderCount = await prisma.order.count({
      where: { shippingAddressId: id },
    });

    if (orderCount > 0) {
      await prisma.address.update({
        where: { id },
        data: { isDeleted: true, isDefault: false },
      });
    } else {
      await prisma.address.delete({
        where: { id },
      });
    }

    if (address.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
      });
      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }
  }
}

export const userRepository = new UserRepository();
