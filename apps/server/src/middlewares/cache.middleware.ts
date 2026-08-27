import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.config';

export const cacheResponse = (durationSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();
    const key = `cache:${req.originalUrl}`;
    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
    } catch (e) {
      // Fallback seamlessly if Redis is offline
    }
    next();
  };
};
