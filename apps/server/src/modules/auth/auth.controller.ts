import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendResponse } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { ENV } from '../../config/env.config';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.NODE_ENV === 'production',
  sameSite: (ENV.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      return sendResponse(
        res,
        HTTP_STATUS.CREATED,
        'Account registered successfully',
        {
          user: result.user,
          accessToken: result.accessToken,
        }
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        'Login successful',
        {
          user: result.user,
          accessToken: result.accessToken,
        }
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.id) {
        await authService.logout(req.user.id);
      }
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: (ENV.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
        path: '/',
      });
      return sendResponse(res, HTTP_STATUS.OK, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await authService.refreshTokens(incomingToken);
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        'Token refreshed successfully',
        {
          user: result.user,
          accessToken: result.accessToken,
        }
      );
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
