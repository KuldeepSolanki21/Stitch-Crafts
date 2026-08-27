import { prisma } from '../../config/database.config';

export class AnalyticsService {
  async getOverview() {
    const [totalOrders, paidOrders, totalCustomers, totalProducts, lowStockProducts] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { totalAmount: true },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const averageOrderValue = paidOrders.length > 0 ? Math.round((totalRevenue / paidOrders.length) * 100) / 100 : 0;

    const [pendingOrders, completedOrders] = await Promise.all([
      prisma.order.count({ where: { orderStatus: { in: ['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'] } } }),
      prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
    ]);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      pendingOrders,
      completedOrders,
    };
  }

  async getRevenueTrends() {
    const orders = await prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyMap: Record<string, number> = {};
    orders.forEach((o) => {
      const month = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap[month] = (monthlyMap[month] || 0) + Number(o.totalAmount);
    });

    return Object.entries(monthlyMap).map(([date, revenue]) => ({ date, revenue }));
  }

  async getTopProducts() {
    const orderItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const products = await Promise.all(
      orderItems.map(async (item) => {
        const p = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { title: true, images: true, price: true },
        });
        return {
          productId: item.productId,
          title: p?.title || 'Unknown Item',
          image: p?.images[0] || '',
          unitsSold: item._sum.quantity || 0,
          revenue: Number(item._sum.totalPrice || 0),
        };
      })
    );

    return products;
  }

  async getCategorySales() {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        products: {
          select: {
            orderItems: {
              select: { totalPrice: true },
            },
          },
        },
      },
    });

    return categories.map((cat) => {
      let revenue = 0;
      cat.products.forEach((p) => {
        p.orderItems.forEach((oi) => {
          revenue += Number(oi.totalPrice);
        });
      });
      return {
        name: cat.name,
        revenue,
      };
    });
  }
}

export const analyticsService = new AnalyticsService();
