#!/usr/bin/env bash
set -euo pipefail

echo "=== Status środowiska Docker ==="
echo

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker nie działa lub nie jest dostępny"
  exit 1
fi

echo "✅ Docker działa"
echo

# Check containers
echo "📦 Kontenery:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "network=motia-net" || true
echo

# Check health status
echo "🏥 Status zdrowia:"
for svc in research-proxy convex-mock raynet-adapter; do
  cid=$(docker ps -qf name=$svc 2>/dev/null || true)
  if [ -n "$cid" ]; then
    health=$(docker inspect --format='{{.State.Health.Status}}' "$cid" 2>/dev/null || echo "brak")
    echo "  $svc: $health"
  else
    echo "  $svc: nie działa"
  fi
done

# Check frontend (no healthcheck)
cid=$(docker ps -qf name=motia-frontend 2>/dev/null || true)
if [ -n "$cid" ]; then
  state=$(docker inspect --format='{{.State.Status}}' "$cid" 2>/dev/null || echo "nieznany")
  echo "  frontend: $state"
else
  echo "  frontend: nie działa"
fi

echo

# Check network connectivity
echo "🌐 Testy połączeń:"
for endpoint in "localhost:5173" "localhost:8787/healthz" "localhost:3001/healthz" "localhost:8000/healthz"; do
  if curl -fsS "http://$endpoint" >/dev/null 2>&1; then
    echo "  ✅ $endpoint"
  else
    echo "  ❌ $endpoint"
  fi
done

echo
echo "🔗 Linki:"
echo "  Frontend: http://localhost:5173"
echo "  Research Proxy: http://localhost:8787"
echo "  Convex Mock: http://localhost:3001"
echo "  Raynet Adapter: http://localhost:8000"
