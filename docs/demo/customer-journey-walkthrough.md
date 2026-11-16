# 🗺️ RasoiIQ — 20-Step Customer Journey Demonstration Scenario

> **Target Profile**: *The Sharma Household* (4 Members: Pooja, Rohan, Ramesh, Aarav)  
> **Environment**: Localhost (`http://localhost:3000` / API `http://localhost:4000/api`)  
> **Test Baseline**: 234/234 passing automated test assertions

This document provides a comprehensive, click-by-click operational guide to executing the complete customer demonstration flow.

---

## The 20-Step End-to-End Walkthrough

### Phase 1: Dashboard Discovery & Household State
1. **Launch Dashboard**:
   - *Action*: Open web browser to `http://localhost:3000`.
   - *System Behavior*: Fetches current meal plan, household data, pantry stock, and recent orders from the backend API.
   - *Visual Outcome*: Clean hero banner, Planned Meals widget for Monday, Nutrition summary, and Quick Action buttons.
2. **Inspect Interactive Day Selector**:
   - *Action*: Click on the day selector pills ("Tue", "Wed", "Thu", "Fri", "Sat", "Sun") on the Planned Meals card.
   - *System Behavior*: Replaces the displayed breakfast, lunch, and dinner cards with the scheduled recipes for that specific day without page refresh.
   - *Visual Outcome*: Dishes, prep times, calories, and protein tags update smoothly.
3. **Open Household Management**:
   - *Action*: Click on **"Manage Household"** in the top navigation bar or on the dashboard card.
   - *System Behavior*: Displays the multi-member household configuration modal.
   - *Visual Outcome*: Shows household name "Sharma Family (4)", primary cook Pooja, and members Rohan, Ramesh, and Aarav.
4. **Verify Dietary Defaults & Multi-Member Rules**:
   - *Action*: Review preferences. Observe dietary mode is `VEGETARIAN` and cuisine is `ALL_INDIAN`.
   - *System Behavior*: Backing constraint solver confirms Ramesh is tagged `JAIN` (no root vegetables, onions, garlic), Pooja has a `Peanut` allergy, and Rohan has a `Gluten` allergy.
   - *Visual Outcome*: Modifiable member cards and dietary selection pills with tooltips.

### Phase 2: AI Chef Meal Planning
5. **Navigate to AI Meal Planner**:
   - *Action*: Click **"Meal Planner"** in the top navigation bar.
   - *System Behavior*: Renders the 7-day responsive grid (Monday through Sunday) across Breakfast, Lunch, and Dinner.
   - *Visual Outcome*: Full 21-meal calendar cards with dish names, cuisine badges, and action buttons.
6. **Trigger AI Plan Generation**:
   - *Action*: Click **"Generate with AI Chef"** button. In the modal, leave preferences as default and click **"Generate 7-Day Plan"**.
   - *System Behavior*: Calls backend `POST /api/ai/generate-plan`. Backend calls Gemini 3.5 Flash-Lite (or activates secondary/deterministic fallback), parses response, reconciles recipes against database, and returns 21 meals.
   - *Visual Outcome*: Progress loader briefly appears, followed by 21 balanced meals populated across the grid.
7. **Verify Recipe Diversity & Zero Same-Day Repetition**:
   - *Action*: Inspect the scheduled meals across all 7 days.
   - *System Behavior*: Enforces $\ge 10$ unique recipes across the week (typically 18–20 unique) and guarantees 0 duplicate recipes on the same calendar day.
   - *Visual Outcome*: Rich variety: Methi Thepla, Poha, Idli Sambar, Paneer Butter Masala, Chole, Rajma, Khichdi, Bhindi Masala, etc.
8. **Inspect AI Provider Attribution**:
   - *Action*: Check the generation status badge at the top right of the planner.
   - *System Behavior*: Transparently reports `Powered by Gemini 3.5 Flash-Lite` (or `Deterministic Fallback Engine` if API key is not present).
   - *Visual Outcome*: Green status badge showing authoritative model and execution time.
9. **Interactive Recipe Replacement**:
   - *Action*: Click **"Swap Dish"** on Wednesday Lunch.
   - *System Behavior*: Opens the Recipe Discovery modal filtered to dishes compatible with household restrictions.
   - *Visual Outcome*: User selects "Authentic Gujarati Khatti Meethi Dal"; Wednesday lunch updates immediately.

### Phase 3: Clinical Nutrition Intelligence (IFCT 2017)
10. **Open Recipe Nutrition Panel**:
    - *Action*: Click on any recipe card (e.g. "Paneer Butter Masala").
    - *System Behavior*: Retrieves unrounded nutrient matrix calculated from ICMR-NIN IFCT 2017 dataset.
    - *Visual Outcome*: Modal opens displaying 7 core nutrients per serving: Calories (372 kcal), Protein (16.2g), Carbs (14.5g), Fat (28.4g), Fibre (3.2g), Sugar (4.1g), Sodium (480mg).
11. **Scale Serving Sizes Dynamically**:
    - *Action*: Increase servings from 4 to 6 using the `+` stepper.
    - *System Behavior*: Scales ingredient quantities proportionally by $1.5\times$ while keeping per-serving nutrition strictly invariant.
    - *Visual Outcome*: Total recipe calories and protein update immediately; per-serving badges remain constant.
12. **Review Protein Source Diversity**:
    - *Action*: Review the Protein Source Diversity card on the planner/dashboard.
    - *System Behavior*: Aggregates protein contributors across the week: Paneer, Dal, Chickpeas, Rajma, Soy, Curd.
    - *Visual Outcome*: Diversity score badge (100%) indicating no single protein source dominates all 7 days.

### Phase 4: Deterministic Indian Grocery Engine
13. **Navigate to Smart Basket**:
    - *Action*: Click **"Smart Basket"** in the top navigation bar.
    - *System Behavior*: Runs `@rasoi/grocery-engine` to aggregate required ingredients across all 21 scheduled meals, scale by household headcount, and round into commercial package sizes.
    - *Visual Outcome*: Itemized shopping list sorted by grocery category (Dairy, Grains, Vegetables, Spices, Staples).
14. **Verify Kitchen Pantry Inventory Deduction**:
    - *Action*: Inspect the Atta (Whole Wheat Flour) line item.
    - *System Behavior*: Recipes require 300g of Atta. The kitchen pantry has 2,000g logged. The engine computes:
      $$\text{Net to Buy} = \max(0, 300\text{g} - 2000\text{g}) = 0\text{g}$$
    - *Visual Outcome*: Atta displays `0 Packs needed (2,000g available in pantry)` and is not charged in the cart.
15. **Test Strict Business Rule Decoupling**:
    - *Action*: Uncheck the checkbox for "Amul Fresh Malai Paneer" in the basket.
    - *System Behavior*: The item moves to the "Excluded from Purchase Basket" section and cart subtotal decreases. However, the underlying recipe requirements for Paneer Butter Masala remain 100% intact.
    - *Visual Outcome*: Visual notification affirms: *"Recipe requirements protected: Scheduled recipes still require 550g of Paneer."*
16. **Swap Brand or Pack Size**:
    - *Action*: Click **"Swap Brand or Pack Size"** on Aashirvaad Atta.
    - *System Behavior*: Opens the substitution modal listing alternative catalog brands and weights (e.g. Fortune Chakki Fresh Atta 5kg).
    - *Visual Outcome*: Selecting Fortune updates the brand name, SKU price, and pack calculation.

### Phase 5: Multi-Retailer Comparison & Checkout
17. **Compare Quick-Commerce Retailers**:
    - *Action*: Scroll to the Retailer Comparison section showing **Blinkit**, **Zepto**, **DMart Ready**, and **BigBasket**.
    - *System Behavior*: The grocery engine evaluates the current basket against each retailer's pricing rules, free-delivery thresholds, and delivery speed estimates.
    - *Visual Outcome*: 4 responsive cards showing basket total, delivery charges, ETA, and potential savings. Clear `DEMO PRICING & SAMPLE CATALOG DATA` badge is visible.
18. **Verify Authoritative Price Consistency**:
    - *Action*: Select the **Blinkit** card.
    - *System Behavior*: Updates active grocer to Blinkit. Synchronizes the Order Summary card.
    - *Visual Outcome*: Blinkit card displays ₹2,545. Order Summary Total Payable displays exactly ₹2,545. No rounding discrepancies.
19. **Select Delivery Address**:
    - *Action*: Toggle between saved addresses: "Home" (Bengaluru), "Office" (Mumbai), and "Parents" (Delhi).
    - *System Behavior*: Updates active delivery destination; confirms delivery serviceability.
    - *Visual Outcome*: Active address card updates with pin icon and address text.
20. **Execute 1-Click Simulated Order & View Confirmation**:
    - *Action*: Click **"Proceed to Simulated 1-Click Order"**.
    - *System Behavior*: Button disables immediately and shows loading spinner (`Processing Simulated Order...`). Backend verifies payload, enforces 5s deduplication check, generates `RASOI-XXXXXX` order number, and persists order with `DEMO ORDER CONFIRMED` status.
    - *Visual Outcome*: Confetti animation fires; order confirmation card appears showing order number, chosen retailer, itemized breakdown, and estimated delivery time. Returning to dashboard displays the new order in "Recent Orders".

---
*End-to-End Scenario Successfully Validated.*
