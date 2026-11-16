# RasoiIQ — Household Grocery Concierge Simulation Report

## Executive Summary
This document records the end-to-end simulated grocery concierge fulfillment interactions executed in RasoiIQ Phase 4.1 for three test households: Sharma Family (North Indian), Patel Family (Kathiyawadi), and Mehta Family (Strict Jain).

---

## 1. Grocery Concierge Fulfillment Model
RasoiIQ does **NOT** maintain direct API partnerships with quick-commerce or grocery retailers (Blinkit, Zepto, DMart Ready, BigBasket). Instead, RasoiIQ operates a **Concierge Procurement & Smart Basket Comparison Engine**:
1. Aggregates multi-recipe weekly requirements.
2. Deducts pantry inventory on hand (`Net Shopping Quantity = Gross Recipe Need - Pantry Stock`).
3. Maps culinary ingredients to retailer SKUs and pack variants.
4. Generates price and delivery comparisons across 4 retailers.
5. In simulated demo mode, generates an itemized order receipt with a unique `RASOI-XXXXXX` order ID and saves the order to PostgreSQL.
6. Prominently displays disclosures: **DEMO ORDER CONFIRMED — SAMPLE CATALOG DATA — ZERO MONETARY TRANSACTION**.

---

## 2. Multi-Household Simulation Results

### Simulation 1: Sharma Family (North Indian Homestyle Basket)
- **Household**: `hh-sharma-family` (Bengaluru)
- **Pantry Baseline**: 2,000g Whole Wheat Atta, 300g Ghee, 500g Salt, 800ml Oil.
- **Recipe Aggregation**: 21 planned meals require 2,300g Whole Wheat Atta.
- **Pantry Deduction**: Net shopping requirement reduced from 2,300g to 300g (1 x 1kg pack instead of 3kg).
- **Selected Retailer**: Blinkit (10–15 mins delivery).
- **Basket Contents**: 29 itemized pack units (Paneer 1kg, Atta 1kg, Tomatoes 2kg, Dahi 400g, Spices).
- **Order Total**: ₹2,167 (Subtotal ₹2,167 + Free Delivery ₹0).
- **Order Confirmation**: `RASOI-496980`, Status: `DEMO ORDER CONFIRMED`.
- **Database Persistence**: Successfully committed to PostgreSQL `Order` and `OrderItem` tables.

### Simulation 2: Patel Family (Kathiyawadi Regional Staples)
- **Household**: `hh-patel-family` (Bodakdev, Ahmedabad)
- **Pantry Baseline**: 500g Besan, 100g Turmeric, 50g Cumin, 200ml Oil.
- **Selected Retailer**: Zepto (10 mins delivery).
- **Basket Contents**:
  - Pilsbury Bajra Atta: 2 x 1kg packs (₹95/pack = ₹190).
  - Amul Masti Dahi: 2 x 400g cups (₹45/cup = ₹90).
  - Fresh Surati Papdi: 1 x 500g pack (₹60/pack = ₹60).
- **Order Total**: ₹340.
- **Order Confirmation**: `RASOI-856929`, Status: `DEMO ORDER CONFIRMED`.
- **Delivery Address**: `304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054`.
- **Database Persistence**: Verified in PostgreSQL with item links to `ProductVariant`.

### Simulation 3: Mehta Family (Strict Jain Basket)
- **Household**: `hh-mehta-family` (Malabar Hill, Mumbai)
- **Dietary Filter**: 100% Strict Jain (zero potato, purple yam, onion, garlic).
- **Selected Retailer**: DMart Ready (Scheduled Delivery).
- **Basket Contents**:
  - Tata Sampann Besan: 1 x 1kg (₹110).
  - Organic Fresh Methi Leaves: 2 x 250g bunches (₹35/bunch = ₹70).
  - Everest Hing (Asafoetida): 1 x 50g bottle (₹75).
- **Order Total**: ₹255.
- **Order Confirmation**: `RASOI-177152`, Status: `DEMO ORDER CONFIRMED`.
- **Delivery Address**: `B-702 Palm Court, Malabar Hill, Mumbai - 400006`.
- **Database Persistence**: Verified in PostgreSQL; survived subsequent backend reboot.

---

## 3. Data Transparency & Disclosure Verification

The administrative metrics and customer checkout UI enforce explicit truthfulness:
- **Badge**: `DEMO PRICING & SAMPLE CATALOG DATA` displayed on all basket summary screens.
- **Disclaimer**: `Simulated checkout for pilot demonstration. No actual financial transaction is processed or payment taken.`
- **Metrics Disclosure**: `All metrics reflect local simulated checkout orders.`
