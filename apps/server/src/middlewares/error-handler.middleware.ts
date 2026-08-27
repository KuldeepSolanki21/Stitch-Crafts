import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.config';
import { HTTP_STATUS } from '../constants/http-status.constant';
import { AppError, sendError } from '../utils/api-response.util';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.message, { stack: err.stack, path: req.originalUrl, method: req.method });

  // Custom App Error
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Validation error', formatted);
  }

  // Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return sendError(
        res,
        HTTP_STATUS.CONFLICT,
        `A record with this ${target} already exists.`
      );
    }
    if (err.code === 'P2025') {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Requested resource was not found.');
    }
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid token.');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Token expired.');
  }

  // Default Internal Error
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
};
