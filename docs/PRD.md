# Product Requirement Document (PRD)
## RasoiIQ — India-First AI Meal Planning & Grocery Marketplace

### 1. Executive Summary
RasoiIQ is a culinary and grocery intelligence platform tailored specifically for Indian households. Inspired by the convenience of Europe's JOW, RasoiIQ addresses the complex realities of Indian home cooking: multi-generational households with mixed dietary preferences (vegetarian, non-vegetarian, Jain, vegan), regional variety (Gujarati, Punjabi, South Indian, Bengali, Maharashtrian), pantry staple management (atta, dal, spices, ghee), and multi-retailer grocery procurement (Blinkit, Zepto, Swiggy Instamart, DMart Ready, BigBasket).

### 2. Core Value Propositions
1. **Effortless Weekly Planning**: Plan breakfast, lunch, dinner, and snacks for 7 days in under 5 minutes.
2. **Deterministic Indian Grocery Engine**: Automatically convert recipes into scaled ingredient requirements, normalize units (grams, kg, ml, spoons), aggregate duplicates, and deduct what is already in the home pantry.
3. **Multi-Retailer Price Discovery**: Map required ingredients to actual branded store products (Amul, Aashirvaad, Tata Sampann) and compare checkout totals across top Indian quick-commerce and hypermarket grocers.
4. **Resilient AI Culinary Assistant**: Powered by Google Gemini free tier with a strict deterministic rule-engine fallback so the user experience never degrades if AI is offline or rate-limited.
5. **Zero-Cost Local Development**: Engineered entirely with open-source tools (PostgreSQL/Prisma, Next.js, NestJS, Tailwind CSS) requiring no paid subscriptions or credit card services.

### 3. User Personas
- **The Household Meal Coordinator (Pooja, 34)**: Manages daily meals for in-laws (strictly Jain/no-onion-garlic), herself (vegetarian), and husband (occasional non-vegetarian). Needs plans that minimize waste and respect family dietary lines.
- **The Busy Urban Professional (Rohan, 28)**: Lives in Bengaluru, cooks 4 days a week, orders 3. Wants quick 20-30 min healthy meals with auto-ordered groceries via quick commerce.
- **The Budget-Conscious Family (Suresh & Meena, 42)**: Wants wholesome home-cooked Indian meals within a strict ₹3,000 weekly grocery budget.

### 4. Key Functional Modules
1. **Household Profile & Preferences**: Support per-member dietary restrictions (Veg, Non-Veg, Jain, Vegan, Eggetarian, Allergies), spice tolerance, and weekly grocery budget.
2. **Recipe Discovery & Library**: Rich catalog of authentic Indian recipes categorized by cuisine, preparation time, difficulty, and estimated cost.
3. **Visual 7-Day Meal Planner**: Intuitive Monday-to-Sunday interactive grid for Breakfast, Lunch, Dinner, and Snacks.
4. **AI Meal Planner**: Natural language plan generation using Google Gemini (backend-proxied, validated via Zod, with rule-based fallback).
5. **Grocery Intelligence Engine**:
   - Serving size scaling.
   - Ingredient aggregation (e.g. 200g paneer + 150g paneer = 350g paneer).
   - Unit normalization.
   - Pantry deduction (5kg required - 2kg on hand = 3kg to buy).
   - **Crucial Rule**: Separation between recipe requirements and grocery purchase basket. Unchecking a product does not remove the ingredient requirement from the meal plan.
6. **Smart Grocery Basket & Multi-Retailer Comparison**: Map ingredients to retail products with brand choices, pack sizes, and store comparison (Blinkit, Zepto, DMart Ready, BigBasket).
7. **Pantry Manager**: Track on-hand staples and low-stock alerts.
8. **Retailer & Admin Portals**: Catalog, store inventory, order flow management.
