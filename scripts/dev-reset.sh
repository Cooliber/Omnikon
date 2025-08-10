#!/usr/bin/env bash
set -euo pipefail

echo "=== Reset środowiska Docker ==="
echo

echo "[info] Zatrzymuję i usuwam kontenery..."
docker compose down -v --remove-orphans

echo "[info] Usuwam obrazy..."
docker images --filter "reference=*research-proxy*" --filter "reference=*convex-mock*" --filter "reference=*raynet-adapter*" -q | xargs -r docker rmi -f

echo "[info] Czyszczę cache Docker..."
docker system prune -f

echo "[info] Rebuilduję i uruchamiam..."
docker compose up -d --build --force-recreate

echo "✅ Reset zakończony. Sprawdź status: ./scripts/dev-status.sh"
