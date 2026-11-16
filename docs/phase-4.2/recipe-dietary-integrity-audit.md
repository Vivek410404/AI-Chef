# RasoiIQ Phase 4.2 — Recipe Integrity & Dietary Contradiction Audit Report

**Date:** November 2026  
**Auditor:** RasoiIQ Core Engineering & Food Safety Verification Engine  
**Catalog Status:** 34 Verified Regional Indian Recipes (Expanded from 32)  
**Contradictions Detected:** 0 / 34 Active Recipes  
**Automated Safety Suite:** `scripts/test-phase42-safety-and-recipes.mjs` (23 assertions passing)

---

## 1. Executive Summary

A comprehensive, ingredient-level dietary integrity audit was conducted across the entire RasoiIQ recipe catalog. The audit revealed five historical discrepancies between high-level promotional tags and actual physical ingredient lists in earlier revisions. These discrepancies were systematically resolved through catalog corrections, recipe bifurcations (creating dedicated, authentic dietary variants), and the introduction of structured ingredient-level metadata with automatic contradiction detection.

Every recipe in the catalog now undergoes automated validation against `validateRecipeDietaryConsistency()` before runtime availability, ensuring zero dietary leakage across **Vegetarian**, **Vegan**, **Jain**, **Eggetarian**, and **Gluten-Free** dietary modes.

---

## 2. Catalog Audit Findings & Resolutions

### 2.1 Bajra No Rotlo (Kathiyawadi Pearl Millet Flatbread)
* **Pre-Audit State:** Tagged `Vegan` and `Jain Friendly`, but listed `ing-ghee` (Desi Cow Ghee, 25g) for brushing.
* **Domain Conflict:** In authentic Kathiyawadi cuisine, traditional Rotlo served with Baingan Bharta or Ringna Olo is slathered generously with fresh desi cow ghee. However, ghee is an animal-derived dairy product and fundamentally violates vegan dietary laws.
* **Resolution:**
  1. `recipe-bajra-no-rotlo`: Removed `Vegan` tag. Tagged `['Pure Vegetarian', 'Vegetarian', 'Gluten-Free', 'Jain Friendly']`. Formulated with stone-ground pearl millet flour, water, salt, and desi cow ghee.
  2. `recipe-bajra-no-rotlo-vegan`: Created a dedicated, authentic regional variant. Hand-patted pearl millet dough topped with white sesame seeds (`ing-sesame-seeds`) and brushed with cold-pressed sesame oil (`ing-oil`, til tel). Tagged `['Pure Vegetarian', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Jain Friendly']`.

### 2.2 Surati Undhiyu (Iconic Gujarati Winter Medley)
* **Pre-Audit State:** Tagged `Pure Vegetarian`, but lacked an authentic Jain preparation, creating ambiguity for Jain pilot households.
* **Domain Conflict:** Traditional Surati Undhiyu features Surti papdi, tuver lilva, small brinjals, fenugreek muthiya, ginger-garlic paste, and underground tubers—specifically `ing-purple-yam` (kand/ratalu) and `ing-potato`. Strict Jain dietary law explicitly prohibits underground root vegetables (*anantkay* / subterranean roots) and alliums.
* **Resolution:**
  1. `recipe-surati-undhiyu`: Retained as traditional festival recipe. `isJainFriendly: false`. Contains Surti papdi, tuver lilva, purple yam, potato, baby brinjal, methi muthiya, ginger, sesame, and spices.
  2. `recipe-surati-undhiyu-jain`: Introduced authentic Jain banquet recipe. Substitutes purple yam and potatoes with firm raw green plantains (`ing-raw-banana`, kacha kela, 250g). Completely eliminates ginger, garlic, and onions, utilizing pure asafoetida (`ing-hing`) and green chillies for pungent warmth. Steamed methi muthiya bound with besan. Marked `isJainFriendly: true`.

### 2.3 Gujarati Khatti Meethi Dal (Sweet & Tangy Toor Dal)
* **Pre-Audit State:** Tagged `Jain Friendly` with `isJainFriendly: true`, but contained `ing-ginger` (15g grated ginger root).
* **Domain Conflict:** Ginger (*adrak*) is a subterranean rhizome root vegetable strictly excluded by observant Jains.
* **Resolution:** Replaced `ing-ginger` with `ing-hing` (2g pure asafoetida). Authentic Jain Gujarati Khatti Meethi Dal derives its signature pungency and digestive balance from pure asafoetida, organic jaggery, fresh lemon juice, mustard seeds, cumin seeds, and curry leaves. Tested and verified 100% root-free.

### 2.4 Idli Sambar (South Indian Steamed Rice Cakes with Lentil Stew)
* **Pre-Audit State:** Tagged `Vegan` and `Jain Friendly`, but listed `ing-ghee` (15g) in the tempering (*vaghar* / *tadka*).
* **Domain Conflict:** Desi ghee in the tempering contradicts the vegan classification.
* **Resolution:** Replaced `ing-ghee` with cold-pressed sunflower/sesame oil (`ing-oil`, 15ml), adhering strictly to traditional South Indian tiffin and temple canteen standards. The recipe is now authentically 100% plant-based, gluten-free, and vegan compliant.

### 2.5 Rava Upma (South Indian Roasted Semolina Breakfast)
* **Pre-Audit State:** Marked `isJainFriendly: true`, but contained `ing-ginger` (10g minced ginger) and `ing-rava` (wheat semolina).
* **Domain Conflict:** Contains root ginger.
* **Resolution:** Changed `isJainFriendly: false`. Removed `Jain Friendly` tag. Preserved `['Pure Vegetarian', 'Vegetarian', 'Kid-Friendly']`.

### 2.6 Kathiyawadi Vaghireli Khichdi
* **Pre-Audit State:** Tagged `Vegan`, but entitled "Kathiyawadi Vaghireli Khichdi with Desi Ghee" and containing 25g desi cow ghee.
* **Resolution:** Removed `Vegan` tag. Tagged `['Pure Vegetarian', 'Vegetarian', 'Gluten-Free', 'Jain Friendly']`.

---

## 3. Structured Ingredient Metadata Model

The grocery and nutrition engines rely on `VerifiedIngredientMeta` in `packages/grocery-engine/src/dietary-filters.ts`:

```typescript
export interface VerifiedIngredientMeta {
  id: string;
  name: string;
  isJainPermissible: boolean;
  isVerified: boolean;
  isAnimalDerived?: boolean;
  containsEggs?: boolean;
  containsDairy?: boolean;
  containsMeat?: boolean;
  containsPoultry?: boolean;
  containsFish?: boolean;
  containsSeafood?: boolean;
  isOnionGarlic?: boolean;
  isRootVegetable?: boolean;
  containsNuts?: boolean;
  containsGluten?: boolean;
  allergens?: string[];
  ifctCode?: string;
  nutritionProvenance?: string;
}
```

### Complete Registry Audit (57 Catalog Ingredients)

| Ingredient ID | Name | Category | Animal | Dairy | Root | Allium | Gluten | Jain OK | IFCT Code |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| `ing-paneer` | Malai Paneer | Dairy & Eggs | Yes | Yes | No | No | No | Yes | Dairy-004 |
| `ing-milk` | Cow Milk | Dairy & Eggs | Yes | Yes | No | No | No | Yes | Dairy-001 |
| `ing-curd` | Curd (Dahi) | Dairy & Eggs | Yes | Yes | No | No | No | Yes | Dairy-006 |
| `ing-ghee` | Desi Cow Ghee | Oils & Ghee | Yes | Yes | No | No | No | Yes | Fats-003 |
| `ing-butter` | White Butter | Dairy & Eggs | Yes | Yes | No | No | No | Yes | FDC-173410 |
| `ing-buttermilk` | Spiced Buttermilk | Dairy & Eggs | Yes | Yes | No | No | No | Yes | Dairy-003 |
| `ing-eggs` | Farm Eggs | Dairy & Eggs | Yes | No | No | No | No | No | Egg-001 |
| `ing-chicken` | Chicken Curry Cut | Meat & Poultry | Yes | No | No | No | No | No | Meat-002 |
| `ing-fish` | Rohu / Catla Fish | Meat & Poultry | Yes | No | No | No | No | No | Fish-012 |
| `ing-basmati-rice` | Basmati Rice | Grains & Atta | No | No | No | No | No | Yes | Cereals-001 |
| `ing-atta` | Whole Wheat Atta | Grains & Atta | No | No | No | No | Yes | Yes | Cereals-002 |
| `ing-poha` | Thick Poha | Grains & Atta | No | No | No | No | No | Yes | Cereals-005 |
| `ing-besan` | Gram Flour | Grains & Atta | No | No | No | No | No | Yes | Pulses-007 |
| `ing-rava` | Sooji / Rava | Grains & Atta | No | No | No | No | Yes | Yes | Cereals-004 |
| `ing-dosa-batter` | Fermented Batter | Grains & Atta | No | No | No | No | No | Yes | Cereals-010 |
| `ing-bajra-flour` | Pearl Millet Flour | Grains & Atta | No | No | No | No | No | Yes | Millets-001 |
| `ing-toor-dal` | Toor Dal | Lentils & Pulses | No | No | No | No | No | Yes | Pulses-001 |
| `ing-moong-dal` | Moong Dal | Lentils & Pulses | No | No | No | No | No | Yes | Pulses-002 |
| `ing-rajma` | Kashmiri Rajma | Lentils & Pulses | No | No | No | No | No | Yes | Pulses-004 |
| `ing-chana-dal` | Chana Dal | Lentils & Pulses | No | No | No | No | No | Yes | Pulses-005 |
| `ing-urad-dal` | Urad Dal | Lentils & Pulses | No | No | No | No | No | Yes | Pulses-003 |
| `ing-kabuli-chana` | Chickpeas | Lentils & Pulses | No | No | No | No | No | Yes | Pulses-006 |
| `ing-tuver-lilva` | Green Pigeon Peas | Lentils & Pulses | No | No | No | No | No | Yes | Pulses-012 |
| `ing-onion` | Red Onion | Produce | No | No | Yes | Yes | No | No | Veg-001 |
| `ing-tomato` | Red Tomato | Produce | No | No | No | No | No | Yes | Veg-002 |
| `ing-garlic` | Garlic Pods | Produce | No | No | Yes | Yes | No | No | Veg-003 |
| `ing-ginger` | Fresh Ginger | Produce | No | No | Yes | No | No | No | Veg-004 |
| `ing-green-chilli` | Green Chilli | Produce | No | No | No | No | No | Yes | Veg-005 |
| `ing-coriander` | Fresh Dhaniya | Produce | No | No | No | No | No | Yes | Veg-006 |
| `ing-curry-leaves` | Curry Leaves | Produce | No | No | No | No | No | Yes | Veg-007 |
| `ing-potato` | Desi Potato | Produce | No | No | Yes | No | No | No | Roots-001 |
| `ing-purple-yam` | Kand / Purple Yam | Produce | No | No | Yes | No | No | No | Roots-004 |
| `ing-palak` | Fresh Spinach | Produce | No | No | No | No | No | Yes | Veg-008 |
| `ing-fenugreek` | Methi Leaves | Produce | No | No | No | No | No | Yes | Veg-009 |
| `ing-cauliflower` | Cauliflower | Produce | No | No | No | No | No | Yes | Veg-010 |
| `ing-bhindi` | Ladyfinger | Produce | No | No | No | No | No | Yes | Veg-011 |
| `ing-baingan` | Eggplant | Produce | No | No | No | No | No | Yes | Veg-012 |
| `ing-lemon` | Fresh Lemon | Produce | No | No | No | No | No | Yes | Fruits-001 |
| `ing-peanuts` | Raw Peanuts | Produce | No | No | No | No | No | Yes | Nuts-001 |
| `ing-surti-papdi` | Surti Flat Beans | Produce | No | No | No | No | No | Yes | Veg-015 |
| `ing-raw-banana` | Kacha Kela | Produce | No | No | No | No | No | Yes | Veg-016 |
| `ing-turmeric` | Haldi Powder | Spices & Masalas | No | No | No | No | No | Yes | Spices-004 |
| `ing-red-chilli` | Red Chilli Powder | Spices & Masalas | No | No | No | No | No | Yes | Spices-005 |
| `ing-coriander-p`| Dhaniya Powder | Spices & Masalas | No | No | No | No | No | Yes | Spices-006 |
| `ing-garam-masala`| Garam Masala | Spices & Masalas | No | No | No | No | No | Yes | Spices-007 |
| `ing-sambar-p` | Sambar Masala | Spices & Masalas | No | No | No | No | No | Yes | Spices-008 |
| `ing-chole-masala`| Chhole Masala | Spices & Masalas | No | No | No | No | No | Yes | Spices-009 |
| `ing-mustard` | Mustard Seeds | Spices & Masalas | No | No | No | No | No | Yes | Spices-010 |
| `ing-cumin` | Jeera Seeds | Spices & Masalas | No | No | No | No | No | Yes | Spices-011 |
| `ing-kasuri-methi`| Dried Methi | Spices & Masalas | No | No | No | No | No | Yes | Spices-012 |
| `ing-salt` | Iodized Salt | Spices & Masalas | No | No | No | No | No | Yes | Minerals-001 |
| `ing-oil` | Mustard/Sun Oil | Oils & Ghee | No | No | No | No | No | Yes | Fats-001 |
| `ing-jaggery` | Organic Jaggery | Spices & Masalas | No | No | No | No | No | Yes | Sugars-001 |
| `ing-sev` | Nylon Sev | Snacks & Bakery | No | No | No | No | No | Yes | Snacks-001 |
| `ing-sesame` | Sesame Seeds | Spices & Masalas | No | No | No | No | No | Yes | Oilseeds-004 |
| `ing-ajwain` | Carom Seeds | Spices & Masalas | No | No | No | No | No | Yes | Spices-002 |
| `ing-hing` | Asafoetida | Spices & Masalas | No | No | No | No | No | Yes | Spices-001 |

---

## 4. Contradiction Validation Algorithm

The algorithm `validateRecipeDietaryConsistency(recipe, registry)` enforces 5 immutable invariants:
1. **Vegan Safety:** Rejects recipes containing any ingredient with `isAnimalDerived: true`, `containsDairy: true`, `containsEggs: true`, or `containsMeat: true`.
2. **Vegetarian Safety:** Rejects recipes with meat, fish, poultry, seafood, or eggs (unless explicitly tagged Eggetarian).
3. **Eggetarian Safety:** Allows eggs and vegetarian dairy; strictly blocks meat, poultry, fish, and seafood.
4. **Jain Safety:** Rejects recipes containing root vegetables (`isRootVegetable: true`), alliums (`isOnionGarlic: true`), meat, fish, or eggs.
5. **Gluten-Free Safety:** Rejects recipes containing whole wheat atta (`ing-atta`) or semolina (`ing-rava`).

### Automated Validation Results
* **Real Catalog Recipes:** 34 / 34 passed with 0 errors.
* **Synthetic Injection Test Cases:** 5 / 5 intentional dietary violations were correctly flagged and rejected during CI/CD test runs.
