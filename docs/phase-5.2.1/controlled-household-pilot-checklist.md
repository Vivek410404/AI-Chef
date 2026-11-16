# RasoiIQ Phase 5.2.1 — Controlled Household Pilot Operational Checklist

**Milestone:** Phase 5.2.1  
**Scope:** Operational Runbook & Safety Checklist for 3–10 Supervised Households  
**Environment:** Zero-Cost Supervised Pilot (Local Monorepo + PostgreSQL 18 on WSL2)  
**Cost:** ₹0 / $0 Additional Spend  

---

## 1. Pilot Scope & Safety Boundary

The RasoiIQ Controlled Household Pilot is designed for 3 to 10 friendly, founder-supervised families.
- **Strict Prohibition:** NO collection of real payment cards, UPI IDs, or net banking credentials.
- **Order Disclosure:** All grocery orders are explicitly marked with `isSimulated: true`. Deliveries are fulfilled via manual founder concierge (purchasing groceries on behalf of the household or validating against pantry inventory).
- **Zero Paid Cloud Infrastructure:** All operations run locally on the founder workstation with zero external recurring fees.

---

## 2. 15-Point Operational Checklist

### 1. Household Informed Consent
- [ ] Present physical or digital Pilot Disclosure Statement to household head.
- [ ] Explicitly disclose that food recommendations are AI-assisted and verified by local deterministic nutrition rules.
- [ ] Confirm household understands grocery checkout is a simulation for meal planning and price discovery, not an automated merchant charge.
- [ ] Obtain signed/acknowledged consent.

### 2. Account Creation & Onboarding
- [ ] Founder assists primary household manager to register at `http://localhost:3000/auth/register`.
- [ ] Enforce password complexity (min 12 characters, Argon2id hashing).
- [ ] Complete email verification step in PostgreSQL (`status -> ACTIVE`).
- [ ] Confirm initial JWT issue and refresh session creation in PostgreSQL.

### 3. Invitation & Recovery Process
- [ ] Primary manager issues household invitations from `Household Management` page.
- [ ] Secondary members (spouse, elder children, Maharaj cook) receive invitation link with cryptographic token.
- [ ] Secondary members accept invitation and verify `HouseholdMember` link in database.
- [ ] Verify password reset workflow via cryptographic reset token if a member loses credentials.

### 4. Data Access & Tenant Privacy
- [ ] Confirm household members can only view their own household data (`/households/my`).
- [ ] Confirm cross-household IDOR attempts are rejected with `403 Forbidden`.
- [ ] Verify that phone numbers in member profiles are masked (`***-***-XXXX`) if inspected by support staff.

### 5. Dietary Preference Setup
- [ ] Select authoritative household dietary mode (`VEGETARIAN`, `JAIN`, `VEGAN`, `SWAMINARAYAN`, `EGGETARIAN`).
- [ ] Set spice tolerance (`MILD`, `MEDIUM`, `SPICY`) and primary regional cuisine preference (`GUJARATI`, `KATHIYAWADI`, `NORTH_INDIAN`, `SOUTH_INDIAN`).
- [ ] Confirm dietary preference commits to PostgreSQL `Household.dietaryPreference`.

### 6. Allergy & Disliked Ingredient Review
- [ ] Explicitly review each member's severe medical allergies (e.g. `PEANUT`, `DAIRY`, `GLUTEN`, `SOY`).
- [ ] Input disliked ingredients (e.g. karela, bhindi, baingan).
- [ ] Verify that conflicting recipes are rejected at the catalog level and excluded from recommendations.

### 7. Weekly Meal Plan Generation
- [ ] Trigger AI Chef meal plan generator for 7 days (Breakfast, Lunch, Dinner, Snack).
- [ ] If Gemini API fails or is rate-limited, verify automatic fallback to local deterministic Gujarati/Kathiyawadi catalog.
- [ ] Household reviews and swaps dishes.
- [ ] Confirm meal plan items commit to PostgreSQL `MealPlan` and `MealPlanItem` tables.

### 8. Smart Grocery Basket Customization
- [ ] System automatically calculates required ingredients by subtracting current `PantryItem` stock from meal plan requirements.
- [ ] Household reviews required grocery quantities, adjusts pack sizes, and removes items already on hand.
- [ ] Verify basket persists to PostgreSQL `GroceryBasket` table.

### 9. Sample Retailer Pricing Disclosure
- [ ] Display price comparison matrix across sample quick-commerce retailers (Blinkit, Zepto, Swiggy Instamart, BigBasket).
- [ ] Prominently display banner: *"SAMPLE PRICING DISCLOSURE: Prices reflect benchmark market rates for comparison and budgeting purposes."*

### 10. Simulated Order Checkout Disclosure
- [ ] Household reviews cart and selects preferred retailer.
- [ ] Checkout displays clear disclaimer: *"SIMULATION ONLY: No payment will be collected from your bank or card."*
- [ ] Submit order and verify `Order.isSimulated === true` in PostgreSQL.

### 11. Maharaj (Home Cook) Workflow
- [ ] Maharaj cook logs in or receives daily WhatsApp/printed preparation digest.
- [ ] Maharaj digest details morning prep, soaking requirements (e.g. dal/chana 4 hours prior), spice levels, and member exclusions (e.g. "Child 1: No peanuts").
- [ ] Maharaj marks meal preparation as completed.

### 12. Support Contact & Escalation Process
- [ ] Households are provided direct founder telephone and emergency WhatsApp contact.
- [ ] When support inspects a household profile, staff enters a mandatory reason (`x-support-reason`, min 5 chars).
- [ ] Audit entry `SUPPORT_HOUSEHOLD_INSPECTED` is logged with staff identity and timestamp.

### 13. Routine Data Backup
- [ ] Founder executes daily logical backup at 23:00 IST via `pg_dump`:
  ```bash
  wsl -- env PGPASSWORD=postgres pg_dump -h 127.0.0.1 -U postgres -d rasoi_iq -F p -b -f /mnt/d/Startup/backups/rasoi_iq_daily_$(date +%Y%m%d).sql
  ```
- [ ] Maintain 7-day rolling local backup retention.

### 14. Emergency Account Suspension & Incident Response
- [ ] In the event of suspected device loss, credential compromise, or bug:
  - Admin suspends account via `PATCH /admin/users/:id/status` (`status: 'SUSPENDED'`).
  - Active access tokens are rejected in real-time (0 ms grace period).
  - Refresh tokens are immediately deleted from PostgreSQL.

### 15. Pilot Exit & Data Deletion Procedure
- [ ] Upon pilot completion or at the household's request:
  - Admin marks household `DEACTIVATED` and exports household meal history as PDF/JSON.
  - Delete customer credentials and personal data from `User` and `HouseholdMember` tables upon written request.
  - Retain append-only immutable audit trail in `AuditLog` for compliance.
