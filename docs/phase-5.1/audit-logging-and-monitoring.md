# RasoiIQ Phase 5.1 — Audit Logging, Security Stream & Platform Monitoring

**Document Version:** 1.0.0  
**Phase:** 5.1  
**Date:** November 2026  
**Audience:** Security Auditors, Compliance Officers, Site Reliability Engineers

---

## 1. Audit Logging Architecture

RasoiIQ maintains an append-only, immutable audit trail in the PostgreSQL `AuditLog` table. Every high-privilege administrative action, identity change, security event, and catalog modification is recorded synchronously with structured JSON metadata.

### Architectural Guarantees
- **Append-Only:** No administrative endpoint or API exists to modify or delete audit log records.
- **Fail-Safe Persistence:** `AuditService.log` ensures that even if an actor is anonymous or passing a non-relational identifier, structured metadata is safely persisted without failing PostgreSQL transactions.
- **Zero Sensitive Data Exposure:** Password hashes, raw credentials, and session secret tokens are never written to audit metadata.

---

## 2. Monitored Event Catalog

### Administrative & Operator Events (Phase 5.1 Additions)
| Action Key | Triggering Action | Entity Type | Captured Metadata |
| :--- | :--- | :--- | :--- |
| `ADMIN_BOOTSTRAP` | Initial CLI superadmin provisioning | `User` | email, role, source: 'CLI' |
| `USER_SUSPENDED` | Administrator suspends account | `User` | targetEmail, reason, previousStatus, newStatus |
| `USER_REACTIVATED` | Administrator reactivates account | `User` | targetEmail, previousStatus, newStatus |
| `SESSIONS_REVOKED` | Admin/Support purges user sessions | `User` | reason, sessionsRevoked count |
| `HOUSEHOLD_INSPECTED` | Admin opens household detail view | `Household` | householdName |
| `RETAILER_APPROVED` | Admin approves merchant application | `RetailerApplication` | applicantId, businessName, applicantEmail |
| `RETAILER_REJECTED` | Admin rejects merchant application | `RetailerApplication` | applicantId, businessName, rejectionReason |
| `RETAILER_SUSPENDED` | Admin suspends active retail partner | `Retailer` | reason, status |
| `ORDER_STATUS_CHANGED` | Operations updates fulfillment status | `Order` | newStatus, reason, fulfillmentNotes, substitutionNotes |
| `RECIPE_CREATED` | Admin publishes new regional recipe | `Recipe` | title, cuisine, dietaryTags, isJainFriendly |
| `RECIPE_MODIFIED` | Admin edits recipe attributes/macros | `Recipe` | title, updatedFields |
| `RECIPE_ARCHIVED` | Admin toggles archival switch | `Recipe` | isArchived, title |
| `STAFF_CREATED` | Super Admin provisions staff account | `User` | staffEmail, assignedRole |
| `STAFF_ROLE_CHANGED` | Super Admin updates staff role tier | `User` | previousRole, newRole |
| `SETTINGS_UPDATED` | Super Admin updates platform flag | `SystemSetting` | key, value |

### Identity & Household Events (Phase 5.0 Core)
| Action Key | Triggering Action | Entity Type |
| :--- | :--- | :--- |
| `REGISTER` | Public customer registration | `User` |
| `EMAIL_VERIFIED` | Customer verifies email link | `User` |
| `LOGIN_SUCCESS` | Successful authentication | `User` |
| `LOGIN_FAILURE` | Invalid credentials attempt | `User` |
| `LOGOUT` | Single session logout | `Session` |
| `LOGOUT_ALL_SESSIONS` | User logs out of all devices | `User` |
| `PASSWORD_RESET_REQUESTED`| Customer requests reset email | `User` |
| `PASSWORD_RESET_COMPLETED`| Customer changes password via token | `User` |
| `HOUSEHOLD_CREATED` | Customer creates new family unit | `Household` |
| `HOUSEHOLD_INVITATION_SENT` | Owner invites new family member | `HouseholdInvitation` |
| `HOUSEHOLD_INVITATION_ACCEPTED` | Member accepts invitation link | `HouseholdMember` |

---

## 3. Structured Metadata Payload Example

When an administrator suspends a user, the structured JSON payload stored in `AuditLog.metadata` contains:

```json
{
  "actorId": "cmwj2fa4w0000l3s4x4q1jmst",
  "targetEmail": "rogue.user@example.com",
  "previousStatus": "ACTIVE",
  "newStatus": "SUSPENDED",
  "reason": "Investigating suspicious order velocity from unverified IP"
}
```

---

## 4. Audit Log Stream Interface (`/admin/audit-logs`)

Authorized administrators (`ADMIN` or `SUPER_ADMIN`) can inspect the audit trail via `/admin/audit-logs`:
- **Search:** Search across action names, entity types, actor emails, or entity IDs.
- **Action Filter:** Filter by specific security events (`USER_SUSPENDED`, `RETAILER_APPROVED`, etc.).
- **Live Stream Table:** Displays timestamp, action pill (color-coded: red for suspensions/rejections, green for creations/approvals, amber for updates), actor identity, target entity, and client IP address.
- **Metadata Inspector:** Click the **Metadata** button on any row to open a modal displaying the formatted JSON payload.
