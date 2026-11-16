# RasoiIQ Phase 5.2 — Retailer Onboarding & Merchant Isolation Integrity

**Milestone:** Phase 5.2 — Security Hardening, Data Integrity & Operational Verification  
**Module:** `services/api/src/marketplace`, `admin.service.ts`  
**Storage:** PostgreSQL `RetailerApplication` & `Retailer` Tables via Prisma ORM  

---

## 1. Retailer Onboarding Lifecycle

RasoiIQ supports public merchant onboarding to supply groceries to households. The lifecycle follows a multi-state workflow:

```
[CUSTOMER / MERCHANT APPLICANT]
             │
             ▼
   POST /marketplace/retailer/apply
             │
             ▼
[STATUS: PENDING_REVIEW / SUBMITTED]
             │
             ├──► Admin rejects (REJECTED + feedback)
             │
             └──► Admin / Super Admin reviews (APPROVED)
                         │
                         ▼
        [AUTO-PROVISION STORE & ELEVATE ROLE]
                         │
                         ├── 1. Prisma Retailer created with unique slug
                         ├── 2. User role elevated to 'RETAILER'
                         └── 3. Pre-existing household membership PRESERVED
```

---

## 2. Hardened Merchant Protections in Phase 5.2

### 1. Staff Anti-Self-Approval Defense
- **Threat:** An internal staff member with administrative review privileges registers as a merchant and approves their own store, bypassing background checks and fee agreements.
- **Server Guard:** In `marketplace.service.ts` and `admin.service.ts`:
  ```typescript
  if (application.userId === reviewerUserId) {
    throw new ForbiddenException('Staff members cannot review or approve their own retailer application.');
  }
  ```
- **Verification:** Verified via test assertion: Admin attempting to approve their own retailer application receives `HTTP 403 Forbidden`.

### 2. Multi-Tenant Merchant Isolation (Merchant A vs Merchant B)
- **Threat:** Retailer A inspects or mutates product pricing or inventory stock of Retailer B (e.g., Zepto altering Blinkit catalog prices).
- **Server Guard:** In `marketplace.service.ts` (`getRetailerInventory`) and `marketplace.controller.ts` (`updateRetailerProduct`):
  ```typescript
  if (user.role === Role.RETAILER && user.retailerId !== targetRetailer.id && user.retailerSlug !== targetRetailer.slug) {
    throw new ForbiddenException('Access denied to other retailer store inventory.');
  }
  ```
- **Verification:**
  - Retailer A querying Retailer B (`ret-zepto`) inventory: Rejected with `403 Forbidden`.
  - Retailer A updating Retailer B product pricing via `PUT`: Rejected with `403 Forbidden`.
  - Retailer querying their own catalog: Succeeded with `200 OK`.

### 3. Customer Household Preservation upon Retailer Elevation
- **Concern:** When an existing household owner or member is approved as a merchant and their `user.role` changes from `CUSTOMER` to `RETAILER`, does their family lose access to their home meal plan or pantry?
- **Relational Integrity:** Household membership is stored in the relational join table `HouseholdMember (householdId, userId, role)`. Role elevation modifies only `User.role`, preserving all foreign key references in `HouseholdMember`.
- **Verification:** Tested in `scripts/test-phase52-security-integrity.mjs` (Category 8):
  - Customer registered and created Household D as `OWNER`.
  - Customer submitted a retailer application.
  - Super Admin approved application; role changed to `RETAILER`.
  - Checked `prisma.householdMember`: Record verified intact with role `OWNER`.

---

## 3. Onboarding Integrity Summary

| Protection / Invariant | Status | Evidence |
| :--- | :---: | :--- |
| Self-Review Prevention | **VERIFIED** | HTTP 403 returned on self-approval attempt |
| Cross-Merchant Isolation (Read) | **VERIFIED** | HTTP 403 returned when Retailer A inspects Retailer B |
| Cross-Merchant Isolation (Write) | **VERIFIED** | HTTP 403 returned when Retailer A modifies Retailer B |
| Household Membership Preservation | **VERIFIED** | `HouseholdMember` relational link verified post-elevation |
| Persistent Database Storage | **VERIFIED** | Both `RetailerApplication` and `Retailer` persisted in PostgreSQL |
