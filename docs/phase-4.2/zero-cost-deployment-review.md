# RasoiIQ Phase 4.2 — Zero-Cost Deployment Architecture & Cloud Free-Tier Audit

**Date:** November 2026  
**Auditor:** RasoiIQ Systems Infrastructure & Cloud Economics Team  
**Budget Constraint:** ₹0.00 / $0.00 Total Spend (Strict Zero-Cost Mandate)  
**Current Runtime:** Local WSL2 Ubuntu (PostgreSQL 18) + Windows Host (NestJS API :4000 + Next.js Web :3000)  
**Target:** Safe, Realistic Infrastructure Strategy for Supervised Household Pilot  

---

## 1. Executive Summary

A defining constraint of the RasoiIQ project is achieving production-grade capability with **zero financial outlay** (₹0 / $0 spend). While cloud infrastructure providers advertise generous "free tiers," deploying a stateful, database-backed, multi-tenant application to public free clouds introduces subtle operational traps: idle compute spin-downs, database sleep cycles, serverless execution timeouts, and licensing restrictions.

This audit provides an unvarnished, technically rigorous evaluation of cloud free-tier options versus local self-hosting. It concludes that for a **Supervised Household Pilot (3–5 families)**, running on a stable local host exposed via a zero-cost secure tunnel (such as **Cloudflare Tunnel**) delivers the highest reliability, zero cold-start friction, unlimited storage, and complete data privacy at zero financial cost.

---

## 2. Current Local Baseline Topology (₹0 Spend)

```
+-------------------------------------------------------------------------------+
|                             LOCAL PILOT RUNTIME                               |
|                                                                               |
|  +--------------------+     +---------------------+     +------------------+  |
|  |  Next.js Web (3000)| <-> |  NestJS API (4000)  | <-> |  PostgreSQL 18   |  |
|  |  React 19 / App    |     |  Prisma / AuthGuard |     |  WSL2 Ubuntu     |  |
|  +--------------------+     +---------------------+     +------------------+  |
|            ^                           ^                                      |
|            |                           |                                      |
|  +-------------------------------------------------+                          |
|  |     Zero-Cost Secure Ingress (Cloudflare Tunnel)|                          |
|  +-------------------------------------------------+                          |
+-------------------------------------------------------------------------------+
                                     ^
                                     | HTTPS (Zero-Cost SSL)
                           +-------------------+
                           |  Pilot Households |
                           |  (Mobile Safari/  |
                           |   Chrome Android) |
                           +-------------------+
```

### 2.1 Local Architecture Strengths
* **Predictable Latency:** Sub-millisecond database queries ($<2\text{ms}$) over local IPC/virtual interface (`172.18.158.240:5432`).
* **Zero Cold Starts:** PostgreSQL and NestJS remain resident in memory; no 50-second spin-up penalties.
* **Storage Freedom:** Database capacity is constrained only by host disk space (hundreds of gigabytes available vs 500MB free cloud limits).
* **Data Sovereignty:** Family dietary preferences and allergy records remain on developer hardware without third-party vendor processing.

---

## 3. Public Cloud Free-Tier Evaluation Matrix

| Provider & Service | Free Tier Allocation | Operational Behavior | Critical Failure Mode / Limitation | Pilot Feasibility Verdict |
| :--- | :--- | :--- | :--- | :---: |
| **Supabase (PostgreSQL)** | 500 MB DB storage, 2 projects, 50,000 MAU | Direct Postgres access with pooling | **Auto-pauses after 7 days of inactivity.** Waking a paused DB requires manual dashboard login or fails API requests. | ⚠️ **Conditional** (Requires periodic cron keep-alive ping) |
| **Neon Tech (Serverless Postgres)** | 0.5 GB storage, 1 project, shared compute | Serverless auto-scaling Postgres | **Auto-suspends after 5 minutes of idle.** Cold-start latency adds 1.5s–3.5s delay to first user request, causing Next.js SSR timeouts. | ⚠️ **Usable with latency penalty** |
| **Render (Web Services)** | 750 free instance hours / month | Docker / Node.js web services | **Spins down after 15 minutes of inactivity.** Initial spin-up incurs a **50–60 second delay**, triggering HTTP 504 Gateway Timeouts. | ❌ **Unacceptable for Live Pilot UX** |
| **Vercel (Hobby Tier)** | Unlimited static, 100GB bandwidth, serverless | Next.js first-party optimization | **10-15s Serverless Function timeout.** Complex 21-meal AI Chef plan generation or multi-table seed jobs risk timeout aborts. Commercial use strictly prohibited under Hobby Terms. | ⚠️ **Acceptable for Frontend Only** |
| **Cloudflare Pages + Tunnels** | Unlimited sites, unlimited tunnel bandwidth | Edge CDN + secure outbound tunnel | Requires no inbound port forwarding; provides free SSL certificates (`*.trycloudflare.com` or custom domain). | ✅ **RECOMMENDED FOR PILOT** |

---

## 4. Deep Dive: Cloud Free-Tier Failure Modes

### 4.1 The Render 50-Second Spin-Down Penalty
When an API deployed on Render Free receives a request after 15 minutes of idle time, Render's container orchestration boots the container from scratch. For a NestJS + Prisma application:
1. Container image pull & initialization: 15–20s
2. Node.js runtime boot: 5–8s
3. Prisma engine binary initialization: 8–12s
4. NestJS dependency injection graph & database connection: 5–10s
* **Total Latency:** ~45 to 60 seconds.
* **Customer Impact:** A pilot mother opening the app on her phone during morning breakfast preparation will experience a browser timeout error (`Gateway Timeout 504`), giving the impression that the app is completely broken.

### 4.2 The Supabase / Neon Inactivity Auto-Pause
* **Supabase:** If no database queries occur for 7 consecutive days, the project enters `PAUSED` state. The database shuts down and connections are refused (`ECONNREFUSED`). Recovery is NOT automatic; an administrator must log into the web dashboard and click "Restore Project".
* **Neon:** While compute resumes automatically on connection, the initial connection handshake stalls for 2 to 4 seconds while the compute worker boots.

---

## 5. Recommended Deployment Architecture for Phase 4.2 Pilot

To ensure zero financial spend while providing a flawless, zero-friction experience for 3 to 5 pilot families, we recommend the **Local Host + Cloudflare Tunnel** model:

### 5.1 Architecture Setup
1. **Host Machine:** Dedicated developer laptop or mini-PC running Windows 11 with WSL2 Ubuntu.
2. **Database:** PostgreSQL 18 running locally inside WSL2 (`systemctl start postgresql`).
3. **Backend API:** NestJS running on port 4000 (`STORAGE_MODE=postgres`).
4. **Frontend:** Next.js running on port 3000.
5. **Secure Zero-Cost Ingress:** Run Cloudflare Tunnel (`cloudflared tunnel run rasoi-pilot`):
   - Exposes `localhost:3000` as a public HTTPS URL (e.g. `https://pilot.rasoiiq.in` or a free Cloudflare domain).
   - Provides free automatic TLS/SSL termination.
   - Requires zero router port-forwarding or public IP addresses.
   - Provides DDOS mitigation and Cloudflare Access authentication if desired.

### 5.2 Pilot SLA Comparison

| Metric | Render Free + Neon Free | Local Host + Cloudflare Tunnel |
| :--- | :--- | :--- |
| **Monthly Cost** | ₹0 / $0 | ₹0 / $0 |
| **First-Request Latency** | 50–65 seconds (Cold) | 120–250 ms (Instant) |
| **Database Max Size** | 500 MB (Strict Cap) | 250+ GB (Host Disk) |
| **Auto-Pause Risk** | High (5m / 7d pauses) | None (Continuous) |
| **Data Privacy** | Shared Cloud Multi-Tenant | 100% On-Premise Host |
| **Cook WhatsApp Export** | Supported | Supported |

---

## 6. Migration Blueprint for Commercial Production (Phase 5)

When transitioning from the Phase 4.2 Supervised Pilot to a commercial rollout (Phase 5), the zero-cost architecture will transition to dedicated cloud tiers:
1. **Database:** Managed AWS RDS PostgreSQL or Supabase Pro ($25/mo) with automated point-in-time backups and read replicas.
2. **Backend Services:** Containerized NestJS on Railway Pro ($10–20/mo) or AWS ECS Fargate with zero-downtime rolling deploys.
3. **Frontend:** Vercel Pro ($20/mo) for edge distribution and image optimization.
4. **Secrets & Monitoring:** HashiCorp Vault or AWS Secrets Manager with Datadog / Sentry APM tracking.

---

## 7. Conclusion

The zero-cost constraint does not require sacrificing reliability. By avoiding the catastrophic spin-down penalties of free cloud platforms and utilizing a local host with Cloudflare Tunnel ingress, RasoiIQ delivers instantaneous, reliable, and secure pilot execution for participating households at true ₹0 cost.
