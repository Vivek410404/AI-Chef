# RasoiIQ Phase 5.0 — Session Management & Token Security

## 1. Dual-Token Architecture

RasoiIQ separates short-lived stateless authorization from long-lived stateful refresh sessions.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Browser / Mobile App
    participant API as NestJS API
    participant DB as PostgreSQL 18

    Note over Client,API: User Login
    Client->>API: POST /api/auth/login { email, password }
    API->>API: Verify password via Argon2id
    API->>API: Generate 15m Access JWT & 64-hex Refresh Token
    API->>DB: INSERT RefreshSession (tokenHash, tokenFamilyId, expires 7d)
    API-->>Client: 200 OK + Set-Cookie: rasoi_refresh_token (HttpOnly)

    Note over Client,API: Accessing Protected Endpoints
    Client->>API: GET /api/households/me (Bearer JWT)
    API->>API: Cryptographically verify signature & expiration
    API-->>Client: 200 OK (Household Data)

    Note over Client,API: Token Refresh (Rotation & Replay Detection)
    Client->>API: POST /api/auth/refresh { refreshToken }
    API->>DB: Lookup session by SHA-256(refreshToken)
    alt Session Valid & Unrevoked
        API->>DB: Set old session revokedAt = NOW()
        API->>DB: INSERT new RefreshSession (new hash, same tokenFamilyId)
        API-->>Client: 200 OK (New Access JWT + New Refresh Token)
    else Session Already Revoked (Replay Attack Detected!)
        API->>DB: REVOKE ALL sessions where tokenFamilyId = session.tokenFamilyId
        API->>DB: INSERT AuditLog (REFRESH_REPLAY_DETECTED)
        API-->>Client: 401 Unauthorized (Security Replay Alert)
    end
```

## 2. Token Specifications & Claims

### 2.1 Access Token (JWT)
- **Signature**: HMAC-SHA256 (`HS256`)
- **TTL**: 15 minutes (`900` seconds)
- **Payload Claims**:
  - `sub`: User ID
  - `email`: User primary email
  - `role`: System role (`CUSTOMER`, `RETAILER`, `ADMIN`)
  - `householdId`: Default primary household association
  - `retailerId`: Merchant partner identifier (if retailer)
  - `jti`: Cryptographically random UUID for server-side revocation tracking
  - `iat` / `exp`: Standard issued-at and expiration timestamps

### 2.2 Refresh Token
- **Entropy**: 64 hexadecimal characters generated from `crypto.randomBytes(32)` (256 bits of cryptographic entropy).
- **Storage**: Raw plaintext tokens are NEVER stored in the database. Only the SHA-256 digest (`crypto.createHash('sha256').update(token).digest('hex')`) is persisted in `RefreshSession.tokenHash`.
- **TTL**: 7 days (`604,800` seconds).
- **Transport**: Stored in `HttpOnly`, `SameSite=Lax`, `Secure` (in production) cookies, and returned in the JSON response payload.

## 3. Replay Detection & Token Families
When an attacker intercepts a refresh token and attempts to use it after the legitimate client has already rotated it:
1. The server detects that `revokedAt` is not null.
2. The server identifies the `tokenFamilyId`.
3. An immediate revocation query terminates **all sessions** sharing that `tokenFamilyId`:
   ```sql
   UPDATE "RefreshSession" SET "revokedAt" = NOW() WHERE "tokenFamilyId" = $1;
   ```
4. An audit event `REFRESH_REPLAY_DETECTED` is recorded.
5. Both the legitimate client and the attacker receive HTTP 401 Unauthorized, forcing re-authentication.

## 4. Revocation Capabilities
- **Single-Device Logout**: `POST /api/auth/logout` revokes the specific session and blacklists the current JWT access token `jti`.
- **Global Logout**: `POST /api/auth/logout-all` invalidates every active refresh session for the authenticated user across all devices.
- **Selective Session Management**: `DELETE /api/auth/sessions/:sessionId` allows users to remotely terminate specific stale or unfamiliar devices from their account settings.
