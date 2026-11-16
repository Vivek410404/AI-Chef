import { Module, Global } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { PasswordService } from './security/password.service';
import { TokenService } from './security/token.service';
import { RateLimiterService } from './security/rate-limiter.service';
import { AuditService } from './security/audit.service';
import { EmailModule } from '../email/email.module';

@Global()
@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    RolesGuard,
    PasswordService,
    TokenService,
    RateLimiterService,
    AuditService
  ],
  exports: [
    AuthService,
    RolesGuard,
    PasswordService,
    TokenService,
    RateLimiterService,
    AuditService
  ]
})
export class AuthModule {}
