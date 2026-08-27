import { orderRepository } from './order.repository';
import { cartService } from '../cart/cart.service';
import { couponService } from '../coupon/coupon.service';
import { userRepository } from '../user/user.repository';
import { calculateFinancials } from '../../utils/pricing.util';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { CheckoutPreviewInput, CreateOrderInput, UpdateOrderStatusInput, UpdateOrderTrackingInput } from '@stitch-and-crafts/validation-schemas';

export class OrderService {
  async getCheckoutPreview(userId: string, input: CheckoutPreviewInput) {
    // 1. Verify address ownership
    const address = await userRepository.getAddressById(input.addressId, userId);
    if (!address) {
      throw new AppError('Shipping address not found or does not belong to customer', HTTP_STATUS.BAD_REQUEST);
    }

    // 2. Fetch server-calculated cart
    const cart = await cartService.getFormattedCart(userId);
    if (cart.items.length === 0) {
      throw new AppError('Your cart is empty', HTTP_STATUS.BAD_REQUEST);
    }
    if (!cart.isCheckoutValid) {
      throw new AppError('Some items in your cart are currently out of stock or unavailable', HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Validate coupon if provided
    let couponDiscount = 0;
    let couponDetails = null;
    if (input.couponCode) {
      const validatedCoupon = await couponService.validateCoupon(input.couponCode, cart.subtotal);
      couponDiscount = validatedCoupon.discountAmount;
      couponDetails = validatedCoupon;
    }

    const financials = calculateFinancials(cart.subtotal, couponDiscount);

    return {
      shippingAddress: address,
      items: cart.items,
      coupon: couponDetails,
      paymentProvider: input.paymentProvider,
      ...financials,
    };
  }

  async createOrder(userId: string, input: CreateOrderInput) {
    // 1. Validate Address
    const address = await userRepository.getAddressById(input.shippingAddressId, userId);
    if (!address) {
      throw new AppError('Shipping address invalid or does not belong to user', HTTP_STATUS.BAD_REQUEST);
    }

    // 2. Fetch Cart
    const cart = await cartService.getFormattedCart(userId);
    if (cart.items.length === 0) {
      throw new AppError('Cannot place order: Cart is empty', HTTP_STATUS.BAD_REQUEST);
    }
    if (!cart.isCheckoutValid) {
      throw new AppError('Cannot place order: One or more cart items are out of stock', HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Validate Coupon
    let couponId: string | null = null;
    let couponDiscount = 0;
    if (input.couponCode) {
      const validatedCoupon = await couponService.validateCoupon(input.couponCode, cart.subtotal);
      couponId = validatedCoupon.couponId;
      couponDiscount = validatedCoupon.discountAmount;
    }

    const financials = calculateFinancials(cart.subtotal, couponDiscount);

    // 4. Snapshot order items
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variant?.id || null,
      quantity: item.quantity,
      price: item.unitPrice,
      totalPrice: item.itemTotal,
    }));

    try {
      const order = await orderRepository.createTransactionalOrder({
        userId,
        shippingAddressId: input.shippingAddressId,
        financials,
        paymentProvider: input.paymentProvider as any,
        couponId,
        notes: input.notes,
        items: orderItems,
        cartId: cart.cartId,
      });

      return order;
    } catch (err: any) {
      throw new AppError(err.message || 'Order placement failed during checkout transaction', HTTP_STATUS.CONFLICT);
    }
  }

  async getMyOrders(userId: string, page = 1, limit = 10) {
    return orderRepository.findByUserId(userId, page, limit);
  }

  async getOrderById(orderId: string, userId?: string) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }
    return order;
  }

  async getOrderTracking(orderId: string, userId?: string) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    const timeline = [
      { status: 'PENDING', label: 'Order Placed', completed: true, timestamp: order.createdAt },
      {
        status: 'PROCESSING',
        label: 'Handcrafting & Packing',
        completed: ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus),
      },
      {
        status: 'SHIPPED',
        label: 'Dispatched with Courier',
        completed: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus),
      },
      {
        status: 'OUT_FOR_DELIVERY',
        label: 'Out for Delivery',
        completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus),
      },
      {
        status: 'DELIVERED',
        label: 'Delivered to Destination',
        completed: order.orderStatus === 'DELIVERED',
      },
    ];

    return {
      orderId: order.id,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      trackingCarrier: order.trackingCarrier,
      timeline,
    };
  }

  async cancelCustomerOrder(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus)) {
      throw new AppError('Order cannot be cancelled as it has already dispatched', HTTP_STATUS.BAD_REQUEST);
    }

    if (order.orderStatus === 'CANCELLED') {
      throw new AppError('Order is already cancelled', HTTP_STATUS.BAD_REQUEST);
    }

    return orderRepository.cancelOrderAndRestoreStock(orderId);
  }

  // Admin Services
  async getAllAdminOrders(query: any) {
    return orderRepository.findAllAdmin(query);
  }

  async updateOrderStatus(orderId: string, input: UpdateOrderStatusInput) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }
    return orderRepository.updateOrderStatus(orderId, input.orderStatus as any, input.paymentStatus as any);
  }

  async updateOrderTracking(orderId: string, input: UpdateOrderTrackingInput) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }
    return orderRepository.updateTracking(orderId, input.trackingNumber, input.trackingCarrier);
  }
}

export const orderService = new OrderService();
