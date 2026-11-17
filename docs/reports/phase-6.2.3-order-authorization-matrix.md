# RasoiIQ Phase 6.2.3 — Order Lifecycle & Cancellation Authorization Matrix

**Project:** RasoiIQ — Indian Household Food Operating System  
**Milestone:** Phase 6.2.3 — Security, Migration & Pilot Evidence Reconciliation  
**Date:** November 17, 2026  
**Auditor:** Senior Product Architect & Database Integrity Specialist  
**Cost Constraint:** ₹0 (Local PostgreSQL 18, NestJS, Next.js, Prisma)  
**Lifecycle Hardening Status:** **PASS** (17/17 Matrix Test Assertions Verified)

---

## 1. Executive Summary

RasoiIQ enforces strict state machine invariants and role-based access control (RBAC) across all grocery order lifecycle actions. Orders originate in `ORDER_CONFIRMED` upon single-retailer simulated checkout and advance sequentially through `HUB_PACKING`, `OUT_FOR_DELIVERY`, and reach terminal status `DELIVERED` or `CANCELLED`.

This document codifies the verified authorization matrix governing which actors may trigger state transitions and cancellations, the exact preconditions required, and the audit trail persisted to PostgreSQL.

---

## 2. Order Lifecycle State Machine

```
                      ┌──────────────────────────────────────────────┐
                      │              ORDER_CONFIRMED                 │
                      └───────┬───────────────────────────────┬──────┘
                              │                               │
                HUB_PACKING   │                 Cancelled by: │ Customer (with reason)
                              ▼                 Retailer, or  │ Retailer (stockout)
                      ┌───────────────────────┐ Admin         │ Admin (ops issue)
                      │      HUB_PACKING      │               │
                      └───────┬───────────────┴───────────────┼───────────────┐
                              │                               │               │
             OUT_FOR_DELIVERY │                 Cancelled by: │               │
                              ▼                 Retailer, or  │               │
                      ┌───────────────────────┐ Admin         │               │
                      │   OUT_FOR_DELIVERY    │               │               │
                      └───────┬───────────────┴───────────────┼───────┐       │
                              │                               │       │       │
                    DELIVERED │                 Cancelled by: │       │       │
                              ▼                 Admin only    │       │       │
                      ┌───────────────────────┐               │       │       │
                      │  DELIVERED (Terminal) │               ▼       ▼       ▼
                      └───────────────────────┘          ┌─────────────────────────┐
                                                         │  CANCELLED (Terminal)   │
                                                         └─────────────────────────┘
```

### Invariants:
1. **Forward Progression Only:** `ORDER_CONFIRMED` → `HUB_PACKING` → `OUT_FOR_DELIVERY` → `DELIVERED`. Direct state skipping (e.g. `ORDER_CONFIRMED` → `DELIVERED`) is rejected (`400 Bad Request`).
2. **Terminal State Immutability:** Both `DELIVERED` and `CANCELLED` are immutable terminal states. Reopening or transitioning from a terminal state is strictly rejected (`400 Bad Request`).
3. **Idempotent Transitions:** Repeating a transition that places an order in its current status is an idempotent no-op that returns the current order without creating duplicate audit rows.

---

## 3. Comprehensive Role Authorization Matrix

| Action / Transition | Customer | Retailer Partner | Admin / Ops | Trusted System Worker |
|---|:---:|:---:|:---:|:---:|
| **Advance: ORDER_CONFIRMED → HUB_PACKING** | ❌ Blocked (`403`) | ✅ Allowed (Own orders) | ✅ Allowed | ✅ Allowed (Internal secret) |
| **Advance: HUB_PACKING → OUT_FOR_DELIVERY** | ❌ Blocked (`403`) | ✅ Allowed (Own orders) | ✅ Allowed | ✅ Allowed (Internal secret) |
| **Advance: OUT_FOR_DELIVERY → DELIVERED** | ❌ Blocked (`403`) | ✅ Allowed (Own orders) | ✅ Allowed | ✅ Allowed (Internal secret) |
| **Skip State (e.g. CONFIRMED → DELIVERED)** | ❌ Blocked (`403`) | ❌ Blocked (`400`) | ❌ Blocked (`400`) | ❌ Blocked (`400`) |
| **Cancel in ORDER_CONFIRMED** | ✅ Allowed (Own household, reason $\ge 3$ chars) | ✅ Allowed (Own store orders) | ✅ Allowed | ❌ Blocked (Worker only fulfills) |
| **Cancel in HUB_PACKING** | ❌ Blocked (`400`) (Packing in progress) | ✅ Allowed (Stockout / cannot fulfill) | ✅ Allowed | ❌ Blocked |
| **Cancel in OUT_FOR_DELIVERY** | ❌ Blocked (`400`) (Dispatched / in transit) | ❌ Blocked (`400`) (Rider dispatched) | ✅ Allowed (Critical ops intervention) | ❌ Blocked |
| **Cancel in DELIVERED** | ❌ Blocked (`400`) (Terminal state) | ❌ Blocked (`400`) (Terminal state) | ❌ Blocked (`400`) (Terminal state) | ❌ Blocked (`400`) |
| **Cancel in CANCELLED** | ℹ️ No-Op (200, idempotent) | ℹ️ No-Op (200, idempotent) | ℹ️ No-Op (200, idempotent) | ❌ Blocked |
| **Cross-Household Order Access** | ❌ Blocked (`403`) | N/A (Scoped to store) | ✅ Allowed | N/A |
| **Cross-Retailer Order Access** | N/A | ❌ Blocked (`403`) | ✅ Allowed | N/A |

---

## 4. Cancellation Reason & Input Validation

The system enforces strict input validation on all cancellation requests:
1. **Mandatory Field:** Request body must contain `reason`.
2. **Whitespace Stripping:** Whitespace-only strings (e.g. `"   "`) are rejected with `400 Bad Request`.
3. **Minimum Length:** Reason must be at least 3 characters long. Single-word abbreviations or empty strings (e.g. `"no"`, `""`) are rejected with `400 Bad Request` (`Cancellation reason must be at least 3 characters.`).

---

## 5. PostgreSQL Audit Trail Durability

Every state transition and cancellation writes an immutable row to the `OrderStatusHistory` table via Prisma transaction:
- `id`: CUID identifier
- `orderId`: Foreign key referencing `Order.id`
- `fromStatus`: Previous order status (or `'START'` for initial creation)
- `toStatus`: New order status
- `reason`: Cancellation explanation or operational transition note
- `changedBy`: Identity of the actor (`user.email`, `retailer-owner`, or `system-worker`)
- `createdAt`: UTC timestamp

---

## 6. Test Suite Evidence: 17 Matrix Scenarios

All 17 matrix rules were executed against the live backend in `scripts/test-phase623-security.mjs`:

| Test # | Description | Role / Scenario | Expected | Result |
|---|---|---|:---:|:---:|
| 2.1 | Customer cancels own order in ORDER_CONFIRMED | Customer (`hh-sharma-family`) | 200 OK | **PASS** |
| 2.2 | Customer cancels own order in HUB_PACKING | Customer | 400 Bad Request | **PASS** |
| 2.3 | Customer cancels own order in OUT_FOR_DELIVERY | Customer | 400 Bad Request | **PASS** |
| 2.4 | Customer attempts to cancel another household's order | Customer (`hh-sharma` vs `hh-patel`) | 403 Forbidden | **PASS** |
| 2.5 | Cancel request with missing reason property | Any | 400 Bad Request | **PASS** |
| 2.6 | Cancel request with whitespace-only reason | Any | 400 Bad Request | **PASS** |
| 2.7 | Cancel request with reason shorter than 3 characters | Any | 400 Bad Request | **PASS** |
| 2.8 | Customer attempts to advance fulfillment status directly | Customer | 403 Forbidden | **PASS** |
| 2.9 | Retailer cancels assigned order in ORDER_CONFIRMED | Retailer Partner | 200 OK | **PASS** |
| 2.10 | Retailer cancels assigned order in HUB_PACKING | Retailer Partner | 200 OK | **PASS** |
| 2.11 | Retailer cancels unassigned order belonging to other grocer | Retailer Partner | 403 Forbidden | **PASS** |
| 2.12 | Retailer cancels order once in OUT_FOR_DELIVERY | Retailer Partner | 400 Bad Request | **PASS** |
| 2.13 | Retailer attempts illegal state jump straight to DELIVERED | Retailer Partner | 400 Bad Request | **PASS** |
| 2.14 | Admin cancels active order in any eligible non-terminal state | Admin / Operations | 200 OK | **PASS** |
| 2.15 | Duplicate cancellation on terminal CANCELLED order | Any Authorized | 200 OK (Idempotent) | **PASS** |
| 2.16 | Admin attempt to reopen/un-cancel a terminal CANCELLED order | Admin | 400 Bad Request | **PASS** |
| 2.17 | State transition audit trail accurately logs actor in database | Audit Trail | `changedBy` matches actor | **PASS** |

---

## 7. Conclusion

The Order Lifecycle & Cancellation state machine satisfies all household safety, retailer partition, and regulatory audit criteria for the Supervised Household Pilot.

**Status:** **PASS**
