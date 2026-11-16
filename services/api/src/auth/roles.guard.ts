import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { AuthService } from './auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles specified, route is public or customer default
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const cookieToken = request.cookies?.rasoi_access_token;

    if (!authHeader && !cookieToken) {
      throw new UnauthorizedException('Authentication token required for protected administrative routes');
    }

    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : cookieToken;
    const user: any = await this.authService.verifyToken(token);
    request.user = user;

    const userRole = (user.role || 'CUSTOMER').toUpperCase();
    const hasRole = requiredRoles.map(r => r.toUpperCase()).includes(userRole);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Role "${userRole}" lacks required permissions: [${requiredRoles.join(', ')}]`
      );
    }

    return true;
  }
}
