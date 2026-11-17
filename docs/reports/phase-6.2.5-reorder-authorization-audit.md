# RasoiIQ Phase 6.2.5 — Workstream A: Reorder Authorization & Idempotency Audit

**Milestone:** Phase 6.2.5  
**Date:** November 17, 2026  
**Auditor:** Senior Backend Architect, Application Security Engineer  
**Status:** **PASS** (10/10 Mandatory Tests Directly Verified)

---

## 1. Executive Summary

In Phase 6.2.4, an architectural vulnerability was identified in the reorder idempotency flow: cached responses were evaluated prior to caller household membership and order ownership verification. In Phase 6.2.5, this sequence was completely refactored to enforce the core security invariant:

> **Core Security Invariant:** Authorization and household ownership verification must execute *strictly before* any cached basket response can be retrieved or returned to the client.

The sequence was audited across `services/api/src/grocery/grocery.controller.ts` and `services/api/src/grocery/grocery.service.ts`. A 13-step sequence was implemented, and 10 mandatory security scenarios were executed against the live API, achieving a **100% PASS** rate.

---

## 2. Implemented 13-Step Authorization & Idempotency Pipeline

The reorder handler enforces the following exact sequential lifecycle:

```
[Incoming Request: POST /api/grocery/cart/reorder]
         │
         ▼
 1. Authenticate Caller
    ├── Extract JWT Bearer Token
    └── Verify signature, revocation, active session
         │
         ▼
 2. Resolve Requested Household
    ├── Extract householdId from body or token
    └── Map to authorized context
         │
         ▼
 3. Verify Active Household Membership
    ├── assertHouseholdMembership(user, householdId)
    └── Reject non-members immediately (403 Forbidden)
         │
         ▼
 4. Validate Source Order Ownership
    ├── SELECT * FROM "Order" WHERE id = options.orderId
    ├── Verify order.householdId === resolvedHouseholdId
    └── Reject cross-household access (403 Forbidden)
         │
         ▼
 5. Validate & Normalize Idempotency Parameters
    ├── Validate idempotency-key format (length 8..128, alphanumeric + hyphen/underscore)
    └── Fingerprint request payload (SHA-256 over orderId, targetRetailer, replaceCart)
         │
         ▼
 6. Check Idempotency Cache (Namespaced by Household)
    ├── Key format: `reorder:${householdId}:${idempotencyKey}`
    ├── If cached entry exists:
    │     ├── Compare fingerprint (Mismatch -> 409 Conflict)
    │     └── If fingerprint matches -> Return cached 200 OK
    └── If cache miss -> Proceed to mutation
         │
         ▼
 7. Acquire Household-Scoped Mutex Lock
    ├── Mutex scoped to `householdId`
    └── Enqueue concurrent calls for same household
         │
         ▼
 8. Recheck Household Membership Under Lock
    └── Guard against concurrent member removal/suspension
         │
         ▼
 9. Recheck Cache Under Lock (Double-Checked Locking)
    ├── If concurrent request finished while waiting -> Return cached 200 OK
    └── If still cache miss -> Proceed
         │
         ▼
10. Validate Source Order, Catalog Availability & Live Prices
    ├── Re-verify order has non-empty items
    ├── Query live RetailerListing / ProductVariant for current stock & pricing
    └── Detect out-of-stock items or price shifts
         │
         ▼
11. Perform Database Basket Mutation
    ├── Reset or append items in Prisma/active basket
    └── Recalculate totals at current retailer rates
         │
         ▼
12. Populate Idempotency Cache AFTER Successful Mutation
    ├── Cache response with 300,000ms (5 min) TTL
    └── Include payload fingerprint and canonical response
         │
         ▼
13. Release Mutex in `finally` Block
    └── Guarantees unblocking of waiting requests under all error conditions
```

---

## 3. Empirical Verification Evidence (10 Mandatory Tests)

All 10 mandatory test scenarios were executed via `scripts/test-phase625-comprehensive.mjs` against the live local backend on port 4000:

| # | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **1** | Valid household member, initial reorder request | `200 OK`, new basket created | `HTTP 200`, valid basket returned | **PASS** |
| **2** | Valid household member, repeated identical request with same key | `200 OK`, cached response returned (no re-mutation) | `HTTP 200`, cached payload verified | **PASS** |
| **3** | Repeated request with same key but altered payload (e.g., replaceCart flipped) | `409 Conflict`, error returned | `HTTP 409`, "Idempotency key reused with different payload" | **PASS** |
| **4** | Non-member of household attempting fresh key reorder | `403 Forbidden`, blocked before mutation | `HTTP 403`, "ForbiddenException: Access denied" | **PASS** |
| **5** | Non-member attempting to retrieve previously successful cached reorder | `403 Forbidden`, blocked before cache return | `HTTP 403`, blocked at Step 3 | **PASS** |
| **6** | Cross-household order hijacking (User from Household B reordering Household A's order) | `403 Forbidden`, blocked before cache lookup | `HTTP 403`, "Household access violation" | **PASS** |
| **7** | Unauthenticated caller (no JWT bearer token) | `401 Unauthorized`, blocked at entry gate | `HTTP 401`, "Authentication required to reorder" | **PASS** |
| **8** | Retailer role attempting to execute household reorder | `403 Forbidden`, blocked by role gate | `HTTP 403`, "Retailers cannot access household basket" | **PASS** |
| **9** | Concurrency burst: 3 simultaneous requests with identical key | Exactly 1 mutation, 3x `200 OK` returned | Mutex serialized execution; exactly 1 mutation | **PASS** |
| **10** | Malformed idempotency key (whitespace, symbols, length < 8) | `400 Bad Request`, rejected at validation gate | `HTTP 400`, "Invalid idempotency key format" | **PASS** |

---

## 4. Architectural Boundaries & Disclosures

1. **Zero-Redis In-Memory Architecture**:
   - The current cache and mutex implementation uses Node.js in-memory maps (`reorderIdempotencyCache` and `householdLocks`).
   - Suitable for single-process local supervised household pilot.
   - **Pilot Disclosure**: In-memory caching and mutexes do not survive server restarts or scale horizontally across multiple worker processes without external shared state (e.g., Redis / PostgreSQL advisory locks). For production payment gateways, database-backed idempotency records (`IdempotencyKey` table) must be deployed.
2. **Process Restart Behavior**:
   - Upon process restart, the in-memory cache and locks reset cleanly.
   - Any client repeating an idempotency key after restart will execute a fresh validation; because source order status and household validation are backed by PostgreSQL, no data corruption or cross-tenant leakage can occur.

---

## 5. Verification Verdict

**WORKSTREAM A VERDICT:** **PASS** — Full authorization precedes cache evaluation; cross-household attacks and cached-key hijacking are strictly blocked.
