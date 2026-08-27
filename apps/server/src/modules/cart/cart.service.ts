import { cartRepository } from './cart.repository';
import { productRepository } from '../product/product.repository';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { calculateFinancials } from '../../utils/pricing.util';
import { AddCartItemInput, UpdateCartItemInput } from '@stitch-and-crafts/validation-schemas';

export class CartService {
  async getFormattedCart(userId: string) {
    const cart = await cartRepository.getOrCreateCart(userId);

    let subtotal = 0;
    const formattedItems = cart.items.map((item) => {
      const product = item.product;
      const variant = item.variant;

      const basePrice = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
      const priceDelta = variant ? Number(variant.priceDelta) : 0;
      const unitPrice = basePrice + priceDelta;
      const itemTotal = unitPrice * item.quantity;

      const availableStock = variant ? variant.stock : product.stock;
      const availability = availableStock === 0 ? 'OUT_OF_STOCK' : availableStock < item.quantity ? 'LOW_STOCK' : 'IN_STOCK';

      subtotal += itemTotal;

      return {
        id: item.id,
        productId: product.id,
        title: product.title,
        slug: product.slug,
        image: variant?.images[0] || product.images[0],
        variant: variant
          ? {
              id: variant.id,
              colorName: variant.colorName,
              colorHex: variant.colorHex,
              size: variant.size,
              sku: variant.sku,
            }
          : null,
        unitPrice,
        regularPrice: Number(product.price) + priceDelta,
        quantity: item.quantity,
        itemTotal,
        availableStock,
        availability,
        isPublished: product.isPublished && product.category.isActive,
      };
    });

    const financials = calculateFinancials(subtotal, 0);

    return {
      cartId: cart.id,
      items: formattedItems,
      ...financials,
      isCheckoutValid: formattedItems.length > 0 && formattedItems.every(i => i.availability !== 'OUT_OF_STOCK' && i.isPublished),
    };
  }

  async addItem(userId: string, input: AddCartItemInput) {
    const product = await productRepository.findById(input.productId);
    if (!product || !product.isPublished || !product.category.isActive) {
      throw new AppError('Product is unavailable', HTTP_STATUS.NOT_FOUND);
    }

    let availableStock = product.stock;
    if (input.variantId) {
      const variant = await productRepository.findVariantById(input.variantId);
      if (!variant || variant.productId !== input.productId) {
        throw new AppError('Invalid product variant selected', HTTP_STATUS.BAD_REQUEST);
      }
      availableStock = variant.stock;
    }

    if (availableStock < input.quantity) {
      throw new AppError(`Insufficient stock. Only ${availableStock} units available.`, HTTP_STATUS.BAD_REQUEST);
    }

    const cart = await cartRepository.getOrCreateCart(userId);
    const existing = await cartRepository.findCartItem(cart.id, input.productId, input.variantId);
    if (existing && existing.quantity + input.quantity > availableStock) {
      throw new AppError(`Cannot add more. Exceeds total available stock of ${availableStock}.`, HTTP_STATUS.BAD_REQUEST);
    }

    await cartRepository.addOrUpdateItem(cart.id, input.productId, input.variantId, input.quantity);
    return this.getFormattedCart(userId);
  }

  async updateItemQuantity(userId: string, cartItemId: string, input: UpdateCartItemInput) {
    const cart = await cartRepository.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === cartItemId);
    if (!item) {
      throw new AppError('Cart item not found or does not belong to user', HTTP_STATUS.NOT_FOUND);
    }

    const availableStock = item.variant ? item.variant.stock : item.product.stock;
    if (input.quantity > availableStock) {
      throw new AppError(`Requested quantity (${input.quantity}) exceeds available stock (${availableStock})`, HTTP_STATUS.BAD_REQUEST);
    }

    await cartRepository.updateItemQuantity(cartItemId, input.quantity);
    return this.getFormattedCart(userId);
  }

  async removeItem(userId: string, cartItemId: string) {
    const cart = await cartRepository.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === cartItemId);
    if (!item) {
      throw new AppError('Cart item not found or does not belong to user', HTTP_STATUS.NOT_FOUND);
    }

    await cartRepository.removeItem(cartItemId);
    return this.getFormattedCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await cartRepository.getOrCreateCart(userId);
    await cartRepository.clearCart(cart.id);
    return this.getFormattedCart(userId);
  }
}

export const cartService = new CartService();
