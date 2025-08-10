#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  echo "[info] Brak pliku .env – kopiuję .env.example"
  cp .env.example .env
fi

echo "[info] Buduję obrazy i uruchamiam stack..."
docker compose up -d --build

echo "[info] Oczekiwanie na zdrowe usługi..."
for svc in research-proxy convex-mock raynet-adapter frontend; do
  echo -n " - $svc"
  for i in {1..60}; do
    cid=$(docker ps -qf name=$svc)
    if [ -z "$cid" ]; then sleep 2; echo -n "."; continue; fi
    health=$(docker inspect --format='{{json .State.Health.Status}}' "$cid" 2>/dev/null || true)
    if echo "$health" | grep -q 'healthy'; then
      echo " ...healthy"
      break
    fi
    # if no healthcheck defined, accept running state
    if [ "$health" = 'null' ] || [ -z "$health" ]; then
      state=$(docker inspect --format='{{.State.Status}}' "$cid" 2>/dev/null || true)
      if [ "$state" = "running" ]; then echo " ...running"; break; fi
    fi
    sleep 2
    echo -n "."
  done
done

echo "[ok] Środowisko działa. Frontend: http://localhost:5173"

