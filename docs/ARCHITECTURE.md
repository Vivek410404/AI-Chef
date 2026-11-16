# Technical Architecture Document
## RasoiIQ Platform Architecture

### 1. System Overview
RasoiIQ is designed as a modular monorepo using standard TypeScript across client, server, and shared libraries.

```
                      ┌────────────────────────────────────────┐
                      │       Customer Web (Next.js 14+)       │
                      │    Tailwind CSS + shadcn/ui + Zod      │
                      └───────────────────┬────────────────────┘
                                          │ REST API / JSON
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          NestJS Backend Core           │
                      │  Modular Services + Auth + Controller  │
                      └────┬──────────────┬──────────────┬─────┘
                           │              │              │
             ┌─────────────┴──┐    ┌──────┴──────┐  ┌────┴────────────┐
             ▼                ▼    ▼             ▼  ▼                 ▼
     ┌──────────────┐ ┌───────────────┐ ┌─────────────────┐ ┌────────────────┐
     │Grocery Engine│ │   AI Engine   │ │  Prisma Client  │ │ Cache / BullMQ │
     │  (Pure TS)   │ │ Gemini Free + │ │   PostgreSQL    │ │     Redis      │
     │Scaling/Dedup │ │  Rule Engine  │ │  Normalized DB  │ │ Background Jobs│
     └──────────────┘ └───────────────┘ └─────────────────┘ └────────────────┘
```

### 2. Workspace Layout
- `apps/customer-web`: Next.js App Router, React 18/19, Tailwind CSS, Lucide icons, TanStack Query, React Hook Form.
- `apps/retailer-dashboard`: Store partner portal for catalog and inventory management.
- `apps/admin-dashboard`: Platform moderation and analytics portal.
- `services/api`: NestJS modular backend REST API.
- `packages/database`: Prisma schema, PostgreSQL client, migrations, Indian recipe & product seeds.
- `packages/shared-types`: Common TypeScript interfaces and domain models.
- `packages/validation`: Zod schemas for validation across boundaries.
- `packages/grocery-engine`: Zero-dependency, testable deterministic calculation engine.

### 3. AI Service Architecture & Zero-Cost Fallback
- **Security**: The frontend never has access to `GEMINI_API_KEY`. All requests are proxied via `services/api/ai`.
- **Abstraction**: `AiProvider` interface with `GeminiProvider` implementation.
- **Failover Logic**:
  1. If `GEMINI_API_KEY` is present and valid, call Google Gemini 1.5/2.0 API with structured JSON system prompts.
  2. Parse and validate AI output using `Zod` schema.
  3. If API is missing, fails, rate-limited, or returns invalid schema: seamlessly fall back to `DeterministicRuleEngine`.
  4. The deterministic engine matches recipes to user constraints (dietary tag, cuisine, target calories, budget) using weighted heuristic scoring.
  5. The end-user always receives a verified, valid 7-day meal plan without disruption.

### 4. Deterministic Grocery Engine Pipeline
1. **Input**: Selected meal plan items with serving multipliers.
2. **Extraction**: Collect all recipe ingredients.
3. **Normalization**: Standardize units (e.g. `1 tbsp oil` -> `15ml`, `500g` + `1kg` -> `1.5kg`).
4. **Aggregation**: Merge identical ingredient identities.
5. **Pantry Subtraction**: Fetch household pantry stock for corresponding ingredients and deduct from required quantities.
6. **Product Mapping**: Map normalized ingredient requirements to retailer-specific products and pack sizes (e.g. `350g paneer` -> `2x 200g Amul Malai Paneer packs = 400g`).
7. **Requirement vs Basket Decoupling**: Recipe ingredient requirements remain immutable; user basket adjustments only toggle purchase flags.
