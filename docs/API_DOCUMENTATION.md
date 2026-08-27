# Stitch & Crafts — Comprehensive API Reference (v1)

Base URL: `http://localhost:5000/api/v1`

## 1. Authentication & Security
- `POST /auth/register`: Register customer account (`name`, `email`, `password`, `phone`).
- `POST /auth/login`: Authenticate customer/admin. Sets HttpOnly `refreshToken` cookie and returns 15-minute `accessToken`.
- `POST /auth/refresh-token`: Rotates refresh token with SHA-256 hash comparison.
- `POST /auth/logout`: Clears refresh token hash in DB and deletes cookie.

## 2. User & Address Management
- `GET /users/me`: Retrieve authenticated user profile.
- `PATCH /users/me`: Update name/phone.
- `GET /users/me/addresses`: List saved delivery addresses.
- `POST /users/me/addresses`: Add address (with automatic default single-selection transaction).
- `PATCH /users/me/addresses/:id`: Update saved address.
- `DELETE /users/me/addresses/:id`: Remove address.

## 3. Product Catalog & Categories
- `GET /categories`: Hierarchical tree of active root & subcategories.
- `GET /categories/:slug`: Category details.
- `GET /products`: Multi-faceted search (`search`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`).
- `GET /products/featured`: Handpicked luxury collection items.
- `GET /products/:slug`: Single product view with variants, calculated discounts, and stock availability.
- `GET /products/:id/related`: Related items from the same atelier category.

## 4. Cart & Wishlist
- `GET /cart`: Live cart with server-recalculated prices, price deltas, and stock availability badges.
- `POST /cart/items`: Add or merge item/variant quantity.
- `PATCH /cart/items/:id`: Update quantity with stock validation.
- `DELETE /cart/items/:id`: Remove item.
- `DELETE /cart`: Clear cart.
- `GET /wishlist`: Customer saved items.
- `POST /wishlist/:productId`: Save to wishlist.
- `DELETE /wishlist/:productId`: Remove from wishlist.
- `POST /wishlist/:productId/move-to-cart`: Atomic move from wishlist to active bag.

## 5. Checkout & Orders
- `POST /checkout/preview`: Server-side calculation of subtotal, coupon discount, shipping fee, and 18% GST tax without creating an order.
- `POST /orders`: Transactional order placement, immutable price snapshot in `OrderItem`, stock deduction, and coupon usage counter increment.
- `GET /orders/my-orders`: Customer order history.
- `GET /orders/:id`: Full historical invoice receipt.
- `GET /orders/:id/track`: 5-step milestone tracking timeline.
- `POST /orders/:id/cancel`: Customer cancellation before dispatch with automatic inventory restoration.

## 6. Payments & Webhooks
- `POST /payments/razorpay/create-order`: Creates Razorpay order with server-calculated amount in paise.
- `POST /payments/razorpay/verify`: HMAC-SHA256 signature verification and idempotent recording.
- `POST /payments/stripe/create-intent`: Creates Stripe `PaymentIntent`.
- `POST /payments/webhook/stripe`: Idempotent Stripe webhook listener.
- `POST /payments/webhook/razorpay`: Idempotent Razorpay webhook listener.

## 7. Customer Reviews & Hero Banners
- `GET /reviews/product/:productId`: Approved reviews with average star rating and 1-5 star breakdown.
- `POST /reviews`: Submit review with verified buyer check against delivered orders.
- `GET /banners`: Active carousel banners.
- `POST /newsletter/subscribe`: Join email newsletter.

## 8. Administrative Desk (`ADMIN` & `SUPER_ADMIN`)
- `GET /admin/overview`: Executive KPI metrics (revenue, orders, low-stock count).
- `GET /admin/analytics/revenue`: Monthly revenue trend.
- `GET /admin/analytics/products`: Top-selling creations by units and revenue.
- `GET /admin/analytics/categories`: Revenue distribution across categories.
- `GET /admin/categories`, `POST /admin/categories`, `PATCH /admin/categories/:id`, `DELETE /admin/categories/:id`
- `GET /admin/products`, `POST /admin/products`, `PATCH /admin/products/:id`, `DELETE /admin/products/:id`
- `GET /admin/inventory`, `PATCH /admin/inventory/:productId`, `PATCH /admin/inventory/variant/:variantId`
- `GET /admin/orders`, `PATCH /admin/orders/:id/status`, `PATCH /admin/orders/:id/tracking` (Airway bill dispatch)
- `GET /admin/coupons`, `POST /admin/coupons`, `PATCH /admin/coupons/:id`, `DELETE /admin/coupons/:id`
- `GET /admin/reviews`, `PATCH /admin/reviews/:id/approve`, `PATCH /admin/reviews/:id/reject`, `DELETE /admin/reviews/:id`
- `GET /admin/banners`, `POST /admin/banners`, `PATCH /admin/banners/:id`, `DELETE /admin/banners/:id`
- `GET /admin/users`, `PATCH /admin/users/:id/role` (Super Admin only), `PATCH /admin/users/:id/status`
- `POST /admin/media/upload`: Multipart Cloudinary image uploader.
