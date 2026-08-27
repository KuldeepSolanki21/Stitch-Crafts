import axios from 'axios';

export const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminAccessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshingAdmin = false;
let failedAdminQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processAdminQueue = (error: any, token: string | null = null) => {
  failedAdminQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedAdminQueue = [];
};

adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      if (isRefreshingAdmin) {
        return new Promise((resolve, reject) => {
          failedAdminQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return adminApiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshingAdmin = true;

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('adminAccessToken', newAccessToken);
          adminApiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processAdminQueue(null, newAccessToken);
          return adminApiClient(originalRequest);
        }
      } catch (refreshErr) {
        processAdminQueue(refreshErr, null);
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminUser');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshingAdmin = false;
      }
    }

    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth & Overview
  login: (credentials: { email: string; password: string }) => adminApiClient.post('/auth/login', credentials),
  getOverview: () => adminApiClient.get('/admin/overview'),
  getRevenueTrends: () => adminApiClient.get('/admin/analytics/revenue'),
  getTopProducts: () => adminApiClient.get('/admin/analytics/products'),
  getCategorySales: () => adminApiClient.get('/admin/analytics/categories'),
  getSystemStatus: () => adminApiClient.get('/admin/system-status'),

  // Categories
  getCategories: () => adminApiClient.get('/admin/categories'),
  getCategoryById: (id: string) => adminApiClient.get(`/admin/categories/${id}`),
  createCategory: (data: any) => adminApiClient.post('/admin/categories', data),
  updateCategory: (id: string, data: any) => adminApiClient.patch(`/admin/categories/${id}`, data),
  updateCategoryStatus: (id: string, isActive: boolean) => adminApiClient.patch(`/admin/categories/${id}/status`, { isActive }),
  deleteCategory: (id: string) => adminApiClient.delete(`/admin/categories/${id}`),

  // Products
  getProducts: (params?: any) => adminApiClient.get('/admin/products', { params }),
  getProductById: (id: string) => adminApiClient.get(`/admin/products/${id}`),
  createProduct: (data: any) => adminApiClient.post('/admin/products', data),
  updateProduct: (id: string, data: any) => adminApiClient.patch(`/admin/products/${id}`, data),
  updateProductStatus: (id: string, isPublished: boolean) => adminApiClient.patch(`/admin/products/${id}/status`, { isPublished }),
  updateProductFeatured: (id: string, featured: boolean) => adminApiClient.patch(`/admin/products/${id}/featured`, { featured }),
  deleteProduct: (id: string) => adminApiClient.delete(`/admin/products/${id}`),

  // Variants
  createVariant: (productId: string, data: any) => adminApiClient.post(`/admin/products/${productId}/variants`, data),
  updateVariant: (productId: string, variantId: string, data: any) => adminApiClient.patch(`/admin/products/${productId}/variants/${variantId}`, data),
  deleteVariant: (productId: string, variantId: string) => adminApiClient.delete(`/admin/products/${productId}/variants/${variantId}`),

  // Inventory
  getInventory: (params?: any) => adminApiClient.get('/admin/inventory', { params }),
  updateProductStock: (productId: string, stock: number) => adminApiClient.patch(`/admin/inventory/${productId}`, { stock }),
  updateVariantStock: (variantId: string, stock: number) => adminApiClient.patch(`/admin/inventory/variant/${variantId}`, { stock }),

  // Coupons
  getCoupons: () => adminApiClient.get('/admin/coupons'),
  getCouponById: (id: string) => adminApiClient.get(`/admin/coupons/${id}`),
  createCoupon: (data: any) => adminApiClient.post('/admin/coupons', data),
  updateCoupon: (id: string, data: any) => adminApiClient.patch(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => adminApiClient.delete(`/admin/coupons/${id}`),

  // Orders
  getOrders: (params?: any) => adminApiClient.get('/admin/orders', { params }),
  getOrderById: (id: string) => adminApiClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, data: any) => adminApiClient.patch(`/admin/orders/${id}/status`, data),
  updateOrderTracking: (id: string, data: any) => adminApiClient.patch(`/admin/orders/${id}/tracking`, data),

  // Banners
  getBanners: () => adminApiClient.get('/admin/banners'),
  createBanner: (data: any) => adminApiClient.post('/admin/banners', data),
  updateBanner: (id: string, data: any) => adminApiClient.patch(`/admin/banners/${id}`, data),
  deleteBanner: (id: string) => adminApiClient.delete(`/admin/banners/${id}`),

  // Reviews
  getReviews: () => adminApiClient.get('/admin/reviews'),
  approveReview: (id: string) => adminApiClient.patch(`/admin/reviews/${id}/approve`, {}),
  rejectReview: (id: string) => adminApiClient.patch(`/admin/reviews/${id}/reject`, {}),
  deleteReview: (id: string) => adminApiClient.delete(`/admin/reviews/${id}`),

  // Users
  getUsers: (params?: any) => adminApiClient.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) => adminApiClient.patch(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id: string, isActive: boolean) => adminApiClient.patch(`/admin/users/${id}/status`, { isActive }),

  // Media
  uploadImage: (formData: FormData) => adminApiClient.post('/admin/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
