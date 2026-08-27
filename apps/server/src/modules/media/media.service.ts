import { cloudinary } from '../../config/cloudinary.config';
import { ENV } from '../../config/env.config';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';

export class MediaService {
  async uploadImage(fileBuffer: Buffer, originalName = 'leather-item'): Promise<{ url: string; publicId: string; width: number; height: number }> {
    if (!ENV.CLOUDINARY_API_KEY || !ENV.CLOUDINARY_CLOUD_NAME) {
      // Graceful fallback for local development without live Cloudinary keys
      const mockId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return {
        url: `https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop`,
        publicId: mockId,
        width: 1200,
        height: 1200,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'stitch-and-crafts/catalog',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(new AppError('Cloudinary image upload failed', HTTP_STATUS.INTERNAL_SERVER_ERROR));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  async deleteImage(publicId: string): Promise<boolean> {
    if (!ENV.CLOUDINARY_API_KEY || !ENV.CLOUDINARY_CLOUD_NAME) {
      return true;
    }
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === 'ok';
    } catch (e) {
      return false;
    }
  }
}

export const mediaService = new MediaService();
