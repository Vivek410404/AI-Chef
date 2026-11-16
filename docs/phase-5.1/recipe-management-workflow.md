# RasoiIQ Phase 5.1 — Recipe Catalog & Dietary Validation Workflow

**Document Version:** 1.0.0  
**Phase:** 5.1  
**Date:** November 2026  
**Audience:** Food-Domain Curators, Nutrition Leads, Platform Administrators

---

## 1. Recipe Catalog Architecture

RasoiIQ maintains an authentic, regional Indian recipe catalog spanning traditional cuisines:
- **Gujarati & Kathiyawadi:** Sev Tameta, Ringan No Olo, Bajra Rotla, Dal Dhokli, Undhiyu, Khandvi.
- **North Indian:** Rajma Chawal, Chana Masala, Dal Makhani, Paneer Bhurji.
- **South Indian:** Sambar, Idli-Dosa batter dishes, Rasam.
- **Maharashtrian:** Pithla Bhakri, Misal Pav.

All recipes are integrated with the ICMR-NIN IFCT 2017 nutrition engine to calculate precise calorie and macronutrient breakdowns per serving.

---

## 2. Dietary Integrity & Validation Rules

To protect multi-household dietary preferences and strict Jain religious constraints, the API enforces automated dietary validation upon recipe creation and updates:

### Rule 1: Strict Jain Dietary Compatibility
If a recipe is marked as `isJainFriendly: true`:
- The recipe **must never** contain root vegetables, alliums, or underground tubers:
  - Prohibited ingredients: `Onion`, `Garlic`, `Potato`, `Carrot`, `Radish`, `Ginger`, `Beetroot`.
- If an administrator submits a Jain-friendly recipe containing any of these keywords, the API rejects the request with `400 Bad Request`:
  > `"Dietary conflict: Recipe marked as Jain-Friendly cannot contain [ingredient]."`

### Rule 2: Vegetarian vs Non-Vegetarian Exclusivity
- A recipe cannot be tagged with conflicting dietary modes:
  - Cannot contain both `NON_VEGETARIAN` and `PURE_VEGETARIAN` / `JAIN`.
- Conflicting tags are rejected with `400 Bad Request`:
  > `"Dietary conflict: Recipe cannot be tagged as NON_VEGETARIAN and PURE_VEGETARIAN/JAIN simultaneously."`

---

## 3. Recipe Catalog Interface (`/admin/recipes`)

Navigate to **Recipe Catalog** (`/admin/recipes`):
- **Search:** Search by recipe title, regional cuisine, or ingredients.
- **Cuisine Filter:** Filter by regional traditions (`Gujarati`, `Kathiyawadi`, `North Indian`, etc.).
- **Archival Filter:** Filter by `Active Only`, `Archived Only`, or `All Recipes`.
- **Table Metrics:** Title, Cuisine, Dietary tags pills, Jain-friendly badge, Total prep/cook time, and Calories per serving.

---

## 4. Creating a New Recipe

1. Click **Add New Recipe** on `/admin/recipes`.
2. Enter the recipe parameters:
   - **Title:** E.g., `"Kathiyawadi Lasaniya Batata"` or `"Jain Sev Tameta"`.
   - **Cuisine:** E.g., `Kathiyawadi`.
   - **Dietary Tag:** Select `PURE_VEGETARIAN`, `JAIN`, `VEGAN`, or `NON_VEGETARIAN`.
   - **Jain Friendly Checkbox:** Check if compliant with Jain rules.
   - **Ingredients List:** Comma-separated ingredient names.
   - **Prep Time & Cook Time:** In minutes.
   - **Calories per Serving:** In kcal.
3. Click **Create Recipe**.
4. The system validates dietary constraints. If valid, the recipe is saved in PostgreSQL, cached in memory, and an audit log event `RECIPE_CREATED` is logged.

---

## 5. Archiving & Unarchiving Recipes

If an ingredient becomes seasonally unavailable or a recipe is undergoing editorial review:
1. Locate the recipe in the catalog table.
2. Click the **Archive** icon in the Actions column.
3. The recipe's `isArchived` flag is set to `true`, and `archivedAt` and `archivedBy` are stamped.
4. Archived recipes are hidden from customer AI meal planning generation while remaining in the database for reference.
5. Click **Unarchive** at any time to restore the recipe to active status.
6. An audit log event `RECIPE_ARCHIVED` is recorded.

---

## 6. Detailed Recipe Editing (`/admin/recipes/[id]`)

Click the **Eye / Edit** icon on any recipe row to access the full editing console:
- Edit title, description, and regional cuisine.
- Recalibrate prep and cook times.
- Update nutritional breakdown: Calories (kcal), Protein (g), Carbohydrates (g), and Fat (g).
- Toggle Jain-friendly status.
- Inspect the itemized ingredient gram requirements stored in PostgreSQL.
- Click **Save Updates** to persist changes immediately. An audit log event `RECIPE_MODIFIED` is recorded.
