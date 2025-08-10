# Deployment Guide - Motia HVAC CRM

## Overview

This guide covers deployment to two platforms:
- **DigitalOcean**: Docker-based deployment with Traefik reverse proxy
- **Cloudflare**: Serverless deployment with Workers, D1, and R2

## DigitalOcean Deployment

### Prerequisites

- DigitalOcean Droplet (minimum 2GB RAM, 2 vCPUs)
- Domain name with DNS pointing to your droplet
- Docker and Docker Compose installed

### Setup

1. **Prepare the server:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Clone and configure:**
```bash
git clone https://github.com/Cooliber/Omnikon.git
cd Omnikon/deploy/digitalocean

# Configure environment
cp .env.prod.example .env.prod
nano .env.prod  # Fill in your values
```

3. **Deploy:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Configuration

Key environment variables in `.env.prod`:

```bash
# Domain setup
DOMAIN=your-domain.com
ACME_EMAIL=admin@your-domain.com

# Generate auth hash: htpasswd -nb admin your-password
TRAEFIK_AUTH=admin:$2y$10$...

# API Keys
TAVILY_API_KEY=your_key
EXA_API_KEY=your_key
FIRECRAWL_API_KEY=your_key
RAYNET_API_KEY=your_key
```

### Services

- **Frontend**: `https://your-domain.com`
- **API**: `https://api.your-domain.com`
- **Traefik Dashboard**: `https://traefik.your-domain.com`

## Cloudflare Deployment

### Prerequisites

- Cloudflare account with Workers plan
- Domain managed by Cloudflare
- Wrangler CLI installed: `npm install -g wrangler`

### Setup

1. **Login to Cloudflare:**
```bash
wrangler login
```

2. **Create resources:**
```bash
cd deploy/cloudflare

# Create D1 database
wrangler d1 create motia-hvac-db

# Create KV namespace
wrangler kv:namespace create "CACHE"

# Create R2 bucket
wrangler r2 bucket create motia-hvac-files
```

3. **Configure wrangler.toml:**
```toml
# Update with your actual IDs from step 2
[[d1_databases]]
binding = "DB"
database_name = "motia-hvac-db"
database_id = "your-actual-database-id"

[[kv_namespaces]]
binding = "CACHE"
id = "your-actual-kv-id"
```

4. **Set secrets:**
```bash
wrangler secret put TAVILY_API_KEY
wrangler secret put EXA_API_KEY
wrangler secret put FIRECRAWL_API_KEY
wrangler secret put RAYNET_API_KEY
wrangler secret put RAYNET_API_URL
wrangler secret put RAYNET_INSTANCE
```

5. **Deploy:**
```bash
chmod +x deploy.sh
./deploy.sh production
```

### Features

- **Serverless**: Auto-scaling, pay-per-use
- **Global CDN**: Fast worldwide access
- **D1 Database**: SQLite-compatible serverless database
- **R2 Storage**: S3-compatible object storage
- **Durable Objects**: Real-time workflow state

## Monitoring & Maintenance

### DigitalOcean

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps

# Update deployment
git pull && ./deploy.sh

# Backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U user postgres > backup.sql
```

### Cloudflare

```bash
# View logs
wrangler tail --env production

# Check metrics
wrangler analytics --env production

# Update deployment
./deploy.sh production
```

## Security Considerations

### DigitalOcean
- Firewall configured for ports 80, 443, 22 only
- Automatic SSL certificates via Let's Encrypt
- API keys stored in environment variables (not in images)
- Traefik dashboard protected with basic auth

### Cloudflare
- API keys stored as encrypted secrets
- CORS configured for specific origins
- Rate limiting via Cloudflare dashboard
- DDoS protection included

## Troubleshooting

### Common Issues

1. **SSL Certificate Issues (DigitalOcean)**
   - Check DNS propagation: `dig your-domain.com`
   - Verify email in ACME_EMAIL is valid
   - Check Traefik logs: `docker logs traefik-prod`

2. **API Key Errors**
   - Verify all required secrets are set
   - Check API key validity with providers
   - Review service logs for specific errors

3. **Database Connection Issues (Cloudflare)**
   - Ensure D1 migrations ran successfully
   - Check database binding in wrangler.toml
   - Verify database ID matches created resource

### Support

- DigitalOcean: Check droplet metrics and logs
- Cloudflare: Use Workers dashboard analytics
- Both: Monitor application logs for errors

## Cost Estimation

### DigitalOcean
- Droplet: $12-24/month (2-4GB RAM)
- Domain: $10-15/year
- Total: ~$15-30/month

### Cloudflare
- Workers: $5/month (10M requests)
- D1: $0.75/month (25M reads)
- R2: $0.015/GB/month
- Domain: Free (if using Cloudflare)
- Total: ~$6-10/month (low traffic)

Choose based on your needs:
- **DigitalOcean**: More control, predictable costs
- **Cloudflare**: Serverless, global scale, lower costs for low traffic
