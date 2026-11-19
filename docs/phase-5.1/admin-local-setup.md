# RasoiIQ Phase 5.1 — Local Setup, Operator Bootstrapping & Verification Guide

**Document Version:** 1.0.0  
**Phase:** 5.1  
**Date:** November 2026  
**Audience:** Developers, DevOps Engineers, Stakeholders conducting local demonstrations  
**Cost Constraint:** ₹0 / $0 spend (No paid APIs or cloud dependencies)

---

## 1. Prerequisites

- **Operating System:** Windows 10/11 with WSL2 (Ubuntu).
- **Node.js:** v18+ (tested on Node.js v24.2.0 / v20+).
- **Database Engine:** PostgreSQL 18 running on WSL2 (`172.18.158.240:5432/rasoi_iq`).
- **Terminal:** PowerShell or Bash.

---

## 2. Environment Configuration

Verify root `.env` or create `.env.local`:

```env
# Database Persistence (Fail-Closed)
STORAGE_MODE=postgres
REQUIRE_DATABASE=true
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rasoi_iq?schema=public"

# Platform Ports
PORT=4000
API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Authentication & Security
JWT_SECRET=rasoi_pilot_jwt_secret_dev_2026_super_secure_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
ADMIN_DEMO_SECRET=rasoi_admin_secret_2026

# Email Transport (Zero-Cost Local Delivery)
EMAIL_TRANSPORT=console-preview
```

---

## 3. Starting the Services

### Step 1: Ensure WSL PostgreSQL Keepalive
To prevent WSL2 systemd from sleeping during idle moments:
```powershell
# In a background terminal or daemon:     
wsl sleep infinity
```

### Step 2: Bootstrap Super Administrator Account
If not already created, provision the root Super Administrator:
```powershell
node scripts/bootstrap-admin.mjs --email panchanivivek0401@gmail.com --role SUPER_ADMIN --name "Super Administrator" --password "RasoiSuperSecretPassphrase@2026"
```

### Step 3: Start NestJS Backend API
```powershell
$env:STORAGE_MODE="postgres"
$env:REQUIRE_DATABASE="true"
npm run start --workspace=services/api
```
*API will start at `http://localhost:4000/api` with fail-closed PostgreSQL connection.*

### Step 4: Start Next.js Customer & Admin Frontend
In a separate terminal:
```powershell
npm run start --workspace=apps/customer-web
```
*Frontend will start at `http://localhost:3000`.*

---

## 4. Accessing the Admin Console

Open your browser to:
`http://localhost:3000/admin`

### Signing In
1. **Via Standard Form:** Log in at `/login` with:
   - Email: `panchanivivek0401@gmail.com`
   - Password: `RasoiSuperSecretPassphrase@2026`
2. **Via Local Demo Role Switcher:**
   - If unauthenticated, click the **Super Admin** or **Admin** demo button on the Restricted Access card.
   - While in the console, use the role switcher pills in the top navigation bar to toggle between `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, and `SUPPORT`.

---

## 5. Running Automated Verifications

### Run Dedicated Phase 5.1 Admin Console Tests (82 Assertions):
```powershell
node scripts/test-phase51-admin-console.mjs
```

### Run All 14 Test Suites (570 Assertions):
```powershell
node scripts/run-all-tests.mjs
```

### Expected Output:
```
========================================================================
                        FINAL TEST SCORECARD                            
========================================================================
GRAND TOTAL: 570 assertions passed, 0 failed across 14 suites.
========================================================================
```
