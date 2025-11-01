# Docker Compose Quick Start Guide

Get the entire Nuxt + Strapi + PostgreSQL stack running in minutes!

## Prerequisites

- Docker >= 20.10
- Docker Compose >= 2.0

## Quick Start (5 minutes)

### 1. Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Generate secure secrets (Linux/macOS)
echo "DATABASE_PASSWORD=$(openssl rand -base64 24)" >> .env
echo "APP_KEYS=$(openssl rand -base64 32),$(openssl rand -base64 32)" >> .env
echo "API_TOKEN_SALT=$(openssl rand -base64 32)" >> .env
echo "ADMIN_JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env
```

**Windows (PowerShell):**
```powershell
# Generate random base64 strings
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### 2. Start the Stack

```bash
# Build and start all services
docker compose up -d

# Monitor startup
docker compose logs -f
```

**Wait for healthy status** (check with `docker compose ps`):
- ✓ postgres (healthy)
- ✓ cms (healthy)
- ✓ frontend (healthy)

### 3. Access Applications

- **Frontend**: http://localhost:3000
- **Strapi Admin**: http://localhost:1337/admin
- **Strapi API**: http://localhost:1337/api

### 4. Configure Strapi

1. Open http://localhost:1337/admin
2. Create your first admin user
3. Go to Settings → API Tokens → Create new API Token
4. Copy the token
5. Add to `.env`: `NUXT_STRAPI_API_TOKEN=your-token-here`
6. Restart frontend: `docker compose restart frontend`

## Common Commands

```bash
# Check service status
docker compose ps

# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f frontend

# Stop all services
docker compose down

# Restart a service
docker compose restart frontend

# Rebuild after code changes
docker compose up -d --build

# Remove everything (including data)
docker compose down -v
```

## Enable Optional Services

### Nginx Reverse Proxy

```bash
docker compose --profile nginx up -d
```

Access via: http://localhost

### CMS Worker (for cron jobs)

```bash
docker compose --profile worker up -d
```

## Troubleshooting

### Port Already in Use

Change ports in `.env`:
```bash
FRONTEND_PORT=3001
STRAPI_PORT=1338
DATABASE_PORT=5433
```

### Service Won't Start

```bash
# Check logs for errors
docker compose logs [service-name]

# Rebuild the service
docker compose up -d --build [service-name]

# Reset everything
docker compose down -v
docker compose up -d --build
```

### Database Connection Failed

```bash
# Check if postgres is running
docker compose ps postgres

# Check postgres logs
docker compose logs postgres

# Wait for postgres to be healthy
docker compose up -d postgres
# Wait 30 seconds
docker compose up -d cms
```

## Development Mode

For hot-reload during development:

```bash
# Copy override example
cp docker-compose.override.example.yml docker-compose.override.yml

# Edit and uncomment the development section
nano docker-compose.override.yml

# Restart
docker compose up -d
```

## Data Persistence

Data is stored in Docker volumes:
- `postgres_data` - Database files
- `strapi_uploads` - Uploaded media files

### Backup

```bash
# Backup database
docker compose exec postgres pg_dump -U strapi strapi > backup.sql

# Backup uploads
docker compose exec cms tar czf /tmp/uploads.tar.gz /opt/app/public/uploads
docker compose cp cms:/tmp/uploads.tar.gz ./uploads-backup.tar.gz
```

### Restore

```bash
# Restore database
cat backup.sql | docker compose exec -T postgres psql -U strapi strapi

# Restore uploads
docker compose cp uploads-backup.tar.gz cms:/tmp/
docker compose exec cms tar xzf /tmp/uploads-backup.tar.gz -C /
```

## China Deployment

### Docker Registry Mirrors

```bash
# Edit /etc/docker/daemon.json
sudo nano /etc/docker/daemon.json
```

```json
{
  "registry-mirrors": [
    "https://registry.docker-cn.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```

```bash
# Restart Docker
sudo systemctl restart docker
```

### NPM Registry

Add to `.npmrc`:
```
registry=https://registry.npmmirror.com
```

## Production Deployment

See comprehensive guide: [docs/deployment/docker-compose.md](./docs/deployment/docker-compose.md)

Key considerations:
- ✓ Generate strong, unique secrets
- ✓ Enable HTTPS/SSL
- ✓ Configure firewall rules
- ✓ Set up database backups
- ✓ Configure monitoring
- ✓ Use nginx reverse proxy
- ✓ Set resource limits

## Next Steps

1. ✅ Create content types in Strapi admin
2. ✅ Generate API tokens for frontend
3. ✅ Configure permissions in Strapi
4. ✅ Customize frontend to consume Strapi API
5. ✅ Set up CI/CD pipeline
6. ✅ Configure production deployment

## Resources

- **Detailed Documentation**: [docs/deployment/docker-compose.md](./docs/deployment/docker-compose.md)
- **Main README**: [README.md](./README.md)
- **Strapi Docs**: https://docs.strapi.io
- **Nuxt Docs**: https://nuxt.com

## Need Help?

1. Check service logs: `docker compose logs [service]`
2. Verify configuration: `docker compose config`
3. Review [docs/deployment/docker-compose.md](./docs/deployment/docker-compose.md)
4. Check [README.md](./README.md) troubleshooting section

---

**Happy deploying! 🚀**
