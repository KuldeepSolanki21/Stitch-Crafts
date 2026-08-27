import { userRepository } from './user.repository';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { UpdateProfileInput, CreateAddressInput, UpdateAddressInput } from '@stitch-and-crafts/validation-schemas';

export class UserService {
  async getProfile(userId: string) {
    const profile = await userRepository.findProfile(userId);
    if (!profile) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }
    return profile;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    return userRepository.updateProfile(userId, data);
  }

  async getAddresses(userId: string) {
    return userRepository.getAddresses(userId);
  }

  async createAddress(userId: string, data: CreateAddressInput) {
    return userRepository.createAddress(userId, data);
  }

  async updateAddress(id: string, userId: string, data: UpdateAddressInput) {
    const existing = await userRepository.getAddressById(id, userId);
    if (!existing) {
      throw new AppError('Address not found or does not belong to user', HTTP_STATUS.NOT_FOUND);
    }
    return userRepository.updateAddress(id, userId, data);
  }

  async deleteAddress(id: string, userId: string) {
    const existing = await userRepository.getAddressById(id, userId);
    if (!existing) {
      throw new AppError('Address not found or does not belong to user', HTTP_STATUS.NOT_FOUND);
    }
    await userRepository.deleteAddress(id, userId);
    return { deleted: true };
  }
}

export const userService = new UserService();
