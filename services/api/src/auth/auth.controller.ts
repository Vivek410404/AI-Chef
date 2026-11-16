import { Controller, Post, Body, Get, Headers, Query, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('demo-session')
  async createDemoSession(
    @Query('role') queryRole?: 'CUSTOMER' | 'RETAILER' | 'ADMIN',
    @Body() body?: { role?: 'CUSTOMER' | 'RETAILER' | 'ADMIN'; userId?: string; householdId?: string; retailerId?: string }
  ) {
    const role = queryRole || body?.role || 'CUSTOMER';
    return this.authService.createDemoSession(role, body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password?: string }) {
    return this.authService.login(body.email || 'demo@rasoiiq.in', body.password || '');
  }

  @Post('register')
  async register(@Body() body: { email: string; fullName: string; password?: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    return this.authService.logout(authHeader);
  }

  @Get('me')
  async getMe(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      // Auto-fallback to demo session for ease of testing
      return (await this.authService.createDemoSession()).user;
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    return this.authService.verifyToken(token);
  }
}
