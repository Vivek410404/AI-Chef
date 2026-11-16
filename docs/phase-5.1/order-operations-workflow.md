# RasoiIQ Phase 5.1 — Order Fulfillment & Operations Workflow

**Document Version:** 1.0.0  
**Phase:** 5.1  
**Date:** November 2026  
**Audience:** Operations Specialists, Fulfillment Managers, Support Coordinators

---

## 1. Simulated Order Environment & Demo Safeguards

RasoiIQ operates locally under a zero-cost principle without live financial transactions or paid payment gateway integration. To prevent confusion between simulated demonstrations and real financial activity:
1. **Explicit Demo Flag:** Every order record in PostgreSQL has `isDemoOrder: true`.
2. **Visual Warning Banners:** Prominent warning banners on both the order list (`/admin/orders`) and detail view (`/admin/orders/[id]`) state:
   > **SIMULATED ORDER ENVIRONMENT:** All customer transactions in this platform instance are generated through simulated cart checkout. Zero real banking or payment gateways are debited.
3. **Demo Order Pills:** All table rows and detail headers display an amber `[Demo]` badge.

---

## 2. Order Operations Console

Navigate to **Orders & Ops** (`/admin/orders`):
- **Search:** Search by Order ID (`ord-...`), merchant name (`Blinkit`, `Zepto`), or customer name/email.
- **Status Filter:** Filter by fulfillment state (`CONFIRMED`, `PREPARING`, `DISPATCHED`, `DELIVERED`, `CANCELLED`).
- **Table Metrics:** Displays Order ID, Merchant Partner, Customer, Total Amount (INR), Status, and Timestamp.

---

## 3. Order Status Lifecycle & Transitions

```
[PLACED / DEMO ORDER CONFIRMED]
              |
              v
         [PREPARING]  (Pantry staging, substitution checks)
              |
              v
        [DISPATCHED]  (Out for delivery via rider)
              |
      +-------+-------+
      |               |
      v               v
 [DELIVERED]     [CANCELLED]
```

### Allowed Status Values
- `CONFIRMED` / `DEMO ORDER CONFIRMED`: Initial state upon cart checkout.
- `PREPARING`: Store is gathering items; substitutions identified if out of stock.
- `DISPATCHED` / `OUT_FOR_DELIVERY`: Handed over to logistics / delivery executive.
- `DELIVERED`: Order completed at customer doorstep.
- `CANCELLED`: Order cancelled due to inventory shortage or customer request.

Any status string outside this whitelist is rejected by the API with `400 Bad Request`.

---

## 4. Updating Order Status & Operational Notes

1. Locate the order in `/admin/orders`.
2. Click **Update** in the Actions column.
3. In the update modal:
   - Select the **Status** (`PREPARING`, `DISPATCHED`, `DELIVERED`, etc.).
   - Enter **Status Reason / Note** (e.g., `"Dispatched via Rider #44"`).
   - Enter **Substitution Notes** (e.g., `"Substituted organic tomatoes with fresh local tomatoes"`).
   - Enter **Fulfillment Notes** (e.g., `"Delivered to apartment security desk as requested"`).
4. Click **Save Changes**.

### System Impact
- Order record in PostgreSQL is updated with the new status, notes, and `updatedBy` administrator identity.
- In-memory store synchronizes immediately.
- An immutable audit log event `ORDER_STATUS_CHANGED` is recorded with status, reason, and fulfillment metadata.

---

## 5. Detailed Order Inspection (`/admin/orders/[id]`)

Click the **Eye / Details** icon to inspect an order:
- **Header:** Full Order ID, Merchant Name, Timestamp, Total Charged INR.
- **Customer Details:** Full Name, Email, and Delivery Address.
- **Fulfillment History:** Active status reason, substitution notes, and delivery notes.
- **Basket Line Items:** Itemized breakdown of products, brand, pack size, quantity packs, and line total price in INR.
