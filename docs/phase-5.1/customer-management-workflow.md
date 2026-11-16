# RasoiIQ Phase 5.1 — Customer Management & Account Security Workflow

**Document Version:** 1.0.0  
**Phase:** 5.1  
**Date:** November 2026  
**Audience:** Customer Support Specialists, Platform Administrators, Security Operations

---

## 1. Customer Account Lifecycle

```
    [Public Registration]
             |
             v
    [PENDING_VERIFICATION] ---> Resend Verification Link (Admin/Support)
             |
     (Email Verified)
             |
             v
         [ACTIVE] <========================+
             |                             |
      (Suspension Action)         (Reactivation Action)
             |                             |
             v                             |
        [SUSPENDED] -----------------------+
   (Sessions & Refresh
     Tokens Revoked)
```

---

## 2. Searching & Filtering User Accounts

Navigate to **Users** (`/admin/users`):
- **Full-Text Search:** Enter customer name, email address, or phone number in the search bar.
- **Role Filter:** Filter by `CUSTOMER`, `RETAILER`, `ADMIN`, `OPERATIONS`, `SUPPORT`, or `SUPER_ADMIN`.
- **Status Filter:** Filter by `ACTIVE`, `SUSPENDED`, or `PENDING_VERIFICATION`.
- **Server Pagination:** Results are paginated with `page` and `limit` query parameters, ensuring fast load times.

---

## 3. Account Suspension & Immediate Invalidation

When an account is flagged for abuse, security violation, or payment anomaly, authorized administrators (`ADMIN` or `SUPER_ADMIN`) can suspend the account.

### Step-by-Step Suspension Procedure
1. Locate the target user in the Users directory.
2. Click the **Ban/Suspend** icon in the Actions column.
3. In the suspension modal, enter a **Mandatory Reason for Suspension** (e.g., `"Unusual order velocity from unverified IP"`).
4. Click **Confirm Suspension**.

### Security Actions Triggered Upon Suspension
1. User's database status is transitioned to `SUSPENDED`.
2. `suspensionReason`, `suspendedAt`, and `suspendedBy` are recorded on the `User` record.
3. **Atomic Session Revocation:** All active JWT refresh tokens in `RefreshSession` and active sessions in `Session` for that user are deleted immediately.
4. If the suspended user attempts to refresh their access token or log in, the API immediately rejects the request with HTTP 403 Forbidden.
5. An audit log event `USER_SUSPENDED` is recorded in `AuditLog` with structured metadata.

### Built-in Safety Guards
- **Self-Suspension Protection:** Administrators cannot suspend their own account. The API responds with `400 Bad Request` ("Administrators cannot suspend their own account").
- **Hierarchy Defense:** A regular `ADMIN` cannot suspend a `SUPER_ADMIN`. The API responds with `403 Forbidden` ("Only Super Administrators can modify administrator account status").

---

## 4. Account Reactivation Procedure

1. In the Users directory, locate the user with status `SUSPENDED`.
2. Click the green **Reactivate** icon.
3. Confirm reactivation in the modal.
4. User status is restored to `ACTIVE`.
5. `suspensionReason`, `suspendedAt`, and `suspendedBy` are cleared to null.
6. An audit log event `USER_REACTIVATED` is recorded.
7. The user can now log in normally.

---

## 5. Emergency Session Invalidation (`/revoke-sessions`)

If a customer reports a compromised password or lost mobile device:
1. Locate the customer profile.
2. Click the **Key / Revoke Sessions** icon.
3. Confirm the action.
4. All refresh sessions and device session tokens for this user are purged from PostgreSQL.
5. All devices are immediately logged out upon their next access token expiration (maximum 15 minutes).
6. An audit log event `SESSIONS_REVOKED` is recorded.

---

## 6. Resending Verification Links

For customers stuck in `PENDING_VERIFICATION`:
1. Support specialists can click the **Mail / Resend Verification** icon.
2. A new secure random 32-byte verification token is generated, hashed, and stored in `EmailVerificationToken`.
3. An email is dispatched with the fresh verification link.
