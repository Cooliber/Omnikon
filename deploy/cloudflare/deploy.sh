#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV=${1:-staging}

echo "🚀 Deploying Motia HVAC CRM to Cloudflare Workers ($ENV)..."

# Check prerequisites
if ! command -v wrangler &> /dev/null; then
  echo "❌ Wrangler CLI not found. Install with: npm install -g wrangler"
  exit 1
fi

if ! wrangler whoami &> /dev/null; then
  echo "❌ Not logged in to Cloudflare. Run: wrangler login"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend assets
echo "🏗️ Building frontend..."
cd ../../
yarn workspace examples.tldraw.com build
cp -r apps/examples/dist deploy/cloudflare/dist
cd deploy/cloudflare

# Run database migrations
echo "🗄️ Running database migrations..."
if [ "$ENV" = "production" ]; then
  wrangler d1 migrations apply motia-hvac-db --env production
else
  wrangler d1 migrations apply motia-hvac-db --env staging
fi

# Deploy to Cloudflare Workers
echo "☁️ Deploying to Cloudflare Workers..."
if [ "$ENV" = "production" ]; then
  wrangler deploy --env production
else
  wrangler deploy --env staging
fi

echo ""
echo "🎉 Deployment completed!"
echo ""

if [ "$ENV" = "production" ]; then
  echo "🔗 Production URLs:"
  echo "  Frontend: https://your-domain.com"
  echo "  API: https://api.your-domain.com"
else
  echo "🔗 Staging URLs:"
  echo "  Check Cloudflare Workers dashboard for URLs"
fi

echo ""
echo "📊 Monitor with:"
echo "  wrangler tail --env $ENV"
echo "  wrangler logs --env $ENV"
