#!/usr/bin/env bash
set -euo pipefail

echo "=== Test integracji środowiska ==="
echo

# Test research proxy endpoints
echo "🔍 Test Research Proxy:"
for provider in tavily exa firecrawl grep; do
  echo -n "  $provider: "
  response=$(curl -fsS -X POST "http://localhost:8787/api/research/$provider" \
    -H "Content-Type: application/json" \
    -d '{"query":"test"}' 2>/dev/null || echo "ERROR")
  if echo "$response" | grep -q "error\|ERROR"; then
    echo "❌ (oczekiwane - brak kluczy API)"
  else
    echo "✅"
  fi
done

echo

# Test Convex mock
echo "📊 Test Convex Mock:"
echo -n "  forms/submit: "
response=$(curl -fsS -X POST "http://localhost:3001/api/forms/submit" \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' 2>/dev/null || echo "ERROR")
if echo "$response" | grep -q "ok.*true"; then
  echo "✅"
else
  echo "❌"
fi

echo -n "  shapes/save: "
response=$(curl -fsS -X POST "http://localhost:3001/api/shapes/save" \
  -H "Content-Type: application/json" \
  -d '{"shapes":[]}' 2>/dev/null || echo "ERROR")
if echo "$response" | grep -q "saved.*true"; then
  echo "✅"
else
  echo "❌"
fi

echo

# Test Raynet adapter
echo "🏢 Test Raynet Adapter:"
echo -n "  healthz: "
response=$(curl -fsS "http://localhost:8000/healthz" 2>/dev/null || echo "ERROR")
if echo "$response" | grep -q "ok"; then
  echo "✅"
else
  echo "❌"
fi

echo

# Test frontend accessibility
echo "🌐 Test Frontend:"
echo -n "  dostępność: "
if curl -fsS "http://localhost:5173" >/dev/null 2>&1; then
  echo "✅"
else
  echo "❌"
fi

echo
echo "✨ Test zakończony. Sprawdź logi w przypadku błędów: ./scripts/dev-logs.sh all"
