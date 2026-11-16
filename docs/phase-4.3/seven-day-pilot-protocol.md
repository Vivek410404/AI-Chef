# RasoiIQ — 7-Day Supervised Pilot Protocol

**Milestone:** Phase 4.3 — Supervised Pilot Deployment  
**Audience:** Founder, Pilot Facilitators, Participating Households (3–5 Urban Families)  
**Methodology:** Founder-Supervised In-Home & Remote Contextual Inquiry  
**Duration:** 7 Consecutive Days per Household  
**Cost to Participant:** ₹0 (Zero fees, simulated orders only)  

---

## 1. Pilot Purpose & Guiding Principles

The objective of the 7-day supervised pilot is to validate real-world household adoption, trust, recipe accuracy, domestic cook communication, and grocery planning efficiency.

### Core Principles
1. **Zero Financial Risk**: All grocery purchases and checkouts are simulated. No actual financial charges are incurred.
2. **Founder Supervised**: The founder personally guides the onboarding, observes usage, assists with questions, and notes friction points in real time.
3. **Safety First**: Dietary constraints (Jain, allergies, vegetarianism) are absolute. The founder verifies that no safety-violating recipe ever reaches a family member.
4. **Honest Feedback**: Real user feedback will **not** be fabricated. Metrics and feedback collected during the upcoming trial will be logged in designated post-pilot repositories.

---

## 2. Day-by-Day Pilot Execution Plan

```
  DAY 1          DAY 2          DAY 3          DAY 4          DAY 5          DAY 6          DAY 7
Onboarding    Meal Planning   Nutrition &    Maharaj Brief   Retailer &     Mid-Week       Debrief &
& Profiles    & Customization Smart Basket   & Kitchen QA    Checkout Sim   Repeat Use     Interview
```

---

### Day 1: Onboarding, Family Profiles & Pantry Audit
- **Goal**: Setup household structure, establish dietary boundaries, and initialize pantry inventory.
- **Activities**:
  1. Access application via local Wi-Fi (`http://<LAN_IP>:3000`) or secure tunnel.
  2. Review and sign the Pilot Consent and Data Use Notice.
  3. Register household members: ages, dietary preferences (Vegetarian, Vegan, Eggetarian, Non-Vegetarian, Jain), and medical food allergies (Peanuts, Gluten, Dairy, Soy, Mustard).
  4. Perform a 10-minute pantry inventory check: log 10–15 staple ingredients currently available at home (atta, rice, dals, cooking oils, spices).
- **Founder Checklist**:
  - Verify member allergy tags appear in Red/Amber in the UI.
  - Verify pantry items persist accurately to PostgreSQL database.

---

### Day 2: AI Meal Plan Generation & Customization
- **Goal**: Generate a 21-meal weekly plan (7 Breakfasts, 7 Lunches, 7 Dinners) and test recipe flexibility.
- **Activities**:
  1. Trigger "Generate Weekly Meal Plan" via AI Chef (Gemini 3.5 Flash-Lite or deterministic fallback).
  2. Inspect recipe variety: confirm at least 10–14 unique recipes across the week.
  3. Review regional appropriateness: evaluate whether Gujarati, North Indian, or South Indian dishes match household expectations.
  4. Test meal swap: swap a suggested dish (e.g., replace Dal Makhani with Chana Dal) and verify real-time recalculation.
- **Founder Checklist**:
  - Confirm provider indicator correctly identifies `gemini-3.5-flash-lite` or `deterministic-fallback`.
  - Ensure zero allergens appear in the generated plan.

---

### Day 3: Nutrition Engine & Smart Basket Deduction
- **Goal**: Verify nutritional transparency and automated grocery deduction.
- **Activities**:
  1. Review Daily Nutrition Card: inspect calorie total (target &plusmn;10%), protein, carbohydrates, fats, and dietary fiber calculated from IFCT 2017 data.
  2. Open "Smart Basket": inspect aggregated ingredient quantities for all 21 meals.
  3. Verify Pantry Deduction: confirm that staples already in the pantry (e.g., 5 kg atta, 1 liter oil) are automatically deducted from the purchase list.
  4. Manually adjust a basket item quantity and observe basket total updates.
- **Founder Checklist**:
  - Confirm calorie balance aligns with adult/child caloric benchmarks.
  - Verify basket quantities represent practical retail package sizes (e.g., 500g, 1kg).

---

### Day 4: Maharaj / Domestic Cook Briefing Workflow
- **Goal**: Bridge the communication gap between household meal planning and the kitchen cook (Maharaj/bai).
- **Activities**:
  1. Open the "Maharaj / Cook Briefing" modal from the navigation bar.
  2. Select today's date or tomorrow's date to generate the day's prep schedule.
  3. Verify that domestic cook instructions are clearly formatted with:
     - Morning, afternoon, and evening meal names.
     - Advance prep steps (dal soaking, vegetable chopping).
     - **Critical safety alerts** (e.g., "NO PEANUTS", "NO ONION/GARLIC").
  4. Use the "Copy for WhatsApp" button and test sending the message to the family's WhatsApp cook thread.
- **Founder Checklist**:
  - Check legibility and comprehension of cook notes.
  - Gather feedback on whether Hindi or regional terminology matches local domestic cook dialect.

---

### Day 5: Four-Retailer Comparison & Simulated Checkout
- **Goal**: Compare grocery prices across quick-commerce providers and complete simulated ordering.
- **Activities**:
  1. Navigate to the "Smart Basket & Retailer Comparison" screen.
  2. Compare simulated prices and item availability across four quick-commerce vendors:
     - Blinkit
     - Zepto
     - Swiggy Instamart
     - BigBasket
  3. Select the most cost-effective retailer cart.
  4. Complete the simulated checkout process (Zero payment required).
  5. Inspect the generated Order Confirmation and order history.
- **Founder Checklist**:
  - Verify sample data disclaimer is prominently visible.
  - Confirm order persists into PostgreSQL `Order` table with correct household association.

---

### Day 6: Mid-Week Replenishment & Repeat Usability
- **Goal**: Observe repeat interaction, unplanned meal shifts, and pantry updates.
- **Activities**:
  1. Update pantry stock based on mid-week grocery arrivals.
  2. Perform a partial plan regeneration for the remaining weekend meals.
  3. Household logs subjective rating on time saved compared to traditional daily meal coordination.
- **Founder Checklist**:
  - Measure time taken by the user to perform repeat actions.
  - Log any friction or confusion during plan regeneration.

---

### Day 7: Structured Debrief & Exit Interview
- **Goal**: Gather qualitative and quantitative validation data.
- **Activities**:
  1. Conduct a 30-minute structured interview with household decision makers.
  2. Administer the 10-question Pilot Feedback Questionnaire.
  3. Review data retention options: provide the household the option to retain their data for future phases or request complete database anonymization/deletion.
- **Founder Checklist**:
  - Record interview responses verbatim without leading the user.
  - Archive session notes into `docs/phase-4.3/` feedback repositories.

---

## 3. Incident Escalation & Bug Handling Procedure

If an unhandled exception or UI blockage occurs during a live household visit:
1. **Immediate Fallback**: Use the frontend Household Switcher to restore clean baseline state, or trigger deterministic fallback.
2. **Local Logging**: Check NestJS console output and Next.js browser console for exact error traces.
3. **Zero Interruptions**: If the cloud Gemini API experiences temporary latency or rate limits, the deterministic fallback seamlessly generates the plan without disrupting the family session.
4. **Founder Action**: Document the issue in the pilot bug tracker immediately following the session.
