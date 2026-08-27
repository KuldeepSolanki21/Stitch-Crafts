import { prisma } from '../../config/database.config';

export class CartRepository {
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { category: true },
              },
              variant: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async findCartItem(cartId: string, productId: string, variantId?: string | null) {
    return prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
        variantId: variantId || null,
      },
    });
  }

  async addOrUpdateItem(cartId: string, productId: string, variantId: string | null | undefined, quantity: number) {
    const existing = await this.findCartItem(cartId, productId, variantId);
    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId,
        productId,
        variantId: variantId || null,
        quantity,
      },
    });
  }

  async updateItemQuantity(cartItemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  async removeItem(cartItemId: string) {
    return prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}

export const cartRepository = new CartRepository();
