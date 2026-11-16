#!/usr/bin/env bash
# ==============================================================================
# RasoiIQ — Production-Grade PostgreSQL Backup Script
# Milestone: Phase 6.0 Controlled Household Pilot
# ==============================================================================
set -euo pipefail

# Configuration with secure defaults
DB_NAME="${DB_NAME:-rasoi_iq}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-backups}"
RETENTION_COUNT="${RETENTION_COUNT:-7}"

# Resolve script directory to handle relative path execution cleanly
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKUP_PATH="${PROJECT_ROOT}/${BACKUP_DIR}"

mkdir -p "${BACKUP_PATH}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_PATH}/rasoi_iq_${TIMESTAMP}.dump"
LOG_FILE="${BACKUP_PATH}/backup.log"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [INFO] Starting RasoiIQ PostgreSQL custom-format backup..." | tee -a "${LOG_FILE}"
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [INFO] Database: ${DB_NAME} | Host: ${DB_HOST}:${DB_PORT} | User: ${DB_USER}" | tee -a "${LOG_FILE}"

# Execute pg_dump in PostgreSQL Custom Format (-Fc)
export PGPASSWORD="${PGPASSWORD:-postgres}"
if pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -Fc \
  -f "${BACKUP_FILE}"; then
  
  # Validate non-empty backup
  if [ ! -s "${BACKUP_FILE}" ]; then
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [ERROR] Backup file created but is empty: ${BACKUP_FILE}" | tee -a "${LOG_FILE}"
    rm -f "${BACKUP_FILE}"
    exit 1
  fi

  # Restrict permissions to owner only (chmod 600)
  chmod 600 "${BACKUP_FILE}"
  BACKUP_SIZE=$(wc -c < "${BACKUP_FILE}" | tr -d ' ')

  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [SUCCESS] Backup completed successfully: ${BACKUP_FILE} (${BACKUP_SIZE} bytes, permissions: 0600)" | tee -a "${LOG_FILE}"

  # Retention management: keep the latest RETENTION_COUNT backups
  BACKUP_COUNT=$(find "${BACKUP_PATH}" -maxdepth 1 -name "rasoi_iq_*.dump" -type f | wc -l)
  if [ "${BACKUP_COUNT}" -gt "${RETENTION_COUNT}" ]; then
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [INFO] Enforcing retention policy: keeping latest ${RETENTION_COUNT} backups (current: ${BACKUP_COUNT})" | tee -a "${LOG_FILE}"
    find "${BACKUP_PATH}" -maxdepth 1 -name "rasoi_iq_*.dump" -type f | sort -r | tail -n "+$((RETENTION_COUNT + 1))" | while read -r old_backup; do
      echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [CLEANUP] Pruning old backup: ${old_backup}" | tee -a "${LOG_FILE}"
      rm -f "${old_backup}"
    done
  fi

  echo "${BACKUP_FILE}"
  exit 0
else
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [ERROR] pg_dump execution failed for database ${DB_NAME}" | tee -a "${LOG_FILE}"
  exit 1
fi
