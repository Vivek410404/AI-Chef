# RasoiIQ Phase 5.0 — Local Development Setup & Reproducible Verification

## 1. Prerequisites

- **OS**: Windows 11 with WSL2 (Ubuntu 24.04/26.04) or native Linux/macOS
- **Node.js**: v20+ / v22+ / v24+
- **PostgreSQL**: PostgreSQL 18 installed in WSL or native
- **Memory**: 4 GB RAM available
- **Cost**: ₹0 / $0 spend (No paid APIs or cloud dependencies)

## 2. Step-by-Step Setup Guide

### 2.1 Database Initialization
Ensure PostgreSQL is active in WSL and accepting connections:
```bash
wsl -- sudo service postgresql start
wsl -- pg_isready -h localhost
```

Keep WSL awake during automated testing or server execution by running a persistent session:
```powershell
wsl sleep infinity
```

### 2.2 Environment Configuration
Copy `.env.example` to `.env` in the repository root:
```env
# Server Ports
PORT=4000
PORT_WEB=3000

# Persistence & Storage Mode
STORAGE_MODE=postgres
REQUIRE_DATABASE=true
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/rasoi_iq?schema=public"

# Cryptographic Keys (Min 32 characters)
JWT_SECRET="rasoi_local_jwt_secret_dev_key_2026_super_secure_32chars"
ADMIN_DEMO_SECRET="rasoi_admin_secret_2026"

# Node Environment
NODE_ENV=development
ALLOW_DEMO_AUTH=true

# AI Provider (Free tier / Deterministic fallback)
GEMINI_API_KEY=""
```

### 2.3 Apply Database Schema & Build Packages
```powershell
# Generate Prisma Client & push schema
npm.cmd run generate --workspace=packages/database
npx.cmd prisma db push --schema=packages/database/prisma/schema.prisma

# Build shared packages
npm.cmd run build --workspace=@rasoi/database
npm.cmd run build --workspace=@rasoi/shared-types
npm.cmd run build --workspace=@rasoi/grocery-engine
```

### 2.4 Bootstrap Platform Administrator (CLI)
```powershell
node scripts/bootstrap-admin.mjs --email="admin@rasoiiq.in" --fullName="Platform Administrator" --password="SecureMasterPassword2026!"
```

### 2.5 Start Servers
Start the backend API (Port 4000):
```powershell
$env:STORAGE_MODE="postgres"; $env:REQUIRE_DATABASE="true"; npm.cmd run start --workspace=services/api
```

Start the customer web frontend (Port 3000):
```powershell
npm.cmd run start --workspace=apps/customer-web
```

Access:
- **Web Application**: `http://localhost:3000`
- **Login Page**: `http://localhost:3000/login`
- **Register Page**: `http://localhost:3000/register`
- **Backend Health**: `http://localhost:4000/api/health`
- **Local Dev Email Inbox**: `http://localhost:4000/api/dev/emails`

## 3. Running Automated Tests
Execute the entire 13-suite test battery (487 assertions):
```powershell
node scripts/run-all-tests.mjs
```
Or execute the dedicated Phase 5 test suite alone:
```powershell
node scripts/test-phase5-auth-and-identity.mjs
```
