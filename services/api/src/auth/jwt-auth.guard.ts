import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const cookieToken = request.cookies?.rasoi_access_token;

    if (!authHeader && !cookieToken) {
      throw new UnauthorizedException('Authentication token required');
    }

    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : cookieToken;
    const user: any = await this.authService.verifyToken(token);
    request.user = user;
    return true;
  }
}
