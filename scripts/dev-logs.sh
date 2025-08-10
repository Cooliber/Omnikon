#!/usr/bin/env bash
set -euo pipefail

SERVICE=${1:-""}

if [ -z "$SERVICE" ]; then
  echo "Użycie: $0 <service>"
  echo "Dostępne usługi: frontend, research-proxy, convex-mock, raynet-adapter"
  echo "Lub: $0 all (wszystkie logi)"
  exit 1
fi

if [ "$SERVICE" = "all" ]; then
  echo "=== Logi wszystkich usług ==="
  docker compose logs -f --tail=50
else
  case "$SERVICE" in
    frontend)
      docker compose logs -f --tail=50 frontend
      ;;
    research-proxy)
      docker compose logs -f --tail=50 research-proxy
      ;;
    convex-mock)
      docker compose logs -f --tail=50 convex-mock
      ;;
    raynet-adapter)
      docker compose logs -f --tail=50 raynet-adapter
      ;;
    *)
      echo "❌ Nieznana usługa: $SERVICE"
      echo "Dostępne: frontend, research-proxy, convex-mock, raynet-adapter, all"
      exit 1
      ;;
  esac
fi
