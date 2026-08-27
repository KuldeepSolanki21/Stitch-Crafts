import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database.config';
import bcrypt from 'bcryptjs';

describe('Phase 6 — Security Audit, Data Isolation, Role Guard & Hardening Suite', () => {
  let customerAToken = '';
  let customerAId = '';
  let customerBToken = '';
  let customerBId = '';
  let adminToken = '';
  let adminId = '';
  let customerAAddressId = '';
  let testCategoryId = '';
  let testProductId = '';

  const userA = {
    name: 'Customer Alice',
    email: `alice.${Date.now()}@example.com`,
    password: 'Password@123',
    role: 'CUSTOMER',
  };

  const userB = {
    name: 'Customer Bob',
    email: `bob.${Date.now()}@example.com`,
    password: 'Password@123',
    role: 'CUSTOMER',
  };

  const adminUser = {
    name: 'Security Admin',
    email: `secadmin.${Date.now()}@stitchandcrafts.com`,
    password: 'AdminPassword@123',
    role: 'ADMIN',
  };

  beforeAll(async () => {
    // 1. Create Users
    const aHash = await bcrypt.hash(userA.password, 10);
    const a = await prisma.user.create({ data: { name: userA.name, email: userA.email, password: aHash, role: 'CUSTOMER' } });
    customerAId = a.id;

    const bHash = await bcrypt.hash(userB.password, 10);
    const b = await prisma.user.create({ data: { name: userB.name, email: userB.email, password: bHash, role: 'CUSTOMER' } });
    customerBId = b.id;

    const adminHash = await bcrypt.hash(adminUser.password, 10);
    const adm = await prisma.user.create({ data: { name: adminUser.name, email: adminUser.email, password: adminHash, role: 'ADMIN' } });
    adminId = adm.id;

    // 2. Login
    const aLog = await request(app).post('/api/v1/auth/login').send({ email: userA.email, password: userA.password });
    customerAToken = aLog.body.data.accessToken;

    const bLog = await request(app).post('/api/v1/auth/login').send({ email: userB.email, password: userB.password });
    customerBToken = bLog.body.data.accessToken;

    const admLog = await request(app).post('/api/v1/auth/login').send({ email: adminUser.email, password: adminUser.password });
    adminToken = admLog.body.data.accessToken;

    // 3. Create Address for User A
    const addr = await prisma.address.create({
      data: {
        userId: customerAId,
        addressLine1: '12 Kensington Row',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
      },
    });
    customerAAddressId = addr.id;

    // 4. Create Product
    const cat = await prisma.category.create({
      data: { name: `Security Test Cat ${Date.now()}`, slug: `sec-cat-${Date.now()}`, image: 'https://img.com/cat.jpg' },
    });
    testCategoryId = cat.id;

    const prod = await prisma.product.create({
      data: {
        title: 'Security Audited Leather Folio',
        slug: `sec-folio-${Date.now()}`,
        description: 'Hardened leather folio.',
        price: 7500,
        stock: 5,
        sku: `SC-SEC-${Date.now()}`,
        images: ['https://img.com/folio.jpg'],
        categoryId: cat.id,
      },
    });
    testProductId = prod.id;
  });

  afterAll(async () => {
    await prisma.address.deleteMany({ where: { id: customerAAddressId } });
    if (testProductId) await prisma.product.deleteMany({ where: { id: testProductId } });
    if (testCategoryId) await prisma.category.deleteMany({ where: { id: testCategoryId } });
    await prisma.user.deleteMany({ where: { email: { in: [userA.email, userB.email, adminUser.email] } } });
    await prisma.$disconnect();
  });

  describe('1. Cross-User Data Isolation', () => {
    it('Customer B should NOT be able to modify Customer A address', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/me/addresses/${customerAAddressId}`)
        .set('Authorization', `Bearer ${customerBToken}`)
        .send({ city: 'Hacked City' });

      expect(res.status).toBe(404);
    });

    it('Customer B should NOT be able to checkout with Customer A address', async () => {
      const res = await request(app)
        .post('/api/v1/checkout/preview')
        .set('Authorization', `Bearer ${customerBToken}`)
        .send({
          addressId: customerAAddressId,
          paymentProvider: 'COD',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('2. Role Escalation & RBAC Guards', () => {
    it('ADMIN should NOT be allowed to promote themselves or anyone to SUPER_ADMIN', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${customerBId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'SUPER_ADMIN' });

      expect(res.status).toBe(403); // Requires SUPER_ADMIN
    });

    it('Unauthenticated requests to admin endpoints should be REJECTED (401)', async () => {
      const res = await request(app).get('/api/v1/admin/overview');
      expect(res.status).toBe(401);
    });
  });

  describe('3. Payment & Security Signature Audits', () => {
    it('POST /api/v1/payments/razorpay/verify should reject forged signatures on existing order', async () => {
      // Create a test order for user A
      const testOrder = await prisma.order.create({
        data: {
          userId: customerAId,
          shippingAddressId: customerAAddressId,
          subtotal: 7500,
          totalAmount: 7500,
          paymentProvider: 'RAZORPAY',
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING',
        },
      });

      const res = await request(app)
        .post('/api/v1/payments/razorpay/verify')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({
          orderId: testOrder.id,
          razorpayOrderId: 'order_fake_123',
          razorpayPaymentId: 'pay_fake_123',
          razorpaySignature: 'forged_fake_signature',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('signature');

      await prisma.order.delete({ where: { id: testOrder.id } });
    });
  });

});
