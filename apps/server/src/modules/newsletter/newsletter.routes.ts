import { Router } from 'express';
import { prisma } from '../../config/database.config';
import { validateRequest } from '../../middlewares/validate.middleware';
import { subscribeNewsletterSchema } from '@stitch-and-crafts/validation-schemas';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';

const router = Router();

router.post('/subscribe', validateRequest(subscribeNewsletterSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existing) {
      return sendResponse(res, HTTP_STATUS.OK, 'You are already subscribed to Stitch & Crafts Atelier.');
    }

    await prisma.newsletterSubscription.create({
      data: { email },
    });

    return sendResponse(res, HTTP_STATUS.CREATED, 'Thank you for subscribing to our luxury newsletter.');
  } catch (error) {
    next(error);
  }
});

export default router;
