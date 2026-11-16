# RasoiIQ — Database Backup and Restoration Verification Guide

**Milestone:** Phase 4.3 — Supervised Pilot Deployment  
**Database Engine:** PostgreSQL 18 + Prisma ORM  
**Backup Baseline File:** `backups/rasoi_iq_pilot_baseline.sql` (142.5 KB)  
**Verification Target:** `rasoi_iq_restore_test`  
**Test Suite:** `scripts/verify-backup-restore.mjs` (12 / 12 Assertions Passed)  

---

## 1. Objective & Resilience Standard

In an active household pilot, data loss or state corruption (e.g., accidental pantry deletion, conflicting meal plans, or power failure during a live visit) damages user trust. To ensure zero-loss operational continuity without relying on expensive cloud managed database backup subscriptions, RasoiIQ incorporates a native, verifiable PostgreSQL backup and restoration protocol.

Before onboarding pilot families, the entire database was backed up using native `pg_dump`, restored into an isolated clean database (`rasoi_iq_restore_test`), and verified assertion-by-assertion for schema, relation, and data parity.

---

## 2. Backup Execution Protocol

### 2.1 Native PostgreSQL Dump Command
To capture the exact state of the production database (`rasoi_iq`), run the following command via WSL2:

```bash
# Set output directory
mkdir -p backups

# Execute clean, transactional plain-text SQL dump
pg_dump -U postgres -h localhost -d rasoi_iq \
  --clean --if-exists --no-owner --no-privileges \
  -f backups/rasoi_iq_pilot_baseline.sql
```

### 2.2 Backup Characteristics
- **Format**: Plain SQL script with standard `DROP TABLE IF EXISTS` and `CREATE TABLE` DDL.
- **Portability**: Human-readable, version-controllable, and restorable via any standard `psql` client on Linux, macOS, or Windows.
- **Size**: Approximately 142.5 KB containing complete relational seeds, 24 regional Indian recipes, nutrition indices, and pilot household states.

---

## 3. Automated Restoration Verification Proof

The restoration workflow was verified programmatically using `scripts/verify-backup-restore.mjs`.

### 3.1 Test Methodology
1. Create a dedicated test database: `DROP DATABASE IF EXISTS rasoi_iq_restore_test; CREATE DATABASE rasoi_iq_restore_test;`.
2. Pipe the SQL dump into the fresh database: `psql -U postgres -d rasoi_iq_restore_test -f backups/rasoi_iq_pilot_baseline.sql`.
3. Connect simultaneously to both `rasoi_iq` (source) and `rasoi_iq_restore_test` (target).
4. Run exact relational queries to compare table row counts, relational foreign keys, JSON metadata, and dietary constraints.

### 3.2 Deep Verification Scorecard (12 / 12 Passed)

| # | Verified Assertion | Source Database (`rasoi_iq`) | Restored Database (`rasoi_iq_restore_test`) | Result |
| :-: | :--- | :---: | :---: | :---: |
| 1 | Baseline SQL Dump File Exists | 142,504 bytes | &gt; 0 bytes | **PASS** |
| 2 | SQL Dump Restoration Execution | Clean exit code 0 | Clean exit code 0 | **PASS** |
| 3 | `Household` Count | 3 | 3 | **PASS** |
| 4 | `HouseholdMember` Count | 6 | 6 | **PASS** |
| 5 | `User` Count | 3 | 3 | **PASS** |
| 6 | `Recipe` Catalog Count | 24 | 24 | **PASS** |
| 7 | `MealPlan` Count | 3 | 3 | **PASS** |
| 8 | `PlannedMeal` Count | 63 (21 meals &times; 3 plans) | 63 (21 meals &times; 3 plans) | **PASS** |
| 9 | `PantryItem` Count | 33 | 33 | **PASS** |
| 10 | `SmartBasket` Count | 3 | 3 | **PASS** |
| 11 | `BasketItem` Count | 42 | 42 | **PASS** |
| 12 | Deep Data Integrity Check | Strict Jain flag on Mehta; Peanut allergy on Aarav Sharma; Gujarati recipes preserved | Identical relational attributes and dietary constraints | **PASS** |

---

## 4. Founder Operational Recovery Routine

If a pilot session experiences data corruption or if a fresh baseline reset is required between test households:

### 4.1 Creating a Quick Snapshot Before a Household Visit
Run the snapshot command on the host terminal:
```bash
wsl pg_dump -U postgres -h localhost -d rasoi_iq --clean --if-exists -f "backups/snapshot_$(date +%Y%m%d_%H%M%S).sql"
```

### 4.2 Emergency One-Line Restoration to Baseline
If an error occurs and you need to restore the system to its verified pilot baseline:
```bash
wsl psql -U postgres -h localhost -d rasoi_iq -f backups/rasoi_iq_pilot_baseline.sql
```
*Note: Because the dump includes `--clean --if-exists`, it cleanly drops and recreates all tables, foreign keys, and indexes in under 2 seconds without requiring database termination.*

### 4.3 Post-Restoration Verification
Confirm backend health after restoration:
```bash
curl http://localhost:4000/api/health
```
Ensure `"databaseConnected": true` and entity counts match baseline.

---

## 5. Security & Privacy Guardrails for Backups

1. **Storage Location**: Store backups strictly within the local repository `backups/` directory or an encrypted local drive.
2. **Never Commit Sensitive Personal Data**: Ensure `.gitignore` ignores non-baseline operational dumps (e.g., `backups/snapshot_*.sql`).
3. **Pilot Data Cleansing**: When the 7-day pilot concludes, any household feedback or order history must be archived or sanitized according to the pilot consent agreement.
