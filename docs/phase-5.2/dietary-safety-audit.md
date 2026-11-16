# RasoiIQ Phase 5.2 — Dietary Safety, Allergy Enforcement & Recipe Integrity Audit

**Milestone:** Phase 5.2 — Security Hardening, Data Integrity & Operational Verification  
**Module:** `services/api/src/recipes`, `services/api/src/ai-chef`  
**Focus:** Non-Negotiable Dietary Safeguards, Root Vegetable (Jain) Exclusions, Conflicting Tag Defenses  

---

## 1. Zero-Compromise Dietary Principles

In the Indian household context, dietary restrictions are deeply cultural, religious, and medical. Violating a dietary rule (e.g. serving onion or garlic to an observant Jain household, or serving animal products to a Vaishnav Hindu household) is considered an unacceptable platform failure.

RasoiIQ enforces dietary rules through a fail-closed multi-tier defense:
1. **Catalog Integrity Level:** Recipes with incompatible tags (e.g., conflicting `NON_VEGETARIAN` and `PURE_VEGETARIAN`) are rejected at creation/ingestion time.
2. **Ingredient-Level Keyword Filtering:** Automated inspection of recipe ingredient lists for prohibited items (e.g. onion, garlic, potato in Jain mode).
3. **AI Chef Guardrails:** Gemini prompts enforce strict system prompts and fallback rules prohibiting prohibited ingredients.
4. **Deterministic Hard Fallback:** If the LLM generates a recipe violating household constraints, the local deterministic rule engine strips or substitutes the ingredient before saving.

---

## 2. Tested Safety Test Cases

In `scripts/test-phase52-security-integrity.mjs` (Category 9) and `scripts/test-phase42-safety-and-recipes.mjs`:

### Case 1: Conflicting Dietary Tags
- **Input:** Recipe creation payload containing both `NON_VEGETARIAN` and `PURE_VEGETARIAN` in `dietaryTags`.
- **Validation:** Server detects contradictory dietary classifications.
- **Result:** HTTP `400 Bad Request` (`Recipe cannot be simultaneously Vegetarian and Non-Vegetarian.`).

### Case 2: Jain Mode Root-Vegetable Ingestion (Onion)
- **Input:** Recipe tagged with `JAIN` / `JAIN_FRIENDLY` containing `onion` or `pyaz` in the ingredient list.
- **Validation:** Root vegetable blacklist detector triggers.
- **Result:** HTTP `400 Bad Request` (`Jain-friendly recipe cannot contain root vegetables (found: onion).`).

### Case 3: Jain Mode Root-Vegetable Ingestion (Potato)
- **Input:** Recipe tagged with `JAIN` / `JAIN_FRIENDLY` containing `potato` or `aloo` in the ingredient list.
- **Validation:** Root vegetable blacklist detector triggers.
- **Result:** HTTP `400 Bad Request` (`Jain-friendly recipe cannot contain root vegetables (found: potato).`).

### Case 4: Severe Allergy Enforcement (Peanut / Dairy / Gluten)
- **Validation:** When household members specify allergens (e.g., `PEANUT` allergy for Sharma child), the meal plan engine and AI Chef automatically exclude recipes containing groundnuts/peanuts or apply verified substitutions (e.g. sunflower seed paste or roasted chana).
- **Result:** 0 peanut ingredients introduced into Sharma meal plans across all automated simulation suites.

---

## 3. Dietary Safety Verification Summary

| Constraint | Engine Guard | Status |
| :--- | :--- | :---: |
| Pure Vegetarian | Strict filter against meat, poultry, seafood, gelatin | **VERIFIED** |
| Jain Strict | Automatic exclusion of onion, garlic, potato, radish, carrot | **VERIFIED** |
| Tag Integrity | Rejection of mutually exclusive dietary tags | **VERIFIED** |
| Allergen Exclusion | Exclusion of declared household member allergens | **VERIFIED** |
| Fallback Safety | Fail-closed deterministic catalog when AI fails | **VERIFIED** |
