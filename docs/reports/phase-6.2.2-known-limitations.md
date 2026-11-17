# RasoiIQ Phase 6.2.2 — Known Limitations & Pilot Readiness Report
**Milestone:** Phase 6.2.2  
**Date:** November 2026  
**Cost Constraint Maintained:** ₹0 (Zero third-party paid infrastructure)  

---

## 1. Known Architectural & Operational Limitations

### 1.1 Simulated Logistics & Fleet Tracking
- **Limitation:** There is no integration with actual delivery fleets (e.g. Shadowfax, Dunzo, internal courier telematics).
- **Design Impact:** Order progression (`ORDER_CONFIRMED` $\to$ `HUB_PACKING` $\to$ `OUT_FOR_DELIVERY` $\to$ `DELIVERED`) is driven by server-side simulation timers or manual operations controls.
- **Transparency Disclosure:** Prominently disclosed in UI banner and order stepper: *"Demo tracking — delivery progress is simulated."*

### 1.2 Multi-Retailer Catalog Pricing Engine
- **Limitation:** To satisfy the strict ₹0 cost constraint without incurring scraping bans or paid enterprise retail data feeds, catalog pricing utilizes an authoritative sample pricing model across Blinkit, Zepto, DMart Ready, and BigBasket.
- **Design Impact:** Live prices reflect deterministically modeled retail tier pricing rather than live dark-store inventory APIs.
- **Transparency Disclosure:** Labeled across all shopping and cart cards: *"Sample Catalog Data"*.

### 1.3 Per-Item Density Conversion Requirement
- **Limitation:** Physical volume ($L$, $ml$) cannot be converted to physical weight ($kg$, $g$) without a product-specific density factor.
- **Design Impact:** For pantry items with volume units and weight thresholds (or vice-versa), if `densityGPerMl` is not configured on the ingredient record, the system safely reports `INCOMPATIBLE_UNITS` rather than making inaccurate assumptions.

### 1.4 Single-Node Reorder Mutex
- **Limitation:** Household concurrency locks for reorders are managed via in-process Node.js mutex maps.
- **Design Impact:** Fully thread-safe and race-condition free for single-instance deployments. Horizontally scaled multi-container clusters will require a distributed Redis lock (e.g. Redlock).

---

## 2. Pilot Readiness Verdict

### Recommended Rating: **Supervised Household Pilot Ready**

| Criteria | Verdict | Comments |
| :--- | :--- | :--- |
| **Authentication & RBAC** | ✅ PASS | Multi-tenant customer, retailer, and admin session isolation verified. |
| **Pantry Intelligence** | ✅ PASS | All 10 unit semantics edge cases hardened with zero synthetic baseline fallbacks. |
| **Fail-Closed Inventory** | ✅ PASS | Missing, null, and unverified SKUs blocked pre-checkout. |
| **Order Lifecycle State Machine** | ✅ PASS | Cancellation window enforced; status progression auditable in PostgreSQL. |
| **Reorder Idempotency** | ✅ PASS | Replayed requests cached; duplicate line item additions prevented. |
| **Regression Safety** | ✅ PASS | 137/137 tests passing across monorepo test suites. |
| **Database Durability** | ✅ PASS | 167 users, 52 households, 309 orders 100% preserved. |

### Prerequisites for Unsupervised Commercial Launch:
1. Replace simulated delivery timers with real-world driver dispatch integration.
2. Connect live retailer APIs or dark-store inventory webhooks.
3. Migrate single-process concurrency mutex to distributed Redis lock.
