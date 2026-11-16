# RasoiIQ — Maharaj (Cook) Preparation Digest Usability Validation

## Executive Summary
This document validates the Maharaj (cook preparation digest) workflow implemented in RasoiIQ Phase 4.1 across three distinct Indian household archetypes: Sharma Family (North Indian), Patel Family (Gujarati / Kathiyawadi), and Mehta Family (Strict Jain).

---

## 1. Maharaj Digest Objective & Kitchen Workflow
In urban Indian households employing a cook (*Maharaj*), household heads face daily friction coordinating meals:
1. Forgetting to soak legumes the previous evening (chana, rajma, dals).
2. Cook arriving unaware of family members' allergies (e.g. peanuts) or dietary rules (e.g. Jain / non-root).
3. Ambiguity over exact portions and serving counts.
4. Need for a simple, fast message format deliverable via WhatsApp without requiring the cook to install an app.

The Maharaj Digest endpoint (`GET /api/meal-plans/maharaj-summary?day=...&householdId=...`) generates structured, operational kitchen directives and pre-formatted mobile text.

---

## 2. Multi-Household Test Execution

### 1. Sharma Family (North Indian Homestyle)
- **Household Profile**: 5 members (Pooja, Ramesh, Rohan, Aarav, Dadi).
- **Target Day**: Monday.
- **Scheduled Meals**:
  - Breakfast: Spiced Gujarati Methi Thepla (4 servings).
  - Lunch: Restaurant Style Paneer Butter Masala (4 servings).
  - Dinner: Authentic Gujarati Khatti Meethi Dal (4 servings).
- **Automated Usability Verifications**:
  - ✅ **Overnight Soaking Alert**: Correctly identified Toor Dal (`ing-toor-dal`, 200g) requiring 6–8 hours soaking prior to boiling for dinner.
  - ✅ **Advance Prep**: Clear instruction to prepare Thepla dough 30 minutes before breakfast and rest under a damp cloth.
  - ✅ **Dietary & Allergy Warning**: Prominently surfaced Pooja's severe peanut allergy to ensure no groundnut oil or peanut garnishes are used.
  - ✅ **Senior Dietary Dislike**: Noted Dadi's garlic aversion.

### 2. Patel Family (Gujarati & Kathiyawadi)
- **Household Profile**: 3 members (Rameshbhai, Hansaben, Bhavin).
- **Target Day**: Monday.
- **Scheduled Meals**:
  - Breakfast: Surati Nylon Khaman Dhokla (3 servings).
  - Lunch: Traditional Sweet & Sour Gujarati Kadhi with Rice (3 servings).
  - Dinner: Kathiyawadi Sev Tameta Nu Shaak with Bajra No Rotlo (3 servings).
- **Automated Usability Verifications**:
  - ✅ **Regional Advance Prep**: Prompted cook to whisk curd and besan into a lump-free batter prior to lunch.
  - ✅ **Kathiyawadi Prep**: Instructed kneading pearl millet flour with warm water immediately prior to hand-patted dinner rotlo.
  - ✅ **Portion Calibration**: Exact 3-portion counts calculated across all meals.

### 3. Mehta Family (Strict Jain)
- **Household Profile**: 3 members (Kirit, Hetal, Niyati).
- **Target Day**: Monday.
- **Scheduled Meals**:
  - Breakfast: Crispy Methi Na Gota (5 servings).
  - Lunch: Kathiyawadi Ringna No Olo (Jain adaptation) (5 servings).
  - Dinner: Traditional Kathiyawadi Bajra No Rotlo (5 servings).
- **Automated Usability Verifications**:
  - ✅ **100% Strict Jain Enforcement**: 0 root vegetables, 0 onions, 0 garlic across scheduled dishes.
  - ✅ **Jain Alternative Directives**: Explicit instructions for the cook to replace root vegetables with green plantain / bottle gourd.
  - ✅ **Allergy Warning**: Hetal's peanut allergy alerted.

---

## 3. WhatsApp Mobile Format Output Sample

```
🍲 *RASOIIQ MAHARAJ COOK DIGEST*
🏠 *Household:* Sharma Family
📅 *Day:* MONDAY
👥 *Total Servings:* 12

🍽️ *SCHEDULED MEALS:*
  • [BREAKFAST] Spiced Gujarati Methi Thepla (4 servings, Gujarati)
  • [LUNCH] Restaurant Style Paneer Butter Masala (4 servings, North Indian)
  • [DINNER] Authentic Gujarati Khatti Meethi Dal (4 servings, Gujarati)

💧 *OVERNIGHT SOAKING:*
  • Toor Dal (Pigeon Pea) (200g) - Soak in clean water for 6-8 hours overnight before boiling.

🔪 *ADVANCE PREP:*
  • Dough Preparation for Spiced Gujarati Methi Thepla (BREAKFAST): Knead fresh dough 30 minutes before meal time and rest under damp cloth.

⚠️ *DIETARY & ALLERGY ALERTS:*
  • Pooja: VEGETARIAN (Allergies: Peanuts)
  • Ramesh (Father-in-law): JAIN
  • Rohan (Husband): EGGETARIAN
  • Aarav (Son): VEGETARIAN
  • Dadi (Grandmother): VEGETARIAN (Dislikes: Garlic)
```

---

## 4. Kitchen Print / High-Contrast PDF Layout
For households where the cook prefers a physical kitchen bulletin:
1. **High Contrast Typography**: Pure black on white (`#000000` on `#ffffff`) with sans-serif Indian regional legibility.
2. **Tabular Meal Timeline**: Breakfast (08:00–09:30), Lunch (12:30–14:00), Dinner (19:30–21:00).
3. **Dedicated Red-Bordered Box**: Highlights allergies and Jain restrictions prominently to eliminate kitchen cross-contamination.
