# RasoiIQ Phase 5.2 — Household Privacy & IDOR Defense Audit

**Milestone:** Phase 5.2 — Security Hardening, Data Integrity & Operational Verification  
**Focus Area:** Multi-Tenant Isolation, IDOR (Insecure Direct Object Reference) Defenses, and Support Privacy Controls  
**Tested Module:** `services/api/src/households`, `admin.controller.ts`, `admin.service.ts`  

---

## 1. Multi-Tenant Household Isolation Architecture

RasoiIQ organizes customer dietary preferences, meal plans, pantry inventory, and smart baskets under the `Household` entity. Every household has associated members tracked via `HouseholdMember` in PostgreSQL with role assignments (`OWNER`, `ADMIN`, `MEMBER`, `MAHARAJ`).

### IDOR Protection Mechanisms
1. **Server-Side Member Verification:**
   - Any endpoint accepting a `:householdId` parameter (or resolving via user session) checks PostgreSQL:
     ```typescript
     const membership = await prisma.householdMember.findFirst({
       where: { householdId, userId }
     });
     if (!membership) {
       throw new ForbiddenException('You do not have access to this household.');
     }
     ```
2. **Dynamic Household Resolution (`resolveHouseholdId`):**
   - Implemented in `MealPlansController`, `PantryController`, and `GroceryController`.
   - When a newly registered customer creates or joins a household, their JWT may not yet have an updated `householdId` claim. `resolveHouseholdId` queries the `HouseholdMember` table in PostgreSQL to resolve their current active household dynamically.
   - Prevents stale JWT claim issues while maintaining strict tenant boundaries.

---

## 2. Customer-to-Customer IDOR Defense Tests

Tested in `scripts/test-phase52-security-integrity.mjs` (Category 6):

| Attack Vector | Attacker Action | Target Entity | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| Read Foreign Household | Customer 1 (`c1`) invokes `GET /api/households/:hh2Id` | Household 2 | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| Modify Foreign Household | Customer 1 (`c1`) invokes `PUT /api/households/:hh2Id` with altered dietary tags | Household 2 | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| Hijack Foreign Household | Customer 1 (`c1`) invokes `POST /api/households/:hh2Id/transfer-ownership` | Household 2 | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| Access Foreign Meal Plan | Customer 1 attempts direct query for Household 2 meal plan | Household 2 | Denied / isolated to Household 1 | Isolated to Household 1 | **PASS** |
| Access Foreign Pantry | Customer 1 queries `/api/pantry` | Household 2 | Isolated to Household 1 | Isolated to Household 1 | **PASS** |

---

## 3. Purpose-Limited Support Access Controls

### The Threat
Internal customer support agents often need to assist families who report issues with meal plans or dietary restrictions. However, granting unconstrained read access allows rogue support staff to snoop on customer lifestyles, allergies, and contact phone numbers without an audit trail.

### Hardened Implementation in Phase 5.2
1. **Mandatory Operational Justification:**
   - For users with the `SUPPORT` role, accessing `GET /api/admin/households/:id` requires the `x-support-reason` header (or `reason` query param), with a minimum length of 5 characters.
   - If missing or blank: HTTP `400 Bad Request` (`Support staff must provide a valid support reason (x-support-reason header or reason param).`).
2. **Automated PII Masking:**
   - When returned to a `SUPPORT` user, the `members` array has all phone numbers masked:
     ```typescript
     // e.g. "+91 98765 43210" -> "***-***-3210"
     phone: member.phone ? maskPhoneNumber(member.phone) : null
     ```
3. **Immutable Support Access Audit Logging:**
   - Every support inspection automatically generates an `AuditLog` entry in PostgreSQL:
     - `action`: `SUPPORT_HOUSEHOLD_INSPECTED`
     - `userId`: Staff ID of support agent
     - `metadata`: `{ householdId, householdName, reason, ipAddress, userAgent }`

### Verification Results
- Support user inspecting Sharma Family without `x-support-reason`: Rejected with `400 Bad Request`.
- Support user inspecting with `x-support-reason: "Customer ticket #8491: pantry sync issue"`: Succeeded with `200 OK`.
- Contact numbers returned in payload: Verified as `***-***-3210` (no plaintext leakage).
- PostgreSQL audit record confirmed with matching `SUPPORT_HOUSEHOLD_INSPECTED` and exact ticket justification.
