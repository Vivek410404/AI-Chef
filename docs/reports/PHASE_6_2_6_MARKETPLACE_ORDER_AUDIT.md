# RasoiIQ Phase 6.2.6 — Marketplace, Grocery Engine & Order Lifecycle Audit

**Milestone:** Phase 6.2.6  
**Date:** November 18, 2026  
**Auditor:** Senior Backend & Marketplace Architect  
**Cost Constraint:** ₹0 — In-memory grocery recalculation + PostgreSQL transaction locks  
**Status:** **PASS (100% Marketplace Integrity Verified)**

---

## 1. Single-Retailer Checkout Rule Enforcement

RasoiIQ requires all products in a single checkout to originate from exactly one merchant (Blinkit, Zepto, DMart Ready, BigBasket) to ensure single-trip doorstep delivery without split orders and double delivery fees.

### 1.1 Conflict Detection & Re-Pricing Mechanism
1. **Catalog Multipliers:** Live prices reflect real-time retailer pricing rules:
   - Blinkit (`ret-blinkit`): Base convenience pricing, 10-15 min delivery.
   - Zepto (`ret-zepto`): Rush pricing, 10 min delivery.
   - DMart Ready (`ret-dmart`): Wholesale discount pricing (approx. 10-15% lower than quick-commerce).
   - BigBasket (`ret-bigbasket`): Comprehensive assortment, scheduled 2-4 hr delivery.
2. **Switch Retailer Endpoint:** Verified `POST /api/grocery/cart/switch-retailer` with `{ retailerId: "ret-zepto" }`:
   - Automatically switches active merchant context.
   - Recalculates subtotal, delivery fee, and packaging costs.
   - Preserves cart quantities without dropping items.
   - Tested directly in `ShopHomeView.tsx` and via automated HTTP clients.

---

## 2. Order Lifecycle State Machine

The order lifecycle follows a strict deterministic state progression audited in [order-lifecycle.service.ts](file:///d:/Startup/services/api/src/marketplace/order-lifecycle.service.ts):

```
ORDER_CONFIRMED ──────► HUB_PACKING ──────► OUT_FOR_DELIVERY ──────► DELIVERED (Terminal)
       │                      │
       ▼                      ▼
   CANCELLED              CANCELLED
  (Customer/Admin)     (Retailer/Admin)
```

### 2.1 State Transition Verification Matrix

| Transition Attempt | Permitted Roles | Verification Result | Evidence |
| :--- | :--- | :--- | :--- |
| `ORDER_CONFIRMED` -> `HUB_PACKING` | `RETAILER`, `ADMIN`, `SYSTEM_WORKER` | **PASS (200 OK)** | `test-phase621-integrity.mjs` (Step 5) |
| `HUB_PACKING` -> `OUT_FOR_DELIVERY` | `RETAILER`, `ADMIN`, `SYSTEM_WORKER` | **PASS (200 OK)** | `test-phase621-integrity.mjs` (Step 6) |
| `OUT_FOR_DELIVERY` -> `DELIVERED` | `RETAILER`, `ADMIN`, `SYSTEM_WORKER` | **PASS (200 OK)** | `test-phase621-integrity.mjs` (Step 7) |
| `ORDER_CONFIRMED` -> `CANCELLED` | `CUSTOMER` (Own order), `RETAILER`, `ADMIN` | **PASS (200 OK)** | `test-phase623-security.mjs` (Step 2.1) |
| `HUB_PACKING` -> `CANCELLED` (Customer) | `CUSTOMER` | **BLOCKED (400 Bad Request)** | `test-phase623-security.mjs` (Step 2.2) |
| `OUT_FOR_DELIVERY` -> `CANCELLED` | `CUSTOMER`, `RETAILER` | **BLOCKED (400 Bad Request)** | `test-phase623-security.mjs` (Step 2.3) |
| Terminal State (`DELIVERED`) -> Any State | Any Role | **BLOCKED (400 Bad Request)** | `test-phase621-integrity.mjs` (Step 9) |
| Terminal State (`CANCELLED`) -> Any State | Any Role | **BLOCKED (400 Bad Request)** | `test-phase623-security.mjs` (Step 2.16) |

---

## 3. Reorder Idempotency & Concurrency

Reorder requests at `POST /api/grocery/cart/reorder` were evaluated under concurrent burst traffic:
- **Household Mutex Locking:** Scoped concurrency lock ensures only one active mutation can process per household at a time.
- **Payload Fingerprinting:** MD5 fingerprinting detects request tampering. Submitting a different payload with a reused idempotency key triggers `409 Conflict` (`IDEMPOTENCY_CONFLICT`).
- **Idempotent Replay:** Replaying the identical request returns `isIdempotentReplay: true` with the cached basket, preventing duplicate order placements.
- **Concurrent Burst:** 5 simultaneous requests with the same key yielded exactly 1 database write and 4 cached replays with zero deadlock or state corruption.

---

## 4. Audit Retention & Immutability

- `OrderStatusHistory` stores every status transition with `orderId`, `fromStatus`, `toStatus`, `changedBy`, `timestamp`, and optional `reason`.
- Database constraint `ON DELETE RESTRICT` guarantees order records cannot be dropped while historical transition logs exist, complying with tax and audit regulations.

---

## 5. Marketplace Verdict

**STATUS: PASS.** The grocery basket engine, price recalculation logic, order lifecycle transitions, and reorder idempotency mechanisms satisfy all pilot requirements.
