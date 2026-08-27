import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database.config';
import bcrypt from 'bcryptjs';

describe('Phase 5 — Wishlist, Reviews, Banners, Analytics & Newsletter Test Suite', () => {
  let customerToken = '';
  let customerId = '';
  let adminToken = '';
  let testCategoryId = '';
  let testProductId = '';
  let testBannerId = '';
  let testReviewId = '';

  const customerUser = {
    name: 'Gwendolyn Croft',
    email: `gwendolyn.${Date.now()}@example.com`,
    password: 'Password@123',
    role: 'CUSTOMER',
  };

  const adminUser = {
    name: 'Executive Curator',
    email: `curator.${Date.now()}@stitchandcrafts.com`,
    password: 'AdminPassword@123',
    role: 'ADMIN',
  };

  beforeAll(async () => {
    // 1. Create Users
    const custHash = await bcrypt.hash(customerUser.password, 10);
    const cust = await prisma.user.create({
      data: {
        name: customerUser.name,
        email: customerUser.email,
        password: custHash,
        role: 'CUSTOMER',
      },
    });
    customerId = cust.id;

    const adminHash = await bcrypt.hash(adminUser.password, 10);
    await prisma.user.create({
      data: {
        name: adminUser.name,
        email: adminUser.email,
        password: adminHash,
        role: 'ADMIN',
      },
    });

    // 2. Login
    const custLog = await request(app).post('/api/v1/auth/login').send({
      email: customerUser.email,
      password: customerUser.password,
    });
    customerToken = custLog.body.data.accessToken;

    const adminLog = await request(app).post('/api/v1/auth/login').send({
      email: adminUser.email,
      password: adminUser.password,
    });
    adminToken = adminLog.body.data.accessToken;

    // 3. Create Category & Product
    const cat = await prisma.category.create({
      data: {
        name: `Executive Briefcases ${Date.now()}`,
        slug: `executive-briefcases-${Date.now()}`,
        image: 'https://img.com/briefcase.jpg',
      },
    });
    testCategoryId = cat.id;

    const prod = await prisma.product.create({
      data: {
        title: 'Artisan Heritage Document Briefcase',
        slug: `artisan-heritage-briefcase-${Date.now()}`,
        description: 'Triple-gusset vegetable tanned leather document case.',
        price: 18500,
        stock: 10,
        sku: `SC-DOC-${Date.now()}`,
        images: ['https://img.com/doc-1.jpg'],
        categoryId: cat.id,
        isPublished: true,
      },
    });
    testProductId = prod.id;
  });

  afterAll(async () => {
    await prisma.newsletterSubscription.deleteMany({});
    if (testReviewId) {
      await prisma.review.deleteMany({ where: { id: testReviewId } });
    }
    if (testBannerId) {
      await prisma.banner.deleteMany({ where: { id: testBannerId } });
    }
    await prisma.wishlist.deleteMany({});
    if (testProductId) {
      await prisma.product.deleteMany({ where: { id: testProductId } });
    }
    if (testCategoryId) {
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
    }
    await prisma.user.deleteMany({
      where: { email: { in: [customerUser.email, adminUser.email] } },
    });
    await prisma.$disconnect();
  });

  describe('1. Wishlist Operations', () => {
    it('POST /api/v1/wishlist/:productId should add product to wishlist', async () => {
      const res = await request(app)
        .post(`/api/v1/wishlist/${testProductId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/wishlist should return populated wishlist', async () => {
      const res = await request(app)
        .get('/api/v1/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].productId).toBe(testProductId);
    });

    it('POST /api/v1/wishlist/:productId/move-to-cart should move item to cart', async () => {
      const res = await request(app)
        .post(`/api/v1/wishlist/${testProductId}/move-to-cart`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify wishlist is now empty
      const wishRes = await request(app)
        .get('/api/v1/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(wishRes.body.data.length).toBe(0);
    });
  });

  describe('2. Product Reviews & Ratings', () => {
    it('POST /api/v1/reviews should submit product review', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProductId,
          rating: 5,
          title: 'Unmatched leather aroma and stitching',
          comment: 'The vegetable tanning aroma and brass hardware are exquisite.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(5);
      testReviewId = res.body.data.id;
    });

    it('GET /api/v1/reviews/product/:id should return aggregated ratings', async () => {
      const res = await request(app).get(`/api/v1/reviews/product/${testProductId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalReviews).toBe(1);
      expect(res.body.data.averageRating).toBe(5);
      expect(res.body.data.ratingBreakdown['5']).toBe(1);
    });
  });

  describe('3. Hero Banners & CMS', () => {
    it('POST /api/v1/admin/banners should create hero banner', async () => {
      const res = await request(app)
        .post('/api/v1/admin/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'The Autumn Patina Capsule',
          subtitle: 'Vegetable-tanned luggage collection.',
          imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
          targetUrl: '/shop',
          displayOrder: 1,
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('The Autumn Patina Capsule');
      testBannerId = res.body.data.id;
    });

    it('GET /api/v1/banners should return active public banners', async () => {
      const res = await request(app).get('/api/v1/banners');
      expect(res.status).toBe(200);
      expect(res.body.data.some((b: any) => b.id === testBannerId)).toBe(true);
    });
  });

  describe('4. Admin Analytics Dashboard', () => {
    it('GET /api/v1/admin/analytics/overview should return metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalProducts).toBeGreaterThanOrEqual(1);
    });

    it('CUSTOMER should be FORBIDDEN from analytics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics/overview')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('5. Newsletter Subscription', () => {
    it('POST /api/v1/newsletter/subscribe should subscribe email', async () => {
      const res = await request(app)
        .post('/api/v1/newsletter/subscribe')
        .send({ email: 'artisan.enthusiast@example.com' });

      expect(res.status).toBe(201);
    });

    it('POST /api/v1/newsletter/subscribe should handle duplicate email safely', async () => {
      const res = await request(app)
        .post('/api/v1/newsletter/subscribe')
        .send({ email: 'artisan.enthusiast@example.com' });

      expect(res.status).toBe(200);
    });
  });
});
