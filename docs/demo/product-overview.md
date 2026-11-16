# 🍲 RasoiIQ — Product Overview & Strategic Narrative

## Executive Summary
**RasoiIQ** is India’s first intelligent kitchen operating system that integrates AI-powered weekly meal planning, clinical Indian nutrition analysis (IFCT 2017), automated pantry deduction, and quick-commerce price discovery.

By addressing the daily domestic friction of *"Aaj khane mein kya banaye?"*, RasoiIQ transforms how modern Indian families plan, balance nutrition, and purchase groceries.

---

## 1. The Core Problem Space

Urban Indian households face three compounding challenges in domestic culinary management:

1. **Daily Cognitive Overload & Menu Monotony**:
   - The average Indian homemaker or couple spends 45–60 minutes daily deciding what to cook across breakfast, lunch, and dinner.
   - This friction causes repetitive menus, default reliance on high-carb dishes, and frequent last-minute ordering from high-calorie restaurants.

2. **Severe Protein Deficiency in Vegetarian Lifestyles**:
   - Over 70% of Indian diets are protein-deficient according to ICMR-NIN.
   - Traditional Indian vegetarian food often clusters around single protein sources (e.g., paneer or lentils only), without adequate source rotation (chickpeas, rajma, curd, soy, seeds).

3. **Fragmented, Inefficient Grocery Procurement**:
   - Ingredients required for 21 meals in a week are difficult to aggregate by hand.
   - Consumers overpurchase perishables that spoil in the fridge while simultaneously buying items they already have in their kitchen pantry.
   - When ordering from quick-commerce apps (Blinkit, Zepto, DMart Ready, BigBasket), users manually toggle between apps with zero transparency on total basket price differences.

---

## 2. RasoiIQ Solution Pillars

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RASOIIQ VALUE FLYWHEEL                          │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│  1. AI CHEF      │  2. NUTRITION    │  3. GROCERY      │  4. QUICK-    │
│     PLANNER      │     ENGINE       │     ENGINE       │     COMMERCE  │
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ • 7-Day Grid     │ • IFCT 2017      │ • Member Scaling │ • 4-Retailer  │
│ • Mixed Diets    │ • 7 Macro/Micros │ • Pantry Subtract│   Comparison  │
│ • Regional India │ • Protein Score  │ • Pack Rounding  │ • 1-Click     │
│ • Zero Duplicate │ • Personal Goals │ • Strict Decouple│   Checkout    │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### Pillar 1: AI Chef with Zero-Cost Dual-Engine Architecture
- Powered by Google Gemini 3.5 Flash-Lite (with secondary fallback to Gemini 3.1 Flash-Lite).
- Backed by an intelligent deterministic rule engine that ensures 100% availability even with zero network connectivity or quota exhaustion.
- Natively understands Indian culinary customs: Regional diets (North Indian, Punjabi, South Indian, Gujarati, Bengali), dietary modes (Vegetarian, Vegan, Eggetarian, Non-Veg, Jain), and strict exclusion rules.

### Pillar 2: Clinical Indian Nutrition Intelligence (IFCT 2017)
- Computes 7 core macro- and micronutrients per serving based on ICMR-NIN Indian Food Composition Tables:
  - Calories (kcal), Protein (g), Carbohydrates (g), Total Fat (g), Dietary Fibre (g), Sugar (g), Sodium (mg).
  - Protein source diversity tracking across Paneer, Dal, Chickpeas, Rajma, Soy, Curd, and Seeds.
  - Transparent data completeness indicators (exact IFCT match vs estimate).

### Pillar 3: Deterministic Grocery Engine
- Automatically aggregates recipe requirements across all 21 scheduled meals.
- Dynamically scales quantities based on household headcount (e.g. 4 adults).
- **Pantry Subtraction**: Automatically deducts pantry stock already at home.
- **Pack Size Normalization**: Rounds recipe quantities (e.g. 350g paneer) into standard commercial packs (two 200g Amul packs = 400g).
- **Strict Decoupling Rule**: Deselecting an item from the purchase basket saves money without corrupting the underlying recipe requirements.

### Pillar 4: Multi-Retailer Price Discovery & 1-Click Simulated Order
- Instant basket cost comparison across top Indian quick-commerce grocers:
  - **Blinkit** (10–15 mins delivery)
  - **Zepto** (10 mins delivery)
  - **DMart Ready** (Value hypermarket scheduled delivery)
  - **BigBasket** (Comprehensive scheduled supermarket)
- Authoritative price synchronization: retailer card prices match the order summary total payable down to the exact rupee.

---

## 3. Brand Identity & Visual Language
RasoiIQ is designed with a warm, culturally resonant visual identity:
- **Primary Color**: Forest Green (`#1e3a2f`) — evokes fresh produce, organic ingredients, and wellness.
- **Accent Color**: Terracotta (`#c85a32`) — honors traditional Indian clay cookware (*handi*, *matka*).
- **Background**: Soft Warm Cream (`#fbf8f2`) — delivers an inviting, editorial kitchen aesthetic distinct from cold generic SaaS apps.
- **Typography**: Modern, highly legible sans-serif with bold numerical badges and clean data pills.

---

## 4. Key Differentiators vs Global Competitors (e.g., JOW, Mealime)
1. **Indian Regional Authenticity**: Global apps struggle with Indian staple prep (tempering/tadka, masala pastes, dal varieties, bread dough scaling). RasoiIQ is built from the ground up for Indian ingredients.
2. **Multi-Generational Mixed Diets**: In India, one roof often houses a Jain grandparent, vegetarian parents, and an eggetarian child. RasoiIQ finds recipes that intersect these complex boundaries without conflict.
3. **Pantry-Aware Grocery Aggregation**: Accounts for common Indian pantry reserves (20kg wheat flour bags, 5kg rice bins, pantry spice tins).
4. **Quick-Commerce First**: While European apps integrate with weekly hypermarket deliveries, Indian urban consumers live on 10-minute quick-commerce. RasoiIQ’s basket engine models delivery fees, thresholds, and instant availability.
