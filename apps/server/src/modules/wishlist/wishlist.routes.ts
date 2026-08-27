import { Router } from 'express';
import { authenticateJWT, AuthRequest } from '../../middlewares/auth.middleware';
import { prisma } from '../../config/database.config';
import { cartService } from '../cart/cart.service';
import { sendResponse, sendError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';

const router = Router();

router.use(authenticateJWT);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: { category: true, variants: true },
        },
      },
    });
    return sendResponse(res, HTTP_STATUS.OK, 'Wishlist items retrieved', items);
  } catch (e) {
    next(e);
  }
});

router.post('/:productId', async (req: AuthRequest, res, next) => {
  try {
    const item = await prisma.wishlist.upsert({
      where: {
        userId_productId: { userId: req.user!.id, productId: req.params.productId },
      },
      update: {},
      create: { userId: req.user!.id, productId: req.params.productId },
    });
    return sendResponse(res, HTTP_STATUS.CREATED, 'Product added to wishlist', item);
  } catch (e) {
    next(e);
  }
});

router.delete('/:productId', async (req: AuthRequest, res, next) => {
  try {
    await prisma.wishlist.deleteMany({
      where: { userId: req.user!.id, productId: req.params.productId },
    });
    return sendResponse(res, HTTP_STATUS.OK, 'Removed from wishlist');
  } catch (e) {
    next(e);
  }
});

// Move from Wishlist to Cart
router.post('/:productId/move-to-cart', async (req: AuthRequest, res, next) => {
  try {
    const { productId } = req.params;
    const { variantId } = req.body;

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId: req.user!.id, productId },
      },
    });

    if (!wishlistItem) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Item not found in wishlist');
    }

    const updatedCart = await cartService.addItem(req.user!.id, {
      productId,
      variantId,
      quantity: 1,
    });

    await prisma.wishlist.delete({
      where: { id: wishlistItem.id },
    });

    return sendResponse(res, HTTP_STATUS.OK, 'Moved from wishlist to cart', updatedCart);
  } catch (e) {
    next(e);
  }
});

export default router;
