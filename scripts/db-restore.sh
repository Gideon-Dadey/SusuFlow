#!/usr/bin/env bash
# Restore PostgreSQL from a pg_dump backup file.
# Usage: ./scripts/db-restore.sh backups/susuflow_20250623_120000.sql.gz
set -euo pipefail

BACKUP_FILE="${1:?Usage: db-restore.sh <backup.sql.gz>}"
DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will overwrite data in the target database."
read -r -p "Continue restore from $BACKUP_FILE? [y/N] " confirm
if [[ "${confirm,,}" != "y" ]]; then
  echo "Aborted."
  exit 0
fi

echo "Restoring ..."
gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL" --single-transaction --set ON_ERROR_STOP=on
echo "Restore complete."
