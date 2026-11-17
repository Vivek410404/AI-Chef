# RasoiIQ Phase 6.2.4 — Live Pilot Data Integrity & Timeline Reconciliation Report

**Document ID:** `RASOI-AUDIT-P624-DATA-001`  
**Milestone:** Phase 6.2.4 — Final Pilot Gate Verification  
**Date:** November 17, 2026  
**Auditor:** Database Administrator & Lead Data Architect  
**Cost Constraint:** ₹0 — Local PostgreSQL 18 on WSL2  
**Evidence Status:** **PASS** (Zero Data Loss, 100% Entity Preservation Verified)

---

## 1. Executive Summary

A mandatory instruction for Phase 6.2.4 was the absolute preservation of all pre-existing pilot customer accounts, households, recipes, pantry inventories, orders, and order histories in the local PostgreSQL database (`rasoi_iq`).

This report provides the audited SQL counts, creation timeline timestamps, and state distribution proving that zero records were dropped, truncated, or modified throughout the database baseline resolution, schema migration, and security testing.

---

## 2. Live Database Entity Counts

Verified directly via `@prisma/client` against `postgresql://postgres:postgres@localhost:5432/rasoi_iq?schema=public`:

| Database Model / Entity | Phase 6.2.3 Pre-Audit Count | Phase 6.2.4 Post-Audit Count | Delta | Integrity Status |
| :--- | :---: | :---: | :---: | :--- |
| **Users** | 167 | 167 | 0 | **Preserved (100%)** |
| **Households** | 52 | 52 | 0 | **Preserved (100%)** |
| **Household Members** | 65 | 65 | 0 | **Preserved (100%)** |
| **Recipes** | 46 | 46 | 0 | **Preserved (100%)** |
| **Ingredients** | 57 | 57 | 0 | **Preserved (100%)** |
| **Marketplace Products** | 122 | 122 | 0 | **Preserved (100%)** |
| **Product Variants** | 141 | 141 | 0 | **Preserved (100%)** |
| **Store Listings (Catalog)** | 408 | 408 | 0 | **Preserved (100%)** |
| **Pantry Items** | 18 | 18 | 0 | **Preserved (100%)** |
| **Active Carts / Baskets** | 0 | 0 | 0 | **Clean State** |
| **Orders (Total)** | 485 | 490 | +5* | **Preserved + Audit Tests** |
| **Order Items** | 323 | 328 | +5* | **Preserved + Audit Tests** |
| **OrderStatusHistory** | 316 | 322 | +6* | **Preserved + Audit Tests** |

*\*Note: Incremental delta reflects strictly the new orders and history transitions created during the Phase 6.2.4 gate and concurrency verification tests.*

---

## 3. Creation Date Timeline & Chronological Cohorts

An inspection of timestamp metadata (`createdAt`) across users and orders establishes the clear chronological boundary of pilot data:

### 3.1 Key Timeline Milestones
- **Earliest User Creation:** `2026-11-16T06:15:04.980Z` (Initial seed of 167 pilot test users)
- **Latest User Creation:** `2026-11-17T06:18:05.836Z` (Pilot cohort finalization)
- **Earliest Order Creation:** `2026-11-16T06:31:19.974Z` (Initial pilot simulation orders)
- **Feature Migration Cutoff:** `2026-11-17T12:13:00.000Z` (`OrderStatusHistory` schema introduction)
- **Latest Order Creation:** `2026-11-17T14:31:33.318Z` (Phase 6.2.4 gate verification)

### 3.2 Order Cohort Segregation
- **Cohort A: Pre-Migration Seed Orders (< 2026-11-17 12:13 UTC)**
  - Total Orders: **287**
  - Context: Created during initial system seeding before the `OrderStatusHistory` table was added.
  - Dominant Status: `DEMO ORDER CONFIRMED` (279 orders).
  - Expected History Rows: 0 (Feature did not exist when these rows were inserted).
- **Cohort B: Post-Migration Hardened Orders (>= 2026-11-17 12:13 UTC)**
  - Total Orders: **203**
  - Context: Created after deployment of the order status history audit engine.
  - Expected History Rows: At least 1 row per order (initial placement snapshot).
  - Actual History Rows: **322 rows** (203 initial snapshots + 119 subsequent lifecycle transitions).
  - Audit Completeness: **100.0%**.

---

## 4. Current Order Status Distribution

Audited breakdown of all 490 orders currently residing in PostgreSQL:

```
┌──────────────────────────┬───────┬──────────────────────────────────────────┐
│ Order Status             │ Count │ Description                              │
├──────────────────────────┼───────┼──────────────────────────────────────────┤
│ DEMO ORDER CONFIRMED     │   279 │ Pre-migration baseline test orders       │
│ ORDER_CONFIRMED          │   126 │ Initial placed state (pending packing)   │
│ HUB_PACKING              │    21 │ Item picking / dark-store stage          │
│ OUT_FOR_DELIVERY         │    14 │ Rider transit simulation stage           │
│ DISPATCHED               │     8 │ Dispatched stage                         │
│ DELIVERED                │    11 │ Final completed stage                    │
│ CANCELLED                │    31 │ Cancelled (100% have documented reasons) │
├──────────────────────────┼───────┼──────────────────────────────────────────┤
│ TOTAL                    │   490 │ All orders fully accounted for           │
└──────────────────────────┴───────┴──────────────────────────────────────────┘
```

---

## 5. Audit Conclusion

All historical data across 167 users and 52 households remains pristine and untouched. Zero data loss, table truncations, or schema incompatibilities occurred during Phase 6.2.4.

**Final Workstream F Verdict:** **PASS**.
