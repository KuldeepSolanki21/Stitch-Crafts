import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt.util';
import { HTTP_STATUS } from '../constants/http-status.constant';
import { sendError } from '../utils/api-response.util';
import { prisma } from '../config/database.config';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      'Access token required. Format: Bearer <token>'
    );
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'User no longer exists');
    }

    if (!user.isActive) {
      return sendError(
        res,
        HTTP_STATUS.FORBIDDEN,
        'Account is deactivated. Please contact support.'
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Access token has expired');
    }
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid access token');
  }
};
