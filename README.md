# 🍲 RasoiIQ — AI Meal Planning & Multi-Grocer Marketplace MVP

> **The Intelligent Kitchen Operating System for Indian Households.**  
> Effortlessly orchestrates authentic weekly meal planning, precision nutrition tracking, smart ingredient aggregation, kitchen pantry deductions, and multi-retailer quick-commerce price comparison — completely runnable locally with zero paid subscriptions.

---

## 1. Product Overview

### The Problem
Indian households spend an average of 45–60 minutes daily deliberating *"Aaj khane mein kya banaye?"* (What to cook today?). This daily friction leads to repetitive menus, unbalanced nutrition (severe protein deficiency is common in Indian vegetarian diets), grocery overspending, and high domestic food wastage. Furthermore, when families buy ingredients, they are forced to manually switch between quick-commerce apps (Blinkit, Zepto, DMart Ready, BigBasket) to piece together ingredients with no clear understanding of price discrepancies or pack sizing.

### The Solution
RasoiIQ is an end-to-end meal planning, nutrition analytics, and grocery procurement system designed specifically for Indian domestic realities:
- **AI Chef Powered by Gemini 3.5 Flash-Lite & Resilient Deterministic Engine**: Generates balanced 7-day regional meal plans adhering to complex multi-generational dietary modes (Vegetarian, Vegan, Eggetarian, Jain, Non-Vegetarian) and allergies.
- **Precision Nutrition Engine (IFCT 2017)**: Uses authoritative Indian Food Composition Tables published by the National Institute of Nutrition (ICMR-NIN) to compute 7 core macro- and micronutrients per serving, with protein source diversity scoring.
- **Smart Indian Grocery Engine**: Consolidates ingredients across all scheduled meals, scales by household member count, subtracts kitchen pantry inventory, rounds to commercial pack sizes, and supports brand/size substitutions.
- **Quick-Commerce Price Discovery & 1-Click Simulated Order**: Real-time basket pricing comparison across **Blinkit**, **Zepto**, **DMart Ready**, and **BigBasket** with authoritative pricing consistency and zero-risk demo ordering.

### Target Audience
- Urban Indian families and multi-generational households with mixed dietary preferences.
- Health-conscious professionals seeking structured protein intake without abandoning traditional Indian homestyle food.
- Working parents seeking to automate weekly grocery budgeting and eliminate daily cooking indecision.

---

## 2. Architecture Overview

RasoiIQ is engineered as a modern TypeScript monorepo using **npm workspaces** and clean modular boundaries:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Customer Web Application                   │
│               (Next.js 14 App Router, React 18, Tailwind)       │
│  - Dashboard & Day Selector      - Recipe Discovery & Details   │
│  - Interactive AI Meal Planner   - Smart Basket & Substitutions │
│  - Household Onboarding Modal    - Multi-Retailer Comparison    │
│  - Nutrition Tracking (IFCT)     - Simulated Checkout Modal     │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON API (Port 4000)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RasoiIQ NestJS Backend API                 │
│  - Auth & RBAC (Customer, Retailer, Admin Roles Guard)          │
│  - AI Service (Gemini 3.5 Flash-Lite -> 3.1 -> Fallback Engine) │
│  - Nutrition Service (IFCT 2017 Dataset & Rounding Tolerances)  │
│  - Grocery Service (Serving Scaler, Pantry Deduction, Rounding) │
│  - Marketplace Service (Pricing Model, 5s Deduplication Window) │
└───────────────────────┬───────────────────┬─────────────────────┘
                        │                   │
                        ▼                   ▼
      ┌───────────────────────────┐   ┌───────────────────────────┐
      │     Shared TypeScript     │   │      Dual Storage         │
      │        Packages           │   │      Architecture         │
      │  - @rasoi/shared-types    │   │  1. Prisma ORM / Postgres │
      │  - @rasoi/nutrition-engine│   │  2. Zero-Cost In-Memory   │
      │  - @rasoi/grocery-engine  │   │     Fallback Store (Local)│
      └───────────────────────────┘   └───────────────────────────┘
```

- **Client Boundary**: The customer frontend never receives or calls third-party AI APIs directly. All AI generations, pricing formulas, and secret credentials remain isolated behind the backend API.
- **Resilience Boundary**: If PostgreSQL or Docker is not running locally, the backend gracefully switches to a built-in in-memory reactive store initialized with full seed datasets.

---

## 3. Technology Stack

- **Frontend**: Next.js 14.2 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: NestJS 10, Node.js (v18+), TypeScript, Express.
- **Database & ORM**: PostgreSQL, Prisma ORM 5.10.
- **Caching & State**: Redis (optional), In-Memory reactive store with sliding-window deduplication.
- **AI Models**: Google Gemini 3.5 Flash-Lite (Primary), Google Gemini 3.1 Flash-Lite (Secondary), RasoiIQ Deterministic Fallback Engine.
- **Nutritional Reference**: Indian Food Composition Tables (IFCT 2017) by ICMR-NIN.
- **Testing**: Node test harnesses with native `fetch` covering E2E customer journey, model failover, dietary mode strictness, nutrition rounding, basket consistency, and RBAC authorization.

---

## 4. Prerequisites

To run RasoiIQ locally, ensure you have:
- **Node.js**: `v18.17.0` or higher (`node -v`).
- **npm**: `v9.0.0` or higher (`npm -v`).
- **Operating System**: Windows, macOS, or Linux.
- **Optional**: Docker Desktop (only required if running local PostgreSQL and Redis containers; RasoiIQ runs 100% out-of-the-box in Zero-Cost In-Memory Mode without Docker).

---

## 5. Repository Structure

```
Startup/
├── apps/
│   ├── customer-web/           # Next.js 14 customer portal & demo UI
│   │   ├── src/
│   │   │   ├── app/            # App Router pages and layout
│   │   │   ├── components/     # UI screens, modals, cards, navbar
│   │   │   └── lib/            # API client and client-side utilities
│   │   └── package.json
│   └── retailer-web/           # Retailer management portal (partner view)
├── services/
│   └── api/                    # NestJS modular backend service
│       ├── src/
│       │   ├── auth/           # JWT auth, demo sessions, RBAC RolesGuard
│       │   ├── ai/             # Gemini 3.5 Flash-Lite provider & fallback
│       │   ├── nutrition/      # IFCT 2017 calculations & protein diversity
│       │   ├── grocery/        # Aggregation, scaling, pantry deductions
│       │   ├── marketplace/    # Retailer pricing, orders, deduplication
│       │   ├── recipes/        # Recipe repository & regional metadata
│       │   └── store/          # Hybrid Prisma/In-Memory reactive store
│       └── package.json
├── packages/
│   ├── shared-types/           # Shared interfaces (Household, Recipe, Basket)
│   ├── nutrition-engine/       # Standalone nutrition calculator & IFCT dataset
│   └── grocery-engine/         # Pure grocery scaling & pack rounding logic
├── prisma/
│   └── schema.prisma           # Prisma schema for PostgreSQL
├── scripts/                    # Automated audit and verification test suites
│   ├── test-e2e-customer-journey.mjs
│   ├── test-rbac-and-security.mjs
│   ├── test-gemini-35-flash-lite.mjs
│   ├── test-ai-chef-hardening.mjs
│   ├── test-ai-preferences.mjs
│   ├── test-nutrition-engine.mjs
│   └── test-smart-basket.mjs
├── docs/                       # Demonstration scripts and architectural guides
│   └── demo/
└── package.json                # Monorepo root workspace configuration
```

---

## 6. Environment Variables

The backend loads configuration from the root `.env` file. A sample configuration is provided:

| Variable | Description | Default / Example | Required | Security Level |
|---|---|---|---|---|
| `PORT` | API Server listening port | `4000` | No | Public |
| `NODE_ENV` | Environment mode | `development` | No | Public |
| `GEMINI_API_KEY` | Google AI Studio Gemini API Key | `AIzaSy...` | Optional | **Secret (Backend Only)** |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/rasoiiq?schema=public` | Optional | Secret |
| `REDIS_URL` | Redis cache connection string | `redis://localhost:6379` | Optional | Internal |
| `JWT_SECRET` | Secret key for signing RBAC tokens | `rasoiiq-super-secret-jwt-key` | No | Secret |
| `NEXT_PUBLIC_API_URL` | Client API endpoint target | `http://localhost:4000/api` | No | Public |

> [!IMPORTANT]
> `GEMINI_API_KEY` is strictly confined to the backend service. It is never prefixed with `NEXT_PUBLIC_` and never transmitted to the browser bundle. If absent, the application seamlessly activates its deterministic fallback engine with zero disruption.

---

## 7. PostgreSQL & Database Setup

If you prefer to run with a real database instead of the default Zero-Cost In-Memory Store:

1. **Start PostgreSQL via Docker**:
   ```bash
   docker run --name rasoi-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=rasoiiq -p 5432:5432 -d postgres:15
   ```
2. **Configure `.env`**:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rasoiiq?schema=public"
   ```

---

## 8. Redis / In-Memory Cache

1. **Optional Redis Instance**:
   ```bash
   docker run --name rasoi-redis -p 6379:6379 -d redis:7
   ```
2. **Automatic In-Memory Fallback**:
   If Redis or PostgreSQL is unavailable, the backend logs a notice (`PostgreSQL connection failed or Docker not running. Active in Zero-Cost Dev Mode with In-Memory State`) and continues operating with 100% feature completeness.

---

## 9. Database Migrations

When running against PostgreSQL, apply the schema migrations:
```bash
npx prisma migrate dev --name init
```
Or generate the Prisma Client:
```bash
npx prisma generate
```

---

## 10. Database Seeds

To populate the database with authentic regional Indian recipes, IFCT 2017 nutritional benchmarks, grocery product variants, and retailer definitions:
```bash
npm run seed --workspace=services/api
```
*(In zero-cost in-memory mode, this seed data is loaded automatically upon server start).*

---

## 11. Build Instructions

Build all workspace packages and applications in sequence:

```bash
# Install root dependencies
npm install

# Build shared packages and NestJS API
npm run build --workspace=services/api

# Build Next.js customer web application
npm run build --workspace=apps/customer-web
```

---

## 12. Backend Development Server

Start the NestJS API server on port `4000`:

```bash
# Production daemon / compiled start
node services/api/dist/main

# Or development watch mode
npm run start:dev --workspace=services/api
```
Verify the API health:
```bash
curl http://localhost:4000/api/recipes
```

---

## 13. Frontend Development Server

Start the Next.js customer web frontend on port `3000`:

```bash
# Production server (fastest, optimized)
npm run start --workspace=apps/customer-web

# Or development hot-reload server
npm run dev --workspace=apps/customer-web
```
Open your browser at: **`http://localhost:3000`**

---

## 14. Test Suite Execution

RasoiIQ includes 7 comprehensive automated API test suites plus a full Puppeteer browser journey test with **245 automated API test assertions** and **20 browser journey steps** covering every layer of the system. Run them locally anytime:

```bash
# 0. Full Real-Browser Customer Journey Validation (20 steps + 14 screenshots)
node scripts/run-browser-journey-validation.mjs

# 1. End-to-End Customer MVP Journey (24 tests)
node scripts/test-e2e-customer-journey.mjs

# 2. RBAC, Multi-Tenant Security, Idempotency & Secrets Isolation (39 tests)
node scripts/test-rbac-and-security.mjs

# 3. Gemini 3.5 Flash-Lite & Cascade Fallback (34 tests)
node scripts/test-gemini-35-flash-lite.mjs

# 4. AI Chef Hardening & Unknown Ingredient Safety (39 tests)
node scripts/test-ai-chef-hardening.mjs

# 5. AI Preferences, Dietary Modes & Diversity (39 tests)
node scripts/test-ai-preferences.mjs

# 6. Nutrition Engine & IFCT 2017 Rounding Audit (60 tests)
node scripts/test-nutrition-engine.mjs

# 7. Smart Basket & Multi-Retailer Pricing (10 tests)
node scripts/test-smart-basket.mjs
```

---

## 15. Documentation & Phase Reports

Comprehensive audit, architecture, and live validation reports are available in the repository:

- **[Live Demo Validation Report](file:///d:/Startup/docs/phase-3/live-demo-validation.md)**: Full verification of the 20-step customer journey, timing analysis, and responsive design screenshots.
- **[Security & Multi-Tenant Review](file:///d:/Startup/docs/phase-3/security-review.md)**: RBAC enforcement, Customer A vs B isolation, Retailer inventory isolation, and idempotency key handling.
- **[AI & Nutrition Engine Validation](file:///d:/Startup/docs/phase-3/ai-and-nutrition-validation.md)**: Gemini 3.5 Flash-Lite cascade, fallback attribution, dietary safety, and IFCT 2017 clinical precision.
- **[Pilot Readiness & Commercial Checklist](file:///d:/Startup/docs/phase-3/pilot-readiness-checklist.md)**: 3-tier roadmap for Ahmedabad family pilot (Navrangpura, Bodakdev) and commercial launch.
- **[Known Risks & Technical Debt](file:///d:/Startup/docs/phase-3/known-risks-and-limitations.md)**: In-memory store characteristics, quick-commerce live stock drift, and mitigation strategies.
- **[Live Screenshots](file:///d:/Startup/docs/phase-3/screenshots/)**: 14 PNG captures of the customer journey from household onboarding to simulated order confirmation.

---

## 16. Demo Accounts & Seeded Household

For stakeholder demonstrations, the system is pre-configured with the **Sharma Family** household and multi-role demo credentials:

### Customer Demo Profile
- **Household Name**: Sharma Family (4 members)
- **Primary Cook**: Pooja (Vegetarian, Peanut Allergy, 60g protein goal)
- **Partner**: Rohan (Vegetarian, Gluten Intolerant, 75g protein goal)
- **Elder**: Ramesh (Strict Jain mode — no onions, garlic, or root vegetables)
- **Child**: Aarav (Vegetarian, Dislikes Eggplant/Baingan)
- **Household Defaults**: Dietary Mode = `VEGETARIAN`, Cuisine = `ALL_INDIAN`
- **Delivery Address**: Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103

### Multi-Role Authentication Sessions
You can generate authenticated bearer tokens instantly via `POST /api/auth/demo-session`:
- **CUSTOMER**: Access to meal plans, nutrition, pantry, basket, simulated checkout.
- **RETAILER**: Access to inventory feeds (`/api/marketplace/retailer/:id/inventory`) and GMV metrics.
- **ADMIN**: Super-user access to platform analytics (`/api/marketplace/admin/metrics`).

---

## 17. Troubleshooting & Common Issues

### 1. Port 3000 or 4000 already in use
- **Symptom**: `EADDRINUSE: address already in use :::4000`
- **Resolution**: Identify and terminate the occupying process:
  - Windows: `netstat -ano | findstr :4000` followed by `taskkill /PID <PID> /F`
  - Linux/macOS: `lsof -i :4000` followed by `kill -9 <PID>`

### 2. Gemini API 429 Quota Exhausted
- **Symptom**: `HTTP 429 Resource has been exhausted`
- **Resolution**: No manual intervention needed. RasoiIQ automatically captures rate-limit reset times, cascades to Gemini 3.1 Flash-Lite, and falls back to the deterministic generation engine with full transparency.

### 3. Duplicate Order Submission Rejection
- **Symptom**: HTTP 400 `Duplicate order submission detected. Please wait a moment before resubmitting.`
- **Resolution**: The system enforces a 5-second idempotency sliding window to protect against double clicks. Wait 5 seconds before resubmitting the identical order.

### 4. Zero-Cost Mode Active Notice
- **Symptom**: Warning logged: `PostgreSQL connection failed or Docker not running...`
- **Resolution**: This is normal expected behavior when running locally without Docker. The entire app runs smoothly with the in-memory reactive store.

---
*Developed with pride for Indian kitchens by the RasoiIQ Engineering Team.*
