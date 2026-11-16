# RasoiIQ Phase 5.2 — Baseline Architecture & Security Audit

**Milestone:** Phase 5.2 — Security Hardening, Data Integrity & Operational Verification  
**Date:** November 2026  
**Auditor:** Senior Full-Stack Architect & Security Reviewer  
**Scope:** Pre-hardening audit of Phase 5.0 Authentication & Phase 5.1 Admin Console  
**Database:** PostgreSQL 18 on WSL2 (`rasoi_iq`) via Prisma ORM  
**Budget / Cost Constraint:** ₹0 / $0 additional spend  

---

## 1. Executive Summary

Prior to applying Phase 5.2 hardening measures, an exhaustive inspection of the RasoiIQ monorepo (`apps/customer-web`, `services/api`, and `packages/database`) was conducted to evaluate the actual security posture, relational data persistence, and isolation guarantees delivered in Phases 5.0 and 5.1.

While Phase 5.0 successfully introduced Argon2id password hashing, email verification, and session refresh rotation, and Phase 5.1 introduced an administrative console with role guards across six platform roles, the audit revealed several critical architectural and security vulnerabilities that had to be addressed before deploying to pilot households.

---

## 2. Identified Pre-Hardening Vulnerabilities & Gaps

### Defect 1: Stateless JWT Suspension Grace Period Vulnerability
- **Severity:** HIGH / CRITICAL
- **Location:** `services/api/src/auth/auth.service.ts` (`verifyToken`)
- **Pre-Hardening Behavior:** When an administrator suspended a rogue or compromised customer account via `PATCH /admin/users/:id/status`, the system set `user.status = 'SUSPENDED'` and purged active refresh tokens from the `RefreshSession` table. However, access JWTs have a 15-minute expiration window. The token verification guard (`verifyToken`) verified signature and checked an in-memory blacklist, but **did not check the database `User.status`**.
- **Impact:** A suspended user could continue executing authenticated mutations (creating orders, altering household profiles, modifying pantry items) for up to 15 minutes post-suspension.
- **Remediation in 5.2:** Updated `verifyToken` to query the authoritative PostgreSQL `User` record. If `user.status === 'SUSPENDED'`, it immediately throws `UnauthorizedException('Account has been suspended. Access denied.')`, closing the grace period to 0 ms.

### Defect 2: Staff Self-Review & Self-Approval Vulnerability
- **Severity:** HIGH
- **Location:** `services/api/src/marketplace/marketplace.service.ts` & `admin.service.ts`
- **Pre-Hardening Behavior:** An authenticated administrator or staff member could apply for a merchant license via `POST /marketplace/retailer/apply`, and then use their own administrative privileges to review and approve their own retailer application via `PATCH /admin/retailers/applications/:id`.
- **Impact:** Abuse of administrative power, conflict of interest, bypassing peer review.
- **Remediation in 5.2:** Enforced server-side check preventing `application.userId === reviewerId`. Any self-approval attempt throws `ForbiddenException('Staff members cannot review or approve their own retailer application.')`.

### Defect 3: Staff Self-Demotion / Role Escalation Vulnerability
- **Severity:** MEDIUM
- **Location:** `services/api/src/admin/admin.service.ts` (`updateUserRole`)
- **Pre-Hardening Behavior:** An admin could submit a PATCH request targeting their own user ID to alter their role or elevate others to `SUPER_ADMIN`.
- **Impact:** Rogue staff could tamper with their own permissions or bypass access controls.
- **Remediation in 5.2:** Added explicit check `if (targetUserId === adminUserId) throw new BadRequestException('Administrators cannot modify their own role.')`. Only `SUPER_ADMIN` can modify staff roles, and non-superadmins cannot provision `SUPER_ADMIN`.

### Defect 4: Unaudited & Unrestricted Support Inspection with PII Exposure
- **Severity:** HIGH
- **Location:** `services/api/src/admin/admin.controller.ts` & `admin.service.ts`
- **Pre-Hardening Behavior:** Support agents (`SUPPORT` role) could query `/admin/households/:id` and view customer household members, dietary restrictions, and contact phone numbers without providing an operational reason or leaving an immutable audit trail.
- **Impact:** Privacy violation, unauthorized customer profiling, potential PII leaks.
- **Remediation in 5.2:** 
  1. Enforced mandatory `x-support-reason` header or `reason` parameter (min 5 characters) for the `SUPPORT` role. Omitting it yields `400 Bad Request`.
  2. Implemented automated masking of customer contact numbers (`***-***-XXXX`) for support personnel.
  3. Created an immutable audit log entry `SUPPORT_HOUSEHOLD_INSPECTED` capturing staff ID, target household, and the exact justification.

### Defect 5: Cross-Tenant Retailer Catalog Mutation (IDOR)
- **Severity:** HIGH
- **Location:** `services/api/src/marketplace/marketplace.controller.ts` & `marketplace.service.ts`
- **Pre-Hardening Behavior:** A retailer authenticated as Merchant A could invoke `PUT /marketplace/retailer/:slug/product/:variantId` with Merchant B's slug. The service lacked a strict ownership cross-check against the authenticated user's assigned retailer record.
- **Impact:** Price tampering, stock tampering, competitive sabotage between retailers.
- **Remediation in 5.2:** Added strict merchant boundary validation in both `getRetailerInventory` and `updateRetailerProduct`. Mismatched retailer IDs throw `ForbiddenException('Access denied to other retailer store inventory.')`.

### Defect 6: Audit Log Sensitive Data Exposure
- **Severity:** MEDIUM
- **Location:** `services/api/src/auth/security/audit.service.ts`
- **Pre-Hardening Behavior:** While audit logging recorded authentication and admin actions, metadata dictionaries were saved without comprehensive sanitization. If an upstream caller passed request bodies, plaintext passwords, tokens, or hashes could be stored in `AuditLog.metadata`.
- **Impact:** Compliance failure, risk of credential exposure if audit logs are viewed by operators.
- **Remediation in 5.2:** Implemented recursive `sanitizeMetadata()` filtering and masking keys matching `password`, `hash`, `token`, `secret`, `authorization`, `cookie`, `key`, and `credential`.

---

## 3. Database State and Connection Audit

- **Live Database:** `postgresql://postgres:postgres@127.0.0.1:5432/rasoi_iq?schema=public` (WSL2 hosted).
- **Prisma Schema:** `packages/database/prisma/schema.prisma`
- **Startup Mode:** `REQUIRE_DATABASE=true`, `STORAGE_MODE=postgres`.
- **Fail-Closed Verification:** Tested in Phase 4.1 & Phase 5.0: terminating the PostgreSQL container or passing an invalid connection URL immediately terminates backend initialization with exit code 1.
- **Pre-5.2 Database Backup:** Successfully exported to `backups/rasoi_iq_phase52_pre.sql` (246,375 bytes).

---

## 4. Audit Conclusions

The Phase 5.0 and 5.1 codebases established strong architectural foundations (Prisma models, role decorators, JWT flow), but left edge cases in token invalidation, merchant boundaries, privacy masking, and privilege management. The remediation in Phase 5.2 directly tackles every identified flaw with server-side enforcement and automated test assertions.
