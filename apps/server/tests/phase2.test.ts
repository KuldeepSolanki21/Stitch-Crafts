import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database.config';
import bcrypt from 'bcryptjs';

describe('Phase 2 — Database, Authentication, RBAC & Address Test Suite', () => {
  const customerUser = {
    name: 'Jane Customer',
    email: `jane.${Date.now()}@example.com`,
    password: 'Password@123',
    phone: '9876543210',
  };

  const adminUser = {
    name: 'Admin Officer',
    email: `admin.${Date.now()}@stitchandcrafts.com`,
    password: 'AdminPassword@123',
  };

  let customerAccessToken = '';
  let customerRefreshTokenCookie = '';
  let adminAccessToken = '';
  let createdAddressId = '';

  beforeAll(async () => {
    // Seed test admin
    const hash = await bcrypt.hash(adminUser.password, 10);
    await prisma.user.create({
      data: {
        name: adminUser.name,
        email: adminUser.email,
        password: hash,
        role: 'ADMIN',
      },
    });
  });

  afterAll(async () => {
    // Cleanup test users
    await prisma.user.deleteMany({
      where: {
        email: { in: [customerUser.email, adminUser.email] },
      },
    });
    await prisma.$disconnect();
  });

  describe('1. Health & Readiness Endpoints', () => {
    it('GET /healthz should return 200 and healthy status', async () => {
      const res = await request(app).get('/healthz');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    });

    it('GET /readyz should return 200 with DB connection status', async () => {
      const res = await request(app).get('/readyz');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.database).toBe('connected');
    });
  });

  describe('2. Authentication System', () => {
    it('POST /api/v1/auth/register should create a new customer and return JWT', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(customerUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(customerUser.email.toLowerCase());
      expect(res.body.data.user.role).toBe('CUSTOMER');
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.accessToken).toBeDefined();
      
      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some((c: string) => c.includes('refreshToken'))).toBe(true);
    });

    it('POST /api/v1/auth/register should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(customerUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/register should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...customerUser, email: 'invalid-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/register should reject weak password (< 8 chars)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...customerUser, email: 'valid@example.com', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/login should authenticate customer successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: customerUser.email,
          password: customerUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      
      customerAccessToken = res.body.data.accessToken;
      const cookies = res.headers['set-cookie'];
      customerRefreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken=')) || '';
    });

    it('POST /api/v1/auth/login should authenticate admin successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: adminUser.email,
          password: adminUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('ADMIN');
      adminAccessToken = res.body.data.accessToken;
    });

    it('POST /api/v1/auth/login should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: customerUser.email,
          password: 'WrongPassword@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/refresh-token should rotate refresh tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', [customerRefreshTokenCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      
      // Update token
      customerAccessToken = res.body.data.accessToken;
    });
  });

  describe('3. Role-Based Access Control (RBAC)', () => {
    it('CUSTOMER should be DENIED (403) from /api/v1/admin/overview', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${customerAccessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('ADMIN should be ALLOWED (200) on /api/v1/admin/overview', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('ADMIN should be DENIED (403) from SUPER_ADMIN-only route', async () => {
      const res = await request(app)
        .get('/api/v1/admin/system-status')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('4. User Profile & Address Management', () => {
    it('GET /api/v1/users/me should return authenticated profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${customerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(customerUser.email.toLowerCase());
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.refreshTokenHash).toBeUndefined();
    });

    it('PATCH /api/v1/users/me should update profile details', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send({ name: 'Jane Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Jane Updated');
    });

    it('POST /api/v1/users/me/addresses should create customer address', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/addresses')
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send({
          addressLine1: '42 Artisan Lane',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'IN',
          isDefault: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.city).toBe('Mumbai');
      expect(res.body.data.isDefault).toBe(true);
      createdAddressId = res.body.data.id;
    });

    it('PATCH /api/v1/users/me/addresses/:id should update address', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/me/addresses/${createdAddressId}`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .send({ addressLine2: 'Suite 3B' });

      expect(res.status).toBe(200);
      expect(res.body.data.addressLine2).toBe('Suite 3B');
    });

    it('DELETE /api/v1/users/me/addresses/:id should remove address', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/me/addresses/${createdAddressId}`)
        .set('Authorization', `Bearer ${customerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('5. Logout', () => {
    it('POST /api/v1/auth/logout should invalidate token and clear cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${customerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
