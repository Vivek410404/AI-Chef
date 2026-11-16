# RasoiIQ Phase 6.0 — PostgreSQL Backup & Restore Operational Runbook

**Milestone:** Phase 6.0 Controlled Household Pilot Readiness  
**Target:** 3 Supervised Households  
**Database:** PostgreSQL 18.6 on WSL2 Ubuntu  
**Backup Format:** PostgreSQL Custom Binary Dump (`-Fc`)  

---

## 1. Executive Summary

RasoiIQ requires that PostgreSQL remain the authoritative persistent database. In accordance with Phase 6.0 requirements, automated backup and restore procedures have been implemented using production-grade shell scripts in WSL2 Ubuntu. Backups are created in custom format, verified for non-empty size, restricted with `0600` permissions, rotated to retain the latest 7 archives, and verified by test-restoring into an isolated recovery database.

---

## 2. Backup Script: `scripts/backup-rasoi.sh`

### Script Capabilities
- **Format:** `pg_dump -Fc` (compressed custom format supporting parallel restore and selective extraction).
- **Automation:** Creates `backups/` directory if missing.
- **Naming:** `rasoi_iq_YYYYMMDD_HHMMSS.dump`.
- **Validation:** Verifies file exists and file size > 0 bytes; aborts and deletes on zero-byte output.
- **Security:** Sets file permissions to `0600` (readable/writable only by owner).
- **Retention:** Retains the 7 most recent backups and automatically prunes older files.
- **Logging:** Logs execution timestamp, file size, and status to `backups/backup.log`.

### Execution Command
```bash
wsl bash scripts/backup-rasoi.sh
```

### Verified Execution Output Sample
```text
[2026-11-16T12:45:13Z] [INFO] Starting RasoiIQ PostgreSQL custom-format backup...
[2026-11-16T12:45:13Z] [INFO] Database: rasoi_iq | Host: 127.0.0.1:5432 | User: postgres
[2026-11-16T12:45:14Z] [SUCCESS] Backup completed successfully: /mnt/d/Startup/backups/rasoi_iq_20261116_124513.dump (177503 bytes, permissions: 0600)
/mnt/d/Startup/backups/rasoi_iq_20261116_124513.dump
```

---

## 3. Restore Verification Script: `scripts/verify-rasoi-backup.sh`

### Script Capabilities
- **Isolation:** Restores into a dedicated temporary database (`rasoi_iq_recovery_test`), never touching the active primary database.
- **Parity Check:** Compares row counts between primary `rasoi_iq` and restored `rasoi_iq_recovery_test` across all tables:
  - `User`, `Household`, `HouseholdMember`, `Recipe`, `RecipeIngredient`, `Ingredient`, `Order`, `AuditLog`.
- **Schema Validation:** Confirms primary keys (31+) and foreign keys (33+) are fully restored.
- **Trigger Immutability Check:** Confirms `trg_audit_log_immutable_update` and `trg_audit_log_immutable_delete` are active, and tests induced `UPDATE` and `DELETE` operations to verify they are blocked.
- **Query Verification:** Executes an active user select query against the restored database.
- **Safe Cleanup:** Automatically drops `rasoi_iq_recovery_test` only after 100% of verification steps pass.

### Execution Command
```bash
wsl bash scripts/verify-rasoi-backup.sh
```

### Verified Execution Output Sample
```text
========================================================================
  RASOIIQ POSTGRESQL BACKUP RESTORE & PARITY VERIFICATION
========================================================================
Backup File: /mnt/d/Startup/backups/rasoi_iq_20261116_124513.dump (177503 bytes)
Target Test Recovery DB: rasoi_iq_recovery_test
Primary Comparison DB:   rasoi_iq
------------------------------------------------------------------------
[Step 1/6] Preparing clean test recovery database...
[Step 2/6] Restoring pg_dump custom format (-Fc) into rasoi_iq_recovery_test...
[Step 3/6] Verifying data and row count parity with primary database...
  ✔ Table "User": 153 rows matches primary database exactly.
  ✔ Table "Household": 46 rows matches primary database exactly.
  ✔ Table "HouseholdMember": 59 rows matches primary database exactly.
  ✔ Table "Recipe": 46 rows matches primary database exactly.
  ✔ Table "RecipeIngredient": 339 rows matches primary database exactly.
  ✔ Table "Ingredient": 57 rows matches primary database exactly.
  ✔ Table "Order": 277 rows matches primary database exactly.
  ✔ Table "AuditLog": 736 rows matches primary database exactly.
[Step 4/6] Verifying schema integrity, primary keys, and foreign keys...
  ✔ Primary Keys verified: 31
  ✔ Foreign Keys verified: 33
[Step 5/6] Verifying AuditLog immutability triggers restored and enforcing...
  ✔ Immutability triggers confirmed active (UPDATE and DELETE triggers present).
  ✔ Immutability verification: UPDATE on AuditLog strictly rejected by database trigger.
  ✔ Immutability verification: DELETE on AuditLog strictly rejected by database trigger.
[Step 6/6] Verifying application queries execute safely against restored database...
  ✔ Discovered valid active user: demo@rasoiiq.in
------------------------------------------------------------------------
Cleaning up temporary recovery database: rasoi_iq_recovery_test...
  ✔ Temporary recovery database dropped cleanly.
========================================================================
🎉 BACKUP VERIFICATION & RESTORE AUDIT: 100% SUCCESSFUL
========================================================================
```

---

## 4. Disaster Recovery Procedure (Restoring to Production)

If the primary database `rasoi_iq` is ever corrupted or lost:

1. **Stop Application Daemons:**
   Stop Next.js and NestJS API server processes to prevent incoming writes.

2. **Select Latest Verified Backup:**
   Inspect `backups/` and select the latest timestamped `.dump` file.

3. **Recreate Primary Database:**
   ```bash
   wsl psql -h 127.0.0.1 -U postgres -c "DROP DATABASE IF EXISTS rasoi_iq;"
   wsl psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE rasoi_iq;"
   ```

4. **Restore Archive:**
   ```bash
   wsl pg_restore -h 127.0.0.1 -U postgres -d rasoi_iq --no-owner --no-privileges backups/rasoi_iq_YYYYMMDD_HHMMSS.dump
   ```

5. **Verify Primary Database:**
   ```bash
   wsl psql -h 127.0.0.1 -U postgres -d rasoi_iq -c "SELECT count(*) FROM \"User\";"
   ```

6. **Restart Backend API Daemon:**
   Start the NestJS API daemon and verify startup logs show:
   `[StoreService] Connected to PostgreSQL database via Prisma.`
