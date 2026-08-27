import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.config';
import { requestLogger } from './middlewares/request-logger.middleware';
import { apiRateLimiter } from './middlewares/rate-limiter.middleware';
import { errorHandler } from './middlewares/error-handler.middleware';
import { prisma } from './config/database.config';
import { redis } from './config/redis.config';
import { sendResponse, sendError } from './utils/api-response.util';
import { HTTP_STATUS } from './constants/http-status.constant';

// Module Routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import categoryRoutes from './modules/category/category.routes';
import productRoutes from './modules/product/product.routes';
import cartRoutes from './modules/cart/cart.routes';
import orderRoutes from './modules/order/order.routes';
import paymentRoutes from './modules/payment/payment.routes';
import couponRoutes from './modules/coupon/coupon.routes';
import reviewRoutes from './modules/review/review.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import bannerRoutes from './modules/banner/banner.routes';
import newsletterRoutes from './modules/newsletter/newsletter.routes';
import adminRoutes from './modules/admin/admin.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import { orderController } from './modules/order/order.controller';
import { authenticateJWT } from './middlewares/auth.middleware';
import { validateRequest } from './middlewares/validate.middleware';
import { checkoutPreviewSchema } from '@stitch-and-crafts/validation-schemas';

const app: Express = express();

app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: [ENV.CLIENT_URL, ENV.ADMIN_URL],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health Endpoint
app.get('/healthz', (req, res) => {
  return sendResponse(res, HTTP_STATUS.OK, 'Stitch & Crafts API is healthy', {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness Endpoint (Database & Redis checks)
app.get('/readyz', async (req, res) => {
  const readiness = {
    database: 'unknown',
    redis: 'not_configured',
    ready: true,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    readiness.database = 'connected';
  } catch (error) {
    readiness.database = 'disconnected';
    readiness.ready = false;
  }

  try {
    if (redis.status === 'ready' || redis.status === 'connect') {
      await redis.ping();
      readiness.redis = 'connected';
    } else {
      readiness.redis = 'degraded/offline';
    }
  } catch (e) {
    readiness.redis = 'offline';
  }

  if (!readiness.ready) {
    return sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'System not ready', [readiness]);
  }

  return sendResponse(res, HTTP_STATUS.OK, 'System ready', readiness);
});

// Apply API Rate Limiter
app.use('/api/', apiRateLimiter);

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.post('/api/v1/checkout/preview', authenticateJWT, validateRequest(checkoutPreviewSchema), (req, res, next) =>
  orderController.checkoutPreview(req as any, res, next)
);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/inventory', inventoryRoutes);

// Centralized Error Handler
app.use(errorHandler);

export default app;
