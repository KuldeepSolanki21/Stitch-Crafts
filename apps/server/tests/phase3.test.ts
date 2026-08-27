import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database.config';
import bcrypt from 'bcryptjs';

describe('Phase 3 — Catalog, Products, Categories, Variants, Search & Inventory Test Suite', () => {
  let adminToken = '';
  let customerToken = '';
  let testCategoryId = '';
  let subCategoryId = '';
  let testCategorySlug = '';
  let testProductId = '';
  let testProductSlug = '';
  let testVariantId = '';

  const adminUser = {
    name: 'Catalog Master',
    email: `catalog.admin.${Date.now()}@stitchandcrafts.com`,
    password: 'AdminPassword@123',
    role: 'ADMIN',
  };

  const customerUser = {
    name: 'Shopper One',
    email: `shopper.${Date.now()}@example.com`,
    password: 'Password@123',
    role: 'CUSTOMER',
  };

  beforeAll(async () => {
    // Seed Admin & Customer
    const adminHash = await bcrypt.hash(adminUser.password, 10);
    await prisma.user.create({
      data: {
        name: adminUser.name,
        email: adminUser.email,
        password: adminHash,
        role: 'ADMIN',
      },
    });

    const custHash = await bcrypt.hash(customerUser.password, 10);
    await prisma.user.create({
      data: {
        name: customerUser.name,
        email: customerUser.email,
        password: custHash,
        role: 'CUSTOMER',
      },
    });

    // Login Admin
    const adminLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: adminUser.email,
      password: adminUser.password,
    });
    adminToken = adminLoginRes.body.data.accessToken;

    // Login Customer
    const custLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: customerUser.email,
      password: customerUser.password,
    });
    customerToken = custLoginRes.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup created data
    if (testProductId) {
      await prisma.product.deleteMany({ where: { id: testProductId } });
    }
    if (subCategoryId) {
      await prisma.category.deleteMany({ where: { id: subCategoryId } });
    }
    if (testCategoryId) {
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
    }
    await prisma.user.deleteMany({
      where: { email: { in: [adminUser.email, customerUser.email] } },
    });
    await prisma.$disconnect();
  });

  describe('1. Category Management (Admin & Public)', () => {
    it('POST /api/v1/admin/categories should create root category', async () => {
      const res = await request(app)
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Handcrafted Laptop Bags',
          description: 'Luxury executive leather bags',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('handcrafted-laptop-bags');
      testCategoryId = res.body.data.id;
      testCategorySlug = res.body.data.slug;
    });

    it('POST /api/v1/admin/categories should reject duplicate category name', async () => {
      const res = await request(app)
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Handcrafted Laptop Bags',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/admin/categories should create subcategory with parentId', async () => {
      const res = await request(app)
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '15-inch Briefcases',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
          parentId: testCategoryId,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.parentId).toBe(testCategoryId);
      subCategoryId = res.body.data.id;
    });

    it('GET /api/v1/categories should return public hierarchical categories', async () => {
      const res = await request(app).get('/api/v1/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const foundRoot = res.body.data.find((c: any) => c.id === testCategoryId);
      expect(foundRoot).toBeDefined();
      expect(foundRoot.children.length).toBeGreaterThanOrEqual(1);
    });

    it('CUSTOMER should be FORBIDDEN from creating categories', async () => {
      const res = await request(app)
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Unauthorized Category',
          image: 'https://img.com',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('2. Product CRUD & Slugs', () => {
    it('POST /api/v1/admin/products should create luxury product with specs', async () => {
      const res = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Artisan Cognac Messenger Bag',
          description: 'A mastercrafted full-grain leather messenger bag with brass buckles.',
          sku: `SC-MB-${Date.now()}`,
          price: 12500,
          discountPrice: 9999,
          stock: 15,
          categoryId: testCategoryId,
          images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa'],
          details: {
            material: 'Full Grain Vegetable Tanned Leather',
            dimensions: '38 x 28 x 8 cm',
          },
          featured: true,
          isPublished: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toContain('artisan-cognac-messenger-bag');
      expect(res.body.data.discountPercentage).toBe(20); // (12500 - 9999) / 12500 ~ 20%
      expect(res.body.data.availability).toBe('IN_STOCK');
      testProductId = res.body.data.id;
      testProductSlug = res.body.data.slug;
    });

    it('POST /api/v1/admin/products should reject invalid discount price (discount > price)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Invalid Discount Bag',
          description: 'Description here',
          sku: `SC-INV-${Date.now()}`,
          price: 5000,
          discountPrice: 6000,
          stock: 10,
          categoryId: testCategoryId,
          images: ['https://img.com'],
        });

      expect(res.status).toBe(400);
    });

    it('GET /api/v1/products/:slug should retrieve public product with details', async () => {
      const res = await request(app).get(`/api/v1/products/${testProductSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testProductId);
    });
  });

  describe('3. Product Variants Matrix', () => {
    it('POST /api/v1/admin/products/:id/variants should add color/size variant', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/products/${testProductId}/variants`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          colorName: 'Midnight Obsidian',
          colorHex: '#111111',
          size: '15-inch',
          sku: `SC-MB-BLK-${Date.now()}`,
          priceDelta: 500,
          stock: 8,
          images: ['https://img.com/black.jpg'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.colorName).toBe('Midnight Obsidian');
      testVariantId = res.body.data.id;
    });

    it('GET /api/v1/products/:slug should reflect variant final price calculations', async () => {
      const res = await request(app).get(`/api/v1/products/${testProductSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.variants.length).toBe(1);
      expect(res.body.data.variants[0].finalPrice).toBe(13000); // 12500 base + 500 delta
    });
  });

  describe('4. Inventory Stock Management', () => {
    it('GET /api/v1/admin/inventory should list stock levels', async () => {
      const res = await request(app)
        .get('/api/v1/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('PATCH /api/v1/admin/inventory/:id should update product stock', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/inventory/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 3 });

      expect(res.status).toBe(200);
    });

    it('PATCH /api/v1/admin/inventory/:id should reject negative stock', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/inventory/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: -5 });

      expect(res.status).toBe(400);
    });
  });

  describe('5. Search, Filter, Sort & Featured APIs', () => {
    it('GET /api/v1/products?search=Messenger should return matching products', async () => {
      const res = await request(app).get('/api/v1/products?search=Messenger');
      expect(res.status).toBe(200);
      expect(res.body.data.some((p: any) => p.id === testProductId)).toBe(true);
    });

    it('GET /api/v1/products/featured should return featured catalog items', async () => {
      const res = await request(app).get('/api/v1/products/featured');
      expect(res.status).toBe(200);
      expect(res.body.data.some((p: any) => p.id === testProductId)).toBe(true);
    });

    it('GET /api/v1/products?sort=price_asc should return ordered list', async () => {
      const res = await request(app).get('/api/v1/products?sort=price_asc');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
    });
  });
});
