import { Injectable, Logger } from '@nestjs/common';
import { StoreService } from '../../data/store.service';

export type AuditAction =
  | 'REGISTER'
  | 'EMAIL_VERIFIED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'LOGOUT_ALL_SESSIONS'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'PASSWORD_CHANGED'
  | 'SESSION_REVOKED'
  | 'REFRESH_TOKEN_REPLAY_DETECTED'
  | 'HOUSEHOLD_CREATED'
  | 'HOUSEHOLD_INVITATION_SENT'
  | 'HOUSEHOLD_INVITATION_ACCEPTED'
  | 'HOUSEHOLD_INVITATION_REVOKED'
  | 'HOUSEHOLD_MEMBER_REMOVED'
  | 'RETAILER_APPLICATION_SUBMITTED'
  | 'RETAILER_APPLICATION_REVIEWED'
  | 'ADMIN_BOOTSTRAP';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly store: StoreService) {}

  async log(params: {
    action: AuditAction;
    userId?: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      if (this.store.isPrismaConnected) {
        await this.store.prisma.auditLog.create({
          data: {
            action: params.action,
            userId: params.userId,
            entityType: params.entityType,
            entityId: params.entityId,
            metadata: params.metadata || {},
            ipAddress: params.ipAddress,
            userAgent: params.userAgent
          }
        });
      }
      this.logger.log(`[Audit] ${params.action} - User: ${params.userId || 'anonymous'} ${params.entityId ? `Target: ${params.entityId}` : ''}`);
    } catch (err: any) {
      this.logger.warn(`Failed to persist audit log: ${err.message}`);
    }
  }
}
