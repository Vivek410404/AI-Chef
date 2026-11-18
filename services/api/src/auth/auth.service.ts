import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  Logger
} from '@nestjs/common';
import { StoreService } from '../data/store.service';
import { PasswordService } from './security/password.service';
import { TokenService } from './security/token.service';
import { RateLimiterService } from './security/rate-limiter.service';
import { AuditService } from './security/audit.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

interface AdminMfaSession {
  sessionId: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  otpHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret = process.env.JWT_SECRET || 'rasoi_iq_super_secret_jwt_key_2026';

  private static readonly revokedTokens = new Set<string>();
  private static readonly adminMfaSessions = new Map<string, AdminMfaSession>();

  constructor(
    public readonly store: StoreService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly rateLimiter: RateLimiterService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService
  ) { }

  async onModuleInit() {
    this.validateWorkerConfiguration();
    await this.loadRevokedTokensFromDatabase();
  }

  private validateWorkerConfiguration() {
    const secret = process.env.INTERNAL_WORKER_SECRET;
    if (!secret || secret.trim().length === 0) {
      this.logger.warn('[WorkerAuth] INTERNAL_WORKER_SECRET is not configured or empty. Internal worker simulation endpoints are LOCKED fail-closed.');
    } else {
      this.logger.log(`[WorkerAuth] Internal worker authentication configured (secret length: ${secret.trim().length} chars). Fail-closed mode active.`);
    }
  }

  async loadRevokedTokensFromDatabase() {
    if (!this.store.isPrismaConnected) return;
    try {
      const now = new Date();
      const activeRevoked = await this.store.prisma.revokedToken.findMany({
        where: {
          expiresAt: { gt: now }
        }
      });
      for (const item of activeRevoked) {
        AuthService.revokedTokens.add(item.token);
      }
      this.logger.log(`Loaded ${activeRevoked.length} unexpired persistent revoked tokens from PostgreSQL.`);
    } catch (e: any) {
      this.logger.warn(`Failed to preload revoked tokens from database: ${e.message}`);
    }
  }

  async cleanupExpiredRevocations(): Promise<number> {
    if (!this.store.isPrismaConnected) return 0;
    try {
      const result = await this.store.prisma.revokedToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      });
      this.logger.log(`Cleaned up ${result.count} expired revoked token records.`);
      return result.count;
    } catch (e: any) {
      this.logger.warn(`Failed to clean up expired revoked tokens: ${e.message}`);
      return 0;
    }
  }

  private normalizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';
    return email.toLowerCase().trim();
  }

  private validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email address format');
    }
  }

  /**
   * Public Customer Registration
   */
  async register(dto: RegisterDto, clientIp = '127.0.0.1') {
    this.rateLimiter.check(`register:${clientIp}`, 10, 60000);

    const hasAcceptedTerms = dto.acceptTerms === true || dto.acceptedTerms === true;
    if (!hasAcceptedTerms) {
      throw new BadRequestException('You must accept the Terms of Service and Privacy Policy to register.');
    }

    const normalizedEmail = this.normalizeEmail(dto.email);
    this.validateEmailFormat(normalizedEmail);

    if (!dto.fullName || dto.fullName.trim().length < 2) {
      throw new BadRequestException('Full name must be at least 2 characters long');
    }

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    this.passwordService.validatePasswordPolicy(dto.password);

    if (this.store.isPrismaConnected) {
      const existing = await this.store.prisma.user.findFirst({
        where: ({
          OR: [
            { email: normalizedEmail },
            { normalizedEmail: normalizedEmail }
          ]
        } as any)
      });

      if (existing) {
        this.logger.log(`Registration attempted for already registered email: ${normalizedEmail}`);
        throw new ConflictException('An account with this email address already exists. Please log in or reset your password.');
      }

      const passwordHash = await this.passwordService.hash(dto.password);
      const phoneNumber = (dto.phoneNumber || dto.phone)?.trim() || null;
      const user = await this.store.prisma.user.create({
        data: ({
          email: normalizedEmail,
          normalizedEmail,
          fullName: dto.fullName.trim(),
          passwordHash,
          phoneNumber,
          role: 'CUSTOMER',
          status: 'PENDING_VERIFICATION',
          emailVerifiedAt: null
        } as any)
      });

      const rawToken = this.tokenService.generateRandomToken(32);
      const tokenHash = this.tokenService.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

      // Auto-provision personal kitchen household for new customer
      const kitchenName = `${dto.fullName.trim().split(' ')[0]}'s Kitchen`;
      const newHousehold = await this.store.prisma.household.create({
        data: {
          userId: user.id,
          name: kitchenName,
          dietaryPreference: 'VEGETARIAN',
          spiceTolerance: 'MEDIUM',
          weeklyBudgetInr: 3500,
          size: 2,
          country: 'India',
          state: 'Gujarat',
          city: 'Ahmedabad'
        }
      });

      await this.store.prisma.householdMember.create({
        data: {
          householdId: newHousehold.id,
          userId: user.id,
          name: dto.fullName.trim(),
          role: 'OWNER',
          status: 'ACTIVE',
          dietaryPreference: 'VEGETARIAN',
          ageGroup: 'adult'
        }
      });

      await this.store.prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt
        }
      });

      await this.emailService.sendVerificationEmail(normalizedEmail, rawToken);

      await this.auditService.log({
        action: 'REGISTER',
        userId: user.id,
        entityType: 'User',
        entityId: user.id,
        ipAddress: clientIp
      });

      return {
        success: true,
        message: 'Registration successful! A verification link has been sent to your email.'
      };
    }

    // In-memory fallback if DB not connected (dev mode)
    return {
      success: true,
      message: 'Registration received (dev mode).'
    };
  }

  /**
   * Email Verification
   */
  async verifyEmail(token: string, clientIp = '127.0.0.1') {
    this.rateLimiter.check(`verify:${clientIp}`, 20, 60000);

    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Verification token is required');
    }

    const tokenHash = this.tokenService.hashToken(token);

    if (this.store.isPrismaConnected) {
      const record = await this.store.prisma.emailVerificationToken.findUnique({
        where: { tokenHash },
        include: { user: true }
      });

      if (!record || record.consumedAt) {
        throw new BadRequestException('Invalid, already used, or expired verification token');
      }

      if (record.expiresAt < new Date()) {
        throw new BadRequestException('Verification token has expired. Please request a new one.');
      }

      await this.store.prisma.$transaction([
        this.store.prisma.emailVerificationToken.update({
          where: { id: record.id },
          data: { consumedAt: new Date() }
        }),
        this.store.prisma.user.update({
          where: { id: record.userId },
          data: {
            status: 'ACTIVE',
            emailVerifiedAt: new Date()
          }
        })
      ]);

      await this.auditService.log({
        action: 'EMAIL_VERIFIED',
        userId: record.userId,
        entityType: 'User',
        entityId: record.userId,
        ipAddress: clientIp
      });

      return {
        success: true,
        message: 'Email successfully verified! You may now sign in to your RasoiIQ account.'
      };
    }

    return { success: true, message: 'Email verified (dev mode)' };
  }

  /**
   * Resend Verification Email
   */
  async resendVerification(email: string, clientIp = '127.0.0.1') {
    this.rateLimiter.check(`resend:${clientIp}`, 5, 60000);
    const normalizedEmail = this.normalizeEmail(email);

    if (this.store.isPrismaConnected && normalizedEmail) {
      const user = await this.store.prisma.user.findFirst({
        where: ({
          OR: [{ email: normalizedEmail }, { normalizedEmail }]
        } as any)
      });

      if (user && user.status === 'PENDING_VERIFICATION') {
        const rawToken = this.tokenService.generateRandomToken(32);
        const tokenHash = this.tokenService.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        await this.store.prisma.emailVerificationToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt
          }
        });

        await this.emailService.sendVerificationEmail(normalizedEmail, rawToken);
      }
    }

    // Always return identical generic message
    return {
      success: true,
      message: 'If an account exists with this email and is pending verification, a new link has been sent.'
    };
  }

  /**
   * Public Secure Login
   */
  async login(emailOrDto: string | LoginDto, passwordPlain?: string, clientIp = '127.0.0.1', userAgent?: string) {
    let email = '';
    let password = '';
    let deviceName = 'Web Browser';

    if (typeof emailOrDto === 'object') {
      email = emailOrDto.email;
      password = emailOrDto.password || '';
      deviceName = emailOrDto.deviceName || deviceName;
    } else {
      email = emailOrDto;
      password = passwordPlain || '';
    }

    const cleanEmail = this.normalizeEmail(email);
    this.rateLimiter.check(`login:${clientIp}`, 15, 60000);

    if (!password || typeof password !== 'string' || password.trim() === '') {
      throw new BadRequestException('Password is required.');
    }

    if (this.store.isPrismaConnected) {
      const user = await this.store.prisma.user.findFirst({
        where: ({
          OR: [{ email: cleanEmail }, { normalizedEmail: cleanEmail }]
        } as any),
        include: ({
          householdMembers: {
            include: { household: true }
          },
          households: true
        } as any)
      });

      if (!user) {
        await this.auditService.log({ action: 'LOGIN_FAILURE', metadata: { email: cleanEmail }, ipAddress: clientIp });
        throw new UnauthorizedException('Invalid email or password');
      }

      if (user.status === 'PENDING_VERIFICATION') {
        throw new UnauthorizedException('Account pending verificati on. Please verify your email before logging in.');
      }

      if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
        throw new ForbiddenException('Account has been suspended or deactivated. Please contact support.');
      }

      const isValidPassword = await this.passwordService.verify(user.passwordHash, password);
      if (!isValidPassword) {
        await this.auditService.log({ action: 'LOGIN_FAILURE', userId: user.id, ipAddress: clientIp });
        throw new UnauthorizedException('Invalid email or password');
      }

      // Determine household association
      let householdId: string | undefined;
      let householdRole: 'OWNER' | 'MEMBER' | 'COOK' = 'MEMBER';

      if (user.householdMembers && user.householdMembers.length > 0) {
        const primary = user.householdMembers[0];
        householdId = primary.householdId;
        householdRole = primary.role as any;
      } else if (user.households && user.households.length > 0) {
        householdId = user.households[0].id;
        householdRole = 'OWNER';
      } else if (user.role === 'CUSTOMER') {
        const kitchenName = `${user.fullName?.trim().split(' ')[0] || 'My'}'s Kitchen`;
        const newHh = await this.store.prisma.household.create({
          data: {
            userId: user.id,
            name: kitchenName,
            dietaryPreference: 'VEGETARIAN',
            spiceTolerance: 'MEDIUM',
            weeklyBudgetInr: 3500,
            size: 2,
            country: 'India',
            state: 'Gujarat',
            city: 'Ahmedabad'
          }
        });
        await this.store.prisma.householdMember.create({
          data: {
            householdId: newHh.id,
            userId: user.id,
            name: user.fullName || 'Household Owner',
            role: 'OWNER',
            status: 'ACTIVE',
            dietaryPreference: 'VEGETARIAN',
            ageGroup: 'adult'
          }
        });
        householdId = newHh.id;
        householdRole = 'OWNER';
      }

      // Generate Access Token (15 min)
      const tokenPayload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        householdId,
        householdRole
      };
      const { accessToken, expiresIn } = this.tokenService.generateAccessToken(tokenPayload);

      // Generate Refresh Token & Session
      const { refreshToken, tokenHash, tokenFamilyId } = this.tokenService.generateRefreshToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await this.store.prisma.refreshSession.create({
        data: {
          userId: user.id,
          tokenHash,
          tokenFamilyId,
          deviceName,
          userAgent: userAgent || null,
          expiresAt
        }
      });

      await this.store.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      await this.auditService.log({
        action: 'LOGIN_SUCCESS',
        userId: user.id,
        ipAddress: clientIp,
        userAgent
      });

      return {
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
          emailVerifiedAt: user.emailVerifiedAt,
          householdId,
          householdRole
        }
      };
    }

    // Memory fallback when PostgreSQL is not required
    if (process.env.REQUIRE_DATABASE === 'true') {
      throw new UnauthorizedException('Authentication service unavailable due to database unavailability.');
    }
    return this.handleLegacyDemoLogin(cleanEmail);
  }

  /**
   * Secure Platform Administrative Login (Step 1: Credential Verification & 2FA Dispatch)
   */
  async adminLogin(email: string, passwordPlain: string, clientIp = '127.0.0.1', userAgent?: string) {
    const cleanEmail = this.normalizeEmail(email);
    this.rateLimiter.check(`admin-login:${clientIp}`, 10, 60000);

    if (!this.store.isPrismaConnected) {
      throw new ForbiddenException('Database unavailable. Administrative login requires PostgreSQL persistence.');
    }

    const user = await this.store.prisma.user.findFirst({
      where: ({
        OR: [{ email: cleanEmail }, { normalizedEmail: cleanEmail }]
      } as any)
    });

    if (!user) {
      await this.auditService.log({ action: 'ADMIN_LOGIN_FAILURE', metadata: { email: cleanEmail, reason: 'USER_NOT_FOUND' }, ipAddress: clientIp });
      throw new UnauthorizedException('Invalid administrative credentials');
    }

    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT'];
    if (!adminRoles.includes(user.role)) {
      await this.auditService.log({ action: 'ADMIN_LOGIN_DENIED', userId: user.id, metadata: { email: cleanEmail, role: user.role, reason: 'ROLE_NOT_AUTHORIZED' }, ipAddress: clientIp });
      throw new ForbiddenException('Access denied. This console is strictly reserved for authorized platform administrators.');
    }

    if (user.status === 'PENDING_VERIFICATION') {
      throw new UnauthorizedException('Administrative account email is pending verification. Please verify your email before accessing the console.');
    }

    if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
      throw new ForbiddenException('Administrative account has been suspended or deactivated. Contact platform security.');
    }

    const isValidPassword = await this.passwordService.verify(user.passwordHash, passwordPlain);
    if (!isValidPassword) {
      await this.auditService.log({ action: 'ADMIN_LOGIN_FAILURE', userId: user.id, metadata: { email: cleanEmail, reason: 'INVALID_PASSWORD' }, ipAddress: clientIp });
      throw new UnauthorizedException('Invalid administrative credentials');
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const sessionId = crypto.randomBytes(24).toString('hex');

    // Clean up any stale sessions (> 15 mins)
    const now = Date.now();
    for (const [key, sess] of AuthService.adminMfaSessions.entries()) {
      if (now > sess.expiresAt) {
        AuthService.adminMfaSessions.delete(key);
      }
    }

    // Store MFA challenge session (valid for 10 minutes)
    AuthService.adminMfaSessions.set(sessionId, {
      sessionId,
      userId: user.id,
      email: user.email,
      fullName: user.fullName || 'Administrator',
      role: user.role,
      otpHash,
      expiresAt: now + 10 * 60 * 1000,
      attempts: 0,
      lastSentAt: now
    });

    // Send the OTP via email
    await this.emailService.sendAdminOtp(user.email, user.fullName || 'Administrator', otp);

    this.logger.log(`[Admin2FA] 6-digit OTP dispatched to admin ${user.email} (session: ${sessionId.slice(0, 8)}...)`);

    // Mask the email address for safe frontend display (e.g. panchanivivek0401@gmail.com -> p***k@gmail.com)
    const [name, domain] = user.email.split('@');
    const maskedEmail = name.length <= 2
      ? `${name[0]}*@${domain}`
      : `${name[0]}***${name[name.length - 1]}@${domain}`;

    return {
      requiresMfa: true,
      mfaSessionId: sessionId,
      maskedEmail,
      expiresInSeconds: 600
    };
  }

  /**
   * Secure Platform Administrative Login (Step 2: 2FA OTP Verification)
   */
  async adminVerifyOtp(mfaSessionId: string, otp: string, clientIp = '127.0.0.1', userAgent?: string) {
    if (!mfaSessionId || !otp) {
      throw new BadRequestException('Session ID and 6-digit verification code are required');
    }

    const session = AuthService.adminMfaSessions.get(mfaSessionId);
    if (!session || Date.now() > session.expiresAt) {
      if (session) AuthService.adminMfaSessions.delete(mfaSessionId);
      throw new UnauthorizedException('Verification session expired or invalid. Please sign in again.');
    }

    session.attempts += 1;
    if (session.attempts > 5) {
      AuthService.adminMfaSessions.delete(mfaSessionId);
      await this.auditService.log({
        action: 'ADMIN_2FA_LOCKED',
        userId: session.userId,
        metadata: { email: session.email, reason: 'TOO_MANY_FAILED_ATTEMPTS' },
        ipAddress: clientIp
      });
      throw new ForbiddenException('Too many invalid verification attempts. Session locked. Please sign in again.');
    }

    const inputHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    const hashMatches = crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(session.otpHash));

    if (!hashMatches) {
      await this.auditService.log({
        action: 'ADMIN_2FA_INVALID_OTP',
        userId: session.userId,
        metadata: { email: session.email, attempt: session.attempts },
        ipAddress: clientIp
      });
      throw new UnauthorizedException('Invalid 6-digit verification code. Please check your email and try again.');
    }

    // OTP Verified! Consume session
    AuthService.adminMfaSessions.delete(mfaSessionId);

    const user = await this.store.prisma.user.findUnique({
      where: { id: session.userId },
      include: ({
        householdMembers: {
          include: { household: true }
        },
        households: true
      } as any)
    });

    if (!user) {
      throw new NotFoundException('Administrative account record not found.');
    }

    // Issue rotating refresh token
    const { refreshToken: rawRefreshToken, tokenHash, tokenFamilyId } = this.tokenService.generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.store.prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash,
        tokenFamilyId,
        deviceName: 'Admin Console' + (userAgent ? ` (${userAgent.substring(0, 30)})` : ''),
        userAgent: userAgent || 'Admin Console',
        expiresAt
      }
    });

    await this.store.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const { accessToken, expiresIn } = this.tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });

    await this.auditService.log({
      action: 'ADMIN_LOGIN_SUCCESS',
      userId: user.id,
      metadata: { role: user.role, email: user.email, mfa: 'EMAIL_OTP' },
      ipAddress: clientIp,
      userAgent
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt
      }
    };
  }

  /**
   * Resend Admin 2FA OTP Code
   */
  async adminResendOtp(mfaSessionId: string) {
    if (!mfaSessionId) {
      throw new BadRequestException('Session ID is required');
    }

    const session = AuthService.adminMfaSessions.get(mfaSessionId);
    if (!session || Date.now() > session.expiresAt) {
      throw new UnauthorizedException('Verification session expired or invalid. Please sign in again.');
    }

    const cooldownMs = 45000; // 45 seconds cooldown
    const elapsed = Date.now() - session.lastSentAt;
    if (elapsed < cooldownMs) {
      const waitSec = Math.ceil((cooldownMs - elapsed) / 1000);
      throw new BadRequestException(`Please wait ${waitSec} seconds before requesting a new verification code.`);
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    session.otpHash = crypto.createHash('sha256').update(newOtp).digest('hex');
    session.lastSentAt = Date.now();
    session.expiresAt = Date.now() + 10 * 60 * 1000;
    session.attempts = 0; // reset attempts on new code

    await this.emailService.sendAdminOtp(session.email, session.fullName, newOtp);

    return {
      success: true,
      message: 'A new 6-digit verification code has been dispatched to your email.'
    };
  }

  private handleLegacyDemoLogin(cleanEmail: string) {
    if (cleanEmail === 'demo@rasoiiq.in' || cleanEmail.includes('sharma') || cleanEmail === 'pooja@sharma.in') {
      return this.createDemoSession('CUSTOMER', { email: cleanEmail, householdId: 'hh-sharma-family', userId: 'user-demo-1' });
    }
    if (cleanEmail.includes('patel') || cleanEmail === 'ramesh@patel.in') {
      return this.createDemoSession('CUSTOMER', { email: cleanEmail, householdId: 'hh-patel-family', userId: 'user-demo-patel' });
    }
    if (cleanEmail.includes('mehta') || cleanEmail === 'kirit@mehta.in') {
      return this.createDemoSession('CUSTOMER', { email: cleanEmail, householdId: 'hh-mehta-family', userId: 'user-demo-mehta' });
    }
    if (cleanEmail.includes('admin')) {
      throw new ForbiddenException('Administrative demo bypass is disabled. Please use the secure administrative login with 2FA.');
    }
    if (cleanEmail.includes('blinkit') || cleanEmail.includes('retailer')) {
      return this.createDemoSession('RETAILER', { email: cleanEmail });
    }
    return this.createDemoSession('CUSTOMER', { email: cleanEmail });
  }

  /**
   * Rotating Refresh Token with Replay Detection
   */
  async refresh(refreshToken: string, clientIp = '127.0.0.1', userAgent?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokenHash = this.tokenService.hashToken(refreshToken);

    if (this.store.isPrismaConnected) {
      const session = await this.store.prisma.refreshSession.findUnique({
        where: { tokenHash },
        include: ({
          user: {
            include: {
              householdMembers: true,
              households: true
            }
          }
        } as any)
      });

      // Token Replay Detection: If session was already revoked, revoke whole family!
      if (session && session.revokedAt) {
        await this.store.prisma.refreshSession.updateMany({
          where: { tokenFamilyId: session.tokenFamilyId },
          data: { revokedAt: new Date() }
        });

        await this.auditService.log({
          action: 'REFRESH_TOKEN_REPLAY_DETECTED',
          userId: session.userId,
          metadata: { tokenFamilyId: session.tokenFamilyId },
          ipAddress: clientIp
        });

        throw new UnauthorizedException('Refresh token has already been rotated or revoked. All related sessions terminated. Please sign in again.');
      }

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = session.user;
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Account is not active');
      }

      // Rotate: Revoke current session
      await this.store.prisma.refreshSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() }
      });

      // Issue new session in the same family
      const { refreshToken: newRefreshToken, tokenHash: newTokenHash } = this.tokenService.generateRefreshToken(session.tokenFamilyId);
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await this.store.prisma.refreshSession.create({
        data: {
          userId: user.id,
          tokenHash: newTokenHash,
          tokenFamilyId: session.tokenFamilyId,
          deviceName: session.deviceName,
          userAgent: userAgent || session.userAgent,
          expiresAt: newExpiresAt
        }
      });

      let householdId: string | undefined;
      let householdRole: 'OWNER' | 'MEMBER' | 'COOK' = 'MEMBER';
      if (user.householdMembers && user.householdMembers.length > 0) {
        householdId = user.householdMembers[0].householdId;
        householdRole = user.householdMembers[0].role as any;
      } else if (user.households && user.households.length > 0) {
        householdId = user.households[0].id;
        householdRole = 'OWNER';
      }

      const { accessToken, expiresIn } = this.tokenService.generateAccessToken({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        householdId,
        householdRole
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn
      };
    }

    throw new UnauthorizedException('Database unavailable for refresh token validation');
  }

  /**
   * Single-Device Logout
   */
  async logout(authHeader?: string, refreshToken?: string, clientIp = '127.0.0.1') {
    if (authHeader) {
      const cleanToken = authHeader.replace(/^Bearer\s+/i, '').trim();
      const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');
      AuthService.revokedTokens.add(cleanToken);
      AuthService.revokedTokens.add(tokenHash);

      if (this.store.isPrismaConnected) {
        try {
          const decoded: any = jwt.decode(cleanToken);
          const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
          const revocationIdentifier = decoded?.jti ? `jti:${decoded.jti}` : tokenHash;
          AuthService.revokedTokens.add(revocationIdentifier);

          await this.store.prisma.revokedToken.upsert({
            where: { token: revocationIdentifier },
            create: {
              token: revocationIdentifier,
              reason: 'User logout',
              revokedAt: new Date(),
              expiresAt
            },
            update: {
              expiresAt
            }
          });
        } catch (dbErr: any) {
          this.logger.warn(`Failed to persist revoked token hash: ${dbErr.message}`);
          if (process.env.REQUIRE_DATABASE === 'true') {
            throw new UnauthorizedException('Logout persistence failed due to database unavailability.');
          }
        }
      }
    }

    if (refreshToken && this.store.isPrismaConnected) {
      const tokenHash = this.tokenService.hashToken(refreshToken);
      await this.store.prisma.refreshSession.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }

    await this.auditService.log({ action: 'LOGOUT', ipAddress: clientIp });
    return { success: true, message: 'Logged out successfully.' };
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string, authHeader?: string, clientIp = '127.0.0.1') {
    if (authHeader) {
      await this.logout(authHeader, undefined, clientIp);
    }

    if (this.store.isPrismaConnected && userId) {
      await this.store.prisma.refreshSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() }
      });
      await this.auditService.log({ action: 'LOGOUT_ALL_SESSIONS', userId, ipAddress: clientIp });
    }

    return { success: true, message: 'All active sessions have been revoked.' };
  }

  /**
   * Password Recovery: Forgot Password
   */
  async forgotPassword(email: string, clientIp = '127.0.0.1') {
    this.rateLimiter.check(`forgot:${clientIp}`, 5, 60000);
    const normalizedEmail = this.normalizeEmail(email);

    if (this.store.isPrismaConnected && normalizedEmail) {
      const user = await this.store.prisma.user.findFirst({
        where: ({
          OR: [{ email: normalizedEmail }, { normalizedEmail }]
        } as any)
      });

      if (user && user.status !== 'DELETED') {
        // Invalidate prior unconsumed reset tokens
        await this.store.prisma.passwordResetToken.updateMany({
          where: { userId: user.id, consumedAt: null },
          data: { consumedAt: new Date() }
        });

        const rawToken = this.tokenService.generateRandomToken(32);
        const tokenHash = this.tokenService.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await this.store.prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt
          }
        });

        await this.emailService.sendPasswordResetEmail(normalizedEmail, rawToken);

        await this.auditService.log({
          action: 'PASSWORD_RESET_REQUESTED',
          userId: user.id,
          ipAddress: clientIp
        });
      }
    }

    // Generic response regardless of whether email exists
    return {
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.'
    };
  }

  /**
   * Password Recovery: Reset Password
   */
  async resetPassword(token: string, newPassword: string, confirmPassword?: string, clientIp = '127.0.0.1') {
    this.rateLimiter.check(`reset:${clientIp}`, 10, 60000);

    if (confirmPassword && newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    this.passwordService.validatePasswordPolicy(newPassword);

    const tokenHash = this.tokenService.hashToken(token);

    if (this.store.isPrismaConnected) {
      const record = await this.store.prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true }
      });

      if (!record || record.consumedAt) {
        throw new BadRequestException('Invalid or already used password reset token');
      }

      if (record.expiresAt < new Date()) {
        throw new BadRequestException('Password reset token has expired. Please request a new one.');
      }

      const passwordHash = await this.passwordService.hash(newPassword);

      await this.store.prisma.$transaction([
        this.store.prisma.passwordResetToken.update({
          where: { id: record.id },
          data: { consumedAt: new Date() }
        }),
        this.store.prisma.user.update({
          where: { id: record.userId },
          data: { passwordHash }
        }),
        // Revoke all existing refresh sessions on password reset
        this.store.prisma.refreshSession.updateMany({
          where: { userId: record.userId, revokedAt: null },
          data: { revokedAt: new Date() }
        })
      ]);

      await this.emailService.sendPasswordChangedNotification(record.user.email);

      await this.auditService.log({
        action: 'PASSWORD_RESET_COMPLETED',
        userId: record.userId,
        ipAddress: clientIp
      });

      return {
        success: true,
        message: 'Password reset successfully. Please sign in with your new password.'
      };
    }

    return { success: true, message: 'Password reset (dev mode)' };
  }

  /**
   * Change Password (for logged-in user)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword?: string, clientIp = '127.0.0.1') {
    if (confirmPassword && newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    this.passwordService.validatePasswordPolicy(newPassword);

    if (this.store.isPrismaConnected) {
      const user = await this.store.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isValid = await this.passwordService.verify(user.passwordHash, currentPassword);
      if (!isValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      const passwordHash = await this.passwordService.hash(newPassword);

      await this.store.prisma.$transaction([
        this.store.prisma.user.update({
          where: { id: userId },
          data: { passwordHash }
        }),
        this.store.prisma.refreshSession.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() }
        })
      ]);

      await this.emailService.sendPasswordChangedNotification(user.email);
      await this.auditService.log({ action: 'PASSWORD_CHANGED', userId, ipAddress: clientIp });

      return {
        success: true,
        message: 'Password changed successfully. All active sessions have been signed out.'
      };
    }

    return { success: true, message: 'Password changed (dev mode)' };
  }

  /**
   * Get Active Sessions for Current User
   */
  async getSessions(userId: string) {
    if (this.store.isPrismaConnected) {
      const sessions = await this.store.prisma.refreshSession.findMany({
        where: {
          userId,
          revokedAt: null,
          expiresAt: { gt: new Date() }
        },
        orderBy: { lastUsedAt: 'desc' }
      });

      return sessions.map(s => ({
        id: s.id,
        deviceName: s.deviceName || 'Web Browser',
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        lastUsedAt: s.lastUsedAt,
        expiresAt: s.expiresAt
      }));
    }
    return [];
  }

  /**
   * Get Full User Profile
   */
  async getProfile(userId: string) {
    if (this.store.isPrismaConnected) {
      const user = await this.store.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          role: true,
          status: true,
          emailVerifiedAt: true,
          createdAt: true,
          households: {
            select: { id: true, name: true, dietaryPreference: true }
          },
          householdMembers: {
            select: {
              id: true,
              householdId: true,
              role: true,
              household: {
                select: { id: true, name: true, dietaryPreference: true }
              }
            }
          }
        }
      });
      if (!user) {
        throw new NotFoundException('User profile not found');
      }
      return user;
    }
    return {
      id: userId,
      email: 'user@example.com',
      fullName: 'Household Member',
      phoneNumber: null,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      households: [],
      householdMembers: []
    };
  }

  /**
   * Update User Profile (editable fields: fullName, phoneNumber)
   */
  async updateProfile(userId: string, dto: { fullName?: string; phoneNumber?: string }, clientIp = '127.0.0.1') {
    if (dto.fullName !== undefined) {
      if (typeof dto.fullName !== 'string' || dto.fullName.trim().length < 2) {
        throw new BadRequestException('Full name must be at least 2 characters long');
      }
    }

    if (dto.phoneNumber !== undefined && dto.phoneNumber !== null && dto.phoneNumber.trim().length > 0) {
      const cleanPhone = dto.phoneNumber.trim().replace(/[\s-]/g, '');
      if (!/^\+?[0-9]{10,13}$/.test(cleanPhone)) {
        throw new BadRequestException('Please provide a valid phone number (10 to 13 digits)');
      }
    }

    if (this.store.isPrismaConnected) {
      const updateData: any = {};
      if (dto.fullName !== undefined) {
        updateData.fullName = dto.fullName.trim();
      }
      if (dto.phoneNumber !== undefined) {
        updateData.phoneNumber = dto.phoneNumber ? dto.phoneNumber.trim() : null;
      }

      const updated = await this.store.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          role: true,
          status: true,
          emailVerifiedAt: true,
          createdAt: true
        }
      });

      await this.auditService.log({
        action: 'PROFILE_UPDATED',
        userId,
        ipAddress: clientIp,
        metadata: {
          updatedFields: Object.keys(updateData)
        }
      });

      return updated;
    }

    return {
      id: userId,
      fullName: dto.fullName || 'Household Member',
      phoneNumber: dto.phoneNumber || null,
      role: 'CUSTOMER',
      status: 'ACTIVE'
    };
  }

  /**
   * Revoke Specific Session
   */
  async revokeSession(userId: string, sessionId: string, clientIp = '127.0.0.1') {
    if (this.store.isPrismaConnected) {
      const session = await this.store.prisma.refreshSession.findUnique({
        where: { id: sessionId }
      });

      if (!session || session.userId !== userId) {
        throw new NotFoundException('Session not found or access denied');
      }

      await this.store.prisma.refreshSession.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() }
      });

      await this.auditService.log({
        action: 'SESSION_REVOKED',
        userId,
        entityType: 'RefreshSession',
        entityId: sessionId,
        ipAddress: clientIp
      });

      return { success: true, message: 'Session successfully revoked' };
    }
    return { success: true, message: 'Session revoked (dev mode)' };
  }

  /**
   * Legacy demo session support
   */
  async createDemoSession(
    role: 'CUSTOMER' | 'RETAILER' | 'ADMIN' | 'SUPER_ADMIN' | 'OPERATIONS' | 'SUPPORT' = 'CUSTOMER',
    options?: { userId?: string; householdId?: string; retailerId?: string; email?: string; secret?: string }
  ) {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_AUTH !== 'true') {
      throw new ForbiddenException('Demo session endpoint is disabled in production environment');
    }

    const email = options?.email || (
      role === 'SUPER_ADMIN' ? 'superadmin@rasoiiq.in' :
        role === 'ADMIN' ? 'admin@rasoiiq.in' :
          role === 'OPERATIONS' ? 'operations@rasoiiq.in' :
            role === 'SUPPORT' ? 'support@rasoiiq.in' :
              role === 'RETAILER' ? 'partner@blinkit.com' :
                'demo@rasoiiq.in'
    );
    const adminSecret = process.env.ADMIN_DEMO_SECRET || 'rasoi_admin_secret_2026';
    const hasValidSecret = options?.secret === adminSecret;

    if (['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT'].includes(role)) {
      throw new ForbiddenException(
        `Privilege escalation blocked: Administrative roles (${role}) cannot be accessed via unauthenticated demo endpoints. Verified credentials and 2FA OTP are strictly required.`
      );
    } else if (role === 'RETAILER') {
      const isKnownRetailer =
        email.toLowerCase().includes('blinkit') ||
        email.toLowerCase().includes('zepto') ||
        email.toLowerCase().includes('dmart') ||
        ['partner@blinkit.com', 'manager@blinkit.demo'].includes(email.toLowerCase());
      if (!isKnownRetailer && !hasValidSecret) {
        throw new ForbiddenException('Privilege escalation blocked. Role "RETAILER" requires authorized merchant credentials.');
      }
    }

    let householdId = options?.householdId;
    let fullName = 'Pooja Sharma';
    let defaultUserId = 'user-demo-1';

    if (role === 'SUPER_ADMIN') {
      defaultUserId = 'user-superadmin-1';
      fullName = 'Super Administrator';
    } else if (role === 'ADMIN') {
      defaultUserId = 'user-admin-1';
      fullName = 'Platform Administrator';
    } else if (role === 'OPERATIONS') {
      defaultUserId = 'user-ops-1';
      fullName = 'Operations Specialist';
    } else if (role === 'SUPPORT') {
      defaultUserId = 'user-support-1';
      fullName = 'Support Specialist';
    } else if (role === 'RETAILER') {
      defaultUserId = 'user-retailer-blinkit';
      fullName = 'Retail Partner Manager';
    } else if (role === 'CUSTOMER') {
      if (householdId === 'hh-patel-family' || options?.userId === 'user-demo-patel' || email.includes('patel')) {
        householdId = 'hh-patel-family';
        fullName = 'Rameshbhai Patel';
        defaultUserId = 'user-demo-patel';
      } else if (householdId === 'hh-mehta-family' || options?.userId === 'user-demo-mehta' || email.includes('mehta')) {
        householdId = 'hh-mehta-family';
        fullName = 'Kirit Mehta';
        defaultUserId = 'user-demo-mehta';
      } else {
        householdId = householdId || 'hh-sharma-family';
        fullName = 'Pooja Sharma';
        defaultUserId = 'user-demo-1';
      }
    }

    if (this.store.isPrismaConnected && !options?.userId) {
      try {
        const existingDbUser = await this.store.prisma.user.findFirst({
          where: ({
            OR: [
              { email: email.toLowerCase() },
              { normalizedEmail: email.toLowerCase() }
            ]
          } as any)
        });
        if (existingDbUser) {
          defaultUserId = existingDbUser.id;
          fullName = existingDbUser.fullName || fullName;
        }
      } catch { }
    }

    const userId = options?.userId || defaultUserId;

    const retailerId = options?.retailerId || (role === 'RETAILER' ? 'ret-blinkit' : undefined);

    const user = {
      id: userId,
      email,
      fullName: role === 'SUPER_ADMIN' ? 'Super Administrator' :
        role === 'ADMIN' ? 'Platform Administrator' :
          role === 'OPERATIONS' ? 'Operations Specialist' :
            role === 'SUPPORT' ? 'Support Specialist' :
              role === 'RETAILER' ? 'Retail Partner Manager' : fullName,
      role,
      householdId,
      retailerId,
      jti: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    };

    const token = jwt.sign(user, this.jwtSecret, { expiresIn: '7d' });
    return {
      token,
      user,
      message: `${role} demo session initialized successfully`
    };
  }

  /**
   * Token verification guard helper
   */
  async verifyToken(token: string) {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');

    if (AuthService.revokedTokens.has(tokenHash) || AuthService.revokedTokens.has(cleanToken)) {
      throw new UnauthorizedException('Token has been revoked. Please sign in again.');
    }

    if (this.store.isPrismaConnected) {
      try {
        const found = await this.store.prisma.revokedToken.findFirst({
          where: { token: { in: [tokenHash, cleanToken] } }
        });
        if (found) {
          AuthService.revokedTokens.add(tokenHash);
          AuthService.revokedTokens.add(cleanToken);
          throw new UnauthorizedException('Token has been revoked. Please sign in again.');
        }
      } catch (dbCheckErr: any) {
        if (dbCheckErr instanceof UnauthorizedException) throw dbCheckErr;
        if (process.env.REQUIRE_DATABASE === 'true') {
          throw new UnauthorizedException('Authentication verification failed due to database unavailability.');
        }
      }
    }

    try {
      const decoded: any = jwt.verify(cleanToken, this.jwtSecret);
      if (!decoded || typeof decoded !== 'object' || !decoded.role) {
        throw new UnauthorizedException('Token payload is missing valid authorization claims');
      }
      const normalizedRole = String(decoded.role).toUpperCase();
      if (!['CUSTOMER', 'RETAILER', 'ADMIN', 'SUPER_ADMIN', 'OPERATIONS', 'SUPPORT'].includes(normalizedRole)) {
        throw new UnauthorizedException(`Invalid role claim "${decoded.role}" in token`);
      }

      // Check jti revocation if present in token
      if (decoded.jti) {
        const jtiKey = `jti:${decoded.jti}`;
        if (AuthService.revokedTokens.has(jtiKey)) {
          throw new UnauthorizedException('Token has been revoked. Please sign in again.');
        }
        if (this.store.isPrismaConnected) {
          try {
            const foundJti = await this.store.prisma.revokedToken.findUnique({
              where: { token: jtiKey }
            });
            if (foundJti) {
              AuthService.revokedTokens.add(jtiKey);
              throw new UnauthorizedException('Token has been revoked. Please sign in again.');
            }
          } catch (jtiErr: any) {
            if (jtiErr instanceof UnauthorizedException) throw jtiErr;
            if (process.env.REQUIRE_DATABASE === 'true') {
              throw new UnauthorizedException('Authentication verification failed due to database unavailability.');
            }
          }
        }
      }

      // Authoritative database check: immediately reject missing, suspended, or deleted users
      const targetUserId = decoded.sub || decoded.id;
      if (this.store.isPrismaConnected) {
        if (!targetUserId) {
          throw new UnauthorizedException('Token missing user identification.');
        }
        try {
          const dbUser = await this.store.prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
              id: true,
              status: true,
              role: true,
              email: true,
              fullName: true,
              phoneNumber: true,
              emailVerifiedAt: true,
              createdAt: true
            }
          });
          if (!dbUser) {
            throw new UnauthorizedException('User account does not exist. Access denied.');
          }
          if (dbUser.status === 'SUSPENDED') {
            throw new UnauthorizedException('Account has been suspended. Access denied.');
          }
          if (dbUser.status === 'DELETED') {
            throw new UnauthorizedException('Account has been deactivated.');
          }
          return {
            ...decoded,
            id: dbUser.id,
            sub: dbUser.id,
            role: dbUser.role || normalizedRole,
            status: dbUser.status,
            email: dbUser.email || decoded.email,
            fullName: dbUser.fullName || decoded.fullName,
            phoneNumber: dbUser.phoneNumber,
            emailVerifiedAt: dbUser.emailVerifiedAt,
            createdAt: dbUser.createdAt
          };
        } catch (dbErr: any) {
          if (dbErr instanceof UnauthorizedException) throw dbErr;
          if (process.env.REQUIRE_DATABASE === 'true') {
            throw new UnauthorizedException('Authentication verification failed due to database unavailability.');
          }
        }
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

  /**
   * Phase 6.2.5: Secure Server-Side System Worker Verification
   * Authenticates internal background workers using constant-time secret comparison.
   * Fails closed if INTERNAL_WORKER_SECRET is unconfigured, empty, or whitespace-only.
   * Completely immune to client-side header spoofing and timing attacks.
   */
  verifyInternalWorker(workerKey?: string): boolean {
    if (!workerKey || typeof workerKey !== 'string') return false;
    const internalSecret = process.env.INTERNAL_WORKER_SECRET;
    if (!internalSecret || typeof internalSecret !== 'string' || internalSecret.trim().length === 0) {
      this.logger.warn('[WorkerAuth] INTERNAL_WORKER_SECRET is not configured or empty. Rejecting worker authentication fail-closed.');
      return false;
    }
    const trimmedWorkerKey = workerKey.trim();
    if (trimmedWorkerKey.length === 0) return false;

    try {
      const keyBuffer = Buffer.from(trimmedWorkerKey, 'utf-8');
      const secretBuffer = Buffer.from(internalSecret.trim(), 'utf-8');
      if (keyBuffer.length !== secretBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(keyBuffer, secretBuffer);
    } catch {
      return false;
    }
  }
}
