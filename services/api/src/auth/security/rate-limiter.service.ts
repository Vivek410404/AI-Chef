import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterService {
  private readonly limits = new Map<string, RateLimitEntry>();

  /**
   * Check rate limit. Throws HTTP 429 if exceeded.
   * @param key unique bucket key (e.g., `login:ip:127.0.0.1` or `register:email:...`)
   * @param maxRequests maximum allowed requests within window
   * @param windowMs window size in milliseconds
   */
  check(key: string, maxRequests: number, windowMs: number): void {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || entry.resetAt <= now) {
      this.limits.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (entry.count >= maxRequests) {
      const waitSeconds = Math.ceil((entry.resetAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many requests. Please try again in ${waitSeconds} seconds.`,
          retryAfter: waitSeconds
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    entry.count += 1;
  }

  /**
   * Reset rate limit bucket (e.g. upon successful login)
   */
  reset(key: string): void {
    this.limits.delete(key);
  }
}
