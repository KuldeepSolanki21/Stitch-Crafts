import { apiClient } from './api.client';
import { RegisterInput, LoginInput, UpdateProfileInput, CreateAddressInput, UpdateAddressInput } from '@stitch-and-crafts/validation-schemas';

export const authApi = {
  register: (data: RegisterInput) => apiClient.post('/auth/register', data),
  login: (data: LoginInput) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh-token'),
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (data: UpdateProfileInput) => apiClient.patch('/users/me', data),
  getAddresses: () => apiClient.get('/users/me/addresses'),
  createAddress: (data: CreateAddressInput) => apiClient.post('/users/me/addresses', data),
  addAddress: (data: CreateAddressInput) => apiClient.post('/users/me/addresses', data),
  updateAddress: (id: string, data: UpdateAddressInput) => apiClient.patch(`/users/me/addresses/${id}`, data),
  deleteAddress: (id: string) => apiClient.delete(`/users/me/addresses/${id}`),
};

