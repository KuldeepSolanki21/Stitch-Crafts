import { Request, Response } from 'express';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';

export class WishlistController {
  async handle(req: Request, res: Response) {
    return sendResponse(res, HTTP_STATUS.OK, 'WISHLIST Module Placeholder Response', {});
  }
}
export const wishlistController = new WishlistController();
