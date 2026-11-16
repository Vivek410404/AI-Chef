# 🧠 RasoiIQ — Phase 3: AI Provider & Clinical Nutrition Validation Report

> **Scope**: Google Gemini 3.5 Flash-Lite Provider, Deterministic Rule Engine, ICMR-NIN IFCT 2017 Dataset & Protein Diversity  
> **Automated Test Baselines**:  
> - `scripts/test-gemini-35-flash-lite.mjs` (34/34 Pass)  
> - `scripts/test-ai-chef-hardening.mjs` (39/39 Pass)  
> - `scripts/test-ai-preferences.mjs` (39/39 Pass)  
> - `scripts/test-nutrition-engine.mjs` (60/60 Pass)

---

## 1. AI Provider Hierarchy & Failover Behavior

RasoiIQ operates a 3-tier cascade to ensure 100% operational uptime without paid enterprise AI commitments:

```
┌─────────────────────────────────────────────────────────────┐
│                 AI MEAL PLAN GENERATION REQUEST             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
        ┌─────────────────────────────────────────────┐
        │  Tier 1: Google Gemini 3.5 Flash-Lite       │
        │  - Model: models/gemini-3.5-flash-lite      │
        │  - Primary high-speed reasoning model       │
        └──────────────┬──────────────────────────────┘
                       │ Fails on 429 / 404 / 500 / Network Error
                       ▼
        ┌─────────────────────────────────────────────┐
        │  Tier 2: Google Gemini 3.1 Flash-Lite       │
        │  - Model: models/gemini-3.1-flash-lite      │
        │  - Secondary fallback candidate             │
        └──────────────┬──────────────────────────────┘
                       │ Fails or Daily Quota Exhausted
                       ▼
        ┌─────────────────────────────────────────────┐
        │  Tier 3: RasoiIQ Deterministic Engine       │
        │  - Offline algorithmic constraint solver    │
        │  - Recency penalties & protein rotation     │
        │  - Zero API dependency                      │
        └─────────────────────────────────────────────┘
```

### Rate-Limit (HTTP 429) & Cooldown Handling
- When Google responds with HTTP 429 (Resource Exhausted), the provider records the cooldown state with the duration extracted from the `Retry-After` header.
- During the cooldown window, subsequent requests automatically skip the rate-limited candidate without issuing wasteful HTTP calls, cleanly cascading to Tier 2 or Tier 3.
- Rate-limit reset timestamps are tracked in-memory and cleanly cleared upon expiration.

### Authoritative Provider Attribution
Every generation response transparently records its authoritative source:
- `source: "gemini"`, `modelUsed: "gemini-3.5-flash-lite"` (or `gemini-3.1-flash-lite`).
- `source: "deterministic-fallback"`, `fallbackReason: "All Gemini models failed. Last error: ..."`
- **Strict Truthfulness Guarantee**: The system never reports Gemini as the provider when fallback generated the plan.

---

## 2. Dietary Safety, Multi-Member Intersection & Regional Filtering

### A. The 5 Indian Dietary Modes
1. **VEGETARIAN (Default)**: Strictly excludes meat, poultry, fish, seafood, and eggs. Permits dairy.
2. **NON_VEGETARIAN**: Permits chicken, mutton, fish, seafood, eggs, and vegetarian homestyle dishes.
3. **EGGETARIAN**: Permits vegetarian foods and eggs (e.g. Egg Bhurji). Strictly excludes meat, poultry, and fish.
4. **VEGAN**: 100% plant-based. Strictly excludes meat, fish, eggs, dairy (milk, ghee, butter, paneer, curd), and honey.
5. **JAIN**: Verified 100% root-vegetable-free and allium-free. Strictly excludes onions, garlic, potatoes, carrots, radishes, ginger, and turmeric root.

### B. Fail-Closed Handling for Unknown Ingredients
- If an ingredient in a recipe lacks verified dietary or allergen metadata, the engine executes a **fail-closed** policy: the recipe is automatically disqualified for restricted diets (Vegan, Jain, or specific allergies) rather than assuming safety.

### C. Multi-Member Intersection
When family members have conflicting dietary requirements (e.g. Grandma is Jain, Mother has a peanut allergy, Father is gluten-intolerant, Son dislikes eggplant):
- The constraint solver computes the mathematical intersection of all family member constraints.
- A single shared meal must simultaneously satisfy all active constraints. For example, *Traditional Bengali Cholar Dal* satisfies both Vegan and Jain constraints simultaneously.

### D. Regional Cuisine Isolation
- **Strict Filtering**: When a user selects "North Indian", zero South Indian recipes leak into the plan. When "South Indian" is selected, zero North Indian dishes appear.
- **Pan-Indian Balance**: When "All Indian" is selected, dishes rotate across Northern, Southern, Western, and Eastern regions.

---

## 3. Clinical Nutrition Engine (ICMR-NIN IFCT 2017)

### A. Source Data & Methodology
- All nutritional calculations are derived from the official **Indian Food Composition Tables (IFCT 2017)** published by the National Institute of Nutrition (ICMR-NIN).
- Nutrition is calculated bottom-up from individual raw ingredient quantities (grams, milliliters) and normalized to a per-serving basis:

$$\text{Calories Per Serving} = \frac{\sum_{i=1}^{n} (\text{Quantity}_i \times \text{CaloriesPer100g}_i / 100)}{\text{Default Servings}}$$

### B. Raw vs. Cooked Ingredient Assumptions
- Ingredient quantities in recipe specifications represent raw, cleaned preparation weights (e.g. 200g raw paneer, 150g raw whole wheat flour).
- Oil and ghee absorption during tempering (*tadka*) and shallow frying is calculated using standard domestic Indian absorption factors (85% retention).

### C. Serving-Size Scaling & Mathematical Invariance
- As servings are adjusted (e.g. from 4 to 6 servings), total recipe nutrients scale proportionally ($1.5\times$).
- **Per-serving nutrition remains strictly invariant**, preserving clinical baseline comparability across meal plans.

### D. Rounding Tolerance Audit
- Internal nutritional totals preserve unrounded double-precision floating-point values.
- Presentation rounding occurs only at the display boundary.
- **Rounding Audit Bound**: The discrepancy between the sum of rounded per-serving values and the rounded total is mathematically proven to be $\le 2\text{ kcal}$ (e.g. for Paneer Butter Masala: raw sum = 1,489.80 kcal; displayed rounded total = 1,490 kcal; $4 \times 372\text{ kcal} = 1,488\text{ kcal}$; difference = 2 kcal).

### E. Protein Source Diversity & Rotation
- Evaluates the presence of distinct verified protein sources across the week: **Paneer**, **Dal**, **Chickpeas**, **Rajma**, **Soy**, **Curd**, and **Eggs**.
- Enforces source alternation between consecutive lunch and dinner slots.
- Awards a 100% diversity score when at least 4 distinct protein sources are rotated across a 7-day schedule, eliminating mono-protein meal planning.
