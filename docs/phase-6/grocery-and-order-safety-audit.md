# RasoiIQ Phase 6.0 — Grocery Basket & Order Safety Audit

**Milestone:** Phase 6.0 Controlled Household Pilot Readiness  
**Target:** 3 Supervised Households  
**Safety Core:** Simulation-Only Checkout, Idempotency, and Tenant Isolation  

---

## 1. Executive Summary

The grocery and checkout workflow operates strictly in a **simulation-only mode**. No real money, payment gateway, credit card details, or live retailer APIs are involved. The system incorporates server-side price validation, transactional idempotency keys, duplicate order deduplication, and tenant-level access restrictions.

---

## 2. Requirements & Verification Matrix

| Requirement | Implementation Safeguard | Test Evidence | Status |
| :--- | :--- | :--- | :--- |
| **Independent Calculations** | Meal-plan ingredient needs are calculated independently of basket selections. | Tested `calculateMealPlanRequirements()` in `packages/grocery-engine`. | PASS |
| **Pantry Deduction** | Pantry stock is deducted from gross requirements using normalized unit conversion factors. | Unit conversion tests in `test-smart-basket.mjs`. | PASS |
| **Pack-Size Integrity** | Commercial pack-size rounding does not alter base culinary recipe requirements. | Inspected `buildGroceryBasket()` calculation pipeline. | PASS |
| **Server-Side Pricing** | Subtotals, delivery fees, and order totals are calculated exclusively by the backend API. | Verified `MarketplaceService.placeOrder()` subtotal summation. | PASS |
| **Simulated-Only Database Flag** | Orders are permanently tagged with `isDemoOrder: true` in the PostgreSQL `Order` table. | Verified in `Order` schema and `verify-phase6-pilot-readiness.mjs`. | PASS |
| **Zero Financial Gateway** | No payment gateway (Razorpay, Stripe, Cashfree, UPI) is invoked. | Code audit of `MarketplaceService` and frontend checkout forms. | PASS |
| **No Financial Data Collected** | No card numbers, CVVs, UPI IDs, or net-banking credentials collected or stored. | Verified 0 payment collection inputs in Next.js customer web. | PASS |
| **Idempotency Protection** | Client-supplied `Idempotency-Key` prevents duplicate charges or duplicate order generation. | Tested replaying identical payload; returned original order. | PASS |
| **Sliding Window Deduplication** | Identical submissions within 5 seconds without idempotency keys are blocked. | Verified 5-second duplicate check in `MarketplaceService`. | PASS |
| **Cross-Household Order IDOR** | Customer A cannot view or inspect Customer B's order history or single order by ID. | Tested with Patel account querying Sharma order; got 403 Forbidden. | PASS |
| **Merchant Catalog Isolation** | Retailer A cannot inspect or modify Retailer B's inventory, stock status, or prices. | Tested Blinkit merchant querying Zepto inventory; got 403 Forbidden. | PASS |

---

## 3. Database Schema Implementation: `isDemoOrder`

In [packages/database/prisma/schema.prisma](file:///d:/Startup/packages/database/prisma/schema.prisma):
```prisma
model Order {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  retailerName      String
  status            String      @default("PLACED")
  totalAmountInr    Float
  deliveryFeeInr    Float
  deliveryAddress   String
  isDemoOrder       Boolean     @default(true) // SIMULATION ENFORCEMENT
  substitutionNotes String?
  fulfillmentNotes  String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  items             OrderItem[]
  payment           Payment?
}
```
All created orders are stamped with `isDemoOrder = true` and initial status `'DEMO ORDER CONFIRMED'`.

---

## 4. Retailer Sample Data Disclosure Notice

The application displays comparison data referencing major Indian quick-commerce and delivery platforms:
- **Blinkit**
- **Zepto**
- **Swiggy Instamart**
- **BigBasket**

> [!IMPORTANT]
> **MANDATORY PILOT SAMPLE DATA DISCLOSURE:**  
> *"ILLUSTRATIVE SAMPLE DATA: Retailer names, products, inventory and prices are displayed for demonstration and budgeting-flow testing. They are not verified live retailer quotations, do not imply retailer partnerships and may differ from actual availability and prices."*

Neither the frontend nor backend makes any claims of real-time API connectivity or formal commercial partnership with any third-party retailer during Phase 6.0.

---

## 5. Offline Concierge Fulfillment Protocol

For the 3 supervised pilot households:
1. When a household completes a simulated checkout in the UI, an order is recorded in PostgreSQL.
2. If the household has opted into the founder-supervised physical grocery concierge pilot, the founder receives notification via the admin console.
3. The founder physically or manually purchases the items outside of the software application.
4. Financial reimbursement between the household and founder occurs entirely offline via explicit mutual consent, with zero payment processing through the RasoiIQ software.
