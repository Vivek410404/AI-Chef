# RasoiIQ Phase 4: Zero-Cost Deployment Options & Cloud Pilot Guide

## 1. Zero-Cost Principle & Financial Discipline

Early-stage validation must never be blocked by cloud infrastructure costs. RasoiIQ is engineered to achieve full production readiness, multi-tenant security, and live external AI capabilities at **₹0 / $0 per month**.

By avoiding recurring subscriptions for AWS, cloud managed databases, paid SMS gateways, and proprietary vector stores, the project maintains unlimited operational runway while proving product-market fit.

---

## 2. Zero-Cost Architecture Comparison

| Component | Standard Paid Stack | RasoiIQ Zero-Cost Pilot Stack | Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Frontend Web Hosting** | AWS Amplify / Vercel Pro | Vercel Hobby Tier (Free) or Local Next.js | **₹0.00** |
| **Backend API Hosting** | AWS ECS / EKS | Render Free Web Service / Local Tunnel | **₹0.00** |
| **Relational Database** | AWS RDS Aurora PostgreSQL ($45/mo) | Supabase Free Tier (500MB) / Neon Free (0.5GB) | **₹0.00** |
| **AI LLM Inference** | OpenAI GPT-4o / Anthropic Claude ($50+/mo) | Google Gemini 3.5 Flash-Lite (Free Tier) | **₹0.00** |
| **Authentication & SMS** | Twilio SMS OTP ($0.05 / SMS) | Stateless Seeded JWT + Secure Cookies | **₹0.00** |
| **Caching & Queues** | AWS ElastiCache Redis ($30/mo) | Process Heap Sliding Window / LRU | **₹0.00** |
| **Domain & SSL** | Custom Domain + Route 53 | Vercel / Cloudflare Free Automated SSL | **₹0.00** |
| **Total Monthly Spend** | **$150 – $300 / mo (₹12,500 – ₹25,000)** | **RasoiIQ Pilot Stack** | **₹0.00 (Free)** |

---

## 3. Deployment Option A: 100% Local / Self-Hosted Pilot (Recommended for Early Pilots)

For an intimate pilot of 3 to 10 households in your immediate community or city:
1. **Host on Developer Machine / Local Home Server**:
   - NestJS API running on port 4000.
   - Next.js Customer Web running on port 3000.
2. **Local PostgreSQL via Docker (Optional)**:
   ```bash
   docker run --name rasoi-postgres -e POSTGRES_PASSWORD=rasoi_secret -e POSTGRES_DB=rasoi_iq -p 5432:5432 -d postgres:16-alpine
   ```
   Set `DATABASE_URL="postgresql://postgres:rasoi_secret@localhost:5432/rasoi_iq?schema=public"` in `services/api/.env`.
3. **Zero-Cost Remote Access via Cloudflare Tunnels**:
   Expose the local server to pilot families securely using Cloudflare Tunnels (Zero Trust, 100% free):
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
   Provides a free, secure `https://<unique-subdomain>.trycloudflare.com` URL accessible by pilot participants on their mobile phones with full SSL.

---

## 4. Deployment Option B: Zero-Cost Cloud Pilot (Cloudflare / Vercel + Supabase)

If deploying to cloud for multi-device pilot access:

### Step 1: Database (Supabase Free Tier)
1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project in the Mumbai (ap-south-1) or Singapore region.
3. Copy the standard connection string (`postgres://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`).
4. Run migrations from the repository:
   ```bash
   npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma
   npx prisma db seed --schema=packages/database/prisma/schema.prisma
   ```

### Step 2: Backend API (Render Free Tier)
1. Link the repository to [render.com](https://render.com).
2. Create a **Web Service** pointing to `services/api`.
3. Set environment variables:
   - `PORT=4000`
   - `DATABASE_URL=<Supabase connection string>`
   - `GEMINI_API_KEY=<Google AI Studio free key>`
   - `JWT_SECRET=<Random 32-char secret>`
4. Build command: `npm install && npm run build --workspace=services/api`
5. Start command: `node services/api/dist/main`

### Step 3: Frontend Web App (Vercel Hobby Tier)
1. Link repository to [vercel.com](https://vercel.com).
2. Select Root Directory as `apps/customer-web`.
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-api-service.onrender.com/api`
4. Deploy! Vercel handles global edge CDN caching, image optimization, and mobile responsiveness at zero cost.

---

## 5. Transition & Scale Triggers

When does RasoiIQ outgrow the Zero-Cost Pilot Tier?

| Milestone Trigger | Action Required | Expected Monthly Cost |
| :--- | :--- | :--- |
| **> 25 Active Daily Households** | Add dedicated Redis cache for session & rate-limiting | ₹800 – ₹1,200 ($10 – $15/mo) |
| **> 50 Active Daily Households** | Migrate from Supabase Free Tier to Managed Postgres | ₹2,000 – ₹3,500 ($25 – $40/mo) |
| **> 100 Active Daily Households** | Integrate automated SMS OTP (Twilio / MSG91) | ₹1,500 / 1000 OTPs |
| **Commercial Retailer Partnerships**| Integrate official Quick-Commerce B2B Partner APIs | Revenue share / affiliate model |
