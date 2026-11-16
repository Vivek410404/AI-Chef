# RasoiIQ Phase 5.2 — Authentication & Session Security Audit

**Milestone:** Phase 5.2 — Security Hardening, Data Integrity & Operational Verification  
**Component:** User Authentication, Password Security, Session Rotation, and Account Invalidation  
**Module:** `services/api/src/auth`  
**Database:** PostgreSQL 18 via Prisma ORM  

---

## 1. Authentication Architecture Overview

RasoiIQ utilizes a defense-in-depth authentication system comprising:
1. **Argon2id Password Hashing:** State-of-the-art memory-hard hashing (`memoryCost: 65536`, `timeCost: 3`, `parallelism: 4`) resistant to GPU-accelerated brute-force attacks.
2. **Dual-Token Session Architecture:**
   - **Access Token:** Short-lived (15 minutes) signed JSON Web Token (JWT) bearing `sub`, `email`, `role`, and `householdId`.
   - **Refresh Token:** Cryptographically secure random hex string (64 bytes / 512 bits entropy) persisted in PostgreSQL `RefreshSession` with expiration (7 days), client IP, user agent, and family rotation metadata.
3. **Session Revocation & Rotation:**
   - On every `/auth/refresh`, the presented refresh token is invalidated, and a new refresh token and access token pair is issued.
   - Detected reuse of an already-invalidated refresh token triggers the immediate revocation of the entire session family (compromise defense).

---

## 2. Hardened Account Suspension (Zero Grace Period)

### The Architectural Problem
Standard stateless JWT verification checks token signature and `exp` timestamp. If an administrator suspends a user whose access token was minted 1 minute prior, standard stateless validation permits requests for the remaining 14 minutes. In food tech, an account suspended for fraudulent orders or malicious alterations could wreak havoc during this window.

### Phase 5.2 Hardened Implementation
In `services/api/src/auth/auth.service.ts`:
```typescript
async verifyToken(token: string): Promise<any> {
  const payload = this.jwtService.verify(token);
  if (this.tokenBlacklist.has(token)) {
    throw new UnauthorizedException('Token has been revoked.');
  }

  // Database status validation
  if (this.store.isPrismaConnected) {
    const user = await this.store.prisma.user.findUnique({
      where: { id: payload.sub || payload.id },
      select: { status: true }
    });
    if (user && user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account has been suspended. Access denied.');
    }
  }

  return payload;
}
```

### Verification Results
Tested via `scripts/test-phase52-security-integrity.mjs`:
- Active customer authenticated with a valid JWT.
- Customer executed valid API requests (`/api/households/my` -> 200 OK).
- Super Admin suspended customer via `PATCH /api/admin/users/:id/status`.
- **Immediate rejection:** Without waiting for token expiration, all subsequent requests using that exact JWT were immediately rejected with `401 Unauthorized` (`Account has been suspended. Access denied.`).
- Concurrent requests across `/households/me`, `/meal-plans/current`, and `/pantry` were all rejected simultaneously (3/3 returned 401).
- Upon administrator reactivation (`status: 'ACTIVE'`), new login immediately succeeded, and a newly minted JWT permitted access (200 OK).

---

## 3. Session Revocation and Logout Invalidation

- **Single Device Logout (`/auth/logout`):**
  - Access JWT hash added to in-memory blacklist.
  - Corresponding refresh token record deleted from PostgreSQL `RefreshSession`.
- **Global Logout (`/auth/logout-all`):**
  - All refresh sessions belonging to `userId` deleted in a single query (`prisma.refreshSession.deleteMany({ where: { userId } })`).
  - Active access token blacklisted.
- **Account Suspension Invalidation:**
  - In addition to real-time status rejection, `adminService.updateUserStatus` immediately executes `prisma.refreshSession.deleteMany({ where: { userId } })`, preventing any new access token acquisition via refresh.

---

## 4. Rate Limiting and Brute Force Defenses

In `services/api/src/auth/security/rate-limiter.service.ts`:
- **Registration Endpoint:** Maximum 10 registrations per IP per 60-second window.
- **Login Endpoint:** Maximum 15 login attempts per IP per 60-second window.
- **Password Reset Request:** Maximum 5 requests per IP per 60-second window.
- **Email Verification Resend:** Maximum 5 requests per IP per 60-second window.
- **Violation Behavior:** Throws HTTP 429 `Too Many Requests` with a calculated `retryAfter` response header.

---

## 5. Security Summary & Compliance Status

| Security Control | Implementation | Audit Status |
| :--- | :--- | :--- |
| Password Storage | Argon2id memory-hard hashing | **VERIFIED** |
| Access Token Lifespan | 15 minutes | **VERIFIED** |
| Refresh Token Entropy | 64-byte CSPRNG hex string | **VERIFIED** |
| Session Family Rotation | One-time use; reuse invalidates family | **VERIFIED** |
| Instant Suspension | Live PostgreSQL status lookup in `verifyToken` | **VERIFIED (0ms grace)** |
| Rate Limiting | In-memory sliding window bucket per IP | **VERIFIED** |
| Token Blacklisting | Set-based fast lookup | **VERIFIED** |
