import app from './app';
import { ENV } from './config/env.config';
import { logger } from './config/logger.config';

const server = app.listen(ENV.PORT, () => {
  logger.info(`Stitch & Crafts API Server running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});
