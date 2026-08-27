import { Request, Response, NextFunction } from 'express';
import { mediaService } from './media.service';
import { sendResponse, sendError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';

export class MediaController {
  async uploadSingle(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'No image file uploaded');
      }
      const uploaded = await mediaService.uploadImage(req.file.buffer, req.file.originalname);
      return sendResponse(res, HTTP_STATUS.CREATED, 'Image uploaded successfully', uploaded);
    } catch (error) {
      next(error);
    }
  }

  async deleteMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicId } = req.params;
      const success = await mediaService.deleteImage(publicId);
      return sendResponse(res, HTTP_STATUS.OK, 'Media deleted', { success });
    } catch (error) {
      next(error);
    }
  }
}

export const mediaController = new MediaController();
