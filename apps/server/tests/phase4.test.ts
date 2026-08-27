import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database.config';
import bcrypt from 'bcryptjs';

describe('Phase 4 — Cart, Checkout, Orders, Coupons & Payments Test Suite', () => {
  let customerToken = '';
  let customerId = '';
  let adminToken = '';
  let testCategoryId = '';
  let testProductId = '';
  let testVariantId = '';
  let testAddressId = '';
  let testCouponCode = 'HERITAGE20';
  let createdOrderId = '';

  const customerUser = {
    name: 'Eleanor Vance',
    email: `eleanor.${Date.now()}@example.com`,
    password: 'Password@123',
    role: 'CUSTOMER',
  };

  const adminUser = {
    name: 'Master Craftsman',
    email: `admin.orders.${Date.now()}@stitchandcrafts.com`,
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

    // 3. Create Shipping Address
    const addrRes = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        addressLine1: '74 Artisan Boulevard',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'IN',
        isDefault: true,
      });
    testAddressId = addrRes.body.data.id;

    // 4. Create Category & Product with Variants
    const cat = await prisma.category.create({
      data: {
        name: `Bespoke Wallets ${Date.now()}`,
        slug: `bespoke-wallets-${Date.now()}`,
        image: 'https://img.com/wallet.jpg',
      },
    });
    testCategoryId = cat.id;

    const prod = await prisma.product.create({
      data: {
        title: 'Slim Bifold Full-Grain Wallet',
        slug: `slim-bifold-wallet-${Date.now()}`,
        description: 'Hand-stitched executive bifold wallet in chestnut finish.',
        price: 3000,
        discountPrice: 2500,
        stock: 20,
        sku: `SC-WAL-${Date.now()}`,
        images: ['https://img.com/wallet-1.jpg'],
        categoryId: cat.id,
        isPublished: true,
        variants: {
          create: [
            {
              colorName: 'Chestnut Brown',
              colorHex: '#653700',
              sku: `SC-WAL-BRN-${Date.now()}`,
              priceDelta: 200,
              stock: 15,
              images: ['https://img.com/wallet-brn.jpg'],
            },
          ],
        },
      },
      include: { variants: true },
    });
    testProductId = prod.id;
    testVariantId = prod.variants[0].id;

    // 5. Create Test Coupon
    await prisma.coupon.create({
      data: {
        code: testCouponCode,
        discountType: 'PERCENTAGE',
        discount: 20, // 20% discount
        minOrderValue: 2000,
        maxDiscount: 1000,
        usageLimit: 50,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  });

  afterAll(async () => {
    await prisma.paymentTransaction.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.coupon.deleteMany({ where: { code: testCouponCode } });
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    if (testProductId) {
      await prisma.productVariant.deleteMany({ where: { productId: testProductId } });
      await prisma.product.deleteMany({ where: { id: testProductId } });
    }
    if (testCategoryId) {
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
    }
    await prisma.address.deleteMany({ where: { userId: customerId } });
    await prisma.user.deleteMany({
      where: { email: { in: [customerUser.email, adminUser.email] } },
    });
    await prisma.$disconnect();
  });


  describe('1. Cart & Variant Operations', () => {
    it('GET /api/v1/cart should return empty cart initially', async () => {
      const res = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(0);
      expect(res.body.data.subtotal).toBe(0);
    });

    it('POST /api/v1/cart/items should add variant item with calculated pricing', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProductId,
          variantId: testVariantId,
          quantity: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      // Unit Price: 2500 (discount base) + 200 (variant delta) = 2700
      expect(res.body.data.items[0].unitPrice).toBe(2700);
      // Total: 2700 * 2 = 5400
      expect(res.body.data.subtotal).toBe(5400);
    });

    it('POST /api/v1/cart/items should automatically merge duplicate item quantities', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProductId,
          variantId: testVariantId,
          quantity: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.items[0].quantity).toBe(3);
      expect(res.body.data.subtotal).toBe(8100); // 2700 * 3
    });
  });

  describe('2. Coupon Validation & Checkout Preview', () => {
    it('POST /api/v1/coupons/validate should validate coupon code', async () => {
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: testCouponCode,
          subtotal: 8100,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.code).toBe(testCouponCode);
      // 20% of 8100 = 1620, capped at maxDiscount 1000
      expect(res.body.data.discountAmount).toBe(1000);
    });

    it('POST /api/v1/checkout/preview should calculate server-side totals and tax', async () => {
      const res = await request(app)
        .post('/api/v1/checkout/preview')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          addressId: testAddressId,
          couponCode: testCouponCode,
          paymentProvider: 'COD',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.subtotal).toBe(8100);
      expect(res.body.data.discountAmount).toBe(1000);
      expect(res.body.data.shippingFee).toBe(0); // >= 5000 is Free
      // Taxable = 8100 - 1000 = 7100. Tax @ 18% = 1278
      expect(res.body.data.taxAmount).toBe(1278);
      // Total = 7100 + 0 + 1278 = 8378
      expect(res.body.data.totalAmount).toBe(8378);
    });
  });

  describe('3. Order Creation & Price Snapshot', () => {
    it('POST /api/v1/orders should create order, deduct stock and snapshot prices', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          shippingAddressId: testAddressId,
          couponCode: testCouponCode,
          paymentProvider: 'COD',
        });

      createdOrderId = res.body.data?.id;
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(Number(res.body.data.totalAmount)).toBe(8378);
      expect(res.body.data.orderItems.length).toBe(1);
      expect(Number(res.body.data.orderItems[0].price)).toBe(2700);

      // Verify cart was cleared
      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(cartRes.body.data.items.length).toBe(0);

      // Verify stock was deducted (15 - 3 = 12)
      const variant = await prisma.productVariant.findUnique({ where: { id: testVariantId } });
      expect(variant?.stock).toBe(12);
    });


    it('GET /api/v1/orders/my-orders should list customer orders', async () => {
      const res = await request(app)
        .get('/api/v1/orders/my-orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].id).toBe(createdOrderId);
    });

    it('GET /api/v1/orders/:id/track should provide tracking timeline', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${createdOrderId}/track`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.orderId).toBe(createdOrderId);
      expect(res.body.data.timeline.length).toBe(5);
    });
  });

  describe('4. Payment Gateways & Webhooks', () => {
    it('POST /api/v1/payments/razorpay/create-order should create Razorpay order', async () => {
      const res = await request(app)
        .post('/api/v1/payments/razorpay/create-order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId: createdOrderId });

      expect(res.status).toBe(200);
      expect(res.body.data.razorpayOrderId).toBeDefined();
      expect(res.body.data.amount).toBe(837800); // 8378 INR in paise
    });

    it('POST /api/v1/payments/razorpay/verify should verify payment and update order status', async () => {
      const res = await request(app)
        .post('/api/v1/payments/razorpay/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: createdOrderId,
          razorpayOrderId: 'order_mock_test',
          razorpayPaymentId: `pay_rzp_${Date.now()}`,
          razorpaySignature: 'valid_mock_signature',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.paymentStatus).toBe('PAID');
    });

    it('POST /api/v1/payments/webhook/stripe should handle duplicate webhooks idempotently', async () => {
      const stripeEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: `pi_mock_${Date.now()}`,
            metadata: { orderId: createdOrderId },
          },
        },
      };

      // First webhook
      const res1 = await request(app).post('/api/v1/payments/webhook/stripe').send(stripeEvent);
      expect(res1.status).toBe(200);

      // Duplicate webhook
      const res2 = await request(app).post('/api/v1/payments/webhook/stripe').send(stripeEvent);
      expect(res2.status).toBe(200);
    });
  });

  describe('5. Admin Order Fulfillment & RBAC', () => {
    it('PATCH /api/v1/admin/orders/:id/tracking should assign tracking & set SHIPPED', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/orders/${createdOrderId}/tracking`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          trackingNumber: 'BLUEDART-8492048',
          trackingCarrier: 'BlueDart Air Express',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.orderStatus).toBe('SHIPPED');
      expect(res.body.data.trackingNumber).toBe('BLUEDART-8492048');
    });

    it('CUSTOMER should be FORBIDDEN from accessing admin orders API', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
