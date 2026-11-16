# RasoiIQ Phase 5.2 — Platform Authorization Matrix

**Milestone:** Phase 5.2 — Security Hardening, Data Integrity & Operational Verification  
**Scope:** Endpoint-by-endpoint RBAC validation across all six platform roles  
**Guards:** `JwtAuthGuard`, `RolesGuard`, server-side ownership validations  

---

## 1. Platform Roles Hierarchy & Definitions

RasoiIQ defines six discrete roles in Prisma enum `Role`:
1. **`SUPER_ADMIN`**: Full platform authority. Sole role capable of provisioning, modifying, or deactivating internal staff (`/admin/staff`), viewing raw security audit streams, and managing platform-wide environment settings.
2. **`ADMIN`**: Platform management authority. Manages users, households, retailers, and recipes. Prohibited from provisioning staff or altering system-level platform configurations.
3. **`OPERATIONS`**: Logistics and order fulfillment operations. Can view orders, trigger concierge delivery dispatches, inspect grocery availability, and monitor retailer performance. Prohibited from modifying user accounts, roles, or settings.
4. **`SUPPORT`**: Customer service role. Can view user profiles and inspect household details **strictly when accompanied by an operational support justification (`x-support-reason`)**. Sensitive customer contact details (phone numbers) are automatically masked. Prohibited from mutating data or viewing staff accounts.
5. **`CUSTOMER`**: Default registered end-user. Restricted to their own household(s), meal plans, grocery carts, and personal order history. Strictly prohibited from accessing administrative or retailer management endpoints.
6. **`RETAILER`**: Verified merchant partner. Access restricted to their assigned store catalog, inventory stock, and product pricing. Prohibited from accessing other retailers' inventories or administrative APIs.

---

## 2. Endpoint-by-Endpoint Authorization Matrix

| Endpoint Path | HTTP Method | Allowed Roles | Prohibited Roles (HTTP 403 / 401) | Security Guard & Enforcement Mechanism |
| :--- | :---: | :---: | :---: | :--- |
| `/api/admin/overview` | `GET` | `SUPER_ADMIN`, `ADMIN`, `SUPPORT`, `OPERATIONS` | `CUSTOMER`, `RETAILER` | `RolesGuard([SUPER_ADMIN, ADMIN, SUPPORT, OPERATIONS])` |
| `/api/admin/users` | `GET` | `SUPER_ADMIN`, `ADMIN`, `SUPPORT` | `OPERATIONS`, `CUSTOMER`, `RETAILER` | `RolesGuard([SUPER_ADMIN, ADMIN, SUPPORT])` |
| `/api/admin/users/:id/status` | `PATCH` | `SUPER_ADMIN`, `ADMIN` | `OPERATIONS`, `SUPPORT`, `CUSTOMER`, `RETAILER` | `RolesGuard([SUPER_ADMIN, ADMIN])` |
| `/api/admin/users/:id/role` | `PATCH` | `SUPER_ADMIN`, `ADMIN` | `OPERATIONS`, `SUPPORT`, `CUSTOMER`, `RETAILER` | `RolesGuard([SUPER_ADMIN, ADMIN])` + Anti-Self-Escalation Check |
| `/api/admin/staff` | `GET` | `SUPER_ADMIN` | `ADMIN`, `OPERATIONS`, `SUPPORT`, `CUSTOMER`, `RETAILER` | `RolesGuard([SUPER_ADMIN])` |
| `/api/admin/staff` | `POST` | `SUPER_ADMIN` | `ADMIN`, `OPERATIONS`, `SUPPORT`, `CUSTOMER`, `RETAILER` | `RolesGuard([SUPER_ADMIN])` |
| `/api/admin/staff/:id` | `PATCH` | `SUPER_ADMIN` | `ADMIN`, `OPERATIONS`, `SUPPORT`, `CUSTOMER`, `RETAILER` | `RolesGuard([SUPER_ADMIN])` |
| `/api/admin/households/:id` | `GET` | `SUPER_ADMIN`, `ADMIN`, `SUPPORT` | `OPERATIONS`, `CUSTOMER`, `RETAILER` | `RolesGuard` + `x-support-reason` validator + PII masking |
| `/api/admin/orders` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS` | `SUPPORT`, `CUSTOMER`, `RETAILER` | `RolesGuard([SUPER_ADMIN, ADMIN, OPERATIONS])` |
| `/api/admin/retailers/applications` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS` | `SUPPORT`, `CUSTOMER`, `RETAILER` | `RolesGuard([SUPER_ADMIN, ADMIN, OPERATIONS])` |
| `/api/admin/retailers/applications/:id` | `PATCH` | `SUPER_ADMIN`, `ADMIN` | `OPERATIONS`, `SUPPORT`, `CUSTOMER`, `RETAILER` | `RolesGuard` + Staff Anti-Self-Approval Check |
| `/api/admin/settings` | `GET` | `SUPER_ADMIN`, `ADMIN` | `OPERATIONS`, `SUPPORT`, `CUSTOMER`, `RETAILER` | `RolesGuard([SUPER_ADMIN, ADMIN])` |
| `/api/admin/settings` | `PATCH` | `SUPER_ADMIN` | `ADMIN`, `OPERATIONS`, `SUPPORT`, `CUSTOMER`, `RETAILER` | `RolesGuard([SUPER_ADMIN])` |
| `/api/marketplace/retailer/:slug/inventory` | `GET` | `RETAILER` (Self only), Admins | Other `RETAILER` (Cross-tenant), `CUSTOMER` | Store slug match against JWT `retailerId` |
| `/api/marketplace/retailer/:slug/product/:varId` | `PUT` | `RETAILER` (Self only) | Other `RETAILER` (Cross-tenant), All Non-Merchants | Merchant boundary verification in `updateRetailerProduct` |
| `/api/households/:id` | `GET` | Household Members | Non-member `CUSTOMER`, Non-member `RETAILER` | Server-side `HouseholdMember` DB relation check |
| `/api/households/:id` | `PUT` | Household `OWNER` / `ADMIN` | Non-admin members, External customers | Role check within household membership relation |
| `/api/meal-plans/current` | `GET` | Household Members | External customers | `resolveHouseholdId` DB membership check |
| `/api/pantry` | `GET`, `POST` | Household Members | External customers | `resolveHouseholdId` DB membership check |
| `/api/grocery/basket` | `GET`, `POST` | Household Members | External customers | `resolveHouseholdId` DB membership check |

---

## 3. Anti-Privilege Escalation Rules Tested

1. **Staff Self-Review Prohibition:**
   - Attempt: Admin user `A` applies for retailer license and submits review `status: 'APPROVED'` for their own application ID.
   - Result: HTTP `403 Forbidden` (`Staff members cannot review or approve their own retailer application.`).
2. **Self-Role Modification Prohibition:**
   - Attempt: Admin user attempts `PATCH /admin/users/:adminId/role`.
   - Result: HTTP `400 Bad Request` (`Administrators cannot modify their own role.`).
3. **Restricted SUPER_ADMIN Creation:**
   - Attempt: Non-superadmin admin attempts to assign `SUPER_ADMIN` role to another user.
   - Result: HTTP `400 Bad Request` (`Only existing Super Admins can provision Super Admin accounts.`).

---

## 4. Test Verification Status

Every path, guard, and anti-escalation condition documented above is tested in `scripts/test-phase52-security-integrity.mjs` (Categories 1, 3, 5, and 6) and verified through automated HTTP assertions.
