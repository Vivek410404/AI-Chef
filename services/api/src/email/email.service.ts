import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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

    // If SMTP is configured in .env, send real transactional email
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const port = Number(process.env.SMTP_PORT) || 587;
        const secure = port === 465;
        const cleanUser = process.env.SMTP_USER.trim();
        const cleanPass = process.env.SMTP_PASS.trim().replace(/\s+/g, '');
        const cleanHost = process.env.SMTP_HOST.trim();

        const transporter = nodemailer.createTransport({
          host: cleanHost,
          port,
          secure,
          auth: {
            user: cleanUser,
            pass: cleanPass
          }
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"RasoiIQ" <${cleanUser}>`,
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html || payload.text.replace(/\n/g, '<br/>')
        });

        this.logger.log(`[EmailService] Real email successfully sent via SMTP to ${payload.to} (Subject: "${payload.subject}")`);
      } catch (err: any) {
        this.logger.error(`[EmailService] SMTP delivery failed to ${payload.to}: ${err.message}. Retaining in dev inbox.`);
      }
    }

    // Always retain in development inbox for instant on-screen verification backup
    EmailService.devInbox.unshift(emailRecord);
    if (EmailService.devInbox.length > 50) {
      EmailService.devInbox.pop();
    }
    if (payload.link) {
      this.logger.log(`[EmailService] Verification/Action Link: ${payload.link}`);
    }
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
