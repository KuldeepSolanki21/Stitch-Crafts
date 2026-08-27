import { authRepository } from './auth.repository';
import {
  hashPassword,
  comparePassword,
} from '../../utils/password.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  compareTokenHash,
} from '../../utils/jwt.util';
import { AppError } from '../../utils/api-response.util';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { RegisterInput, LoginInput } from '@stitch-and-crafts/validation-schemas';

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('An account with this email already exists', HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phone: input.phone,
    });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await authRepository.updateRefreshTokenHash(user.id, hashToken(refreshToken));

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Please contact support.', HTTP_STATUS.FORBIDDEN);
    }

    const isMatch = await comparePassword(input.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await authRepository.updateRefreshTokenHash(user.id, hashToken(refreshToken));

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    await authRepository.updateRefreshTokenHash(userId, null);
    return { loggedOut: true };
  }

  async refreshTokens(incomingRefreshToken?: string) {
    if (!incomingRefreshToken) {
      throw new AppError('Refresh token is required', HTTP_STATUS.UNAUTHORIZED);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (e) {
      throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await authRepository.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new AppError('User inactive or not found', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.refreshTokenHash) {
      throw new AppError('Refresh token revoked. Please log in again.', HTTP_STATUS.UNAUTHORIZED);
    }

    const isTokenValid = compareTokenHash(incomingRefreshToken, user.refreshTokenHash);
    if (!isTokenValid) {
      // Possible token reuse anomaly: invalidate stored token for security
      await authRepository.updateRefreshTokenHash(user.id, null);
      throw new AppError('Invalid token signature detected. Session revoked.', HTTP_STATUS.UNAUTHORIZED);
    }

    // Token Rotation
    const payload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await authRepository.updateRefreshTokenHash(user.id, hashToken(newRefreshToken));

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

export const authService = new AuthService();
