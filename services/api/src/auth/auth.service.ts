import { Injectable, UnauthorizedException, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
import { StoreService } from '../data/store.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret = process.env.JWT_SECRET || 'rasoi_iq_default_dev_secret_2026';

  constructor(private readonly store: StoreService) {}

  private static readonly revokedTokens = new Set<string>();

  async onModuleInit() {
    await this.loadRevokedTokensFromDatabase();
  }

  async loadRevokedTokensFromDatabase() {
    if (!this.store.isPrismaConnected) return;
    try {
      const allRevoked = await this.store.prisma.revokedToken.findMany();
      const now = new Date();
      const activeRevoked = allRevoked.filter(item => !item.expiresAt || item.expiresAt > now);
      for (const item of activeRevoked) {
        AuthService.revokedTokens.add(item.token);
      }
      this.logger.log(`Loaded ${activeRevoked.length} persistent revoked tokens from PostgreSQL.`);
    } catch (e: any) {
      this.logger.warn(`Failed to preload revoked tokens from database: ${e.message}`);
    }
  }

  async logout(authHeader?: string) {
    if (authHeader) {
      const cleanToken = authHeader.replace(/^Bearer\s+/i, '').trim();
      AuthService.revokedTokens.add(cleanToken);

      if (this.store.isPrismaConnected) {
        try {
          const decoded: any = jwt.decode(cleanToken);
          const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;
          await this.store.prisma.revokedToken.upsert({
            where: { token: cleanToken },
            create: {
              token: cleanToken,
              reason: 'User logout',
              revokedAt: new Date(),
              expiresAt
            },
            update: {}
          });
        } catch (dbErr: any) {
          this.logger.warn(`Failed to persist revoked token to PostgreSQL: ${dbErr.message}`);
        }
      }
    }
    return { success: true, message: 'Logged out successfully. Token revoked.' };
  }

  async createDemoSession(
    role: 'CUSTOMER' | 'RETAILER' | 'ADMIN' = 'CUSTOMER',
    options?: { userId?: string; householdId?: string; retailerId?: string; email?: string; secret?: string }
  ) {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_AUTH !== 'true') {
      throw new ForbiddenException('Demo session endpoint is disabled in production environment');
    }

    const email = options?.email || (role === 'ADMIN' ? 'admin@rasoiiq.in' : role === 'RETAILER' ? 'partner@blinkit.com' : 'demo@rasoiiq.in');
    const adminSecret = process.env.ADMIN_DEMO_SECRET || 'rasoi_admin_secret_2026';
    const hasValidSecret = options?.secret === adminSecret;

    // Privilege escalation protection: verify authorized identity or secret
    if (role === 'ADMIN') {
      const isKnownAdmin = ['admin@rasoiiq.in', 'ops@rasoiiq.com', 'admin@rasoi.demo'].includes(email.toLowerCase());
      if (!isKnownAdmin && !hasValidSecret) {
        throw new ForbiddenException('Privilege escalation blocked. Role "ADMIN" requires verified platform administrative identity.');
      }
    } else if (role === 'RETAILER') {
      const isKnownRetailer = email.toLowerCase().includes('blinkit') ||
        email.toLowerCase().includes('zepto') ||
        email.toLowerCase().includes('dmart') ||
        ['partner@blinkit.com', 'manager@blinkit.demo'].includes(email.toLowerCase());
      if (!isKnownRetailer && !hasValidSecret) {
        throw new ForbiddenException('Privilege escalation blocked. Role "RETAILER" requires authorized merchant credentials.');
      }
    }

    const userId = options?.userId || (role === 'ADMIN' ? 'user-admin-1' : role === 'RETAILER' ? 'user-retailer-blinkit' : 'user-demo-1');
    let householdId = options?.householdId;
    let fullName = 'Pooja Sharma';

    if (role === 'CUSTOMER') {
      if (householdId === 'hh-patel-family' || options?.userId === 'user-demo-patel' || email.includes('patel')) {
        householdId = 'hh-patel-family';
        fullName = 'Rameshbhai Patel';
      } else if (householdId === 'hh-mehta-family' || options?.userId === 'user-demo-mehta' || email.includes('mehta')) {
        householdId = 'hh-mehta-family';
        fullName = 'Kirit Mehta';
      } else {
        householdId = householdId || 'hh-sharma-family';
        fullName = 'Pooja Sharma';
      }
    }

    const retailerId = options?.retailerId || (role === 'RETAILER' ? 'ret-blinkit' : undefined);

    const user = {
      id: userId,
      email,
      fullName: role === 'ADMIN' ? 'Platform Administrator' : role === 'RETAILER' ? 'Retail Partner Manager' : fullName,
      role,
      householdId,
      retailerId
    };

    const token = jwt.sign(user, this.jwtSecret, { expiresIn: '7d' });
    return {
      token,
      user,
      message: `${role} demo session initialized successfully`
    };
  }

  async login(email: string, _pass: string) {
    if (email === 'demo@rasoiiq.in' || email === 'pooja@sharma.in') {
      return this.createDemoSession();
    }
    const user = {
      id: `user-${Date.now()}`,
      email,
      fullName: email.split('@')[0],
      role: 'CUSTOMER',
      householdId: 'hh-sharma-family'
    };
    const token = jwt.sign(user, this.jwtSecret, { expiresIn: '7d' });
    return { token, user };
  }

  async verifyToken(token: string) {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    if (AuthService.revokedTokens.has(cleanToken)) {
      throw new UnauthorizedException('Token has been revoked. Please sign in again.');
    }
    if (this.store.isPrismaConnected) {
      try {
        const found = await this.store.prisma.revokedToken.findUnique({
          where: { token: cleanToken }
        });
        if (found) {
          AuthService.revokedTokens.add(cleanToken);
          throw new UnauthorizedException('Token has been revoked. Please sign in again.');
        }
      } catch (dbCheckErr: any) {
        if (dbCheckErr instanceof UnauthorizedException) throw dbCheckErr;
      }
    }
    try {
      const decoded: any = jwt.verify(cleanToken, this.jwtSecret);
      if (!decoded || typeof decoded !== 'object' || !decoded.role) {
        throw new UnauthorizedException('Token payload is missing valid authorization claims');
      }
      const normalizedRole = String(decoded.role).toUpperCase();
      if (!['CUSTOMER', 'RETAILER', 'ADMIN'].includes(normalizedRole)) {
        throw new UnauthorizedException(`Invalid role claim "${decoded.role}" in token`);
      }
      return { ...decoded, role: normalizedRole };
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Authentication token has expired');
      }
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or malformed authentication token');
    }
  }
}
