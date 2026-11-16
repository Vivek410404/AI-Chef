import { Controller, Get, Delete, Query, ForbiddenException } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('dev/emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  getCapturedEmails(@Query('email') email?: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Development email preview endpoint is strictly disabled in production.');
    }

    if (email) {
      const found = this.emailService.getLatestEmailFor(email);
      return found ? [found] : [];
    }

    return this.emailService.getDevInbox();
  }

  @Delete()
  clearCapturedEmails() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Development email preview endpoint is strictly disabled in production.');
    }
    this.emailService.clearDevInbox();
    return { success: true, message: 'Dev email inbox cleared' };
  }
}
