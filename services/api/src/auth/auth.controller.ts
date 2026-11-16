import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Headers,
  Req,
  Res,
  Query,
  Ip,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  RefreshTokenDto
} from './dto/auth-actions.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractClientIp(req: Request, ip?: string): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return ip || req.ip || '127.0.0.1';
  }

  private setAuthCookies(res: Response, accessToken?: string, refreshToken?: string) {
    const isProd = process.env.NODE_ENV === 'production';
    if (accessToken) {
      res.cookie('rasoi_access_token', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000 // 15 mins
      });
    }
    if (refreshToken) {
      res.cookie('rasoi_refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('rasoi_access_token', { path: '/' });
    res.clearCookie('rasoi_refresh_token', { path: '/' });
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Ip() ip: string) {
    const clientIp = this.extractClientIp(req, ip);
    return this.authService.register(dto, clientIp);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: Request, @Ip() ip: string) {
    const clientIp = this.extractClientIp(req, ip);
    return this.authService.verifyEmail(dto.token, clientIp);
  }

  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto, @Req() req: Request, @Ip() ip: string) {
    const clientIp = this.extractClientIp(req, ip);
    return this.authService.resendVerification(dto.email, clientIp);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string
  ) {
    const clientIp = this.extractClientIp(req, ip);
    const userAgent = req.headers['user-agent'];
    const result: any = await this.authService.login(dto, undefined, clientIp, userAgent);

    if (result.accessToken || result.token) {
      this.setAuthCookies(res, result.accessToken || result.token, result.refreshToken);
    }

    return result;
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string
  ) {
    const clientIp = this.extractClientIp(req, ip);
    const userAgent = req.headers['user-agent'];
    const refreshToken = dto?.refreshToken || (req as any).cookies?.rasoi_refresh_token;

    const result = await this.authService.refresh(refreshToken, clientIp, userAgent);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post('logout')
  async logout(
    @Headers('authorization') authHeader: string,
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string
  ) {
    const clientIp = this.extractClientIp(req, ip);
    const token = authHeader || ((req as any).cookies?.rasoi_access_token ? `Bearer ${(req as any).cookies.rasoi_access_token}` : undefined);
    const refreshToken = dto?.refreshToken || (req as any).cookies?.rasoi_refresh_token;

    this.clearAuthCookies(res);
    return this.authService.logout(token, refreshToken, clientIp);
  }

  @Post('logout-all')
  async logoutAll(
    @Headers('authorization') authHeader: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string
  ) {
    const clientIp = this.extractClientIp(req, ip);
    const token = authHeader?.replace(/^Bearer\s+/i, '') || (req as any).cookies?.rasoi_access_token;
    if (!token) {
      throw new UnauthorizedException('Authentication token required');
    }

    const user: any = await this.authService.verifyToken(token);
    this.clearAuthCookies(res);
    return this.authService.logoutAll(user.id || user.sub, authHeader, clientIp);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request, @Ip() ip: string) {
    const clientIp = this.extractClientIp(req, ip);
    return this.authService.forgotPassword(dto.email, clientIp);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request, @Ip() ip: string) {
    const clientIp = this.extractClientIp(req, ip);
    return this.authService.resetPassword(dto.token, dto.newPassword, dto.confirmPassword, clientIp);
  }

  @Post('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Headers('authorization') authHeader: string,
    @Req() req: Request,
    @Ip() ip: string
  ) {
    const clientIp = this.extractClientIp(req, ip);
    const token = authHeader?.replace(/^Bearer\s+/i, '') || (req as any).cookies?.rasoi_access_token;
    if (!token) {
      throw new UnauthorizedException('Authentication token required');
    }
    const user: any = await this.authService.verifyToken(token);
    return this.authService.changePassword(user.id || user.sub, dto.currentPassword, dto.newPassword, dto.confirmPassword, clientIp);
  }

  @Get('me')
  async getMe(@Headers('authorization') authHeader: string, @Req() req: Request) {
    const token = authHeader?.replace(/^Bearer\s+/i, '') || (req as any).cookies?.rasoi_access_token;
    if (!token) {
      if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_AUTH === 'true') {
        return (await this.authService.createDemoSession()).user;
      }
      throw new UnauthorizedException('Authentication required');
    }
    return this.authService.verifyToken(token);
  }

  @Get('sessions')
  async getSessions(@Headers('authorization') authHeader: string, @Req() req: Request) {
    const token = authHeader?.replace(/^Bearer\s+/i, '') || (req as any).cookies?.rasoi_access_token;
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }
    const user: any = await this.authService.verifyToken(token);
    return this.authService.getSessions(user.id || user.sub);
  }

  @Delete('sessions/:sessionId')
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @Headers('authorization') authHeader: string,
    @Req() req: Request,
    @Ip() ip: string
  ) {
    const clientIp = this.extractClientIp(req, ip);
    const token = authHeader?.replace(/^Bearer\s+/i, '') || (req as any).cookies?.rasoi_access_token;
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }
    const user: any = await this.authService.verifyToken(token);
    return this.authService.revokeSession(user.id || user.sub, sessionId, clientIp);
  }

  /**
   * Backward-compatible demo session endpoint for test suites
   */
  @Post('demo-session')
  async createDemoSession(
    @Query('role') queryRole?: 'CUSTOMER' | 'RETAILER' | 'ADMIN' | 'SUPER_ADMIN' | 'OPERATIONS' | 'SUPPORT',
    @Body() body?: { role?: 'CUSTOMER' | 'RETAILER' | 'ADMIN' | 'SUPER_ADMIN' | 'OPERATIONS' | 'SUPPORT'; userId?: string; householdId?: string; retailerId?: string; email?: string; secret?: string }
  ) {
    const role = queryRole || body?.role || 'CUSTOMER';
    return this.authService.createDemoSession(role, body);
  }
}
