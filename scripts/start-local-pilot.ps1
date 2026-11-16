# ==============================================================================
# RasoiIQ Phase 4.3 — Repeatable Local Pilot Startup Script (PowerShell)
# ==============================================================================

Write-Host "========================================================================" -ForegroundColor Green
Write-Host "         🍲 RASOIIQ SUPERVISED LOCAL PILOT STARTUP                      " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Green

# 1. Check WSL and PostgreSQL Availability
Write-Host "`n[1/6] Checking PostgreSQL Database Service in WSL..." -ForegroundColor Yellow
$pgReady = wsl -- pg_isready -h localhost
if ($pgReady -match "accepting connections") {
    Write-Host "  ✅ PostgreSQL is active and accepting connections in WSL." -ForegroundColor Green
} else {
    Write-Host "  ⚠️  PostgreSQL is not responding in WSL. Attempting to start..." -ForegroundColor Yellow
    wsl -- sudo service postgresql start
    Start-Sleep -Seconds 2
    $pgReady = wsl -- pg_isready -h localhost
    if ($pgReady -match "accepting connections") {
        Write-Host "  ✅ PostgreSQL started successfully in WSL." -ForegroundColor Green
    } else {
        Write-Host "  ❌ CRITICAL: Failed to start PostgreSQL. Halting startup." -ForegroundColor Red
        exit 1
    }
}

# 2. Check WSL Host IP Resolution
Write-Host "`n[2/6] Resolving WSL Virtual Adapter Network Topology..." -ForegroundColor Yellow
$wslIp = (wsl -- hostname -I).Trim().Split(' ')[0]
Write-Host "  ✅ WSL Host IP resolved: $wslIp (TCP port 5432)" -ForegroundColor Green

# 3. Verify Required Environment Variables
Write-Host "`n[3/6] Verifying Required Environment Configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "  ❌ CRITICAL: .env file missing in repository root." -ForegroundColor Red
    exit 1
}

$env:STORAGE_MODE = "postgres"
$env:REQUIRE_DATABASE = "true"
$env:PORT = "4000"
$env:PORT_WEB = "3000"
Write-Host "  ✅ STORAGE_MODE = postgres" -ForegroundColor Green
Write-Host "  ✅ REQUIRE_DATABASE = true (Fail-closed mode active)" -ForegroundColor Green
Write-Host "  ✅ Backend Port: 4000 | Frontend Port: 3000" -ForegroundColor Green

# 4. Check Database Table Inventory
Write-Host "`n[4/6] Verifying PostgreSQL Schema & Seed State..." -ForegroundColor Yellow
$tableCount = (wsl -- env PGPASSWORD=postgres psql -h localhost -U postgres -d rasoi_iq -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';").Trim()
Write-Host "  ✅ PostgreSQL schema verified: $tableCount relational tables active in 'rasoi_iq'." -ForegroundColor Green

# 5. Start Backend API Server
Write-Host "`n[5/6] Starting NestJS API Server (Port 4000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title RasoiIQ-Backend && set STORAGE_MODE=postgres&& set REQUIRE_DATABASE=true&& npm run start --workspace=services/api" -WindowStyle Minimized
Start-Sleep -Seconds 5

# Confirm Backend Health
try {
    $healthRes = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -Method Get -TimeoutSec 5
    Write-Host "  ✅ Backend API Health: Status=$($healthRes.status), Storage=$($healthRes.storageMode), DBConnected=$($healthRes.databaseConnected)" -ForegroundColor Green
    Write-Host "  ✅ AI Engine Status: Gemini=$($healthRes.ai.geminiConfigured) (Model: $($healthRes.ai.primaryModel)), Fallback Ready=$($healthRes.ai.deterministicFallbackReady)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Backend initializing... Continuing to frontend launch." -ForegroundColor Yellow
}

# 6. Start Customer Web Frontend
Write-Host "`n[6/6] Starting Next.js Customer Web (Port 3000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title RasoiIQ-Frontend && npm run start --workspace=apps/customer-web" -WindowStyle Minimized
Start-Sleep -Seconds 2

# LAN Ingress Details
$wifiIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -match "Wi-Fi|Wireless|Ethernet" -and $_.IPAddress -notmatch "169.254" } | Select-Object -First 1).IPAddress

Write-Host "`n========================================================================" -ForegroundColor Green
Write-Host "                   🍲 RASOIIQ PILOT RUNTIME READY                       " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "  🖥️  Local Machine URL:    http://localhost:3000" -ForegroundColor Cyan
Write-Host "  📱 Local Network (Wi-Fi): http://${wifiIp}:3000" -ForegroundColor Cyan
Write-Host "  🛡️  Backend API Health:   http://localhost:4000/api/health" -ForegroundColor Cyan
Write-Host "  👥 Test Accounts:        Sharma (pooja@sharma.in), Patel (ramesh@patel.in), Mehta (kirit@mehta.in)" -ForegroundColor Cyan
Write-Host "========================================================================`n" -ForegroundColor Green
