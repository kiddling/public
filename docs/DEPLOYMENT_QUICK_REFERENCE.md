# Deployment Quick Reference

Fast reference guide for common deployment operations.

## Quick Commands

### Preflight Checks

```bash
pnpm deploy:preflight
# or
./scripts/deploy/preflight.sh
```

### Deploy

```bash
pnpm deploy:blue-green
# or
./scripts/deploy/blue-green-deploy.sh --version v1.2.3
```

### Verify

```bash
pnpm deploy:verify
# or
./scripts/deploy/post-deploy-verify.sh --target-color green
```

### Rollback

```bash
pnpm deploy:rollback
# or
./scripts/deploy/rollback.sh --force --skip-db
```

## Smoke Tests

```bash
# Run all smoke tests
pnpm test:smoke

# Run specific test
npx playwright test tests/smoke/homepage.smoke.spec.ts

# Run against specific URL
PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm test:smoke
```

## Health Checks

### Blue Stack (default)

```bash
curl http://localhost:3000/api/health  # Frontend
curl http://localhost:1337/_health     # CMS
```

### Green Stack

```bash
curl http://localhost:3001/api/health  # Frontend
curl http://localhost:1338/_health     # CMS
```

### Nginx

```bash
curl http://localhost/health
```

## Docker Operations

### Check Active Deployment

```bash
./scripts/deploy/get-active-color.sh
cat /tmp/active-deployment-color
```

### Container Status

```bash
docker ps --filter "name=frontend"
docker ps --filter "name=cms"
docker ps --filter "health=healthy"
```

### Logs

```bash
docker logs -f nuxt-strapi-frontend-blue
docker logs -f nuxt-strapi-cms-green
docker logs --tail=100 nuxt-strapi-frontend-blue
```

### Start/Stop Stacks

```bash
# Start blue stack
docker-compose -f docker-compose.blue.yml up -d

# Start green stack
docker-compose -f docker-compose.green.yml up -d

# Stop old stack
docker-compose -f docker-compose.blue.yml down
```

## Database Operations

### Backup

```bash
docker-compose exec postgres pg_dump -U strapi strapi > backup.sql
```

### Restore

```bash
docker-compose exec -T postgres psql -U strapi strapi < backup.sql
```

### Migrations

```bash
# Run migrations
docker exec nuxt-strapi-cms-blue npm run strapi migrate

# Rollback migrations (if supported)
docker exec nuxt-strapi-cms-blue npm run strapi migrate:down
```

## Monitoring

### System Resources

```bash
# Docker stats
docker stats

# Disk usage
df -h

# Memory usage
free -h
```

### Application Metrics

```bash
# Check error logs
docker logs nuxt-strapi-frontend-blue 2>&1 | grep -i error

# Check response time
time curl -I http://localhost:3000/
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :1337

# Kill process
kill -9 <PID>
```

### Container Won't Start

```bash
# Check logs
docker logs <container-name>

# Rebuild without cache
docker-compose build --no-cache

# Remove and recreate
docker-compose down
docker-compose up -d --force-recreate
```

### Health Check Failing

```bash
# Check container status
docker inspect <container-name> | grep -A 10 Health

# Test endpoint manually
curl -v http://localhost:3000/api/health

# Check container network
docker network inspect nuxt-strapi-monorepo_app-network
```

## Emergency Procedures

### Immediate Rollback

```bash
./scripts/deploy/rollback.sh --force --skip-db
```

### Force Stop All Deployments

```bash
docker-compose down
docker-compose -f docker-compose.blue.yml down
docker-compose -f docker-compose.green.yml down
```

### Clear All and Restart

```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
```

## File Locations

| Item               | Location                   |
| ------------------ | -------------------------- |
| Deployment scripts | `scripts/deploy/`          |
| Deployment logs    | `logs/`                    |
| Database backups   | `backups/`                 |
| Nginx configs      | `config/nginx/`            |
| Smoke tests        | `tests/smoke/`             |
| CI/CD workflow     | `.github/workflows/ci.yml` |

## Port Reference

| Service    | Blue Port | Green Port    |
| ---------- | --------- | ------------- |
| Frontend   | 3000      | 3001          |
| CMS        | 1337      | 1338          |
| PostgreSQL | 5432      | 5432 (shared) |
| Redis      | 6379      | 6379 (shared) |
| Nginx      | 80/443    | 80/443        |

## Status Codes

| Code | Meaning              |
| ---- | -------------------- |
| 0    | Success              |
| 1    | General failure      |
| 200  | HTTP OK              |
| 204  | HTTP No Content (OK) |
| 404  | HTTP Not Found       |
| 500  | HTTP Server Error    |

## Documentation Links

- [Full Deployment Strategy](./DEPLOYMENT_STRATEGY.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Script Documentation](../scripts/deploy/README.md)
- [Smoke Test Guide](../tests/smoke/README.md)

## Support Contacts

Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for emergency contact information.
