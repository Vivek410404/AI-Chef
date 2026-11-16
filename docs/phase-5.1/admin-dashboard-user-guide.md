# RasoiIQ Phase 5.1 — Admin Dashboard & Operations Console User Guide

**Document Version:** 1.0.0  
**Phase:** 5.1  
**Date:** November 2026  
**Audience:** Platform Administrators, Operations Coordinators, Customer Support Leads

---

## 1. Accessing the Platform Console

The RasoiIQ Operations Console is located at route:
`http://localhost:3000/admin`

### Authentication Requirements
Access requires an active session with an administrative role:
- `SUPER_ADMIN`
- `ADMIN`
- `OPERATIONS`
- `SUPPORT`

If unauthenticated or logged in as a customer or retailer, the system displays a **Restricted Access** shield screen with identity details and quick local authorization options.

---

## 2. Interface Layout & Navigation

```
+-----------------------------------------------------------------------------------+
|  RasoiIQ [CONSOLE]      | Breadcrumbs: Admin > Overview       [PG18: Online] [Role] |
+-------------------------+---------------------------------------------------------+
| [D] Overview            |                                                         |
| [U] Users               |  [Metric: Users]   [Metric: Households]                 |
| [H] Households          |  [Metric: Orders]  [Metric: Recipes]                    |
| [R] Retailers & Apps    |                                                         |
| [O] Orders & Ops        |  +---------------------------------------------------+  |
| [B] Recipe Catalog      |  |  14-Day Platform Growth & Velocity (Bar Chart)    |  |
| [S] Audit Logs          |  +---------------------------------------------------+  |
| [K] Staff Management    |                                                         |
| [P] Platform Settings   |  [Recent Audit Stream]       [Recent Simulated Orders]  |
| [A] System Health       |                                                         |
|                         |                                                         |
| [->] Customer Web App   |                                                         |
| [x] Sign Out            |                                                         |
+-------------------------+---------------------------------------------------------+
```

### Persistent Sidebar Navigation
- **Overview (`/admin`):** Central command dashboard displaying real-time database counts, growth velocity, and recent activity streams.
- **Users (`/admin/users`):** Complete user directory with search, role filters, status filters, account suspension, and session invalidation.
- **Households (`/admin/households`):** Registered family units, dietary calibration, spice tolerance, and pantry stats.
- **Retailers & Apps (`/admin/retailers`):** Merchant partner catalogue status and applicant review queue.
- **Orders & Ops (`/admin/orders`):** Simulated checkout transactions, delivery notes, and substitution records.
- **Recipe Catalog (`/admin/recipes`):** Regional Indian recipes catalog, Jain dietary rule validator, and archival switches.
- **Audit Logs (`/admin/audit-logs`):** Append-only immutable stream of platform security events and JSON metadata.
- **Staff Management (`/admin/staff`):** Role assignment and staff provisioning (restricted to `SUPER_ADMIN`).
- **Platform Settings (`/admin/settings`):** Runtime configuration flags and pricing constants.
- **System Health (`/admin/system-health`):** PostgreSQL 18 connection status, process memory allocation, and AI engine fallback readiness.

---

## 3. Dashboard Metric Cards

The Overview dashboard displays four primary live metric cards directly aggregated from PostgreSQL:

1. **Total Registered Users:**
   - Displays total accounts, active accounts, suspended accounts, and unverified signups.
   - Live query: `prisma.user.count()` and `prisma.user.groupBy({ by: ['role'] })`.
2. **Active Households:**
   - Displays total family households and breakdown by dietary type (`VEGETARIAN`, `JAIN`, `VEGAN`).
   - Live query: `prisma.household.count()` and `prisma.household.groupBy({ by: ['dietaryPreference'] })`.
3. **Simulated Orders & GMV:**
   - Displays total order count, total simulated Gross Merchandise Value (GMV in INR), and Average Order Value (AOV).
   - Marked with an explicit **Demo GMV** pill to guarantee financial transparency.
   - Live query: `prisma.order.aggregate({ _sum: { totalAmountInr: true }, _avg: { totalAmountInr: true } })`.
4. **Recipe Catalog:**
   - Total published recipes, active recipes, and Jain-friendly compliant recipes.
   - Live query: `prisma.recipe.count()`.

---

## 4. 14-Day Growth Trends Chart

Below the metric cards is an interactive 14-day velocity chart:
- **Blue Bars:** New customer registrations per calendar day.
- **Terracotta Bars:** Simulated orders placed per calendar day.
- **Hover Inspection:** Hovering over any date column reveals an interactive tooltip with exact daily counts.
- **Data Source:** Computed dynamically by `/api/admin/trends?days=14` by grouping timestamp records in PostgreSQL.

---

## 5. Local Demo Role Switcher

For seamless stakeholder demonstrations and automated test verification without requiring continuous re-logins, the header includes a local **Role Switcher**:
- Click **SUPER_ADMIN** to demonstrate root staff provisioning and system settings editing.
- Click **ADMIN** to demonstrate user suspension and merchant application review.
- Click **OPERATIONS** to demonstrate order fulfillment and substitution coordination.
- Click **SUPPORT** to demonstrate customer inquiry inspection and session revocation.
