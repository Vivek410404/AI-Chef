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
  | 'RETAILER_APPROVED'
  | 'RETAILER_REJECTED'
  | 'RETAILER_SUSPENDED'
  | 'USER_SUSPENDED'
  | 'USER_REACTIVATED'
  | 'SESSIONS_REVOKED'
  | 'HOUSEHOLD_INSPECTED'
  | 'ORDER_STATUS_CHANGED'
  | 'RECIPE_CREATED'
  | 'RECIPE_MODIFIED'
  | 'RECIPE_ARCHIVED'
  | 'STAFF_CREATED'
  | 'STAFF_ROLE_CHANGED'
  | 'SETTINGS_UPDATED'
  | 'ADMIN_BOOTSTRAP'
  | (string & {});

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
        let validUserId: string | null = null;
        if (params.userId) {
          const userExists = await this.store.prisma.user.findUnique({
            where: { id: params.userId },
            select: { id: true }
          });
          if (userExists) {
            validUserId = userExists.id;
          } else {
            // Check if userId was passed as email
            const userByEmail = await this.store.prisma.user.findFirst({
              where: {
                OR: [
                  { email: params.userId.toLowerCase() },
                  { normalizedEmail: params.userId.toLowerCase() }
                ]
              },
              select: { id: true }
            });
            if (userByEmail) {
              validUserId = userByEmail.id;
            }
          }
        }

        const metadata = {
          ...(params.metadata || {}),
          actorId: params.userId || 'system'
        };

        await this.store.prisma.auditLog.create({
          data: {
            action: params.action,
            userId: validUserId,
            entityType: params.entityType,
            entityId: params.entityId,
            metadata,
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
