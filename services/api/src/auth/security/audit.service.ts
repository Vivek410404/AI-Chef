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

function sanitizeMetadata(obj: any, depth = 0): any {
  if (depth > 8) return '[TRUNCATED_MAX_DEPTH]';
  if (!obj || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      if (/eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/.test(obj)) {
        return '[REDACTED_JWT_TOKEN]';
      }
      if (/bearer\s+[a-zA-Z0-9._-]+/i.test(obj)) {
        return '[REDACTED_BEARER_TOKEN]';
      }
      if (obj.length > 2000) {
        return obj.slice(0, 2000) + '...[TRUNCATED]';
      }
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length > 50) {
      return obj.slice(0, 50).map(item => sanitizeMetadata(item, depth + 1)).concat(['[TRUNCATED_ARRAY]']);
    }
    return obj.map(item => sanitizeMetadata(item, depth + 1));
  }

  const sanitized: Record<string, any> = {};
  const entries = Object.entries(obj).slice(0, 100);
  for (const [key, value] of entries) {
    const lower = key.toLowerCase();
    if (
      lower.includes('password') ||
      lower.includes('token') ||
      lower.includes('secret') ||
      lower.includes('credential') ||
      lower.includes('authorization') ||
      lower.includes('cookie') ||
      lower.includes('creditcard') ||
      lower.includes('cvv') ||
      lower.includes('apikey') ||
      lower.includes('api_key') ||
      lower.includes('hash') ||
      lower.includes('privatekey')
    ) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeMetadata(value, depth + 1);
    } else if (typeof value === 'string') {
      if (/eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/.test(value)) {
        sanitized[key] = '[REDACTED_JWT_TOKEN]';
      } else if (/bearer\s+[a-zA-Z0-9._-]+/i.test(value)) {
        sanitized[key] = '[REDACTED_BEARER_TOKEN]';
      } else if (value.length > 2000) {
        sanitized[key] = value.slice(0, 2000) + '...[TRUNCATED]';
      } else {
        sanitized[key] = value;
      }
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

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
            const userByEmail = await (this.store.prisma.user as any).findFirst({
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

        const sanitizedMeta = sanitizeMetadata(params.metadata || {});
        const metadata = {
          ...sanitizedMeta,
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
