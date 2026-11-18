import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean) as string[];

  use(req: Request, res: Response, next: NextFunction) {
    // 1. Ensure a CSRF token cookie exists for browser sessions (Double-Submit pattern)
    let csrfToken = req.cookies?.rasoi_csrf_token;
    if (!csrfToken) {
      csrfToken = crypto.randomBytes(32).toString('hex');
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('rasoi_csrf_token', csrfToken, {
        httpOnly: false, // Standard double-submit: readable by client-side scripts on same origin
        secure: isProd,
        sameSite: 'lax',
        path: '/'
      });
    }

    const method = req.method.toUpperCase();
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (!isStateChanging) {
      return next();
    }

    // Exclude public authentication endpoints that establish credentials initially
    const publicAuthEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/verify-email',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/admin/login',
      '/api/auth/admin/verify-otp',
      '/api/auth/demo-session',
      '/api/auth/refresh',
      '/api/auth/csrf'
    ];

    const path = req.path || req.originalUrl?.split('?')[0];
    if (publicAuthEndpoints.some(ep => path === ep || path.endsWith(ep.replace('/api', '')))) {
      return next();
    }

    // Check authentication source:
    // CSRF attacks target ambient browser credentials (HttpOnly cookie).
    // Non-browser API clients using Bearer tokens or internal worker keys are not vulnerable to ambient CSRF.
    const hasAuthCookie = Boolean(req.cookies?.rasoi_access_token);
    const authHeader = req.headers['authorization'];
    const hasBearerHeader = Boolean(authHeader && typeof authHeader === 'string' && authHeader.trim().startsWith('Bearer '));
    const hasWorkerKey = Boolean(req.headers['x-internal-worker-key']);

    if (hasAuthCookie && !hasBearerHeader && !hasWorkerKey) {
      // 1. Origin / Referer Validation against whitelist
      const origin = req.headers['origin'];
      const referer = req.headers['referer'];

      if (!origin && !referer) {
        throw new ForbiddenException('CSRF validation failed: Missing Origin and Referer headers.');
      }

      if (origin) {
        if (!this.allowedOrigins.includes(origin)) {
          throw new ForbiddenException(`CSRF validation failed: Untrusted Origin "${origin}".`);
        }
      } else if (referer) {
        try {
          const refererOrigin = new URL(referer).origin;
          if (!this.allowedOrigins.includes(refererOrigin)) {
            throw new ForbiddenException(`CSRF validation failed: Untrusted Referer origin "${refererOrigin}".`);
          }
        } catch {
          throw new ForbiddenException('CSRF validation failed: Malformed Referer header.');
        }
      }

      // 2. Double-Submit Token Validation
      // Standard anti-forgery double-submit: client must provide X-CSRF-Token matching the cookie.
      // Note: X-Requested-With alone cannot bypass CSRF token verification.
      const clientCsrfHeader = req.headers['x-csrf-token'];
      if (!clientCsrfHeader || typeof clientCsrfHeader !== 'string' || clientCsrfHeader.trim().length === 0) {
        throw new ForbiddenException('CSRF validation failed: Missing or empty X-CSRF-Token header.');
      }

      const cookieCsrf = req.cookies?.rasoi_csrf_token;
      if (!cookieCsrf || clientCsrfHeader !== cookieCsrf) {
        throw new ForbiddenException('CSRF validation failed: Invalid X-CSRF-Token header.');
      }
    }

    next();
  }
}
