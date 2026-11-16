# RasoiIQ Phase 5.2 — Unresolved Risks & Production Readiness Assessment

**Milestone:** Phase 5.2 — Security Hardening, Data Integrity & Operational Verification  
**Evaluation Perspective:** Objective Engineering & Application Security Review  
**Budget Constraint:** Zero-Cost Architecture (₹0 / $0 spend)  

---

## 1. Readiness Tier Definitions

To provide clear operational boundaries, the platform readiness is evaluated across four distinct operational tiers:

- **Tier A (Local Founder Demo):** Running locally on the founder's machine, supervised live demonstrations.
- **Tier B (Controlled Household Pilot):** 3 to 10 known, friendly households using the app locally or via a secure tunnel (e.g. Cloudflare Zero Trust or Tailscale) with founder supervision.
- **Tier C (Limited Public Pilot):** 50 to 500 self-serve public users on cloud hosting.
- **Tier D (Commercial Production):** High-volume, public multi-tenant SaaS with real financial transactions and SLAs.

---

## 2. Objective Readiness Evaluation by Tier

| Readiness Tier | Status | Rationale |
| :--- | :---: | :--- |
| **Tier A: Local Founder Demo** | **READY** | Full functional parity, robust UI, rich Gujarati recipe catalog, real-time AI Chef fallback, simulated checkout, responsive admin console. |
| **Tier B: Controlled Household Pilot** | **READY** | Multi-household data isolation verified, fail-closed database verified, immediate account suspension verified, audit logging sanitized, dietary rules strictly enforced. |
| **Tier C: Limited Public Pilot** | **BLOCKED (Requires Phase 6 Cloud Deploy)** | Requires cloud infrastructure (managed PostgreSQL, CDN, SSL domain, automated transactional email provider for verification links). |
| **Tier D: Commercial Production** | **BLOCKED (Requires Enterprise Upgrades)** | Requires distributed cache/rate-limiting (Redis), real payment gateway (Razorpay), actual merchant inventory API integration, legal compliance/terms. |

---

## 3. Inventory of Remaining Operational & Technical Risks

### 1. In-Memory Rate Limiting & Token Blacklisting
- **Current State:** `RateLimiterService` and `tokenBlacklist` reside in local Node.js process memory (`Map` / `Set`).
- **Limitation:** In a multi-instance, clustered, or containerized cloud setup (Kubernetes / serverless), rate limits and blacklisted JWTs will not synchronize across instances without Redis or PostgreSQL backing.
- **Impact for Controlled Pilot (Tier B):** Negligible. A single NestJS instance handles the pilot load easily.
- **Remediation for Tier C/D:** Migrate rate limiter and revocation lists to Redis or PostgreSQL cache table.

### 2. Simulated Payment & Grocery Logistics
- **Current State:** Checkout sets `isSimulated: true` and generates a local `Order` record with delivery breakdown. Retailer pricing is based on static catalog fixtures.
- **Limitation:** No live webhook integration with Dunzo, Zepto, or Blinkit APIs; no live UPI/Credit Card settlement.
- **Impact for Controlled Pilot (Tier B):** Acceptable by design. Controlled pilots use concierge fulfillment (founder or local runner purchases goods based on generated order).
- **Remediation for Tier D:** Integrate Razorpay/Cashfree payment gateway and partner retailer logistics APIs.

### 3. Email Delivery Engine
- **Current State:** Email verification tokens and password reset tokens are logged to backend console and stored in PostgreSQL. In local mode, an actual SMTP server is not connected.
- **Impact for Controlled Pilot (Tier B):** Acceptable. Admins can verify users directly via Admin Console or retrieve tokens from database for the pilot participants.
- **Remediation for Tier C/D:** Integrate transactional email service (SendGrid, AWS SES, or Resend).

### 4. Database High Availability & Automated Offsite Backup
- **Current State:** Database runs on local WSL2 ext4 disk. Backup is manual or cron-scheduled `pg_dump`.
- **Limitation:** Lack of automated multi-region replication or offsite S3 snapshotting.
- **Impact for Controlled Pilot (Tier B):** Acceptable with daily local backups (`pg_dump`).
- **Remediation for Tier C/D:** Provision managed PostgreSQL (e.g. Supabase, AWS RDS, Neon) with point-in-time recovery.
