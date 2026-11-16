# RasoiIQ Phase 5.1 — Platform Administration & Operations Architecture

**Document Version:** 1.0.0  
**Phase:** 5.1 (Admin Dashboard, Platform Management & Operations Console)  
**Date:** November 2026  
**Audience:** Platform Architects, Security Auditors, Full-Stack Engineers  
**Spend / Cost:** ₹0 / $0 additional spend (Strict Zero-Cost Development Principle)

---

## 1. Architectural Mission & Objectives

Phase 5.1 introduces a production-ready, secure, and operational Platform Administration & Operations Console for RasoiIQ. Building upon the multi-household foundation of Phase 4 and the public authentication/identity architecture of Phase 5.0, Phase 5.1 provides platform operators, support specialists, merchant coordinators, and super-administrators with full oversight and operational control over the food operating system.

### Core Architectural Principles
1. **Real PostgreSQL Metrics Only:** All dashboard statistics, user counts, household numbers, retailer metrics, and order financials are derived from live database queries via Prisma ORM. No numbers are hardcoded, mocked, or fabricated.
2. **Server-Side Role-Based Access Control (RBAC):** Every endpoint under `/api/admin/*` is guarded by NestJS `RolesGuard` enforcing a four-tier administrative hierarchy (`SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `SUPPORT`).
3. **Demo Safeguard Isolation:** All simulated checkout transactions are explicitly flagged with `isDemoOrder: true` and labeled across admin screens to ensure demo orders are never mistaken for real financial transactions.
4. **Append-Only Audit Stream:** All administrative actions (user suspensions, session revocations, merchant approvals, recipe edits, role changes, and system settings updates) are recorded immutably in the PostgreSQL `AuditLog` table with structured JSON metadata.
5. **Zero-Cost Local Reproducibility:** Entire console functions locally using PostgreSQL 18 on WSL2, Next.js 14, and NestJS without paid cloud dependencies or third-party auth SaaS.

---

## 2. High-Level System Architecture

```
                                 [RasoiIQ Platform Architecture]
                                 
      +--------------------------------------------------------------------------+
      |                       Next.js 14 Customer & Admin Web                    |
      |                          (http://localhost:3000)                         |
      |                                                                          |
      |   Customer Experience               Administrative Console               |
      |   - Meal Planning                   - /admin (Overview & 14d Trends)     |
      |   - Nutrition & Pantry              - /admin/users (Directory & Suspend) |
      |   - Smart Cart & Checkout           - /admin/households (Inspector)      |
      |   - Auth: Register / Login          - /admin/retailers (Merchant Apps)   |
      |                                     - /admin/orders (Ops & Notes)        |
      |                                     - /admin/recipes (Catalog & Jain)    |
      |                                     - /admin/audit-logs (Security Stream)|
      |                                     - /admin/staff (SUPER_ADMIN only)    |
      |                                     - /admin/settings (Platform Flags)   |
      |                                     - /admin/system-health (Diagnostics) |
      +--------------------------------------------------------------------------+
                                           |
                              HTTP / JSON (Bearer JWT)
                                           v
      +--------------------------------------------------------------------------+
      |                           NestJS Backend API                             |
      |                          (http://localhost:4000)                         |
      |                                                                          |
      |  +---------------------+   +---------------------+   +----------------+  |
      |  |     AuthModule      |   |     AdminModule     |   |   StoreModule  |  |
      |  | - Argon2id Hashing  |   | - AdminController   |   | - StoreService |  |
      |  | - JWT Tokens & CSRF |   | - AdminService      |   | - Fail-Closed  |  |
      |  | - RolesGuard (RBAC) |   | - RBAC Decorators   |   |   PostgreSQL   |  |
      |  | - AuditService      |   | - Dietary Validator |   |   Connection   |  |
      |  +---------------------+   +---------------------+   +----------------+  |
      +--------------------------------------------------------------------------+
                                           |
                                    Prisma ORM Client
                                           v
      +--------------------------------------------------------------------------+
      |                       PostgreSQL 18 Database Engine                      |
      |                       (WSL2 172.18.158.240:5432/rasoi_iq)                 |
      |                                                                          |
      |   - User (Roles, Status, SuspendedBy, SuspendedAt)                       |
      |   - RefreshSession & Session (Atomic Revocation upon suspension)         |
      |   - Household & HouseholdMember (Dietary calibration & Roster)           |
      |   - Recipe & RecipeIngredient (Catalog, Jain flags, Archival state)      |
      |   - Retailer & RetailerApplication (Merchant onboarding & Status)        |
      |   - Order & OrderItem (isDemoOrder: true, notes, fulfillment state)      |
      |   - AuditLog (Immutable event logs with actor, entity, metadata)         |
      |   - SystemSetting (Runtime configuration key-value storage)              |
      +--------------------------------------------------------------------------+
```

---

## 3. Database Schema Extensions (Prisma ORM)

The PostgreSQL schema (`packages/database/prisma/schema.prisma`) was extended in a non-destructive manner, preserving all existing pilot records:

```prisma
enum Role {
  CUSTOMER
  RETAILER
  ADMIN
  SUPER_ADMIN
  OPERATIONS
  SUPPORT
}

model User {
  id               String            @id @default(cuid())
  email            String            @unique
  normalizedEmail  String            @default("")
  passwordHash     String
  fullName         String
  phoneNumber      String?
  role             Role              @default(CUSTOMER)
  status           UserStatus        @default(ACTIVE)
  suspensionReason String?
  suspendedAt      DateTime?
  suspendedBy      String?
  emailVerifiedAt  DateTime?
  lastLoginAt      DateTime?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  ...
}

model RetailerApplication {
  id                 String                    @id @default(cuid())
  userId             String
  user               User                      @relation(fields: [userId], references: [id], onDelete: Cascade)
  businessName       String
  contactInformation Json
  applicationStatus  RetailerApplicationStatus @default(PENDING)
  submittedAt        DateTime                  @default(now())
  reviewedAt         DateTime?
  reviewedBy         String?
  rejectionReason    String?
  @@index([userId])
}

model Order {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  retailerName      String
  status            String      @default("PLACED")
  totalAmountInr    Float
  deliveryFeeInr    Float
  deliveryAddress   String
  isDemoOrder       Boolean     @default(true)
  substitutionNotes String?
  fulfillmentNotes  String?
  statusReason      String?
  updatedBy         String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  ...
}

model Recipe {
  id                   String             @id @default(cuid())
  title                String
  slug                 String             @unique
  description          String
  cuisine              String
  dietaryTags          String[]
  isJainFriendly       Boolean            @default(false)
  isArchived           Boolean            @default(false)
  archivedAt           DateTime?
  archivedBy           String?
  ...
}

model SystemSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  updatedBy   String?
  updatedAt   DateTime @updatedAt
  createdAt   DateTime @default(now())
}
```

---

## 4. API Endpoints Specification

| Endpoint | HTTP | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/overview` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `SUPPORT` | Live platform metrics (users, households, orders, recipes, retailers) |
| `/api/admin/trends` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `SUPPORT` | 14-day aggregated time series of registrations, households, orders |
| `/api/admin/users` | `GET` | `SUPER_ADMIN`, `ADMIN`, `SUPPORT`, `OPERATIONS` | User directory with search, role, status filters, and pagination |
| `/api/admin/users/:id` | `GET` | `SUPER_ADMIN`, `ADMIN`, `SUPPORT`, `OPERATIONS` | Detailed user inspection (households, orders, sessions count) |
| `/api/admin/users/:id/status` | `PATCH` | `SUPER_ADMIN`, `ADMIN` | Suspend / Reactivate account with mandatory reason |
| `/api/admin/users/:id/revoke-sessions` | `POST` | `SUPER_ADMIN`, `ADMIN`, `SUPPORT` | Invalidate all active JWT refresh tokens and sessions |
| `/api/admin/users/:id/resend-verification` | `POST` | `SUPER_ADMIN`, `ADMIN`, `SUPPORT` | Resend verification email to unverified customer |
| `/api/admin/households` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `SUPPORT` | Household directory with dietary filter and pagination |
| `/api/admin/households/:id` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `SUPPORT` | Deep inspection of household members, dietary rules, and pantry |
| `/api/admin/retailers/applications` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS` | Merchant onboarding applications review stream |
| `/api/admin/retailers/applications/:id` | `PATCH` | `SUPER_ADMIN`, `ADMIN` | Approve (elevates to RETAILER) or Reject (with reason) |
| `/api/admin/retailers` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `SUPPORT` | Active/suspended retail partner list |
| `/api/admin/retailers/:id/status` | `PATCH` | `SUPER_ADMIN`, `ADMIN` | Update retailer status (ACTIVE / SUSPENDED) |
| `/api/admin/orders` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `SUPPORT` | Simulated order operations list (isDemoOrder: true) |
| `/api/admin/orders/:id` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `SUPPORT` | Detailed order line items and fulfillment history |
| `/api/admin/orders/:id/status` | `PATCH` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS` | Update status, substitution notes, fulfillment notes |
| `/api/admin/recipes` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `SUPPORT` | Recipe catalog with cuisine and archival filters |
| `/api/admin/recipes/:id` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `SUPPORT` | Detailed recipe inspection with ingredients and nutrition |
| `/api/admin/recipes` | `POST` | `SUPER_ADMIN`, `ADMIN` | Create recipe with strict Jain and vegetarian validation |
| `/api/admin/recipes/:id` | `PATCH` | `SUPER_ADMIN`, `ADMIN` | Update recipe title, description, time, calories, macros |
| `/api/admin/recipes/:id/archive` | `PATCH` | `SUPER_ADMIN`, `ADMIN` | Toggle recipe archival status (isArchived: boolean) |
| `/api/admin/audit-logs` | `GET` | `SUPER_ADMIN`, `ADMIN` | Query immutable security audit log stream with pagination |
| `/api/admin/staff` | `GET` | `SUPER_ADMIN` | List platform staff accounts |
| `/api/admin/staff` | `POST` | `SUPER_ADMIN` | Provision new staff member (ADMIN, OPERATIONS, SUPPORT) |
| `/api/admin/staff/:id/role` | `PATCH` | `SUPER_ADMIN` | Update staff member role permission tier |
| `/api/admin/settings` | `GET` | `SUPER_ADMIN`, `ADMIN` | Read runtime platform configuration settings |
| `/api/admin/settings` | `PATCH` | `SUPER_ADMIN` | Upsert system configuration key-value |
| `/api/admin/health` | `GET` | `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `SUPPORT` | Live service diagnostics probe (Postgres, Memory, AI, Email) |

---

## 5. Security & Isolation Controls

1. **Denial of Privilege Escalation:** The public registration endpoint (`/api/auth/register`) strictly sets `role: CUSTOMER` regardless of any attacker-supplied role parameter in the payload.
2. **Session Invalidation on Suspension:** When an administrator suspends a user, all active sessions and refresh token families in `RefreshSession` are deleted atomically in the same database transaction.
3. **Self-Suspension Protection:** Administrators are prevented by server-side logic from suspending their own accounts (by ID and email match).
4. **Hierarchical Promotion Guard:** A regular `ADMIN` cannot suspend, demote, or modify a `SUPER_ADMIN` account.
5. **No Plaintext Passwords:** Argon2id is used for all staff and admin accounts. Password hashes are excluded from all admin GET responses.
