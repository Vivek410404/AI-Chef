# RasoiIQ Phase 5.2 — Local Deployment, Backup & Disaster Recovery Guide

**Milestone:** Phase 5.2 — Security Hardening, Data Integrity & Operational Verification  
**Environment:** Zero-Cost Local Multi-Process Architecture  
**Operating Systems:** Windows 11 host with WSL2 Ubuntu subsystem  

---

## 1. Zero-Cost Multi-Process Architecture

RasoiIQ operates entirely locally without paid cloud subscriptions, external database hosting, or third-party paid SaaS:

```
┌──────────────────────────────────────────────────────────────┐
│                    WINDOWS 11 / HOST                         │
│                                                              │
│  apps/customer-web (Next.js 14)       Port 3000              │
│  services/api      (NestJS 10)         Port 4000              │
│                                                              │
└──────────────┬───────────────────────────────▲───────────────┘
               │ TCP 5432                      │ HTTP
               ▼                               │
┌──────────────────────────────────────────────┴───────────────┐
│                    WSL2 UBUNTU SUBSYSTEM                     │
│                                                              │
│  PostgreSQL 18 Database (`rasoi_iq`)  Port 5432              │
│  Storage: Persistent ext4 virtual disk                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Environment Configuration

### Required Environment Flags for Production/Pilot Readiness
In `services/api/.env`:
```env
PORT=4000
NODE_ENV=production
STORAGE_MODE=postgres
REQUIRE_DATABASE=true
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/rasoi_iq?schema=public
JWT_SECRET=super_secret_jwt_key_at_least_32_chars_long_pilot
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
AI_PROVIDER=gemini
GEMINI_API_KEY=your_free_tier_gemini_api_key
```

> [!IMPORTANT]
> Setting `REQUIRE_DATABASE=true` ensures the application refuses to start if PostgreSQL is unreachable, preventing accidental data loss or silent fallback to volatile in-memory mode.

---

## 3. Routine Backup Runbook

To generate a full logical PostgreSQL backup of the active RasoiIQ database:

```bash
# In WSL2 terminal or via PowerShell wsl bridge:
wsl -- env PGPASSWORD=postgres pg_dump -h 127.0.0.1 -U postgres -d rasoi_iq -F p -b -v -f /mnt/d/Startup/backups/rasoi_iq_$(date +%Y%m%d_%H%M%S).sql
```

The dump captures all tables, constraints, sequences, foreign keys, and indexes.

---

## 4. Disaster Recovery & Restoration Procedure

If database corruption or accidental deletion occurs:

1. **Stop Application Services:**
   ```powershell
   # Stop API and Web processes to release connection pools
   Get-Process -Name node | Stop-Process -Force
   ```
2. **Re-create Database in PostgreSQL:**
   ```bash
   wsl -d Ubuntu -u postgres psql -c "DROP DATABASE IF EXISTS rasoi_iq;"
   wsl -d Ubuntu -u postgres psql -c "CREATE DATABASE rasoi_iq OWNER postgres;"
   ```
3. **Restore from Backup File:**
   ```bash
   wsl -d Ubuntu -u postgres psql -d rasoi_iq -f /mnt/d/Startup/backups/rasoi_iq_phase52_pre.sql
   ```
4. **Run Prisma Migrations (if schema changes occurred):**
   ```powershell
   npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma
   ```
5. **Restart Applications:**
   ```powershell
   npm run start --workspace=services/api
   npm run start --workspace=apps/customer-web
   ```
6. **Verify Parity:**
   ```powershell
   node scripts/verify-backup-restore.mjs
   ```
