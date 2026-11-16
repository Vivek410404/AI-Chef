# ⚠️ RasoiIQ — Known Limitations & Future Roadmap

> **Document Status**: Active Product Documentation  
> **Scope**: Current Customer MVP vs. Production Scale Roadmap

This document outlines the architectural boundaries, intentional trade-offs, and planned enhancements for RasoiIQ.

---

## 1. Intentional Architectural Trade-offs (Current MVP)

### A. Simulated Quick-Commerce Integration
- **Current State**: Retailer pricing, catalog mapping, and checkout are simulated using standardized commercial pricing datasets for Blinkit, Zepto, DMart Ready, and BigBasket.
- **Why**: Real quick-commerce platforms in India do not offer public open ordering APIs; official B2B integration requires enterprise retailer partner agreements.
- **Future Roadmap**: Direct API / headless cart transfer integrations with quick-commerce partners via deep-linking or ONDC (Open Network for Digital Commerce) grocery protocols.

### B. Dual-Store State Management (In-Memory & Prisma)
- **Current State**: The backend features a dual-store layer: a full Prisma ORM schema for PostgreSQL, and a reactive In-Memory Store loaded with seed datasets.
- **Why**: Enables zero-friction local developer testing and stakeholder demonstrations on any machine without requiring Docker or running PostgreSQL daemons.
- **Future Roadmap**: Transition to managed PostgreSQL (e.g. Supabase, Neon) with Redis caching in production cloud deployments.

### C. In-Memory Order Deduplication
- **Current State**: Duplicate checkout submissions are intercepted using an in-memory 5-second sliding window checking order payload signatures.
- **Why**: Highly performant, requires zero external services, and immediately prevents user double-clicks.
- **Future Roadmap**: Distributed Redis-based idempotency keys (`Idempotency-Key` HTTP header) with database unique constraints across horizontal API replicas.

---

## 2. Catalog & Regional Recipe Coverage

### A. Recipe Catalog Breadth
- **Current State**: Current seed database includes 23 deeply curated regional Indian recipes with verified IFCT 2017 nutritional mappings and ingredient metadata.
- **Why**: Focuses on deep data quality, exact macro/micronutrient precision, and verified Jain/allergen metadata rather than thousands of unverified scraped recipes.
- **Future Roadmap**: Expanding to 1,500+ verified regional recipes covering Kashmiri, Chettinad, Malvani, Assamese, and Coastal Goan cuisines.

### B. Nutritional Dataset Coverage
- **Current State**: Uses ICMR-NIN IFCT 2017 tables for common Indian ingredients. Unlisted specialty items (e.g., imported vegan cheeses or rare dried herbs) are flagged with an `ESTIMATE` data completeness tag.
- **Why**: Data truthfulness rule: RasoiIQ never invents fake numerical precision when official composition data is unavailable.
- **Future Roadmap**: Crowdsourced and manufacturer-verified barcode nutrient scanning for branded packaged goods.

---

## 3. Future Roadmap Milestones

```
┌─────────────────────────────────────────────────────────────────┐
│                    RASOIIQ PRODUCT ROADMAP                      │
├────────────────────┬────────────────────┬───────────────────────┤
│    Q1: MVP Launch  │   Q2: Connectivity │    Q3: Scale & Health │
├────────────────────┼────────────────────┼───────────────────────┤
│ • 7-Day AI Planner │ • ONDC Integration │ • Continuous Glucose  │
│ • IFCT 2017 Engine │ • WhatsApp Bot for │   Monitor (CGM) Sync  │
│ • Smart Basket     │   Daily Menu Alert │ • Smart Fridge IoT    │
│ • 4-Grocer Compare │ • Live Store Sync  │ • Family Health Sync  │
└────────────────────┴────────────────────┴───────────────────────┘
```

1. **ONDC Integration**: Connect directly to local kirana stores and quick-commerce providers via the Open Network for Digital Commerce.
2. **WhatsApp Bot & Push Notifications**: Send the day's dinner recipe and required prep steps directly to the cook or family group chat.
3. **Smart Pantry Image Recognition**: Allow users to snap a photo of their vegetable crisper or spice rack to automatically update pantry inventory via Gemini Vision.
4. **Clinical Health Sync**: Connect with Apple Health, Google Health Connect, and diagnostic blood reports to automatically tailor weekly protein and sodium targets to specific health profiles (e.g. Type 2 Diabetes, hypertension, PCOS).
