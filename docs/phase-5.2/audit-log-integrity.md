# RasoiIQ Phase 5.2 — Audit Log Integrity & Credential Redaction Audit

**Milestone:** Phase 5.2 — Security Hardening, Data Integrity & Operational Verification  
**Module:** `services/api/src/auth/security/audit.service.ts`  
**Storage:** PostgreSQL `AuditLog` Table via Prisma ORM  

---

## 1. Audit Logging Architecture

RasoiIQ maintains an append-only security and operational audit trail persisted directly in PostgreSQL via the `AuditLog` model:

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String   // e.g. AUTH_LOGIN, USER_STATUS_CHANGE, SUPPORT_HOUSEHOLD_INSPECTED
  entityType String   // e.g. USER, HOUSEHOLD, RETAILER, ORDER
  entityId   String?
  metadata   Json?    // Context dictionary: IP, user agent, changes, reason
  createdAt  DateTime @default(now())
}
```

### Purpose and Coverage
The audit system tracks critical events:
- Authentication events (login success, login failure, password resets, token refreshes, session revocations)
- Administrative actions (user status updates, role modifications, staff provisioning, settings updates)
- Retailer onboarding (application submission, review, approval, rejection)
- Support inspections (household inspections with associated ticket reasons)

---

## 2. Sensitive Data Sanitization Safeguards

### Pre-Hardening Risk
If upstream controllers or services pass raw payload objects (such as registration DTOs, login payloads, or credentials) into `auditService.log()`, plaintext passwords, password hashes, JWT tokens, and authorization cookies could be committed into PostgreSQL JSON metadata columns. Any internal staff member with database read access or admin audit viewer access could read these credentials.

### Hardened Implementation in Phase 5.2
In `services/api/src/auth/security/audit.service.ts`:
```typescript
private sanitizeMetadata(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(item => this.sanitizeMetadata(item));
  }

  const SENSITIVE_KEYS = [
    'password', 'confirmpassword', 'newpassword', 'currentpassword',
    'hash', 'passwordhash', 'token', 'refreshtoken', 'accesstoken',
    'secret', 'authorization', 'cookie', 'credentials', 'apikey'
  ];

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(k => lowerKey.includes(k));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = this.sanitizeMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
```

This method is invoked recursively before creating the Prisma `auditLog` record:
```typescript
const sanitizedMetadata = metadata ? this.sanitizeMetadata(metadata) : undefined;
await this.prisma.auditLog.create({
  data: {
    userId,
    action,
    entityType,
    entityId,
    metadata: sanitizedMetadata,
  }
});
```

---

## 3. Database Audit Verification

In `scripts/test-phase52-security-integrity.mjs` (Category 7):
1. **Audit Stream Population:** Verified that real audit entries exist in PostgreSQL (`AuditLog.count() > 0`).
2. **Exhaustive Redaction Verification:** Inspected all recent PostgreSQL audit log rows across registration, login, and admin actions.
   - Evaluated serialized JSON string representations of `metadata`.
   - Confirmed that keys matching passwords, secrets, tokens, or hashes are replaced with `[REDACTED]`.
   - Zero occurrences of plaintext test passwords (`Password123!@#`, `VictimPassword123!@#`) or unmasked JWT tokens were found in PostgreSQL.
3. **Immutability:** No API endpoint exists allowing modification or deletion of `AuditLog` rows. The table operates strictly as append-only.
