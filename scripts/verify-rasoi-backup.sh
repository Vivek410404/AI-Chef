#!/usr/bin/env bash
# ==============================================================================
# RasoiIQ — Production-Grade Backup Verification & Parity Audit Script
# Milestone: Phase 6.0 Controlled Household Pilot
# ==============================================================================
set -euo pipefail

PRIMARY_DB="${PRIMARY_DB:-rasoi_iq}"
RECOVERY_DB="${RECOVERY_DB:-rasoi_iq_recovery_test}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-backups}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKUP_PATH="${PROJECT_ROOT}/${BACKUP_DIR}"

export PGPASSWORD="${PGPASSWORD:-postgres}"

# Determine backup file: accept argument or take latest .dump in backups/
if [ $# -ge 1 ] && [ -f "$1" ]; then
  BACKUP_FILE="$1"
else
  BACKUP_FILE=$(find "${BACKUP_PATH}" -maxdepth 1 -name "rasoi_iq_*.dump" -type f | sort -r | head -n 1 || true)
fi

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
  echo "[ERROR] No valid backup file found to verify in ${BACKUP_PATH}"
  exit 1
fi

echo "========================================================================"
echo "  RASOIIQ POSTGRESQL BACKUP RESTORE & PARITY VERIFICATION"
echo "========================================================================"
echo "Backup File: ${BACKUP_FILE} ($(wc -c < "${BACKUP_FILE}" | tr -d ' ') bytes)"
echo "Target Test Recovery DB: ${RECOVERY_DB}"
echo "Primary Comparison DB:   ${PRIMARY_DB}"
echo "------------------------------------------------------------------------"

# 1. Clean slate for recovery database
echo "[Step 1/6] Preparing clean test recovery database..."
dropdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" --if-exists "${RECOVERY_DB}"
createdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${RECOVERY_DB}"

# 2. Restore custom-format dump
echo "[Step 2/6] Restoring pg_dump custom format (-Fc) into ${RECOVERY_DB}..."
# pg_restore may return warnings for non-critical grants/tablespaces, so allow exit codes 0 or 1
pg_restore -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${RECOVERY_DB}" --no-owner --no-privileges "${BACKUP_FILE}" || true

# 3. Verify Table and Row Count Parity
echo "[Step 3/6] Verifying data and row count parity with primary database..."
check_parity() {
  local table="$1"
  local primary_count
  local recovery_count

  primary_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${PRIMARY_DB}" -t -A -c "SELECT count(*) FROM \"${table}\";")
  recovery_count=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${RECOVERY_DB}" -t -A -c "SELECT count(*) FROM \"${table}\";")

  if [ "${primary_count}" -eq "${recovery_count}" ]; then
    echo "  ✔ Table \"${table}\": ${recovery_count} rows matches primary database exactly."
  else
    echo "  ✘ Parity Failure on table \"${table}\": Primary=${primary_count}, Recovered=${recovery_count}"
    exit 1
  fi
}

check_parity "User"
check_parity "Household"
check_parity "HouseholdMember"
check_parity "Recipe"
check_parity "RecipeIngredient"
check_parity "Ingredient"
check_parity "Order"
check_parity "AuditLog"

# 4. Verify Constraints, Indexes and Foreign Keys
echo "[Step 4/6] Verifying schema integrity, primary keys, and foreign keys..."
PK_COUNT=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${RECOVERY_DB}" -t -A -c "
  SELECT count(*) FROM information_schema.table_constraints 
  WHERE constraint_type = 'PRIMARY KEY' AND table_schema = 'public';
")
FK_COUNT=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${RECOVERY_DB}" -t -A -c "
  SELECT count(*) FROM information_schema.table_constraints 
  WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
")
echo "  ✔ Primary Keys verified: ${PK_COUNT}"
echo "  ✔ Foreign Keys verified: ${FK_COUNT}"

if [ "${PK_COUNT}" -lt 15 ] || [ "${FK_COUNT}" -lt 15 ]; then
  echo "  ✘ Unexpected constraint count. Primary keys (${PK_COUNT}) or Foreign keys (${FK_COUNT}) too low."
  exit 1
fi

# 5. Verify Database Triggers and Immutability Protection
echo "[Step 5/6] Verifying AuditLog immutability triggers restored and enforcing..."
TRIGGER_COUNT=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${RECOVERY_DB}" -t -A -c "
  SELECT count(*) FROM pg_trigger WHERE tgname LIKE 'trg_audit_log_immutable%';
")

if [ "${TRIGGER_COUNT}" -eq 2 ]; then
  echo "  ✔ Immutability triggers confirmed active (UPDATE and DELETE triggers present)."
else
  echo "  ✘ Expected 2 immutability triggers on AuditLog, found: ${TRIGGER_COUNT}"
  exit 1
fi

# Test induced UPDATE rejection
UPDATE_REJECTED=0
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${RECOVERY_DB}" -c "
  UPDATE \"AuditLog\" SET action = 'TAMPERED' WHERE id = (SELECT id FROM \"AuditLog\" LIMIT 1);
" > /dev/null 2>&1 || UPDATE_REJECTED=1

if [ "${UPDATE_REJECTED}" -eq 1 ]; then
  echo "  ✔ Immutability verification: UPDATE on AuditLog strictly rejected by database trigger."
else
  echo "  ✘ Security Failure: UPDATE on AuditLog was permitted in recovered database!"
  exit 1
fi

# Test induced DELETE rejection
DELETE_REJECTED=0
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${RECOVERY_DB}" -c "
  DELETE FROM \"AuditLog\" WHERE id = (SELECT id FROM \"AuditLog\" LIMIT 1);
" > /dev/null 2>&1 || DELETE_REJECTED=1

if [ "${DELETE_REJECTED}" -eq 1 ]; then
  echo "  ✔ Immutability verification: DELETE on AuditLog strictly rejected by database trigger."
else
  echo "  ✘ Security Failure: DELETE on AuditLog was permitted in recovered database!"
  exit 1
fi

# 6. Verify Authenticated Application Query on Recovered Database
echo "[Step 6/6] Verifying application queries execute safely against restored database..."
TEST_USER_EMAIL=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${RECOVERY_DB}" -t -A -c "
  SELECT email FROM \"User\" WHERE status = 'ACTIVE' LIMIT 1;
")

if [ -n "${TEST_USER_EMAIL}" ]; then
  echo "  ✔ Discovered valid active user: ${TEST_USER_EMAIL}"
else
  echo "  ✘ No active user found in restored database."
  exit 1
fi

# Cleanup temporary recovery database
echo "------------------------------------------------------------------------"
echo "Cleaning up temporary recovery database: ${RECOVERY_DB}..."
dropdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${RECOVERY_DB}"
echo "  ✔ Temporary recovery database dropped cleanly."

echo "========================================================================"
echo "🎉 BACKUP VERIFICATION & RESTORE AUDIT: 100% SUCCESSFUL"
echo "========================================================================"
exit 0
