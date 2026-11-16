# RasoiIQ — Deployment and Network Architecture Guide

**Milestone:** Phase 4.3 — Supervised Pilot Deployment  
**Audience:** Founder, Systems Engineer, Pilot Deployment Coordinator  
**Cost Constraint:** ₹0 / $0 Additional Spend  
**Network Topologies Covered:** Local Single-Device, Home Wi-Fi LAN (Second-Device), Cloudflare Zero Trust Tunnel  

---

## 1. Architectural Overview & Network Topology

RasoiIQ is engineered to run locally on a single workstation or laptop while securely serving responsive client interfaces to mobile smartphones and tablets over a shared home Wi-Fi network.

```
+-----------------------------------------------------------------------------------+
|                              FOUNDER HOST WORKSTATION                             |
|                                                                                   |
|  +-------------------------------------+   +-----------------------------------+  |
|  |           WSL2 Linux VM             |   |        Windows 11 Native          |  |
|  |                                     |   |                                   |  |
|  |  +-------------------------------+  |   |  +-----------------------------+  |  |
|  |  |   PostgreSQL 18 Database      |  |   |  |     NestJS Backend API      |  |  |
|  |  |   Port 5432 (Internal Socket) |  |   |  |     Port 4000 (Localhost)   |  |  |
|  |  +---------------+---------------+  |   |  +--------------+--------------+  |  |
|  +------------------|------------------+   +-----------------|-----------------+  |
|                     | Local vEthernet                        | HTTP Loopback      |
|                     +----------------------------------------+                    |
|                                                              |                    |
|                                            +-----------------+-----------------+  |
|                                            |    Next.js 14 Customer Web App    |  |
|                                            |    Port 3000 (Bound to 0.0.0.0)   |  |
|                                            +-----------------+-----------------+  |
+--------------------------------------------------------------|--------------------+
                                                               |
                                   Local Wi-Fi Network         |
                                   (e.g., 10.60.74.191:3000)   |
                                                               v
                                             +-----------------------------------+
                                             |       PILOT HOUSEHOLD DEVICE      |
                                             |    (iPhone, Android, or iPad)     |
                                             |                                   |
                                             |   Browser: http://<LAN_IP>:3000   |
                                             +-----------------------------------+
```

---

## 2. Automated Single-Command Startup

To guarantee error-free, reproducible deployments during household pilot visits, automated startup scripts have been prepared for both Windows PowerShell and WSL2/Linux environments.

### 2.1 Windows PowerShell Startup Script (`scripts/start-local-pilot.ps1`)
The PowerShell script performs full pre-flight verification:
1. Validates PostgreSQL connectivity on `localhost:5432`.
2. Inspects `REQUIRE_DATABASE="true"` and `STORAGE_MODE="postgres"`.
3. Verifies API health endpoint at `http://localhost:4000/api/health`.
4. Discovers the host's active Wi-Fi IPv4 address (`Get-NetIPAddress`).
5. Displays clear instructions for connecting mobile pilot devices.

```powershell
# Usage:
.\scripts\start-local-pilot.ps1
```

### 2.2 WSL2 / Linux Startup Script (`scripts/start-local-pilot.sh`)
For POSIX-compliant environments:
```bash
chmod +x scripts/start-local-pilot.sh
./scripts/start-local-pilot.sh
```

---

## 3. Second-Device & LAN Mobile Access Configuration

A core friction point during previous mobile testing was client-side fetch errors: when a mobile browser opens `http://10.60.74.191:3000` and attempts to contact `http://localhost:4000`, the phone tries to resolve port 4000 on its own loopback interface, causing total network failure.

### 3.1 Next.js Server-Side API Rewrite Proxy
In Phase 4.3, this issue was resolved architecturally via Next.js server-side route rewrites.

**File:** `apps/customer-web/next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

**Client Library Optimization:** `apps/customer-web/src/lib/api.ts`
```typescript
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // In browser context on LAN device, use relative /api proxy
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
}
```

### 3.2 Network Advantages
1. **Zero Port 4000 Exposure**: Mobile phones only connect to port 3000. Port 4000 remains bound strictly to `127.0.0.1` on the host machine.
2. **Zero CORS Friction**: Because all mobile network requests go to origin (`http://10.60.74.191:3000/api/...`), cross-origin restrictions and preflight OPTIONS requests are completely eliminated.
3. **Seamless Offline Fallback**: If the Wi-Fi drops, the local Next.js client handles retry states gracefully without exposing backend internals.

---

## 4. Host Machine & Firewall Setup

### 4.1 Step 1: Identifying the Active Wi-Fi IPv4 Address
On the host Windows machine:
```powershell
Get-NetIPAddress -InterfaceAlias "Wi-Fi*" -AddressFamily IPv4 | Select-Object IPAddress
# Example output: 10.60.74.191
```

### 4.2 Step 2: Configuring Inbound Windows Firewall Rule
Allow inbound TCP traffic on port 3000 strictly for Private networks:
```powershell
New-NetFirewallRule -DisplayName "RasoiIQ Web Pilot (Port 3000)" `
  -Direction Inbound `
  -LocalPort 3000 `
  -Protocol TCP `
  -Action Allow `
  -Profile Private
```

### 4.3 Step 3: Verifying Network Boundaries
- **Port 5432 (PostgreSQL)**: Must **NOT** be exposed on Windows Firewall. Accessible only via WSL2 localhost.
- **Port 4000 (NestJS API)**: Must **NOT** be opened to the LAN. Accessible only via Next.js server proxy.
- **Port 3000 (Next.js)**: Bound to `0.0.0.0:3000` for pilot phone browser access.

---

## 5. Remote Access & Cloudflare Tunnel Security Audit

If a pilot household requires remote participation outside the founder's physical Wi-Fi range, a zero-cost Cloudflare Zero Trust Tunnel (`cloudflared`) can be utilized.

### 5.1 Cloudflare Tunnel Operational Model
```
[ Pilot Household Phone ] (Any 4G/5G Network)
           |
      HTTPS / TLS 1.3
           v
[ Cloudflare Global Edge ]
           |
   Cloudflare Access (One-Time Email PIN Authentication)
           |
      Secure Tunnel (Outbound TCP 443 / QUIC)
           v
[ Host Workstation (cloudflared daemon) ]
           |
   Reverse Proxy -> http://localhost:3000
```

### 5.2 Mandatory Security Guardrails for Cloudflare Tunnels
1. **Never Expose Raw API or Database**:
   - `cloudflared` must point **only** to `http://localhost:3000` (Next.js).
   - Under no circumstances should `localhost:4000` or `localhost:5432` have dedicated tunnel ingresses.
2. **Mandatory Cloudflare Access Policy**:
   - Configure a Zero Trust Application rule restricting access strictly to verified pilot email addresses (e.g., `pooja@sharma.in`, `ramesh@patel.in`, `kirit@mehta.in`).
   - Any unauthenticated public web crawler or bot is immediately rejected with HTTP 403 at Cloudflare's edge before touching the local machine.
3. **Ephemeral Tunnel Execution**:
   - Launch tunnels only during active pilot sessions:
     ```bash
     cloudflared tunnel run rasoi-pilot
     ```
   - Terminate the tunnel process immediately when the session ends.

---

## 6. Pre-Flight Checklist for Founder Pilot Visits

| Verification Step | Command / Action | Expected Result | Checked |
| :--- | :--- | :--- | :---: |
| 1. PostgreSQL Service | `wsl sudo service postgresql status` | `18/main (port 5432): online` | [x] |
| 2. API Diagnostics | `curl http://localhost:4000/api/health` | `HTTP 200 {"status":"healthy"}` | [x] |
| 3. Web Service | `curl http://localhost:3000` | `HTTP 200 (HTML Document)` | [x] |
| 4. Wi-Fi Connectivity | Connect phone to host Wi-Fi network | Wi-Fi connected with valid local IP | [x] |
| 5. Mobile Web Browser | Open `http://<LAN_IP>:3000` on phone | RasoiIQ dashboard renders crisply | [x] |
| 6. Account Switcher | Select "Sharma Household" from dropdown | North Indian preferences and meals load | [x] |
| 7. Maharaj Modal | Tap "Maharaj / Cook Briefing" | WhatsApp copyable text renders | [x] |
