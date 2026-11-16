#!/usr/bin/env bash
# ==============================================================================
# RasoiIQ Phase 4.3 — Repeatable Local Pilot Startup Script (Bash / WSL)
# ==============================================================================

set -e

echo -e "\033[1;32m========================================================================\033[0m"
echo -e "\033[1;32m         🍲 RASOIIQ SUPERVISED LOCAL PILOT STARTUP (WSL/LINUX)          \033[0m"
echo -e "\033[1;32m========================================================================\033[0m"

# 1. Verify PostgreSQL
echo -e "\n\033[1;33m[1/6] Checking PostgreSQL Service...\033[0m"
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "\033[0;32m  ✅ PostgreSQL is active on port 5432.\033[0m"
else
    echo -e "\033[1;33m  ⚠️  PostgreSQL is not running. Starting service...\033[0m"
    sudo service postgresql start
    sleep 2
    if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        echo -e "\033[0;32m  ✅ PostgreSQL service started successfully.\033[0m"
    else
        echo -e "\033[0;31m  ❌ CRITICAL: Could not connect to PostgreSQL. Halting.\033[0m"
        exit 1
    fi
fi

# 2. Check Database Schema
echo -e "\n\033[1;33m[2/6] Verifying Database Schema and Tables...\033[0m"
TABLE_COUNT=$(PGPASSWORD=postgres psql -h localhost -U postgres -d rasoi_iq -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ')
echo -e "\033[0;32m  ✅ Schema verified: ${TABLE_COUNT} public tables present in 'rasoi_iq'.\033[0m"

# 3. Environment Setup
echo -e "\n\033[1;33m[3/6] Setting Pilot Environment Flags...\033[0m"
export STORAGE_MODE="postgres"
export REQUIRE_DATABASE="true"
export PORT="4000"
export PORT_WEB="3000"
echo -e "\033[0;32m  ✅ STORAGE_MODE=postgres, REQUIRE_DATABASE=true\033[0m"

# 4. Launch Backend API
echo -e "\n\033[1;33m[4/6] Starting NestJS API Server (Port 4000)...\033[0m"
npm run start --workspace=services/api > /tmp/rasoi_api.log 2>&1 &
API_PID=$!
echo -e "\033[0;32m  ✅ Backend API running (PID: ${API_PID}, logs: /tmp/rasoi_api.log)\033[0m"

sleep 4

# 5. Check Health
echo -e "\n\033[1;33m[5/6] Probing Backend Health Check...\033[0m"
if curl -s http://localhost:4000/api/health | grep -q '"status":"ok"'; then
    echo -e "\033[0;32m  ✅ Backend health check passed.\033[0m"
else
    echo -e "\033[1;33m  ⚠️  Backend still initializing... logs available at /tmp/rasoi_api.log\033[0m"
fi

# 6. Launch Frontend
echo -e "\n\033[1;33m[6/6] Starting Next.js Customer Web (Port 3000)...\033[0m"
npm run start --workspace=apps/customer-web > /tmp/rasoi_web.log 2>&1 &
WEB_PID=$!
echo -e "\033[0;32m  ✅ Customer Web running (PID: ${WEB_PID}, logs: /tmp/rasoi_web.log)\033[0m"

HOST_IP=$(hostname -I | cut -d' ' -f1)

echo -e "\n\033[1;32m========================================================================\033[0m"
echo -e "\033[1;32m                   🍲 RASOIIQ PILOT RUNTIME READY                       \033[0m"
echo -e "\033[1;32m========================================================================\033[0m"
echo -e "\033[1;36m  🖥️  Local Machine URL:    http://localhost:3000\033[0m"
echo -e "\033[1;36m  📱 Local Network Host:   http://${HOST_IP}:3000\033[0m"
echo -e "\033[1;36m  🛡️  Backend API Health:   http://localhost:4000/api/health\033[0m"
echo -e "\033[1;36m  👥 Test Accounts:        Sharma, Patel, Mehta\033[0m"
echo -e "\033[1;32m========================================================================\n\033[0m"
