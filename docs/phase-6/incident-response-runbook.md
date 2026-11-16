# RasoiIQ Phase 6.0 — Administrative Controls & Incident Response Runbook

**Milestone:** Phase 6.0 Controlled Household Pilot Readiness  
**Target:** 3 Supervised Pilot Households (Up to 10 maximum)  
**Roles Covered:** SUPER_ADMIN, ADMIN, OPERATIONS, SUPPORT, and System Founder  

---

## 1. Administrative Role & Permission Matrix

| Role | Access Level | Restrictions & Boundaries |
| :--- | :--- | :--- |
| **SUPER_ADMIN** | Full platform control, staff creation, system health, settings | Cannot delete audit logs (enforced by DB triggers) |
| **ADMIN** | User management, household inspection, retailer approvals | Cannot modify system secrets; all actions logged |
| **OPERATIONS** | Retailer vetting, order monitoring, catalog verification | Cannot alter staff roles or system configuration |
| **SUPPORT** | Read-only masked household inspection with mandatory reason | Cannot inspect households without auditable reason |

---

## 2. Hardened Security & Anti-Tampering Controls

1. **Privilege Escalation Prevention:** Staff cannot elevate their own role. Only a verified SUPER_ADMIN can assign administrative permissions.
2. **Separation of Duties:** Staff members cannot approve their own merchant/retailer applications.
3. **Database-Level Audit Immutability:** Two PostgreSQL database triggers strictly block any tampering:
   ```sql
   CREATE TRIGGER trg_audit_log_immutable_update
   BEFORE UPDATE ON "AuditLog"
   FOR EACH ROW EXECUTE FUNCTION audit_log_immutable_trigger();

   CREATE TRIGGER trg_audit_log_immutable_delete
   BEFORE DELETE ON "AuditLog"
   FOR EACH ROW EXECUTE FUNCTION audit_log_immutable_trigger();
   ```
4. **Metadata Sanitization:** The `AuditService` automatically inspects all logged metadata. Any field matching `password`, `token`, `secret`, `authorization`, `cookie`, `cvv`, or `hash` is redacted to `[REDACTED]`.

---

## 3. Incident Response Playbooks

### Incident 1: Suspected Account Compromise
1. **Immediate Action:** The administrator navigates to `/admin/users` and clicks **Suspend User** or executes:
   ```bash
   node scripts/manage-account.mjs --action=suspend --email=compromised@household.in --reason="Suspected credential compromise"
   ```
2. **Immediate Effect:** 
   - User status in PostgreSQL is set to `SUSPENDED`.
   - All active `RefreshSession` records are immediately revoked.
   - Any active access JWTs are rejected on the very next HTTP request by the authoritative database check.
3. **Remediation:** Contact the household manager offline. Issue a verified single-use password reset link. Once reset, reactivate the account.

---

### Incident 2: Lost or Stolen Household Device
1. **Self-Service Option:** The household owner logs into RasoiIQ on another device, navigates to `/account/sessions`, and clicks **Revoke All Other Sessions**.
2. **Administrator Assistance:** If the user has no secondary device, the administrator triggers `logoutAll()` via the admin console.
3. **Verification:** Confirm in `RefreshSession` table that `revokedAt` is populated for all sessions belonging to that `userId`.

---

### Incident 3: Household Privacy Incident (Accidental Data Exposure)
1. **Containment:** Immediately revoke access to the affected resource.
2. **Audit Inspection:** Query `AuditLog` table to trace all requests associated with the exposed entity:
   ```sql
   SELECT * FROM "AuditLog" WHERE "entityId" = 'hh-affected-id' ORDER BY "createdAt" DESC;
   ```
3. **Notification:** Notify the affected household within 24 hours in plain language.
4. **Root Cause Analysis:** Inspect route guards and middleware. Document resolution in the pilot incident log.

---

### Incident 4: Incorrect Dietary or Allergen Recommendation
1. **Immediate Safety Action:** Household manager or supervisor immediately rejects the meal plan in the UI.
2. **Catalog Quarantine:** If a recipe contains mislabelled ingredients, update the recipe via `/admin/recipes/:id` to remove or correct it.
3. **Engine Check:** Run `node scripts/audit-all-recipes.mjs` to verify catalog-wide compliance.
4. **Direct Confirmation:** Re-generate the meal plan using the deterministic fallback engine to guarantee hard constraint adherence.

---

### Incident 5: Database Corruption or Transaction Failure
1. **Assessment:** Check PostgreSQL server logs via `wsl sudo tail -n 100 /var/log/postgresql/postgresql-18-main.log`.
2. **Service Safeguard:** RasoiIQ operates with `REQUIRE_DATABASE=true`. It fails closed rather than corrupting in-memory data.
3. **Restore from Backup:** Execute the automated recovery procedure using the latest verified backup:
   ```bash
   wsl bash scripts/verify-rasoi-backup.sh backups/rasoi_iq_latest.dump
   ```
4. **Promote:** Restore into `rasoi_iq` and restart the backend service.

---

### Incident 6: Failed Backup or Restoration
1. **Alerting:** `backup-rasoi.sh` logs errors to `backups/backup.log` and exits with code 1 if a dump fails or is 0 bytes.
2. **Immediate Manual Dump:** Execute manual backup:
   ```bash
   wsl pg_dump -h 127.0.0.1 -U postgres -d rasoi_iq -Fc -f backups/manual_emergency_backup.dump
   ```
3. **Verification:** Test recovery into `rasoi_iq_recovery_test` via `verify-rasoi-backup.sh`.
4. **Resolution:** Address disk space, permissions, or PostgreSQL process locks.

---

### Incident 7: AI Provider Outage or Rate Limit Exhaustion
1. **Behavior:** The system detects timeout (10s) or HTTP 429/5xx, logs the warning, and immediately activates the local `DeterministicProvider`.
2. **User Experience:** The user receives a valid, regionally compliant meal plan without interruption.
3. **Monitoring:** Check admin system health (`/admin/system-health`) to observe Gemini quota reset timestamps.
4. **Action:** No emergency intervention required; system self-heals when quota refreshes.

---

### Incident 8: Accidental Exposure of API Credentials
1. **Revocation:** Immediately revoke the exposed `GEMINI_API_KEY` in Google AI Studio console.
2. **Regeneration:** Generate a new key and update `.env` on the workstation.
3. **Restart Service:** Restart the backend API daemon to load the new secret.
4. **History Audit:** Ensure the secret was never committed to Git history.
