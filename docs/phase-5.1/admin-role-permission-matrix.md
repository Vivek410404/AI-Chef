# RasoiIQ Phase 5.1 — Administrative Role & Permission Matrix

**Document Version:** 1.0.0  
**Phase:** 5.1  
**Date:** November 2026  
**Audience:** Security Auditors, Platform Engineers, System Administrators

---

## 1. Overview of Platform Roles

RasoiIQ defines six distinct platform roles divided into Customer/External tiers and Internal Administrative tiers:

```
  +---------------------------------------------------------------------------------+
  |                                ROLE HIERARCHY                                   |
  |                                                                                 |
  |   [SUPER_ADMIN] Root Platform Authority                                         |
  |         |                                                                       |
  |         +---> [ADMIN] Full Operations, Catalog & Customer Oversight             |
  |                 |                                                               |
  |                 +---> [OPERATIONS] Orders, Substitutions & Fulfillment Dispatch |
  |                 |           |                                                   |
  |                 +-----------+---> [SUPPORT] Read-Only Customer & Order Inquiries|
  |                                                                                 |
  |   ===========================================================================   |
  |   [NON-ADMINISTRATIVE ROLES — STRICTLY FORBIDDEN FROM /admin & /api/admin/*]    |
  |                                                                                 |
  |   [RETAILER] Merchant Partner Manager (Catalog & Store Stock)                   |
  |   [CUSTOMER] Household Food Operating System User                               |
  +---------------------------------------------------------------------------------+
```

---

## 2. Role Definitions

### 1. `SUPER_ADMIN` (Root Platform Administrator)
- **Scope:** Complete, unrestricted platform oversight.
- **Exclusive Capabilities:**
  - Provision new administrative staff (`ADMIN`, `OPERATIONS`, `SUPPORT`).
  - Modify staff member roles.
  - Modify global runtime platform configuration settings (`SystemSetting`).
  - Perform destructive administrative actions and high-privilege account suspensions.
  - Inspect raw security audit logs and system diagnostic telemetry.

### 2. `ADMIN` (Platform Administrator)
- **Scope:** Daily platform management, catalog maintenance, and merchant onboarding.
- **Capabilities:**
  - Suspend and reactivate customer and retailer accounts.
  - Review, approve, and reject merchant onboarding applications (`RetailerApplication`).
  - Create, edit, and archive recipes in the regional recipe catalog.
  - Update order statuses and operational fulfillment notes.
  - Inspect household configurations and family dietary profiles.
  - Read security audit logs and platform settings.
- **Restrictions:** Cannot provision staff, change staff roles, or update global system settings. Cannot suspend `SUPER_ADMIN`.

### 3. `OPERATIONS` (Fulfillment & Delivery Specialist)
- **Scope:** Grocery order dispatch, merchant coordination, and item substitution tracking.
- **Capabilities:**
  - View all simulated orders.
  - Update order status transitions (`CONFIRMED` -> `PREPARING` -> `DISPATCHED` -> `DELIVERED`).
  - Record item substitution notes and customer delivery instructions.
  - View active retail partner stores and customer households.
- **Restrictions:** Cannot suspend users, modify recipe catalog, review merchant applications, provision staff, or view raw security audit logs.

### 4. `SUPPORT` (Customer Care Specialist)
- **Scope:** Assisting household members with account access and order inquiries.
- **Capabilities:**
  - Search and inspect user profiles (excluding password hashes).
  - Search and inspect household rosters and dietary settings.
  - Invalidate active sessions upon customer request (`/revoke-sessions`).
  - Resend email verification links to unverified customers.
  - View order details and fulfillment timelines.
- **Restrictions:** Read-only access to customer records. Cannot suspend users, mutate orders, modify catalog, approve retailers, or change settings.

### 5. `RETAILER` (Merchant Partner)
- **Scope:** External merchant operations (Blinkit, Zepto, DMart Ready, BigBasket).
- **Restrictions:** **Strictly forbidden (HTTP 403)** from all `/admin` frontend routes and `/api/admin/*` endpoints.

### 6. `CUSTOMER` (Household Member / Consumer)
- **Scope:** Consumer food operating system (meal planning, cart, simulated checkout).
- **Restrictions:** **Strictly forbidden (HTTP 403)** from all `/admin` frontend routes and `/api/admin/*` endpoints.

---

## 3. Comprehensive Permission Matrix

| Functional Capability | API Endpoint | SUPER_ADMIN | ADMIN | OPERATIONS | SUPPORT | RETAILER | CUSTOMER |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **View Dashboard Overview** | `GET /api/admin/overview` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **View Growth Trends (14d)** | `GET /api/admin/trends` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **List Users Directory** | `GET /api/admin/users` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **Inspect User Profile** | `GET /api/admin/users/:id` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **Suspend / Reactivate User** | `PATCH /api/admin/users/:id/status` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **Revoke Active Sessions** | `POST /api/admin/users/:id/revoke-sessions` | ✅ | ✅ | ❌ (403) | ✅ | ❌ (403) | ❌ (403) |
| **Resend Verification Link** | `POST /api/admin/users/:id/resend-verification` | ✅ | ✅ | ❌ (403) | ✅ | ❌ (403) | ❌ (403) |
| **List Households** | `GET /api/admin/households` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **Inspect Household Profile** | `GET /api/admin/households/:id` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **List Merchant Applications** | `GET /api/admin/retailers/applications` | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ (403) |
| **Review Merchant Application** | `PATCH /api/admin/retailers/applications/:id`| ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **List Retail Partners** | `GET /api/admin/retailers` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **Update Retailer Status** | `PATCH /api/admin/retailers/:id/status` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **List Orders** | `GET /api/admin/orders` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **Inspect Order Detail** | `GET /api/admin/orders/:id` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **Update Order Status & Notes**| `PATCH /api/admin/orders/:id/status` | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ (403) |
| **List Recipe Catalog** | `GET /api/admin/recipes` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **Inspect Recipe Detail** | `GET /api/admin/recipes/:id` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **Create Recipe** | `POST /api/admin/recipes` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **Update Recipe Details** | `PATCH /api/admin/recipes/:id` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **Archive / Unarchive Recipe** | `PATCH /api/admin/recipes/:id/archive` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **View Audit Logs Stream** | `GET /api/admin/audit-logs` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **List Staff Accounts** | `GET /api/admin/staff` | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **Provision Staff Member** | `POST /api/admin/staff` | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **Update Staff Role** | `PATCH /api/admin/staff/:id/role` | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **Read System Settings** | `GET /api/admin/settings` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **Update System Settings** | `PATCH /api/admin/settings` | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **View System Health Telemetry**| `GET /api/admin/health` | ✅ | ✅ | ✅ | ✅ | ❌ (403) | ❌ (403) |

---

## 4. Enforcement Mechanism in NestJS

All role checks are executed server-side via `RolesGuard` (`services/api/src/auth/roles.guard.ts`) and `@Roles(...)` metadata decorators:

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    const user = await this.authService.verifyToken(token);
    request.user = user;

    const userRole = (user.role || 'CUSTOMER').toUpperCase();
    const reqRolesUpper = requiredRoles.map(r => r.toUpperCase());

    // Role Hierarchy Resolution
    if (userRole === 'SUPER_ADMIN') return true;
    if (userRole === 'ADMIN') {
      const nonSuperAdminRoles = reqRolesUpper.filter(r => r !== 'SUPER_ADMIN');
      if (nonSuperAdminRoles.some(r => ['OPERATIONS', 'SUPPORT', 'ADMIN'].includes(r))) return true;
    }
    if (userRole === 'OPERATIONS') {
      if (reqRolesUpper.includes('SUPPORT') || reqRolesUpper.includes('OPERATIONS')) return true;
    }
    if (reqRolesUpper.includes(userRole)) return true;

    throw new ForbiddenException(`Access denied. Role "${userRole}" lacks required permissions: [${requiredRoles.join(', ')}]`);
  }
}
```
