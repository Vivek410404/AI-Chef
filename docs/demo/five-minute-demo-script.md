# ⏱️ RasoiIQ — 5-Minute Stakeholder Demonstration Script

> **Purpose**: A crisp, professional 5-minute presentation script for investors, product leaders, and prospective retail partners.  
> **Host URL**: `http://localhost:3000` (Customer Portal)  
> **Seeded Household**: *Sharma Family (4 Members: Pooja, Rohan, Ramesh, Aarav)*

---

## Timeline & Scene Overview

| Time | Scene | Screen | Focus / Core Message |
|---|---|---|---|
| **0:00 – 0:45** | The Hook & Dashboard | Customer Dashboard | Indian kitchen friction & real-time household snapshot |
| **0:45 – 1:30** | Household Onboarding | Household Modal | Multi-generational diet & allergy intersection |
| **1:30 – 2:30** | AI Chef Meal Planning | AI Planner & 7-Day Grid | Gemini 3.5 Flash-Lite generation, 20 unique recipes |
| **2:30 – 3:15** | Clinical Nutrition | Recipe Nutrition Details | IFCT 2017 7-nutrient breakdown & protein source diversity |
| **3:15 – 4:15** | Smart Basket & Retailers | Grocery Basket & Retailer Cards | Pantry deduction, pack rounding, 4-grocer comparison |
| **4:15 – 5:00** | Simulated Checkout & Wrap | Order Confirmation | Authoritative price match, 1-click order, zero API leaks |

---

## Step-by-Step Script & Actions

### Scene 1: The Hook & Dashboard (0:00 – 0:45)
- **Action**: Open `http://localhost:3000`. Point to the header showing **Sharma Family (4)** and the top navigation.
- **Say**:
  > *"Every evening, over 100 million urban Indian households ask the exact same question: 'Aaj khane mein kya banaye?'. Despite having multiple delivery apps, home cooking remains fragmented, protein-deficient, and fraught with grocery waste.*  
  > *Welcome to RasoiIQ — the intelligent kitchen operating system built specifically for Indian homes.*  
  > *On this dashboard, the Sharma family can see today's planned meals across Breakfast, Lunch, and Dinner, their daily protein goal progress, active pantry alerts, and recent quick-commerce grocery orders."*
- **Highlight**:
  - Interactive Day Selector pills (Mon–Sun) switching the day's menu instantly.
  - Protein progress gauge calibrated against the household goal.

---

### Scene 2: Household Onboarding & Mixed Diets (0:45 – 1:30)
- **Action**: Click on **"Manage Household"** in the top navigation or dashboard card.
- **Say**:
  > *"What makes Indian households unique is multi-generational complexity. In the Sharma family, Pooja is vegetarian with a peanut allergy; Rohan is gluten-intolerant; and grandfather Ramesh follows a strict Jain diet requiring zero onions, garlic, or root vegetables.*  
  > *RasoiIQ defaults every new home to Vegetarian and All-Indian cuisines, but allows complete customization across Vegetarian, Vegan, Eggetarian, Jain, and Non-Vegetarian modes. Our constraint engine computes the mathematical intersection of all family restrictions, ensuring every suggested meal is 100% safe for everyone around the dining table."*
- **Highlight**:
  - Show the 4 members, their individual protein goals, and allergen tags.
  - Close the modal and see the household title dynamically synchronized in the navbar.

---

### Scene 3: AI Chef Meal Planning with Gemini 3.5 Flash-Lite (1:30 – 2:30)
- **Action**: Navigate to **"Meal Planner"** tab. Click **"Generate with AI Chef"**. In the modal, leave preferences as default and click **"Generate 7-Day Plan"**.
- **Say**:
  > *"With one tap, the RasoiIQ AI Chef analyzes the family profile and orchestrates a complete 21-meal weekly schedule. It is powered by Google's Gemini 3.5 Flash-Lite on our secure backend, with automated cascade to Gemini 3.1 and a high-performance deterministic fallback engine.*  
  > *Notice that across all 21 meals, we have achieved 20 unique recipes, strictly zero same-day repetitions, and guaranteed regional diversity spanning North Indian curries, Gujarati theplas, and South Indian idlis.*  
  > *If the cook wants to change Wednesday lunch, they can click 'Swap Dish' or 'Regenerate Dish' to discover immediate homestyle alternatives."*
- **Highlight**:
  - The provider badge: `Powered by Gemini 3.5 Flash-Lite` (or `Deterministic Fallback Engine` if offline).
  - Diversity score badge indicating 100% variety.

---

### Scene 4: Clinical Indian Nutrition Intelligence (IFCT 2017) (2:30 – 3:15)
- **Action**: Click on **"Paneer Butter Masala"** to open its Recipe Detail modal. Scroll to the **Nutrition Breakdown** section.
- **Say**:
  > *"We do not allow AI to hallucinate nutritional numbers. RasoiIQ calculates nutrition deterministically using the official Indian Food Composition Tables (IFCT 2017) from the National Institute of Nutrition.*  
  > *Every dish displays all 7 core parameters: Calories, Protein, Carbohydrates, Fat, Dietary Fibre, Sugar, and Sodium. As we adjust the serving size from 4 to 6 servings, the total recipe nutrition scales proportionally while the per-serving figures remain clinically invariant.*  
  > *Furthermore, our weekly analytics track protein source rotation among Paneer, Dal, Chickpeas, Rajma, and Curd, actively discouraging mono-protein diets."*
- **Highlight**:
  - Exact IFCT 2017 data source badge.
  - Interactive serving scaler updating quantities in real-time.

---

### Scene 5: Smart Basket & 4-Retailer Quick-Commerce Price Discovery (3:15 – 4:15)
- **Action**: Navigate to the **"Smart Basket"** tab.
- **Say**:
  > *"Now comes the breakthrough. In traditional apps, a meal plan is just a list of recipes. In RasoiIQ, our Indian Grocery Engine automatically aggregates every ingredient needed for the 21 meals, scales by household headcount, and deducts whatever is already in the pantry!*  
  > *For example, 2kg of Whole Wheat Atta is in the pantry, so net Atta to buy is 0g. For Paneer, the recipes need 350g; our engine rounds to two 200g commercial Amul packs (400g).*  
  > *Notice our Strict Business Rule: If a user unchecks Paneer because they already bought some, it is excluded from purchase to save money, but the recipe requirement remains intact.*  
  > *Up top, our Multi-Retailer Comparison engine prices the exact basket across Blinkit, Zepto, DMart Ready, and BigBasket. Notice complete price consistency: the ₹2,545 on the selected Blinkit card matches our order summary down to the exact rupee."*
- **Highlight**:
  - Multi-retailer cards with estimated delivery times, delivery fees, and savings.
  - Transparent `DEMO PRICING & SAMPLE CATALOG DATA` disclosures.
  - "Swap Brand or Pack Size" modal for instant product substitutions.

---

### Scene 6: Simulated 1-Click Checkout & Closing (4:15 – 5:00)
- **Action**: Click **"Proceed to Simulated 1-Click Order"**. Notice the button enters the in-flight processing state with a spinner, followed by the celebratory order confirmation screen and confetti.
- **Say**:
  > *"The customer selects their delivery address (Home, Office, or Parents) and clicks 'Proceed to Simulated 1-Click Order'. The backend generates a unique order number (RASOI-XXXXXX), records the timestamp, and stores the order with DEMO ORDER CONFIRMED status.*  
  > *To ensure enterprise robustness, our backend enforces a 5-second sliding-window deduplication guard to block accidental double-submissions, and strict Role-Based Access Control protecting partner inventory feeds.*  
  > *Best of all, this entire platform runs 100% locally with zero paid API subscriptions, zero AWS requirements, and zero client credential leakage.*  
  > *Thank you — we are ready to answer your questions."*
- **Highlight**:
  - Simulated order confirmation card with order ID and delivery time estimate.
  - Button disabled and loading spinner state during checkout submission.

---
*Ready for live demo execution.*
