# RasoiIQ Phase 6.0 — Baseline Repository & System Audit

**Milestone:** Phase 6.0 Controlled Household Pilot Readiness  
**Date:** November 2026  
**Auditor:** Principal Software Architect, Application Security Engineer & QA Lead  
**Repository:** RasoiIQ Indian Household Food Operating System  
**Environment:** Windows 11 + WSL2 Ubuntu + PostgreSQL 18.6 + Node.js v24.22.1  
**Infrastructure Spend:** ₹0 / $0 additional spend  

---

## 1. Executive Baseline Summary

This audit establishes the concrete, verifiable baseline of the RasoiIQ repository prior to the launch of the 3-household supervised pilot. Every metric and assertion in this document is derived from direct inspection of source code, runtime environment probes, and database queries.

---

## 2. Technical Stack & Environment Verification

| Component | Verified Version / State | Execution Probe Command | Status |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v24.22.1` | `node -v` | PASS |
| **npm** | `11.19.1` | `npm.cmd -v` | PASS |
| **Operating System** | Windows 11 x64 + WSL2 Ubuntu 26.04 | `wsl uname -a` | PASS |
| **Database** | PostgreSQL 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1) | `SELECT version();` | PASS |
| **Prisma ORM** | `6.19.3` | `npx.cmd prisma -v` | PASS |
| **TypeScript** | `5.9.3` / `5.7.3` | `npx.cmd tsc -v` | PASS |
| **Frontend App** | Next.js 14.2.35 (Port 3000) | `http://localhost:3000` | PASS |
| **Backend API** | NestJS 10.4.15 (Port 4000) | `http://localhost:4000/api` | PASS |
| **Git Commit** | `a098314` (Branch: `phase-5.2.1-checkpoint`) | `wsl git log -1 --oneline` | PASS |

---

## 3. Monorepo Architecture & Directory Structure

```text
d:\Startup\
├── apps/
│   ├── customer-web/          # Next.js 14 customer, cook & admin web application
│   ├── admin-dashboard/       # Operational console view
│   └── retailer-dashboard/    # Retail partner management view
├── services/
│   └── api/                   # NestJS monolithic modular backend service
│       ├── src/
│       │   ├── auth/          # Argon2id, JWT, Rate Limiting, Audit
│       │   ├── household/     # Multi-household membership & RBAC
│       │   ├── recipes/       # Regional recipe catalog & filters
│       │   ├── meal-plans/    # AI meal generation & Maharaj cook digest
│       │   ├── grocery/       # Smart basket & scaling engine
│       │   ├── marketplace/   # Retailers, products & simulated checkout
│       │   ├── pantry/        # Household inventory & tracking
│       │   ├── ai/            # Gemini Flash-Lite cascade & deterministic fallback
│       │   ├── admin/         # Platform administration & operational controls
│       │   ├── health/        # Database and service health probes
│       │   └── data/          # StoreService & PostgreSQL Prisma connection
├── packages/
│   ├── database/              # Prisma schema, migrations, seed data
│   ├── grocery-engine/        # Dietary filters, allergen checks, nutrition engine
│   ├── shared-types/          # Canonical TypeScript interfaces & types
│   └── validation/            # Zod validation schemas
├── backups/                   # Encrypted, custom-format PostgreSQL backups
├── docs/                      # Architectural, milestone & operational documentation
└── scripts/                   # Automated verification & test runners
```

---

## 4. PostgreSQL Database Baseline & Record Counts

Queried directly from `rasoi_iq` database via PostgreSQL `pg_catalog`:

| Table Name | Persistent Records | Primary Purpose | Verification Status |
| :--- | :--- | :--- | :--- |
| `User` | 153 | Customer, staff, retailer, cook identities | PASS |
| `Household` | 46 | Multi-tenant household accounts | PASS |
| `HouseholdMember` | 59 | Member profiles, roles, allergies | PASS |
| `HouseholdInvitation` | 6 | Single-use invitation tokens | PASS |
| `Recipe` | 46 | Regional Indian recipes | PASS |
| `RecipeIngredient` | 339 | Structured ingredients per recipe | PASS |
| `RecipeStep` | 149 | Cooking steps and techniques | PASS |
| `Ingredient` | 57 | Master ingredient registry | PASS |
| `MealPlan` | 7 | Active household meal schedules | PASS |
| `MealPlanItem` | 27 | Scheduled meal slots | PASS |
| `PantryItem` | 18 | In-stock household pantry supplies | PASS |
| `Order` | 277 | Simulated grocery checkout orders | PASS |
| `Product` | 44 | Retail catalog products | PASS |
| `ProductVariant` | 49 | SKU variants, pricing, packaging | PASS |
| `Retailer` | 44 | Quick-commerce & supermarket vendors | PASS |
| `RetailerApplication` | 61 | Merchant onboarding applications | PASS |
| `AuditLog` | 736 | Append-only database-immutable audit events | PASS |
| `RefreshSession` | 126 | Active & rotated device sessions | PASS |
| `EmailVerificationToken`| 97 | Single-use registration verification tokens | PASS |
| `PasswordResetToken` | 2 | Single-use password recovery tokens | PASS |
| `RevokedToken` | 47 | Blacklisted JWT access tokens | PASS |
| `SystemSetting` | 7 | Operational configuration settings | PASS |

---

## 5. Security & Persistence Settings

1. **Storage Mode:** `STORAGE_MODE=postgres` strictly enforced.
2. **Fail-Closed Constraint:** `REQUIRE_DATABASE=true` halts backend startup if PostgreSQL connection fails.
3. **Database Immuntability:** PostgreSQL triggers `trg_audit_log_immutable_update` and `trg_audit_log_immutable_delete` block any attempt to modify or delete audit log entries.
4. **Zero Spend:** All services run locally on developer hardware with ₹0 additional cloud or API costs.
