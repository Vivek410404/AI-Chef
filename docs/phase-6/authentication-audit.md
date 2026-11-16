# RasoiIQ Phase 6.0 — Authentication & Account Lifecycle Audit

**Milestone:** Phase 6.0 Controlled Household Pilot Readiness  
**Target:** 3 Supervised Households  
**Scope:** Public Registration, Authentication, Password Security, Sessions, Tokens, and Suspension  

---

## 1. Executive Summary

The authentication subsystem was independently audited against modern cryptographic standards and multi-tenant security requirements. RasoiIQ enforces strict fail-closed security, Argon2id hashing, cryptographic single-use verification tokens, rotating refresh sessions with replay detection, and instantaneous token invalidation upon account suspension.

---

## 2. Requirements & Verification Matrix

| Requirement | Implementation Details | Evidence Command / Test | Status |
| :--- | :--- | :--- | :--- |
| **Argon2id Hashing** | Uses `argon2` with `argon2id` variant, 64 MB memory cost (`m=65536`), 3 iterations (`t=3`), parallelism 1. Verified via `$argon2id$` hash prefix in PostgreSQL. | `node scripts/verify-phase6-pilot-readiness.mjs` (Section 2) | PASS |
| **Password Policy** | Minimum 12 characters, maximum 256 characters. Unicode and long passphrases allowed. Common weak passwords rejected via wordlist. | Tested short password (`short`), server returned 400 Bad Request. | PASS |
| **No Plaintext Passwords** | Passwords hashed prior to DB persistence. Plaintext passwords never stored in DB, logs, or audit metadata. | Inspected PostgreSQL `User` and `AuditLog` tables; 0 plaintext matches. | PASS |
| **Terms of Service** | Explicit customer consent required (`acceptTerms: true`). Rejected if false or omitted. | Tested with `acceptTerms: false`; server returned 400 Bad Request. | PASS |
| **Single-Use Email Tokens** | Cryptographically random 32-byte hex tokens, stored as SHA-256 hashes with 30-minute expiry. `consumedAt` timestamp set upon activation. | Inspected `EmailVerificationToken` table in PostgreSQL. | PASS |
| **Password Reset Security** | 15-minute token expiry. Single-use. On completion, immediately revokes all active `RefreshSession` records for the user. | Code audit of `AuthService.resetPassword()`. | PASS |
| **Suspended Account Rejection** | Login rejects accounts with `status: SUSPENDED` or `DELETED` with 403 Forbidden. | Tested suspended user login; rejected with 403. | PASS |
| **Instant Suspension Enforcement** | `AuthService.verifyToken()` queries PostgreSQL directly for user status on protected requests. Suspension takes effect immediately. | Tested active JWT after suspension; rejected across 4/4 endpoints. | PASS |
| **Rotating Refresh Tokens** | Every call to `POST /auth/refresh` invalidates the old token and issues a new token in the same family. | Inspected `RefreshSession` table and verified distinct new token hash. | PASS |
| **Replay Attack Detection** | Reusing an already-rotated refresh token revokes all descendant sessions in that family and logs a security incident. | Tested replaying used token; returned 401 and invalidated session family. | PASS |
| **Session Self-Management** | Customers can inspect active devices (`GET /auth/sessions`) and revoke specific sessions (`POST /auth/sessions/:id/revoke`). | Verified endpoint availability and authorization guard. | PASS |
| **Household Invitations** | Cryptographic 32-byte tokens, 48-hour expiration, single-use, role assignment restricted to OWNER. | Verified in `HouseholdService.createInvitation()`. | PASS |
| **No Public Admin Registration** | Public registration endpoint strictly forces `role: 'CUSTOMER'`. Administrative roles cannot be registered over the web. | Inspected `AuthService.register()`; role hardcoded to `'CUSTOMER'`. | PASS |
| **Secure Admin Bootstrap** | Administrative accounts initialized via audited CLI tool (`node scripts/bootstrap-admin.mjs`) requiring direct host access. | Verified CLI script and database execution. | PASS |

---

## 3. Cryptographic Implementation Details

### Password Hashing Specification
```typescript
// services/api/src/auth/security/password.service.ts
await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 3,       // 3 iterations
  parallelism: 1
});
```

### Access Token & Refresh Session Lifecycle
- **Access JWT:** 15-minute validity (`expiresIn: '15m'`), signed with HMAC-SHA256, carrying unique `jti`.
- **Refresh Token:** Cryptographically random 64-character token with SHA-256 hash stored in `RefreshSession` table. Valid for 7 days.
- **Revocation:** Persistent `RevokedToken` table in PostgreSQL caches explicitly logged-out JWT JTIs and tokens until expiration.

---

## 4. Operational Recommendations for Pilot

1. **Email Service in Pilot:** Ensure development/pilot email preview URLs are visible to the supervisor during household onboarding.
2. **Password Assistance:** If a pilot user forgets their password, guide them through the self-service reset flow rather than manual database edits.
3. **Session Monitoring:** Monitor `AuditLog` for `REFRESH_TOKEN_REPLAY_DETECTED` events during daily reviews.
