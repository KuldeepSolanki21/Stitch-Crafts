import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { HTTP_STATUS } from '../constants/http-status.constant';
import { sendError } from '../utils/api-response.util';

export const requireRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        HTTP_STATUS.FORBIDDEN,
        `Access denied: Requires role [ ${roles.join(', ')} ]`
      );
    }

    next();
  };
};
