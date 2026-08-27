import Redis from 'ioredis';
import { ENV } from './env.config';

export const redis = new Redis(ENV.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: () => null, // Don't retry endlessly if not running
});

redis.on('error', (err) => {
  // Silent fallback for non-critical cache
});

