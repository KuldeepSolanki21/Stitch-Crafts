# Stitch & Crafts — Production Deployment & Hardening Checklist

## 1. Environment & Secrets
- [x] Configure production PostgreSQL 16+ database URL.
- [x] Set 64-character random cryptographic `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- [x] Configure Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
- [x] Configure Razorpay production keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
- [x] Configure Stripe production keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- [x] Configure production SMTP credentials.
- [x] Ensure `.env` files are in `.gitignore`.

## 2. Security & Networking
- [x] Strict CORS origin restriction (`CLIENT_URL` & `ADMIN_URL`).
- [x] Helmet security headers (HSTS, CSP, X-Frame-Options).
- [x] HttpOnly, Secure, SameSite=Strict cookies.
- [x] Tiered rate limiting on auth, payments, and general APIs.
- [x] Role-Based Access Control (`CUSTOMER`, `ADMIN`, `SUPER_ADMIN`).
- [x] Ownership verification on all private data (cart, addresses, orders, reviews).

## 3. Database & Performance
- [x] Prisma schema verified and indexed for fast lookups.
- [x] Immutable purchase-time price snapshots in `OrderItem`.
- [x] Atomic transactional inventory deduction.
- [x] Idempotent payment gateway webhooks.
- [x] Automated database backup script with retention policy.

## 4. Deployment Commands
```bash
# 1. Run migrations
npx prisma migrate deploy

# 2. Seed Super Admin
npx ts-node src/prisma/seed.ts

# 3. Build & launch via Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build
```
