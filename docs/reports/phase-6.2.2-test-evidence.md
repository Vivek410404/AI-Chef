# RasoiIQ Phase 6.2.2 — Test Evidence Report
**Milestone:** Phase 6.2.2 Hardening Verification  
**Test Suite:** `scripts/test-phase622-hardening.mjs` & `scripts/test-phase621-integrity.mjs`  
**Execution Date:** November 17, 2026  
**Test Runner:** Node.js v24.22.1 on Windows 11  

---

## 1. Test Suite Summary

```
============================================================
📊 RasoiIQ Phase 6.2.2 Hardening Test Results: 23/23 PASSED (0 FAILED)
📊 RasoiIQ Phase 6.2.1 Integrity Test Results: 27/27 PASSED (0 FAILED)
📊 Total Phase 6 Hardening Checks: 50/50 PASSED (100% SUCCESS)
============================================================
```

---

## 2. Pantry Unit Semantics Test Evidence (10/10 Passed)

| Test ID | Test Scenario | Inputs | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.1** | 2 kg vs 500 g | Current: `2 kg`, Threshold: `500 g` | `ADEQUATE` ($2000\text{g} > 500\text{g}$) | `ADEQUATE` | ✅ PASS |
| **1.2** | 200 g vs 500 g | Current: `200 g`, Threshold: `500 g` | `LOW_STOCK` ($200\text{g} \le 500\text{g}$) | `LOW_STOCK` | ✅ PASS |
| **1.3** | 500 g exactly at threshold | Current: `500 g`, Threshold: `500 g` | `LOW_STOCK` (Boundary condition) | `LOW_STOCK` | ✅ PASS |
| **1.4** | 500 ml vs 500 g incompatible units | Current: `500 ml`, Threshold: `500 g` | `INCOMPATIBLE_UNITS` | `INCOMPATIBLE_UNITS` | ✅ PASS |
| **1.5** | 1 pack (6 pcs) vs 4 pcs | Current: `1 pack` (`piecesPerPack=6`), Threshold: `4 pcs` | `ADEQUATE` ($6\text{ pcs} > 4\text{ pcs}$) | `ADEQUATE` | ✅ PASS |
| **1.6** | Pack with unknown contents vs pcs | Current: `1 pack` (no pieces factor), Threshold: `4 pcs` | `INCOMPATIBLE_UNITS` (No $1\text{ pack}=1\text{ pc}$ assumption) | `INCOMPATIBLE_UNITS` | ✅ PASS |
| **1.7** | Missing threshold | Current: `350 g`, Threshold: `null` | `THRESHOLD_NOT_CONFIGURED` | `THRESHOLD_NOT_CONFIGURED` | ✅ PASS |
| **1.8** | Unknown unit | Current: `5 handfuls`, Threshold: `2 handfuls` | `UNKNOWN_UNIT` | `UNKNOWN_UNIT` | ✅ PASS |
| **1.9** | Zero & negative quantities | Zero: `0 g`, Negative: `-10 g` | Zero: `OUT_OF_STOCK`, Negative: `MALFORMED_QUANTITY` | Zero: `OUT_OF_STOCK`, Negative: `MALFORMED_QUANTITY` | ✅ PASS |
| **1.10** | Decimal precision rounding | Current: `0.50004 kg`, Threshold: `500 g` | `ADEQUATE` ($500.04\text{g} > 500\text{g}$) | `ADEQUATE` | ✅ PASS |

---

## 3. Inventory Fail-Closed Test Evidence (3/3 Passed)

| Test ID | Test Scenario | Inputs | HTTP Status | Response Payload | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.1** | Checkout unverified product variant | SKU `var-nonexistent-9999` | 400 Bad Request | `{"error": "UNAVAILABLE_ITEMS_IN_CHECKOUT", "message": "Checkout blocked: 1 item(s)..."}` | ✅ PASS |
| **2.2** | Evaluate item with `inStock: null` | `variant: { inStock: null }` | 200 OK | `{"status": "UNKNOWN_AVAILABILITY", "isAvailable": false}` | ✅ PASS |
| **2.3** | Evaluate item with `inStock: false` | `variant: { inStock: false }` | 200 OK | `{"status": "OUT_OF_STOCK", "isAvailable": false}` | ✅ PASS |

---

## 4. Reorder Idempotency & Mutex Concurrency (4/4 Passed)

| Test ID | Test Scenario | Details | Status |
| :--- | :--- | :--- | :--- |
| **3.1** | Seed valid test order | Placed valid test order `ord-1794919967980` with Aashirvaad Atta 5kg. | ✅ PASS |
| **3.2** | Initial reorder with idempotency key | Dispatched with header `idempotency-key: idemp-key-1794919968000`. Evaluated live prices and populated basket. | ✅ PASS |
| **3.3** | Replayed reorder request | Re-submitted identical key. Cached response replayed without incrementing quantities in basket. | ✅ PASS |
| **3.4** | Parallel concurrent reorders | Fired 3 simultaneous reorder requests for household `hh-sharma-family`. Mutex lock serialized processing cleanly without race conditions. | ✅ PASS |

---

## 5. Order Cancellation & State Machine Evidence (6/6 Passed)

| Test ID | Test Scenario | Actor & Initial State | Action | HTTP Status | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **4.1** | Cancel without valid reason | Customer on `ORDER_CONFIRMED` | Reason: `"no"` ($< 3$ chars) | 400 Bad Request | ✅ PASS |
| **4.2** | Customer advance fulfillment status | Customer on `ORDER_CONFIRMED` | Target: `HUB_PACKING` | 403 Forbidden | ✅ PASS |
| **4.3** | Cross-household cancellation | Patel customer on Sharma order | Target: `CANCELLED` | 403 Forbidden | ✅ PASS |
| **4.4** | Valid self-service cancellation | Sharma customer on Sharma order in `ORDER_CONFIRMED` | Target: `CANCELLED`, Reason: `"Changed meal plan"` | 200 OK | ✅ PASS |
| **4.5** | Terminal order transition | Admin on `CANCELLED` order | Target: `HUB_PACKING` | 400 Bad Request | ✅ PASS |
| **4.6** | Cancellation during packing | Customer on order in `HUB_PACKING` | Target: `CANCELLED` | 400 Bad Request | ✅ PASS |

---

## 6. Multi-Tenant Household Isolation Evidence (1/1 Passed)

- **Sharma Household Orders:** 168
- **Patel Household Orders:** 109
- **Mehta Household Orders:** 25
- **Order ID Overlap:** Zero (Sets are completely disjoint)
- **Status:** ✅ PASS
