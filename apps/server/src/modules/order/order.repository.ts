import { prisma } from '../../config/database.config';
import { Order, OrderStatus, PaymentStatus, PaymentProvider, Prisma } from '@prisma/client';

export class OrderRepository {
  async findById(id: string, userId?: string) {
    return prisma.order.findFirst({
      where: {
        id,
        ...(userId && { userId }),
      },
      include: {
        shippingAddress: true,
        orderItems: {
          include: {
            product: true,
            variant: true,
          },
        },
        payments: true,
        coupon: true,
      },
    });
  }

  async findByUserId(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          shippingAddress: true,
          orderItems: {
            include: {
              product: { select: { title: true, images: true, slug: true } },
              variant: true,
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllAdmin(query: any) {
    const { page = 1, limit = 20, status, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.OrderWhereInput = {
      ...(status && status !== 'ALL' && { orderStatus: status as OrderStatus }),
      ...(search && {
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          shippingAddress: true,
          orderItems: {
            include: {
              product: { select: { title: true } },
              variant: true,
            },
          },
          payments: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  async createTransactionalOrder(params: {
    userId: string;
    shippingAddressId: string;
    financials: { subtotal: number; discountAmount: number; shippingFee: number; taxAmount: number; totalAmount: number };
    paymentProvider: PaymentProvider;
    couponId?: string | null;
    notes?: string | null;
    items: Array<{ productId: string; variantId?: string | null; quantity: number; price: number; totalPrice: number }>;
    cartId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Deduct stock safely
      for (const item of params.items) {
        if (item.variantId) {
          const v = await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
          if (v.stock < 0) {
            throw new Error(`Insufficient stock for variant SKU ${v.sku}`);
          }
        } else {
          const p = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
          if (p.stock < 0) {
            throw new Error(`Insufficient stock for product ${p.title}`);
          }
        }
      }

      // 2. Increment coupon usage if used
      if (params.couponId) {
        await tx.coupon.update({
          where: { id: params.couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // 3. Create Order
      const isCod = params.paymentProvider === 'COD';
      const order = await tx.order.create({
        data: {
          userId: params.userId,
          shippingAddressId: params.shippingAddressId,
          subtotal: params.financials.subtotal,
          discountAmount: params.financials.discountAmount,
          shippingFee: params.financials.shippingFee,
          taxAmount: params.financials.taxAmount,
          totalAmount: params.financials.totalAmount,
          paymentProvider: params.paymentProvider,
          paymentStatus: isCod ? PaymentStatus.PENDING : PaymentStatus.PENDING,
          orderStatus: isCod ? OrderStatus.PROCESSING : OrderStatus.PENDING,
          couponId: params.couponId || null,
          notes: params.notes || null,
          orderItems: {
            create: params.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId || null,
              quantity: i.quantity,
              price: i.price,
              totalPrice: i.totalPrice,
            })),
          },
        },
        include: {
          orderItems: true,
          shippingAddress: true,
        },
      });

      // 4. Clear active cart items
      await tx.cartItem.deleteMany({
        where: { cartId: params.cartId },
      });

      return order;
    });
  }

  async updateOrderStatus(id: string, orderStatus: OrderStatus, paymentStatus?: PaymentStatus) {
    return prisma.order.update({
      where: { id },
      data: {
        orderStatus,
        ...(paymentStatus && { paymentStatus }),
      },
    });
  }

  async updateTracking(id: string, trackingNumber: string, trackingCarrier: string) {
    return prisma.order.update({
      where: { id },
      data: {
        trackingNumber,
        trackingCarrier,
        orderStatus: OrderStatus.SHIPPED,
      },
    });
  }

  async cancelOrderAndRestoreStock(orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) throw new Error('Order not found');

      // Restore stock
      for (const item of order.orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: OrderStatus.CANCELLED,
        },
      });
    });
  }
}

export const orderRepository = new OrderRepository();
