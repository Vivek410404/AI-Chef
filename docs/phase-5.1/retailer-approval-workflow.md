# RasoiIQ Phase 5.1 — Retailer Onboarding & Application Approval Workflow

**Document Version:** 1.0.0  
**Phase:** 5.1  
**Date:** November 2026  
**Audience:** Merchant Partnerships Leads, Platform Administrators, Operations Coordinators

---

## 1. Merchant Onboarding Lifecycle

```
    [Merchant Submits Application] (/retailer/apply)
                   |
                   v
          [Application PENDING]
                   |
     +-------------+-------------+
     |                           |
 (Approve)                   (Reject)
     |                           |
     v                           v
[Application APPROVED]    [Application REJECTED]
  - Role elevated to        - Mandatory reason recorded
    RETAILER                - Applicant retains CUSTOMER
  - Retailer entity           role
    provisioned             - AuditLog recorded
  - AuditLog recorded
```

---

## 2. Navigating the Retailer Console

Navigate to **Retailers & Apps** (`/admin/retailers`):
The console provides two views accessible via header tabs:
1. **Active Merchants Tab:**
   - Displays all connected grocery partners (Blinkit, Zepto, DMart Ready, BigBasket).
   - Shows delivery time estimate, minimum order value, standard delivery fee, and rating.
   - Status toggle: Suspend or Reactivate merchant.
2. **Applications Tab:**
   - Queue of merchant onboarding applications.
   - Shows applicant business name, contact info, owner email, and submission date.

---

## 3. Reviewing & Approving Merchant Applications

When a merchant submits an onboarding form via `/retailer/apply`:
1. The application appears in the **Applications Tab** with status `PENDING`.
2. An administrator (`ADMIN` or `SUPER_ADMIN`) reviews the business name and contact information.
3. Click **Approve**.
4. Confirm approval in the modal.

### Automated System Actions Upon Approval
1. Application status is updated to `APPROVED`, with `reviewedAt` timestamp and `reviewedBy` administrator ID.
2. **Role Promotion:** The applicant user account is elevated from `CUSTOMER` to `RETAILER`.
3. **Retailer Provisioning:** If a `Retailer` record does not already exist for this merchant name, a new `Retailer` record is automatically provisioned in PostgreSQL with standard delivery configurations.
4. An immutable audit log event `RETAILER_APPROVED` is recorded in `AuditLog`.

---

## 4. Rejecting an Application

If an application fails verification (e.g., missing trade license, outside service area):
1. In the Applications tab, click **Reject**.
2. **Mandatory Reason:** Enter the specific reason for rejection in the textarea (e.g., `"Incomplete business registration documentation"`). Rejection without a reason is blocked with `400 Bad Request`.
3. Click **Confirm REJECTED**.
4. Application status is updated to `REJECTED`, and the applicant user retains their existing `CUSTOMER` role without escalation.
5. An audit log event `RETAILER_REJECTED` is recorded.

---

## 5. Merchant Status Management

If an existing retail partner experiences warehouse maintenance, catalog downtime, or delivery partner strikes:
1. In the **Active Merchants** tab, locate the partner.
2. Click **Suspend Merchant**.
3. Enter the suspension reason.
4. Merchant status transitions to `SUSPENDED`.
5. The customer web application immediately flags this merchant as unavailable during cart comparison.
6. Click **Reactivate Merchant** to restore live ordering.
