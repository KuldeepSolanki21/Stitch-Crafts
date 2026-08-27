import { prisma } from '../../config/database.config';
import { Role, User } from '@prisma/client';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string | null;
    role?: Role;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        phone: data.phone?.trim() || null,
        role: data.role || Role.CUSTOMER,
      },
    });
  }

  async updateRefreshTokenHash(userId: string, hash: string | null): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }
}

export const authRepository = new AuthRepository();
