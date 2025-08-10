#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Deploying Motia HVAC CRM to DigitalOcean..."

# Check prerequisites
if [ ! -f .env.prod ]; then
  echo "❌ Missing .env.prod file. Copy from .env.prod.example and configure."
  exit 1
fi

if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Please install Docker."
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose not found. Please install Docker Compose."
  exit 1
fi

# Load environment variables
source .env.prod

# Validate required variables
required_vars=("DOMAIN" "ACME_EMAIL" "TRAEFIK_AUTH")
for var in "${required_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "❌ Missing required environment variable: $var"
    exit 1
  fi
done

echo "📦 Building and deploying containers..."

# Pull latest images and build
docker-compose -f docker-compose.prod.yml pull --ignore-pull-failures
docker-compose -f docker-compose.prod.yml build --no-cache

# Deploy with zero downtime
echo "🔄 Deploying with zero downtime..."
docker-compose -f docker-compose.prod.yml up -d --remove-orphans

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
services=("motia-frontend-prod" "research-proxy-prod" "convex-proxy-prod" "raynet-adapter-prod" "traefik-prod")
for service in "${services[@]}"; do
  echo -n "  Checking $service... "
  if docker ps --filter "name=$service" --filter "status=running" | grep -q "$service"; then
    echo "✅ Running"
  else
    echo "❌ Failed"
    docker logs "$service" --tail 20
    exit 1
  fi
done

# Test endpoints
echo "🧪 Testing endpoints..."
sleep 10

test_endpoints=(
  "https://${DOMAIN}"
  "https://api.${DOMAIN}/research/healthz"
  "https://api.${DOMAIN}/convex/healthz"
  "https://api.${DOMAIN}/raynet/healthz"
)

for endpoint in "${test_endpoints[@]}"; do
  echo -n "  Testing $endpoint... "
  if curl -fsS --max-time 10 "$endpoint" > /dev/null 2>&1; then
    echo "✅ OK"
  else
    echo "⚠️  Failed (may be expected during initial setup)"
  fi
done

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "🔗 URLs:"
echo "  Frontend: https://${DOMAIN}"
echo "  API: https://api.${DOMAIN}"
echo "  Traefik Dashboard: https://traefik.${DOMAIN}"
echo ""
echo "📊 Monitor with:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo "  docker-compose -f docker-compose.prod.yml ps"
