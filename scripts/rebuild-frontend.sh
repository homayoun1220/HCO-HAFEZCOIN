#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo "Rebuilding HCO frontend (no cache)..."
docker compose build --no-cache hco-frontend
docker compose up -d hco-frontend
echo ""
echo "Done. Open http://localhost:8080/"
echo "If the old page still appears once, clear site data for localhost:8080"
echo "  Chrome: DevTools → Application → Clear site data"
echo "  Or use a private/incognito window"
