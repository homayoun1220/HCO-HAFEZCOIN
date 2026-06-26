#!/usr/bin/env bash
# Backup SQLite database from Docker volume
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${ROOT}/backups"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="${BACKUP_DIR}/hco_study_${STAMP}.db"

mkdir -p "${BACKUP_DIR}"

cd "${ROOT}"
docker compose exec -T backend cat /data/hco_study.db > "${OUT}"

echo "Backup saved: ${OUT}"
ls -lh "${OUT}"
