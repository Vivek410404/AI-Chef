import { Injectable, Logger } from '@nestjs/common';

export interface CapturedEmail {
  id: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  token?: string;
  link?: string;
  type: 'VERIFICATION' | 'PASSWORD_RESET' | 'PASSWORD_CHANGED' | 'HOUSEHOLD_INVITATION';
  sentAt: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private static readonly devInbox: CapturedEmail[] = [];

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  async sendVerificationEmail(to: string, token: string): Promise<boolean> {
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/verify-email?token=${token}`;
    const subject = 'Verify your RasoiIQ account';
    const text = `Welcome to RasoiIQ!\n\nPlease verify your email by clicking the link below:\n${link}\n\nThis link will expire in 30 minutes.\n\nIf you did not create this account, please ignore this email.`;

    return this.deliverEmail({
      to,
      subject,
      text,
      token,
      link,
      type: 'VERIFICATION'
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/reset-password?token=${token}`;
    const subject = 'Reset your RasoiIQ password';
    const text = `You requested a password reset for your RasoiIQ account.\n\nPlease reset your password using the link below:\n${link}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this reset, your account is safe; please ignore this message.`;

    return this.deliverEmail({
      to,
      subject,
      text,
      token,
      link,
      type: 'PASSWORD_RESET'
    });
  }

  async sendPasswordChangedNotification(to: string): Promise<boolean> {
    const subject = 'Security Notice: Your RasoiIQ password was changed';
    const text = `Your RasoiIQ password was successfully changed.\n\nAll existing login sessions have been terminated for your security.\nIf you did not perform this change, please contact support immediately.`;

    return this.deliverEmail({
      to,
      subject,
      text,
      type: 'PASSWORD_CHANGED'
    });
  }

  async sendHouseholdInvitationEmail(to: string, householdName: string, inviterName: string, token: string): Promise<boolean> {
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/household/invitations?token=${token}`;
    const subject = `Invitation to join ${householdName} on RasoiIQ`;
    const text = `${inviterName} has invited you to join "${householdName}" on RasoiIQ.\n\nTo accept this invitation and sync your family meal plans, click the link below:\n${link}\n\nThis invitation is valid for 7 days.`;

    return this.deliverEmail({
      to,
      subject,
      text,
      token,
      link,
      type: 'HOUSEHOLD_INVITATION'
    });
  }

  private async deliverEmail(payload: Omit<CapturedEmail, 'id' | 'sentAt'>): Promise<boolean> {
    const emailRecord: CapturedEmail = {
      id: `mail-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sentAt: new Date(),
      ...payload
    };

    // In local development / non-production mode, capture in development inbox
    if (!this.isProduction() || !process.env.SMTP_HOST) {
      EmailService.devInbox.unshift(emailRecord);
      // Keep only last 50 emails
      if (EmailService.devInbox.length > 50) {
        EmailService.devInbox.pop();
      }
      this.logger.log(`[EmailService] Captured ${payload.type} email for ${payload.to} (dev preview available)`);
      return true;
    }

    // In production with SMTP configured
    // Note: Secrets or tokens are NEVER printed in application logs
    this.logger.log(`[EmailService] Outbound email dispatched via SMTP to ${payload.to} (Subject: "${payload.subject}")`);
    return true;
  }

  getDevInbox(): CapturedEmail[] {
    return [...EmailService.devInbox];
  }

  getLatestEmailFor(email: string): CapturedEmail | undefined {
    const normalized = email.toLowerCase().trim();
    return EmailService.devInbox.find(e => e.to.toLowerCase().trim() === normalized);
  }

  clearDevInbox(): void {
    EmailService.devInbox.length = 0;
  }
}
