import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/rbac.middleware';
import { sendResponse, sendError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { prisma } from '../../config/database.config';
import { validateRequest } from '../../middlewares/validate.middleware';

import { categoryController } from '../category/category.controller';
import { productController } from '../product/product.controller';
import { inventoryController } from '../inventory/inventory.controller';
import { mediaController } from '../media/media.controller';
import { couponController } from '../coupon/coupon.controller';
import { orderController } from '../order/order.controller';
import { bannerController } from '../banner/banner.controller';
import { reviewController } from '../review/review.controller';
import { analyticsController } from '../analytics/analytics.controller';
import { upload } from '../../middlewares/upload.middleware';

import {
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
  updateProductFeaturedSchema,
  createVariantSchema,
  updateVariantSchema,
  updateStockSchema,
  createCouponSchema,
  updateCouponSchema,
  updateOrderStatusSchema,
  updateOrderTrackingSchema,
  createBannerSchema,
  updateBannerSchema,
  bannerStatusSchema,
} from '@stitch-and-crafts/validation-schemas';

const router = Router();

// Protect ALL /api/v1/admin/* routes for ADMIN and SUPER_ADMIN
router.use(authenticateJWT, requireRoles('ADMIN', 'SUPER_ADMIN'));

// 1. Dashboard & Analytics
router.get('/overview', (req, res, next) => analyticsController.getOverview(req, res, next));
router.get('/analytics/overview', (req, res, next) => analyticsController.getOverview(req, res, next));
router.get('/analytics/revenue', (req, res, next) => analyticsController.getRevenue(req, res, next));
router.get('/analytics/products', (req, res, next) => analyticsController.getTopProducts(req, res, next));
router.get('/analytics/categories', (req, res, next) => analyticsController.getCategorySales(req, res, next));

// 2. Super Admin System Status
router.get('/system-status', requireRoles('SUPER_ADMIN'), (req, res) => {
  return sendResponse(res, HTTP_STATUS.OK, 'Super Admin system status verified', {
    nodeEnv: process.env.NODE_ENV,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

// 3. Category Admin CRUD
router.get('/categories', (req, res, next) => categoryController.getAllAdminCategories(req, res, next));
router.get('/categories/:id', (req, res, next) => categoryController.getCategoryById(req, res, next));
router.post('/categories', validateRequest(createCategorySchema), (req, res, next) =>
  categoryController.createCategory(req, res, next)
);
router.patch('/categories/:id', validateRequest(updateCategorySchema), (req, res, next) =>
  categoryController.updateCategory(req, res, next)
);
router.patch('/categories/:id/status', validateRequest(updateCategoryStatusSchema), (req, res, next) =>
  categoryController.updateCategoryStatus(req, res, next)
);
router.delete('/categories/:id', (req, res, next) => categoryController.deleteCategory(req, res, next));

// 4. Product Admin CRUD
router.get('/products', (req, res, next) => productController.getAllAdminProducts(req, res, next));
router.get('/products/:id', (req, res, next) => productController.getAdminProductById(req, res, next));
router.post('/products', validateRequest(createProductSchema), (req, res, next) =>
  productController.createProduct(req, res, next)
);
router.patch('/products/:id', validateRequest(updateProductSchema), (req, res, next) =>
  productController.updateProduct(req, res, next)
);
router.patch('/products/:id/status', validateRequest(updateProductStatusSchema), (req, res, next) =>
  productController.updateProductStatus(req, res, next)
);
router.patch('/products/:id/featured', validateRequest(updateProductFeaturedSchema), (req, res, next) =>
  productController.updateProductFeatured(req, res, next)
);
router.delete('/products/:id', (req, res, next) => productController.deleteProduct(req, res, next));

// 5. Product Variant Admin CRUD
router.post('/products/:productId/variants', validateRequest(createVariantSchema), (req, res, next) =>
  productController.createVariant(req, res, next)
);
router.get('/products/:productId/variants', (req, res, next) =>
  productController.getVariants(req, res, next)
);
router.patch('/products/:productId/variants/:variantId', validateRequest(updateVariantSchema), (req, res, next) =>
  productController.updateVariant(req, res, next)
);
router.delete('/products/:productId/variants/:variantId', (req, res, next) =>
  productController.deleteVariant(req, res, next)
);

// 6. Inventory Admin APIs
router.get('/inventory', (req, res, next) => inventoryController.getInventory(req, res, next));
router.get('/inventory/:productId', (req, res, next) => inventoryController.getProductInventory(req, res, next));
router.patch('/inventory/:productId', validateRequest(updateStockSchema), (req, res, next) =>
  inventoryController.updateProductStock(req, res, next)
);
router.patch('/inventory/variant/:variantId', validateRequest(updateStockSchema), (req, res, next) =>
  inventoryController.updateVariantStock(req, res, next)
);

// 7. Coupon Admin APIs
router.get('/coupons', (req, res, next) => couponController.getAll(req, res, next));
router.get('/coupons/:id', (req, res, next) => couponController.getById(req, res, next));
router.post('/coupons', validateRequest(createCouponSchema), (req, res, next) =>
  couponController.create(req, res, next)
);
router.patch('/coupons/:id', validateRequest(updateCouponSchema), (req, res, next) =>
  couponController.update(req, res, next)
);
router.patch('/coupons/:id/status', (req, res, next) => couponController.updateStatus(req, res, next));
router.delete('/coupons/:id', (req, res, next) => couponController.delete(req, res, next));

// 8. Order Admin APIs
router.get('/orders', (req, res, next) => orderController.getAllAdminOrders(req as any, res, next));
router.get('/orders/:id', (req, res, next) => orderController.getAdminOrderById(req as any, res, next));
router.patch('/orders/:id/status', validateRequest(updateOrderStatusSchema), (req, res, next) =>
  orderController.updateOrderStatus(req as any, res, next)
);
router.patch('/orders/:id/tracking', validateRequest(updateOrderTrackingSchema), (req, res, next) =>
  orderController.updateOrderTracking(req as any, res, next)
);

// 9. Banner Admin APIs
router.get('/banners', (req, res, next) => bannerController.getAllAdminBanners(req, res, next));
router.get('/banners/:id', (req, res, next) => bannerController.getBannerById(req, res, next));
router.post('/banners', validateRequest(createBannerSchema), (req, res, next) =>
  bannerController.createBanner(req, res, next)
);
router.patch('/banners/:id', validateRequest(updateBannerSchema), (req, res, next) =>
  bannerController.updateBanner(req, res, next)
);
router.patch('/banners/:id/status', validateRequest(bannerStatusSchema), (req, res, next) =>
  bannerController.updateBannerStatus(req, res, next)
);
router.delete('/banners/:id', (req, res, next) => bannerController.deleteBanner(req, res, next));

// 10. Review Moderation Admin APIs
router.get('/reviews', (req, res, next) => reviewController.getAllAdminReviews(req, res, next));
router.patch('/reviews/:id/approve', (req, res, next) => {
  req.body = { isApproved: true };
  return reviewController.updateApproval(req, res, next);
});
router.patch('/reviews/:id/reject', (req, res, next) => {
  req.body = { isApproved: false };
  return reviewController.updateApproval(req, res, next);
});
router.delete('/reviews/:id', (req, res, next) => reviewController.deleteReview(req as any, res, next));

// 11. Customer / Users Management
router.get('/users', async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return sendResponse(res, HTTP_STATUS.OK, 'Users retrieved', users, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (e) {
    next(e);
  }
});

router.patch('/users/:id/role', requireRoles('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid user role');
    }
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    return sendResponse(res, HTTP_STATUS.OK, 'User role updated', updated);
  } catch (e) {
    next(e);
  }
});

router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
    });
    return sendResponse(res, HTTP_STATUS.OK, 'User status updated', updated);
  } catch (e) {
    next(e);
  }
});

// 12. Media Upload Admin APIs
router.post('/media/upload', upload.single('image'), (req, res, next) =>
  mediaController.uploadSingle(req, res, next)
);
router.delete('/media/:publicId', (req, res, next) =>
  mediaController.deleteMedia(req, res, next)
);

export default router;
