# RasoiIQ Phase 6.2.6 — Operational Acceptance & Privacy Audit

**Milestone:** Phase 6.2.6  
**Date:** November 18, 2026  
**Auditor:** DevOps Lead & Data Privacy Officer  
**Compliance Standards:** Digital Personal Data Protection (DPDP) Act readiness, zero-cost operational SLA  
**Status:** **PASS (Operational Acceptance Complete)**

---

## 1. Operational Infrastructure Baseline

The RasoiIQ platform is deployed on a zero-cost local architecture:
1. **Operating System:** Windows 11 Enterprise host with Ubuntu 24.04 LTS running in WSL2.
2. **Database:** PostgreSQL 18.6 running in WSL2 container on standard port `5432`.
3. **Backend Service:** NestJS API (`@rasoi/api`) running on Node.js v24.22.1 on port `4000`.
4. **Frontend Service:** Next.js 14 (`apps/customer-web`) running on port `3000` with reverse-proxy rewrite rules to port `4000`.
5. **Persistence Management:** WSL2 keep-alive daemon background process prevents hypervisor idle sleep, ensuring zero dropped database sockets.

---

## 2. DPDP Act & Data Privacy Verification

1. **No Sensitive PII Leakage:**
   - User passwords stored using bcrypt hash with salt factor 10.
   - Internal JWT secrets and worker keys are never sent in responses or included in client JavaScript bundles.
   - Database connection strings are read strictly from `.env` and never logged to stdout or embedded in audit artifacts.
2. **Audit Logging Hygiene:**
   - The `AuditLog` table records security-critical actions (`LOGIN_SUCCESS`, `REGISTER`, `EMAIL_VERIFIED`, `ORDER_STATUS_UPDATE`, `TOKEN_REVOCATION`) with sanitized metadata.
   - Plaintext passwords, tokens, or financial identifiers are strictly omitted from `AuditLog.details`.
3. **Household Consent & Data Segregation:**
   - Household membership controls define OWNER, MEMBER, and COOK roles.
   - Cooks can view meal plans and Maharaj preparation digests but cannot initiate financial checkout or modify dietary boundaries.
   - Cross-household data leakage is strictly blocked by foreign key and tenant boundary middleware.

---

## 3. Disaster Recovery & Backup Plan (SOP)

| Step | Operation | Command / Script | SLA / RPO |
| :--- | :--- | :--- | :--- |
| **Daily Cold Backup** | Automated `pg_dump` of `rasoi_iq` | `wsl -u postgres pg_dump -Fc -b -v -f /backups/rasoi_iq_$(date +%F).dump rasoi_iq` | RPO: 24h, Backup time < 2 sec |
| **Disaster Recovery** | Fast `pg_restore` to target | `wsl -u postgres pg_restore -d rasoi_iq_target /backups/dumpfile.dump` | RTO: < 5 minutes |
| **Integrity Check** | Automated validation script | `node scripts/test-backup-restore.mjs` | Automated CI verification |

---

## 4. Runbook for Supervised Pilot Kickoff

1. **Pre-Pilot Verification Checklist:**
   - [x] Run `node scripts/count-pilot-db.mjs` to confirm baseline entity counts.
   - [x] Run `node scripts/test-phase626-three-households.mjs` to verify all 16 journey assertions pass.
   - [x] Inspect `GET http://localhost:4000/api/health` to confirm `storageMode: postgres`, `databaseConnected: true`.
2. **Incident Escalation:**
   - If PostgreSQL connection drops: Check WSL2 keep-alive process (`wsl ps aux | grep sleep`).
   - If UI displays "No groceries found": Click "Clear All Filters" to trigger authoritative catalog reload.

---

## 5. Operational Sign-Off

**STATUS: PASS.** The operational setup meets all reliability, privacy, and disaster recovery standards required for the three-household supervised pilot.
