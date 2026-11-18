import { Injectable, BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';

const COMMON_PASSWORDS = new Set([
  'password12345',
  'password123456',
  '123456789012',
  '1234567890123',
  'qwerty123456',
  'admin12345678',
  'welcome123456',
  'letmein123456',
  'rasoiiq123456',
  'iloveyou12345'
]);

@Injectable()
export class PasswordService {
  /**
   * Enforce password policy:
   * - Minimum 12 characters.
   * - Unicode and long passphrases allowed.
   * - No silent truncation.
   * - Reject commonly used / compromised passwords.
   */
  validatePasswordPolicy(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new BadRequestException('Password is required');
    }

    if (password.length < 12) {
      throw new BadRequestException('Password must be at least 12 characters long');
    }

    if (password.length > 256) {
      throw new BadRequestException('Password exceeds maximum supported length (256 characters)');
    }

    const lower = password.toLowerCase().trim();
    if (COMMON_PASSWORDS.has(lower)) {
      throw new BadRequestException('Password is too common and easily guessed. Please choose a stronger passphrase.');
    }
  }

  /**
   * Hash a password using Argon2id with unique salt per password.
   */
  async hash(password: string): Promise<string> {
    this.validatePasswordPolicy(password);
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,       // 3 iterations
      parallelism: 1
    });
  }

  /**
   * Verify password against Argon2id hash (with graceful fallback for demo bcrypt hashes if needed).
   */
  async verify(hash: string, plain: string): Promise<boolean> {
    if (!hash || !plain) return false;

    // Check if hash is Argon2id
    if (hash.startsWith('$argon2')) {
      try {
        return await argon2.verify(hash, plain);
      } catch {
        return false;
      }
    }

    // Legacy / demo bcrypt fallback for pre-seeded test fixtures
    if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
      try {
        const bcrypt = require('bcryptjs');
        return await bcrypt.compare(plain, hash);
      } catch {
        return false;
      }
    }

    return false;
  }
}
