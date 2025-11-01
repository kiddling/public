# Docker Compose Deployment Guide

This guide covers deploying the Nuxt + Strapi application stack using Docker Compose for development, staging, and production environments.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Development Deployment](#development-deployment)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [China Deployment](#china-deployment)
- [Service Management](#service-management)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Overview

The Docker Compose stack consists of the following services:

- **postgres** - PostgreSQL 16 database
- **cms** - Strapi CMS headless backend (port 1337)
- **frontend** - Nuxt 3 SSR application (port 3000)
- **cms-worker** - Optional background worker for cron jobs (disabled by default)
- **nginx** - Optional reverse proxy for production (disabled by default)

### Architecture

```
┌─────────────┐
│   nginx     │ (optional, port 80/443)
└──────┬──────┘
       │
       ├──────> frontend (Nuxt 3, port 3000)
       │              │
       │              └──> cms (Strapi, port 1337)
       │                      │
       └──────────────────────┴──> postgres (port 5432)
```

## Prerequisites

### Required Software

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Git** (to clone the repository)

### Installation

#### Linux
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

#### macOS
```bash
# Install Docker Desktop (includes Docker Compose)
brew install --cask docker
```

#### Windows
Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)

### Verify Installation

```bash
docker --version
docker compose version
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required variables:**
```bash
# Generate secure keys
export APP_KEYS=$(openssl rand -base64 32)
export API_TOKEN_SALT=$(openssl rand -base64 32)
export ADMIN_JWT_SECRET=$(openssl rand -base64 32)
export TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)
export ENCRYPTION_KEY=$(openssl rand -base64 32)

# Set database password
export DATABASE_PASSWORD=$(openssl rand -base64 24)
```

Add these to your `.env` file.

### 3. Start the Stack

```bash
# Build and start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

### 4. Access the Applications

- **Frontend**: http://localhost:3000
- **Strapi Admin**: http://localhost:1337/admin
- **Strapi API**: http://localhost:1337/api

### 5. Initial Setup

1. Open http://localhost:1337/admin
2. Create your first admin user
3. Generate an API token:
   - Settings → API Tokens → Create new API Token
   - Copy the token and add it to `.env` as `NUXT_STRAPI_API_TOKEN`
4. Restart frontend: `docker compose restart frontend`

## Environment Configuration

### Environment Variables

See `.env.example` for all available variables. Key variables:

#### Database
```bash
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-secure-password
DATABASE_PORT=5432
```

#### Strapi
```bash
STRAPI_PORT=1337
APP_KEYS=key1,key2,key3
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-secret
JWT_SECRET=your-jwt-secret
```

#### Frontend
```bash
FRONTEND_PORT=3000
NUXT_PUBLIC_API_BASE_URL=http://cms:1337
NUXT_STRAPI_API_TOKEN=your-api-token
NUXT_PUBLIC_CDN_URL=https://cdn.example.com
```

#### Optional Services
```bash
BAIDU_API_KEY=your-baidu-key
BAIDU_SECRET_KEY=your-baidu-secret
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

### Security Best Practices

1. **Never commit `.env` files** - they contain secrets
2. **Use strong, unique passwords** - generate with `openssl rand -base64 32`
3. **Rotate secrets regularly** - especially in production
4. **Limit database access** - use restrictive firewall rules
5. **Enable SSL/TLS** - use Let's Encrypt or your certificate authority

## Development Deployment

For local development with hot-reload:

### 1. Create Override File

```bash
cp docker-compose.override.example.yml docker-compose.override.yml
```

Edit `docker-compose.override.yml` and use the development example:

```yaml
version: '3.8'

services:
  cms:
    volumes:
      - ./apps/cms:/opt/app
      - /opt/app/node_modules
    command: ["pnpm", "develop"]
    environment:
      NODE_ENV: development
    ports:
      - "1337:1337"

  frontend:
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
      - /app/.nuxt
    command: ["pnpm", "dev"]
    environment:
      NODE_ENV: development
      NUXT_PUBLIC_API_BASE_URL: http://localhost:1337
    ports:
      - "3000:3000"
      - "24678:24678"  # Nuxt DevTools
```

### 2. Start Development Stack

```bash
# Start with override
docker compose up -d

# Watch logs
docker compose logs -f frontend cms

# Rebuild after dependency changes
docker compose up -d --build
```

### 3. Development Workflow

```bash
# Restart a service
docker compose restart frontend

# Execute commands in containers
docker compose exec cms pnpm strapi console
docker compose exec frontend pnpm run lint

# Access database
docker compose exec postgres psql -U strapi -d strapi
```

## Staging Deployment

For staging/testing environments:

### 1. Configure Environment

```bash
# Create staging environment file
cp .env.example .env.staging

# Edit for staging
nano .env.staging
```

Set staging-specific values:
```bash
NODE_ENV=staging
DATABASE_PASSWORD=staging-password
NUXT_PUBLIC_API_BASE_URL=https://staging-api.example.com
```

### 2. Create Staging Override

```bash
nano docker-compose.staging.yml
```

```yaml
version: '3.8'

services:
  cms:
    environment:
      NODE_ENV: staging
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    environment:
      NODE_ENV: staging
```

### 3. Deploy Staging

```bash
# Use staging configuration
docker compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d

# Check status
docker compose ps
```

## Production Deployment

### 1. Pre-deployment Checklist

- [ ] All secrets generated and securely stored
- [ ] Database backups configured
- [ ] SSL certificates obtained (Let's Encrypt recommended)
- [ ] Domain DNS configured
- [ ] Firewall rules configured
- [ ] Monitoring and logging set up
- [ ] Backup and disaster recovery plan documented

### 2. Production Environment

Create `.env.production`:

```bash
NODE_ENV=production

# Strong passwords
DATABASE_PASSWORD=<generate-strong-password>

# Production secrets (generate fresh)
APP_KEYS=<generate-unique-keys>
API_TOKEN_SALT=<generate-salt>
ADMIN_JWT_SECRET=<generate-secret>
JWT_SECRET=<generate-secret>

# Production URLs
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NUXT_PUBLIC_STRAPI_URL=https://api.yourdomain.com
NUXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com

# Enable nginx
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

### 3. Production Override

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  cms:
    restart: always
    ports: []  # Don't expose directly
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  frontend:
    restart: always
    ports: []  # Don't expose directly
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  nginx:
    profiles: []  # Enable nginx
    volumes:
      - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
    restart: always
```

### 4. SSL/TLS Setup

Using Let's Encrypt:

```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificates
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/

# Set permissions
sudo chmod 644 ./ssl/*.pem
```

Update nginx configuration for HTTPS (see `config/nginx/conf.d/default.conf`).

### 5. Deploy to Production

```bash
# Build images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d

# Verify health
docker compose ps
curl https://yourdomain.com/_health
```

### 6. Production Maintenance

```bash
# View logs
docker compose logs -f --tail=100

# Update services
docker compose pull
docker compose up -d

# Backup database
docker compose exec postgres pg_dump -U strapi strapi > backup.sql

# Restore database
cat backup.sql | docker compose exec -T postgres psql -U strapi strapi
```

## China Deployment

### Docker Registry Mirrors

For faster image pulls in China, configure Docker to use domestic mirrors:

```bash
# Create or edit /etc/docker/daemon.json
sudo nano /etc/docker/daemon.json
```

Add registry mirrors:
```json
{
  "registry-mirrors": [
    "https://registry.docker-cn.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

Restart Docker:
```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### China-Specific Configuration

Create `docker-compose.china.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: registry.cn-hangzhou.aliyuncs.com/library/postgres:16-alpine

  cms:
    build:
      context: ./apps/cms
      args:
        NPM_REGISTRY: https://registry.npmmirror.com
    environment:
      BAIDU_API_KEY: ${BAIDU_API_KEY}
      BAIDU_SECRET_KEY: ${BAIDU_SECRET_KEY}

  frontend:
    build:
      context: ./apps/frontend
      args:
        NPM_REGISTRY: https://registry.npmmirror.com
    environment:
      NUXT_PUBLIC_CDN_URL: https://cdn.jsdelivr.net

  nginx:
    image: registry.cn-hangzhou.aliyuncs.com/library/nginx:alpine
```

### Deploy in China

```bash
# Use China configuration
docker compose -f docker-compose.yml -f docker-compose.china.yml up -d
```

### Popular Chinese Cloud Providers

- **Aliyun (阿里云)**: https://www.aliyun.com/
  - Container Service: ACK (Alibaba Cloud Container Service)
  - Database: RDS for PostgreSQL

- **Tencent Cloud (腾讯云)**: https://cloud.tencent.com/
  - Container Service: TKE (Tencent Kubernetes Engine)
  - Database: TencentDB for PostgreSQL

- **Huawei Cloud (华为云)**: https://www.huaweicloud.com/
  - Container Service: CCE (Cloud Container Engine)
  - Database: RDS for PostgreSQL

### NPM Registry Mirrors

Configure `.npmrc` for faster package installation:

```ini
registry=https://registry.npmmirror.com
```

Alternatives:
- Taobao (淘宝): `https://registry.npmmirror.com`
- Tencent Cloud: `https://mirrors.cloud.tencent.com/npm/`
- Huawei Cloud: `https://mirrors.huaweicloud.com/repository/npm/`

## Service Management

### Common Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart a service
docker compose restart <service-name>

# View logs
docker compose logs -f <service-name>

# Scale services (frontend example)
docker compose up -d --scale frontend=3

# Update and restart
docker compose pull
docker compose up -d

# Remove everything (including volumes)
docker compose down -v
```

### Health Checks

Check service health:

```bash
# Check all services
docker compose ps

# Check specific service health
docker compose exec cms wget -qO- http://localhost:1337/_health

# Check frontend
docker compose exec frontend wget -qO- http://localhost:3000/

# Check database
docker compose exec postgres pg_isready -U strapi
```

### Backup and Restore

#### Database Backup

```bash
# Create backup
docker compose exec postgres pg_dump -U strapi strapi > backup-$(date +%Y%m%d-%H%M%S).sql

# Create compressed backup
docker compose exec postgres pg_dump -U strapi strapi | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

#### Database Restore

```bash
# Restore from backup
cat backup.sql | docker compose exec -T postgres psql -U strapi strapi

# Restore from compressed backup
gunzip < backup.sql.gz | docker compose exec -T postgres psql -U strapi strapi
```

#### Upload Files Backup

```bash
# Backup Strapi uploads
docker compose exec cms tar czf /tmp/uploads.tar.gz /opt/app/public/uploads
docker compose cp cms:/tmp/uploads.tar.gz ./uploads-backup-$(date +%Y%m%d).tar.gz

# Restore uploads
docker compose cp ./uploads-backup.tar.gz cms:/tmp/
docker compose exec cms tar xzf /tmp/uploads-backup.tar.gz -C /
```

### Enable Optional Services

#### Enable CMS Worker

```bash
# Start with cms-worker profile
docker compose --profile worker up -d

# Or remove profile from cms-worker in docker-compose.override.yml
```

#### Enable Nginx

```bash
# Start with nginx profile
docker compose --profile nginx up -d

# Or remove profile from nginx in docker-compose.override.yml
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or change port in .env
FRONTEND_PORT=3001
```

#### Container Won't Start

```bash
# Check logs
docker compose logs <service-name>

# Inspect container
docker compose exec <service-name> sh

# Rebuild container
docker compose up -d --build <service-name>
```

#### Database Connection Issues

```bash
# Check if postgres is healthy
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Verify connection from cms
docker compose exec cms nc -zv postgres 5432

# Reset database
docker compose down -v
docker compose up -d
```

#### Out of Disk Space

```bash
# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune -a

# Remove unused volumes
docker volume prune
```

#### Permission Issues

```bash
# Fix volume permissions
docker compose exec cms chown -R node:node /opt/app/public/uploads
docker compose exec frontend chown -R node:node /app
```

### Debug Mode

Enable debug logging:

```bash
# Add to .env
DEBUG=strapi:*
LOG_LEVEL=debug

# Restart services
docker compose restart
```

### Reset Everything

```bash
# Stop and remove all containers, networks, volumes
docker compose down -v

# Remove images
docker compose down --rmi all

# Start fresh
docker compose up -d --build
```

## Advanced Configuration

### Resource Limits

Limit CPU and memory usage:

```yaml
services:
  cms:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Custom Networks

```yaml
networks:
  app_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
```

### Volume Drivers

Use different volume drivers for production:

```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=nfs-server.example.com,rw
      device: ":/path/to/data"
```

### Health Check Customization

```yaml
services:
  cms:
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:1337/_health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

### Logging Configuration

```yaml
services:
  cms:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
        labels: "service,env"
```

### Environment-Specific Builds

```yaml
services:
  frontend:
    build:
      context: ./apps/frontend
      target: production
      args:
        NODE_ENV: production
        BUILD_VERSION: ${BUILD_VERSION:-latest}
```

## CI/CD Integration

### Validation

The CI pipeline validates the Docker Compose configuration:

```bash
# Validate configuration
docker compose config

# Validate specific file
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

### Automated Deployment

Example GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate Docker Compose
        run: docker compose config
      
      - name: Deploy to production
        run: |
          docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
          docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Strapi Deployment Guide](https://docs.strapi.io/dev-docs/deployment)
- [Nuxt Deployment Guide](https://nuxt.com/docs/getting-started/deployment)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review container logs: `docker compose logs`
3. Consult the main [README.md](../../README.md)
4. Open an issue in the repository

---

**Last Updated**: November 2024
