import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env.config';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRATION as any,
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRATION as any,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as JwtPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const compareTokenHash = (token: string, storedHash: string): boolean => {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return hash === storedHash;
};
