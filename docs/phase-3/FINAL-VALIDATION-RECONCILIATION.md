# RasoiIQ — Phase 3.1: Validation Evidence Reconciliation & Final Demo Sign-Off

**Document Reference:** `docs/phase-3/FINAL-VALIDATION-RECONCILIATION.md`  
**Execution Timestamp:** November 16, 2026  
**Audience:** Core Engineering, Product Leadership, Operations & Security Architects  
**Authoritative Status:** Reconciled, Evidence-Backed Final Audit  

---

## 1. Resolution of Test Count & Suite Discrepancies

### The Discrepancy Explained
In previous reports, two distinct testing paradigms were conflated:
1. **Automated Unit & API Test Assertions:** Code-level test assertions running in Node.js test harnesses.
2. **Browser Journey Steps:** High-level interactive UI automation steps executed via Puppeteer in Google Chrome.

Reporting "265 assertions" while claiming "7 test suites" created ambiguity because 245 assertions originated from 7 API/engine test suites, and 20 steps originated from 1 browser automation script. 

### Authoritative Reconciliation Table
Every test script was re-executed against the live running application. The table below documents the exact breakdown:

| Script Name | Category / Target Module | Assertions Executed | Passed | Failed | Execution Mode / AI Provider Mechanism |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `scripts/test-e2e-customer-journey.mjs` | Full Customer MVP Journey | 24 | 24 | 0 | Live local API + live backend Gemini 3.5 call (or fallback) + deterministic unit fallback |
| `scripts/test-rbac-and-security.mjs` | RBAC, Isolation & Idempotency | 39 | 39 | 0 | Live local API + cryptographic JWT verification + mock demo sessions |
| `scripts/test-gemini-35-flash-lite.mjs` | Model Hierarchy & Failover | 34 | 34 | 0 | **Section 2: LIVE Google Gemini 3.5 Flash-Lite API call**; Sections 3–6: Mocked HTTP responses (429, 401, 404, 500, timeouts) for failover logic; Section 7: Deterministic engine |
| `scripts/test-ai-chef-hardening.mjs` | Safety & Unknown Ingredients | 39 | 39 | 0 | Mocked Gemini responses + deterministic fallback engine + pure unit logic |
| `scripts/test-ai-preferences.mjs` | Dietary Modes & Regional Filters | 39 | 39 | 0 | Live local API (Tests 1–3, 10, 12, invoking live Gemini / fallback) + grocery-engine unit filters |
| `scripts/test-nutrition-engine.mjs` | IFCT 2017 & Macro Precision | 60 | 60 | 0 | Pure engine unit tests on static IFCT 2017 dataset + deterministic provider (Zero AI calls) |
| `scripts/test-smart-basket.mjs` | Basket Aggregation & Pricing | 10 | 10 | 0 | Pure grocery-engine unit tests + 2 live local API checks (Zero AI calls) |
| **SUBTOTAL (API & Unit Assertions)** | **7 Dedicated Test Suites** | **245** | **245** | **0** | **100% Pass Rate** |
| `scripts/run-browser-journey-validation.mjs` | Real-Browser Customer Journey | 20 steps | 20 | 0 | Live Puppeteer driving Google Chrome against Next.js (port 3000) & NestJS (port 4000) |
| **TOTAL VALIDATION EVENTS** | **8 Total Verification Scripts** | **265** | **265** | **0** | **245 Unit/API Assertions + 20 Browser Steps** |

---

## 2. Exact Execution Commands

To execute all test suites locally from the monorepo root:

```bash
# 1. Execute the 7 Backend, Security & Engine Test Suites (245 assertions)
node scripts/test-e2e-customer-journey.mjs     # 24 assertions
node scripts/test-rbac-and-security.mjs        # 39 assertions
node scripts/test-gemini-35-flash-lite.mjs     # 34 assertions
node scripts/test-ai-chef-hardening.mjs        # 39 assertions
node scripts/test-ai-preferences.mjs           # 39 assertions
node scripts/test-nutrition-engine.mjs         # 60 assertions
node scripts/test-smart-basket.mjs             # 10 assertions

# 2. Execute Real-Browser Customer Journey Test (20 steps + 15 screenshots)
node scripts/run-browser-journey-validation.mjs

# 3. Additional Audit Scripts Developed in Phase 3.1
node scripts/verify-persistence-matrix.mjs      # Verifies memory retention vs restart wipe
node scripts/verify-idempotency.mjs             # Verifies sliding window & parameter mismatch
node scripts/verify-live-gemini-status.mjs      # Directly probes Google Gemini endpoints
node scripts/verify-screenshots.mjs             # Validates PNG headers and dimensions
```

---

## 3. Browser Journey Evidence

The real-browser customer journey script ([scripts/run-browser-journey-validation.mjs](file:///d:/Startup/scripts/run-browser-journey-validation.mjs)) was executed using Puppeteer `v25.17.0` targeting the local Chrome executable (`C:\Program Files\Google\Chrome\Application\chrome.exe`).

### Verified Execution Timeline
- **Total Execution Duration:** 22.27 seconds.
- **Steps Executed:** 20 / 20 steps passed (0 failures).
- **Network / Console Health:** 0 uncaught JavaScript runtime errors, 0 failed HTTP network requests.
- **Visual Captures:** 15 valid PNG files generated in `docs/phase-3/screenshots/`.

```
[STEP 01] Navigate to Customer Web Dashboard (/) ................... PASS (1.82s)
[STEP 02] Verify Initial Weekly Meal Grid .......................... PASS (0.42s)
[STEP 03] Click Day Selector Tabs (Mon -> Wed) ..................... PASS (0.65s)
[STEP 04] Open Household Configuration Modal ....................... PASS (0.54s)
[STEP 05] Inspect Dietary & Allergen Profile ....................... PASS (0.41s)
[STEP 06] Open AI Chef Generation Modal ............................ PASS (0.48s)
[STEP 07] Trigger 7-Day Plan Generation ............................ PASS (3.12s)
[STEP 08] Review Generated Plan & Commit to Grid ................... PASS (0.82s)
[STEP 09] Open Recipe Details Modal ................................ PASS (0.61s)
[STEP 10] Verify Nutrition Breakdown Per Serving ................... PASS (0.38s)
[STEP 11] Swap Recipe in Meal Plan ................................. PASS (0.95s)
[STEP 12] Navigate to Smart Basket Section ......................... PASS (0.51s)
[STEP 13] Verify Pantry Deductions (Gross - Pantry = Net) .......... PASS (0.44s)
[STEP 14] Deselect Ingredient from Basket .......................... PASS (0.52s)
[STEP 15] Adjust Pack Quantities & Subtotal Recalculation .......... PASS (0.67s)
[STEP 16] Review 4-Retailer Price Comparison Table ................. PASS (0.72s)
[STEP 17] Select Preferred Retailer (Blinkit) ...................... PASS (0.45s)
[STEP 18] Open Simulated Checkout Modal ............................ PASS (0.58s)
[STEP 19] Place Simulated Order & Verify DEMO ORDER CONFIRMED ...... PASS (1.45s)
[STEP 20] Hard Browser Reload & Verify Order History Persistence ... PASS (1.88s)
```

---

## 4. Storage and Restart-Persistence Findings

RasoiIQ operates in **Zero-Cost In-Memory Mode** via `StoreService` (`services/api/src/data/store.service.ts`) when PostgreSQL is not connected. 

We subjected the running application to four distinct lifecycle disruption tests via `scripts/verify-persistence-matrix.mjs`:

### Persistence Across Lifecycle Events

| Data Entity | A. Browser Hard Reload (Backend running) | B. Frontend Restart (Backend running) | C. Backend Process Restart | D. Full System Restart | Durability Classification |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Household Settings** | **Survives** | **Survives** | **RESETS to Seed** | **RESETS to Seed** | Process Heap Only |
| **Household Members** | **Survives** | **Survives** | **RESETS to Seed** | **RESETS to Seed** | Process Heap Only |
| **Meal Plans** | **Survives** | **Survives** | **RESETS to Seed** | **RESETS to Seed** | Process Heap Only |
| **Pantry Inventory** | **Survives** | **Survives** | **RESETS to Seed** | **RESETS to Seed** | Process Heap Only |
| **Grocery Basket** | **Survives (Recomputed)**| **Survives (Recomputed)**| **RESETS to Seed** | **RESETS to Seed** | Derived Dynamic |
| **Completed Orders** | **Survives** | **Survives** | **WIPED to Empty `[]`** | **WIPED to Empty `[]`** | Process Heap Only |
| **Idempotency Keys** | **Survives** | **Survives** | **WIPED to Empty Map** | **WIPED to Empty Map** | Process Heap Only |
| **Active UI Tab** | **Survives (LocalStorage)**| **Survives (LocalStorage)**| **Survives (LocalStorage)**| **Survives (LocalStorage)**| Client Browser Storage |

### Technical Determination
The local runtime **CANNOT be characterized as durable database persistence**. 
- It is an **in-memory process heap cache** initialized with seed datasets upon every backend boot.
- If the backend process crashes or restarts, all runtime mutations (placed orders, custom meal swaps, added members) are immediately lost.
- For local demos and stakeholder presentations, this architecture is ideal because it requires zero database setup and self-heals back to a pristine demo state upon restart.
- For production pilots (Tier B/C), a managed persistent PostgreSQL database (`DATABASE_URL`) with Prisma ORM migrations is strictly required.

---

## 5. Route Authorization Matrix & Security Audit

We inspected all 8 NestJS controllers in `services/api/src/`. Below is the complete route inventory:

### Complete NestJS Route Authorization Inventory

| Method | Route Path | Controller | Auth Required | Allowed Roles | Resource Ownership Check | Test Coverage |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `POST` | `/api/auth/demo-session` | `AuthController` | No (Dev) / Disabled (Prod) | Any | None | `test-rbac-and-security.mjs` |
| `POST` | `/api/auth/login` | `AuthController` | No | Public | None | Code-audited |
| `POST` | `/api/auth/register` | `AuthController` | No | Public | None | Code-audited |
| `GET` | `/api/auth/me` | `AuthController` | Optional | Any | User identity decode | `test-rbac-and-security.mjs` |
| `GET` | `/api/households/me` | `HouseholdController` | Optional | `CUSTOMER` default | Token household scoping | `test-ai-preferences.mjs` |
| `PUT` | `/api/households/me` | `HouseholdController` | Optional | `CUSTOMER` default | Token household scoping | `test-ai-preferences.mjs` |
| `POST` | `/api/households/me/members` | `HouseholdController` | Optional | `CUSTOMER` default | Token household scoping | Code-audited |
| `DELETE` | `/api/households/me/members/:id`| `HouseholdController` | Optional | `CUSTOMER` default | Token household scoping | Code-audited |
| `GET` | `/api/households/:id` | `HouseholdController` | Optional | Any | **Enforced:** Customer cannot view other household (403) | `test-rbac-and-security.mjs` |
| `POST` | `/api/households` | `HouseholdController` | No | Public | None | `test-rbac-and-security.mjs` |
| `GET` | `/api/recipes` | `RecipesController` | No | Public | None (Public Catalog) | `test-e2e-customer-journey.mjs` |
| `GET` | `/api/recipes/:id` | `RecipesController` | No | Public | None (Public Catalog) | `test-e2e-customer-journey.mjs` |
| `POST` | `/api/ai/generate-plan` | `AiController` | No | Public | Takes `householdId` from body | `test-gemini-35-flash-lite.mjs` |
| `GET` | `/api/meal-plans/current` | `MealPlansController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | `test-e2e-customer-journey.mjs` |
| `POST` | `/api/meal-plans/item` | `MealPlansController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | `test-e2e-customer-journey.mjs` |
| `PUT` | `/api/meal-plans/item/:id` | `MealPlansController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | Code-audited |
| `DELETE` | `/api/meal-plans/item/:id` | `MealPlansController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | Code-audited |
| `POST` | `/api/meal-plans/apply-ai-plan`| `MealPlansController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | `test-e2e-customer-journey.mjs` |
| `POST` | `/api/meal-plans/clear` | `MealPlansController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | Code-audited |
| `GET` | `/api/pantry` | `PantryController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | `test-e2e-customer-journey.mjs` |
| `POST` | `/api/pantry` | `PantryController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | `test-e2e-customer-journey.mjs` |
| `DELETE` | `/api/pantry/:id` | `PantryController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | Code-audited |
| `GET` | `/api/grocery/requirements` | `GroceryController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | `test-e2e-customer-journey.mjs` |
| `GET` | `/api/grocery/basket` | `GroceryController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | `test-smart-basket.mjs` |
| `POST` | `/api/grocery/basket/toggle` | `GroceryController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | `test-smart-basket.mjs` |
| `PUT` | `/api/grocery/basket/swap-variant` | `GroceryController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | `test-smart-basket.mjs` |
| `PUT` | `/api/grocery/basket/update-packs` | `GroceryController` | No | Hardcoded | Hardcoded to `hh-sharma-family` | `test-smart-basket.mjs` |
| `GET` | `/api/marketplace/retailers` | `MarketplaceController` | No | Public | None | `test-smart-basket.mjs` |
| `GET` | `/api/marketplace/products` | `MarketplaceController` | No | Public | None | `test-smart-basket.mjs` |
| `GET` | `/api/marketplace/products/by-ingredient/:id` | `MarketplaceController` | No | Public | None | Code-audited |
| `POST` | `/api/marketplace/checkout` | `MarketplaceController` | Optional | Any | Scopes user/household if token provided | `test-rbac-and-security.mjs` |
| `GET` | `/api/marketplace/orders` | `MarketplaceController` | Optional | Any | Scopes to authenticated user/household | `test-e2e-customer-journey.mjs` |
| `GET` | `/api/marketplace/admin/metrics`| `MarketplaceController` | **Yes (RolesGuard)**| `ADMIN`, `RETAILER`| Denies Customer (403), Denies No Auth (401) | `test-rbac-and-security.mjs` |
| `GET` | `/api/marketplace/retailer/:id/inventory` | `MarketplaceController` | **Yes (RolesGuard)**| `ADMIN`, `RETAILER`| **Enforced:** Retailer A cannot view Retailer B (403) | `test-rbac-and-security.mjs` |

### Multi-Tenant Isolation Truth Statement
Multi-tenant isolation is **NOT globally active across all endpoints**.
- It is **strictly enforced** on protected B2B endpoints (`/api/marketplace/retailer/:id/inventory`), administrative analytics (`/api/marketplace/admin/metrics`), and household record inspection (`/api/households/:id`).
- However, operational meal-planning, pantry, and basket endpoints (`/api/meal-plans/*`, `/api/pantry/*`, `/api/grocery/*`) are **demo endpoints hardcoded to `'hh-sharma-family'`**.
- Claiming "complete multi-tenant isolation" across the entire platform would be inaccurate. The current codebase is architected as a single-family customer demonstration with multi-tenant barriers enforced at identity and partner borders.

---

## 6. Idempotency & Deduplication Limitations

We executed `scripts/verify-idempotency.mjs` to probe the actual behavior of the deduplication mechanisms:

### Findings from Direct Probing
1. **Identical Concurrent Submissions:** Handled effectively by the 5-second sliding window (`isDuplicate` check against `this.orders`). Rapid double-clicks are rejected with `HTTP 400 Bad Request`.
2. **Same Key with Same Request:** Returns the cached order with `HTTP 201 Created` without duplicating database records.
3. **Same Key with DIFFERENT Request Payload:**
   - When sending a completely different request (Zepto instead of Blinkit, Milk instead of Atta, ₹120 instead of ₹250) with an existing key, the backend **returned the old Blinkit ₹250 order**.
   - It did **NOT** return `HTTP 422 Unprocessable Content` or `HTTP 409 Conflict` (parameter mismatch).
   - Under the IETF Idempotency-Key specification (draft-ietf-httpapi-idempotency-key-header), reusing a key with altered parameters must trigger a conflict error.
4. **Backend Restart:**
   - Because `idempotencyRecords` is an `in-memory Map` in `MarketplaceService`, all keys are cleared on backend restart. A retried request after restart creates a new order.
5. **Storage & Transactional Boundary:**
   - The current implementation is **in-memory process heap only**.
   - It is **NOT database-backed**.
   - It is **NOT distributed across multiple server instances**.

### Reconciled Technical Classification
The current deduplication engine should be described as an **"In-Memory Sliding-Window Double-Click Guard and Basic Idempotency Cache"**, NOT a fully compliant, transactionally distributed RFC-compliant idempotency system.

---

## 7. Live Google Gemini API Verification

We executed `scripts/verify-live-gemini-status.mjs` to directly probe Google's Generative Language API endpoint (`https://generativelanguage.googleapis.com/v1beta/`) using the backend `.env` key:

### Live Model Audit Results

| Configured / Probed Model ID | Reached Google API | HTTP Status | Response Time | Actual Result / Google API Message |
| :--- | :---: | :---: | :---: | :--- |
| `models/gemini-3.5-flash-lite` | **YES** | **200 OK** | 9,298 ms | **SUCCESS:** Returns valid JSON meal plan |
| `models/gemini-3.1-flash-lite` | **YES** | **200 OK** | 3,246 ms | **SUCCESS:** Returns valid JSON meal plan |
| `models/gemini-2.5-flash-lite` | **YES** | **404 Not Found** | 368 ms | Deprecated: Google reports model is no longer available |
| `models/gemini-1.5-flash` | **YES** | **404 Not Found** | 586 ms | Unsupported for v1beta `generateContent` |
| `models/gemini-3.5-flash` | **YES** | **429 Quota Exhausted**| 433 ms | Daily quota limit reached on Free Tier |

### Fallback Hierarchy & Attribution Verification
- **Primary:** `models/gemini-3.5-flash-lite` (Active & Functional).
- **Secondary:** `models/gemini-3.1-flash-lite` (Active & Functional).
- **Tertiary:** `deterministic-fallback-v1` (Activates when offline or upon HTTP 429).
- **Attribution Truthfulness:** In `test-gemini-35-flash-lite.mjs` (Section 6), when Gemini models return 429, the response explicitly reports `source: 'deterministic-fallback'` with the exact Google failure string in `fallbackReason`. The application never labels fallback plans as Gemini.

---

## 8. Nutrition Engine Limitations & Nuances

Inspection of `packages/grocery-engine/src/nutrition.ts` and `nutrition-data.ts` revealed key scientific and engineering characteristics:

### Limitations & Assumptions
1. **Raw Ingredient Baseline:** All IFCT 2017 compositions represent **raw / uncooked foods per 100g**. The system sums raw ingredient values linearly without simulating cooking retention factors (e.g., Vitamin C heat degradation, B-vitamin leaching into boil water) or deep-frying oil absorption.
2. **Serving Size Scaling:** Per-serving nutrition is derived by dividing total recipe nutrition by `defaultServings` (e.g. 4). While mathematically consistent, it assumes uniform distribution across portions.
3. **Culinary Weight Conversions:** Non-gram culinary units use standardized conversion constants (`tbsp` = 15g, `tsp` = 5g, `cup` = 200g, `piece` = 40–90g). Real-world agricultural produce varies significantly in size and moisture content.
4. **Data Coverage & Estimates:** 47 core ingredients have exact IFCT 2017 or USDA FDC profiles (`confidence: 'exact'`). Unknown ingredients fall back to category composite estimates with explicit `isEstimate: true` flags.
5. **Presentation Rounding:** The engine preserves unrounded floating-point values internally (`rawNutrients`). Presentation values are rounded (Calories/Sodium to integer, others to 1 decimal place), producing minor, mathematically bounded display differences ($\le 2$ kcal).

### Accurate Technical Description
Claims of "zero AI hallucinations" and "clinical nutritional accuracy" are replaced with:
> **"Deterministic reference nutritional calculations derived from raw Indian Food Composition Tables (IFCT 2017) baseline compositions, evaluated independently of LLM generation."**

---

## 9. Screenshot Inventory & Dimension Reconciliation

Inspection of `docs/phase-3/screenshots/` via `scripts/verify-screenshots.mjs` confirmed that **15 valid PNG files** exist on disk:

| Filename | Dimensions (Width x Height) | File Size | Description / Viewport |
| :--- | :---: | :---: | :--- |
| `01-dashboard.png` | 1440 x 1893 | 233.6 KB | Customer Web Dashboard with weekly overview and quick stats |
| `02-household-modal.png` | 1440 x 900 | 206.4 KB | Family preferences modal (Sharma Family, 4 members) |
| `03-meal-planner-grid.png` | 1440 x 2217 | 378.9 KB | 7-day 21-meal interactive planning grid |
| `04-ai-modal-generated.png` | 1440 x 900 | 194.3 KB | AI Chef generation modal with generated weekly menu |
| `04-generated-plan.png` | 1440 x 2217 | 404.7 KB | Committed meal plan displayed on dashboard grid |
| `05-recipe-detail-nutrition.png`| 1440 x 900 | 163.0 KB | Recipe detail modal with per-serving IFCT macro breakdown |
| `06-smart-basket.png` | 1440 x 6594 | 888.5 KB | Aggregated grocery basket with commercial pack sizes |
| `07-pantry-view.png` | 1440 x 931 | 157.0 KB | Kitchen pantry inventory with automated deduction badges |
| `08-retailer-comparison.png` | 1440 x 900 | 165.8 KB | Multi-retailer price comparison (Blinkit, Zepto, DMart, BigBasket)|
| `09-order-confirmation.png` | 1440 x 900 | 152.8 KB | Simulated checkout confirmation with unique Order ID |
| `10-dashboard-order-history.png`| 1440 x 1893 | 239.7 KB | Order history section populated in dashboard footer |
| `responsive-desktop-1440.png` | 1440 x 1893 | 239.7 KB | Responsive verification: Standard desktop viewport (1440px) |
| `responsive-laptop-1366.png` | 1366 x 1893 | 238.1 KB | Responsive verification: Compact laptop viewport (1366px) |
| `responsive-tablet-768.png` | 1073 x 2837 | 244.0 KB | Responsive verification: Tablet portrait viewport |
| `responsive-mobile-390.png` | 394 x 4232 | 223.1 KB | Responsive verification: Mobile iPhone 14 viewport |

### Repository & Git Commit Status Statement
As verified during baseline auditing, the `git` executable is not installed or available in the system PATH on this host machine. Therefore, **repository commit history and remote sync status cannot be verified via Git CLI**. All files are confirmed to exist as concrete files on the local filesystem.

---

## 10. Confirmed Remaining Risks & Architectural Technical Debt

1. **In-Memory Store Loss on Restart (RISK-01):** The current local prototype relies on `StoreService` heap memory. Any backend process termination wipes user changes, custom meal plans, and completed orders back to the seed state.
2. **Single-Node Limitation (RISK-02):** The in-memory sliding window and idempotency cache cannot coordinate across multi-pod or serverless deployments.
3. **Idempotency Parameter Mismatch Blindness (RISK-03):** Sending the same `Idempotency-Key` with an altered body returns the cached order rather than an HTTP 422/409 error.
4. **Gemini Free-Tier Rate Limits (RISK-04):** The free-tier key is capped at 15 RPM. While fallback is 100% transparent and reliable, heavy concurrent traffic will push users to deterministic fallback.
5. **Static Retailer Multipliers (RISK-05):** Retailer prices are calculated using calibrated multipliers rather than live quick-commerce scraping or ONDC webhooks.

---

## 11. Local Demo Readiness Decision: SIGN-OFF APPROVED

**Verdict: FULLY APPROVED FOR LOCAL INVESTOR & STAKEHOLDER DEMONSTRATIONS**

### Rationale
- Zero-cost setup works out-of-the-box on clean developer machines without requiring Docker, AWS, or paid APIs.
- 20 / 20 browser journey steps pass in under 25 seconds with full visual polish.
- 245 / 245 automated unit/API assertions pass across all 7 test suites.
- Gemini 3.5 Flash-Lite generates authentic, diverse regional meals with instant failover resilience.
- Brand identity, typography, and responsive layouts function seamlessly.

---

## 12. Closed-Pilot Readiness Decision: CONDITIONAL ON TIER B ROADMAP

**Verdict: REQUIRES PREREQUISITE INFRASTRUCTURE BEFORE LIVE FAMILY DEPLOYMENT**

Before onboarding 10–50 real families in Ahmedabad (Bodakdev, Navrangpura, Satellite), the following technical transitions must be executed:

1. **Persistent Managed PostgreSQL:** Connect a persistent database (Supabase / AWS RDS Mumbai `ap-south-1`) via Prisma ORM to ensure data survives server deployments.
2. **Mobile Phone OTP Authentication:** Implement SMS-based login (MSG91 / Firebase) in place of mock demo sessions.
3. **Distributed Redis Cache:** Migrate idempotency records and rate limits to a managed Redis cluster to support RFC-compliant idempotency.
4. **Gujarati Recipe Catalog Expansion:** Expand the recipe pool from 23 to 100+ authentic regional Gujarati and Kathiyawadi dishes with regional ingredient synonyms.
5. **Domestic Cook WhatsApp Digest:** Implement the scheduled 7:00 PM WhatsApp preparation alert for domestic cooks (*Maharaj*).
