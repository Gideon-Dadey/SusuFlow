#!/usr/bin/env bash
# Create a timestamped PostgreSQL backup using pg_dump.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"

mkdir -p "$BACKUP_DIR"
OUTPUT="$BACKUP_DIR/susuflow_${TIMESTAMP}.sql.gz"

echo "Backing up database to $OUTPUT ..."
pg_dump "$DATABASE_URL" --no-owner --no-acl | gzip > "$OUTPUT"
echo "Backup complete: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"

# Retain last 30 backups
ls -1t "$BACKUP_DIR"/susuflow_*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm -f
