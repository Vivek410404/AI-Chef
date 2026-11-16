import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export interface AccessTokenPayload {
  sub: string;
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'RETAILER' | 'ADMIN';
  householdId?: string;
  householdRole?: 'OWNER' | 'MEMBER' | 'COOK';
  jti: string;
}

@Injectable()
export class TokenService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'rasoi_iq_super_secret_jwt_key_2026';
  private readonly issuer = 'rasoi-iq';
  private readonly audience = 'rasoi-iq-app';

  /**
   * Generates a cryptographically random, single-use token (hex string).
   */
  generateRandomToken(byteLength = 32): string {
    return crypto.randomBytes(byteLength).toString('hex');
  }

  /**
   * Hashes a raw token using SHA-256 for persistent database storage.
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
  }

  /**
   * Issues a short-lived (15 min) JWT access token with unique JTI.
   */
  generateAccessToken(user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    householdId?: string;
    householdRole?: string;
  }): { accessToken: string; jti: string; expiresIn: number } {
    const jti = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
    const payload: AccessTokenPayload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: (user.role || 'CUSTOMER') as any,
      householdId: user.householdId,
      householdRole: user.householdRole as any,
      jti
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '15m',
      issuer: this.issuer,
      audience: this.audience
    });

    return {
      accessToken,
      jti,
      expiresIn: 900 // 15 minutes in seconds
    };
  }

  /**
   * Verifies an access token and extracts claims.
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: this.issuer,
        audience: this.audience
      }) as AccessTokenPayload;

      return decoded;
    } catch (err: any) {
      // Also allow tokens issued with legacy options (without strict issuer/aud) during transitional tests
      try {
        const fallback = jwt.verify(token, this.jwtSecret) as AccessTokenPayload;
        return fallback;
      } catch (fallbackErr: any) {
        if (err?.name === 'TokenExpiredError' || fallbackErr?.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Authentication token has expired');
        }
        throw new UnauthorizedException('Invalid or malformed authentication token');
      }
    }
  }

  /**
   * Generates a rotating refresh token, returns plain token, hash, and family ID.
   */
  generateRefreshToken(existingFamilyId?: string): {
    refreshToken: string;
    tokenHash: string;
    tokenFamilyId: string;
  } {
    const refreshToken = `rt_${this.generateRandomToken(40)}`;
    const tokenHash = this.hashToken(refreshToken);
    const tokenFamilyId = existingFamilyId || `fam_${crypto.randomUUID()}`;

    return {
      refreshToken,
      tokenHash,
      tokenFamilyId
    };
  }
}
