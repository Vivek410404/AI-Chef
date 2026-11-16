# RasoiIQ Phase 6.0 — Household Privacy & Multi-Tenant Isolation Audit

**Milestone:** Phase 6.0 Controlled Household Pilot Readiness  
**Target:** 3 Supervised Pilot Households (Sharma, Patel, Mehta)  
**Security Boundary:** Multi-Tenant Server-Side Authorization & Support Privacy  

---

## 1. Executive Summary

RasoiIQ enforces strict server-side multi-household tenant isolation. Under no circumstances does the application trust a client-supplied household ID without verifying that the authenticated user possesses active membership in that household. Cross-household queries, data leaks, and unauthorized modifications are consistently intercepted with HTTP 403 Forbidden.

---

## 2. Multi-Household Verification Matrix

Tested across 3 distinct, fully isolated household accounts:
1. **Sharma Family** (`hh-sharma-family`, Owner: `pooja@sharma.in`)
2. **Patel Family** (`hh-patel-family`, Owner: `ramesh@patel.in`)
3. **Mehta Family** (`hh-mehta-family`, Owner: `kirit@mehta.in`)

| Endpoint Category | Test Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Household Profile** | Sharma Owner querying Sharma Household | 200 OK with profile data | 200 OK | PASS |
| **Cross-Household IDOR** | Patel querying Sharma Household (`hh-sharma-family`) | 403 Forbidden | 403 Forbidden | PASS |
| **Cross-Household IDOR** | Mehta querying Patel Household (`hh-patel-family`) | 403 Forbidden | 403 Forbidden | PASS |
| **Household Preferences** | Patel attempting to update Sharma dietary preferences | 403 Forbidden | 403 Forbidden | PASS |
| **Meal Plans** | Patel querying Sharma meal plan | 403 Forbidden | 403 Forbidden | PASS |
| **Pantry Stock** | Mehta attempting to view or deduct Patel pantry items | 403 Forbidden | 403 Forbidden | PASS |
| **Grocery Basket** | Patel querying Sharma smart grocery basket | Isolated basket returned | Sharma data withheld | PASS |
| **Grocery Orders** | Patel querying Sharma order by ID (`GET /marketplace/orders/:id`) | 403 Forbidden | 403 Forbidden | PASS |
| **Cook Digest** | Mehta querying Sharma Maharaj cook digest | 403 Forbidden | 403 Forbidden | PASS |
| **Retailer Isolation** | Blinkit querying Zepto store inventory | 403 Forbidden | 403 Forbidden | PASS |
| **Unauthenticated Request** | Unauthenticated request to protected household endpoint | 401 / 403 Rejection | Rejected | PASS |
| **Suspended User Request** | Suspended user attempting household access with valid JWT | 401 Unauthorized | 401 Unauthorized | PASS |

---

## 3. Role-Based Access Control (RBAC) Matrix

| Household Role | View Meals & Digest | Update Preferences | Invite Members | Place Grocery Orders | Manage Billing & Deletion |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **OWNER** | Allowed | Allowed | Allowed | Allowed | Allowed |
| **MEMBER** | Allowed | View Only | Blocked (403) | Allowed | Blocked (403) |
| **COOK** | Allowed (Digest Only) | Blocked (403) | Blocked (403) | Blocked (403) | Blocked (403) |

### Cook Role Permission Enforcement
```typescript
// services/api/src/household/household.service.ts
if (requiredRole === 'MEMBER' && role === 'COOK') {
  throw new ForbiddenException(
    'Domestic cooks do not have permission to manage household configuration or grocery orders.'
  );
}
```
Domestic cooks can access only the daily cooking digest and meal schedules required to prepare food. Personal contact information, addresses, financial data, and grocery orders are completely inaccessible.

---

## 4. Administrative Support Access & Privacy Safeguards

To prevent staff abuse, administrative access to household data is strictly gated and audited:

1. **Permission Check:** Requires `SUPPORT`, `ADMIN`, or `SUPER_ADMIN` platform role.
2. **Support Reason Mandatory:** Requests without a valid reason are rejected with `400 Bad Request`.
3. **Whitespaces and Oversized Strings Rejected:** Empty spaces or reasons exceeding 500 characters are rejected with `400 Bad Request`.
4. **Data Masking:** Member phone numbers and sensitive identifiers are masked by default (`***-***-3210`).
5. **Direct Customer Endpoint Block:** Support and Operations staff cannot call customer-facing endpoints (e.g. `GET /households/me`), preventing ambient impersonation.
6. **Immutable Audit Trail:** Every support inspection logs `SUPPORT_HOUSEHOLD_INSPECTED` to the database-immutable `AuditLog` table with staff identity, timestamp, household ID, and justification reason.

---

## 5. Pilot Privacy Finding & Sign-Off

- **Isolation Integrity:** Verified. No cross-household data leakage observed.
- **Cook Boundary:** Verified. Cooks have read-only access to recipes and preparation instructions.
- **Support Privacy:** Verified. Audit triggers prevent altering or tampering with support logs.
