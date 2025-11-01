# Deployment Scripts

This directory contains scripts for managing blue/green deployments with zero-downtime and automated rollback capabilities.

## Overview

The deployment process uses a blue/green strategy where two identical production environments (blue and green) exist. At any time, one environment serves production traffic while the other is idle. New deployments go to the idle environment, which is then tested before traffic is switched over.

## Scripts

### `preflight.sh`

Runs comprehensive pre-deployment checks to ensure the system is ready for deployment.

**Checks performed:**
- Code quality (lint, format, typecheck)
- Unit tests
- Environment variable validation
- Docker image builds
- Database migration review
- Security audit
- Build verification

**Usage:**
```bash
./scripts/deploy/preflight.sh
```

**Exit codes:**
- `0` - All checks passed
- `1` - One or more checks failed

**Logs:**
- `logs/preflight_TIMESTAMP.log`

---

### `get-active-color.sh`

Determines which deployment stack (blue or green) is currently serving production traffic.

**Detection methods (in order):**
1. Nginx symlink (`/etc/nginx/sites-enabled/active`)
2. Environment variable (`$ACTIVE_DEPLOYMENT_COLOR`)
3. Marker file (`/tmp/active-deployment-color`)
4. Running Docker containers
5. Default to blue if unable to determine

**Usage:**
```bash
ACTIVE_COLOR=$(./scripts/deploy/get-active-color.sh)
echo "Active deployment color: $ACTIVE_COLOR"
```

**Output:**
- `blue` or `green`

---

### `blue-green-deploy.sh`

Main deployment orchestration script that performs zero-downtime blue/green deployment.

**Process:**
1. Determine active and target deployment colors
2. Create database backup
3. Build Docker images with version tags
4. Deploy to idle stack
5. Run database migrations
6. Wait for health checks to pass
7. Run post-deployment verification
8. Switch traffic to new stack
9. Monitor post-cutover metrics

**Usage:**
```bash
# Basic deployment
./scripts/deploy/blue-green-deploy.sh

# Deploy specific version
./scripts/deploy/blue-green-deploy.sh --version v1.2.3

# Force deployment to specific color
./scripts/deploy/blue-green-deploy.sh --target-color green

# Skip database migrations
./scripts/deploy/blue-green-deploy.sh --skip-migrations

# Dry run (show what would be done)
./scripts/deploy/blue-green-deploy.sh --dry-run
```

**Options:**
- `--version VERSION` - Docker image version tag (default: git commit sha)
- `--target-color COLOR` - Force deployment to specific color (blue|green)
- `--skip-migrations` - Skip database migrations
- `--skip-health-check` - Skip health check wait (not recommended)
- `--dry-run` - Show what would be done without executing
- `--help` - Show help message

**Environment variables:**
- `DEPLOYMENT_ENV` - Deployment environment (default: production)
- `CONTAINER_REGISTRY` - Docker registry URL
- `DATABASE_BACKUP` - Enable database backup (default: true)

**Logs:**
- `logs/deployment_TIMESTAMP.log`

**Automatic rollback:**
The script automatically triggers rollback if:
- Health checks fail
- Post-deployment verification fails
- Timeout waiting for services

---

### `rollback.sh`

Reverts deployment to the previous stack in case of issues.

**Process:**
1. Determine target rollback color
2. Verify target stack is healthy
3. Optionally rollback database migrations
4. Switch traffic back to previous stack
5. Verify rollback success

**Usage:**
```bash
# Interactive rollback (with confirmations)
./scripts/deploy/rollback.sh

# Rollback to specific color
./scripts/deploy/rollback.sh --target-color blue

# Skip database rollback
./scripts/deploy/rollback.sh --skip-db

# Force rollback without confirmations
./scripts/deploy/rollback.sh --force
```

**Options:**
- `--target-color COLOR` - Color to roll back to (blue|green)
- `--skip-db` - Skip database rollback
- `--force` - Force rollback without confirmations
- `--help` - Show help message

**Logs:**
- `logs/rollback_TIMESTAMP.log`

**⚠️ Warning:**
Database rollbacks can be destructive. Only perform database rollback if migrations are causing issues.

---

### `post-deploy-verify.sh`

Runs comprehensive verification checks after deployment to ensure the system is functioning correctly.

**Checks performed:**
- Frontend health endpoint
- CMS health endpoint
- Homepage loading
- API endpoints
- Database connectivity
- Response time validation
- Docker container health
- Playwright smoke tests (if configured)

**Usage:**
```bash
# Verify specific deployment color
./scripts/deploy/post-deploy-verify.sh --target-color green --frontend-port 3001 --cms-port 1338

# Skip Playwright tests
./scripts/deploy/post-deploy-verify.sh --skip-playwright

# Verbose output
./scripts/deploy/post-deploy-verify.sh --verbose
```

**Options:**
- `--target-color COLOR` - Color to verify (blue|green)
- `--frontend-port PORT` - Frontend port (default: 3000)
- `--cms-port PORT` - CMS port (default: 1337)
- `--skip-playwright` - Skip Playwright tests
- `--verbose` - Enable verbose output
- `--help` - Show help message

**Logs:**
- `logs/verification_TIMESTAMP.log`
- `logs/verification_TIMESTAMP_report.json` (machine-readable report)

**Exit codes:**
- `0` - All verifications passed
- `1` - One or more verifications failed

---

## Deployment Workflow

### Standard Deployment

```bash
# 1. Run preflight checks
./scripts/deploy/preflight.sh

# 2. Review output and ensure all checks pass

# 3. Execute deployment
./scripts/deploy/blue-green-deploy.sh --version v1.2.3

# 4. Monitor logs and verify success

# 5. After 24 hours, decommission old stack
docker-compose -f docker-compose.blue.yml down
```

### Emergency Rollback

```bash
# Quick rollback without database changes
./scripts/deploy/rollback.sh --force --skip-db

# Verify rollback success
curl http://localhost/api/health
```

### CI/CD Integration

These scripts are integrated into the GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`).

The automated deployment process:
1. Runs preflight checks
2. Waits for manual approval (if configured)
3. Executes blue/green deployment
4. Runs smoke tests
5. Automatically rolls back on failure
6. Uploads deployment artifacts and logs

---

## Port Configuration

### Blue Stack
- Frontend: `3000`
- CMS: `1337`

### Green Stack
- Frontend: `3001`
- CMS: `1338`

### Shared Services
- PostgreSQL: `5432`
- Redis: `6379`
- Nginx: `80`, `443`

---

## Directory Structure

```
scripts/deploy/
├── README.md                    # This file
├── preflight.sh                 # Pre-deployment checks
├── get-active-color.sh          # Determine active deployment
├── blue-green-deploy.sh         # Main deployment script
├── rollback.sh                  # Rollback script
└── post-deploy-verify.sh        # Post-deployment verification

logs/                            # Deployment logs (created automatically)
├── preflight_*.log
├── deployment_*.log
├── verification_*.log
├── verification_*.json
└── rollback_*.log

backups/                         # Database backups (created automatically)
└── db_*.sql

config/nginx/
├── blue.conf                    # Nginx config for blue stack
└── green.conf                   # Nginx config for green stack

docker-compose.blue.yml          # Generated during deployment
docker-compose.green.yml         # Generated during deployment
```

---

## Configuration

### Required Environment Variables

For deployment to work, ensure these environment variables are set:

```bash
# Database
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=<secure-password>

# Strapi secrets
APP_KEYS=<app-keys>
API_TOKEN_SALT=<api-token-salt>
ADMIN_JWT_SECRET=<admin-jwt-secret>
TRANSFER_TOKEN_SALT=<transfer-token-salt>
JWT_SECRET=<jwt-secret>

# Nuxt configuration
NUXT_STRAPI_API_TOKEN=<api-token>
NUXT_PUBLIC_API_BASE_URL=http://cms:1337
```

### Optional Configuration

```bash
# Deployment settings
DEPLOYMENT_ENV=production
CONTAINER_REGISTRY=ghcr.io
DATABASE_BACKUP=true

# Active color (determined automatically if not set)
ACTIVE_DEPLOYMENT_COLOR=blue
```

---

## Monitoring

### Health Endpoints

- **Frontend:** `http://localhost:3000/api/health` (blue) or `http://localhost:3001/api/health` (green)
- **CMS:** `http://localhost:1337/_health` (blue) or `http://localhost:1338/_health` (green)
- **Nginx:** `http://localhost/health`

### Logs

All deployment operations are logged to the `logs/` directory with timestamps. Review these logs when troubleshooting issues.

### Container Status

```bash
# Check running containers
docker ps

# Check container health
docker ps --filter "health=healthy"

# View container logs
docker logs nuxt-strapi-frontend-blue
docker logs nuxt-strapi-cms-green
```

---

## Troubleshooting

### Health Checks Timeout

If health checks timeout during deployment:
1. Check container logs: `docker logs <container-name>`
2. Verify environment variables are set correctly
3. Ensure database is accessible
4. Check port conflicts

### Database Migration Failures

If migrations fail:
1. Review migration files in `database/migrations/`
2. Check database connectivity
3. Verify migration compatibility
4. Consider rolling back: `./scripts/deploy/rollback.sh`

### Traffic Not Switching

If traffic doesn't switch to new stack:
1. Verify Nginx configuration
2. Check Nginx logs: `docker logs nuxt-strapi-nginx`
3. Manually test endpoints: `curl http://localhost:3000/api/health`
4. Verify active color marker: `cat /tmp/active-deployment-color`

### Rollback Not Working

If rollback fails:
1. Check if target stack containers are running
2. Manually start target stack: `docker-compose -f docker-compose.blue.yml up -d`
3. Manually switch Nginx config
4. Verify health endpoints

---

## Security Considerations

1. **Secrets Management:** Never commit secrets to version control. Use environment variables or secret management tools.

2. **Database Backups:** Always maintain recent backups before deployment. Backups are created automatically but verify they exist.

3. **Access Control:** Limit who can execute deployment scripts. Use CI/CD with approval gates for production deployments.

4. **Audit Logs:** All deployment actions are logged. Review logs regularly and retain them for compliance.

5. **Network Security:** Ensure proper firewall rules and network segmentation between environments.

---

## Best Practices

1. **Always Run Preflight:** Never skip preflight checks. They catch issues before deployment.

2. **Test in Staging:** Always test deployment process in staging environment first.

3. **Monitor Actively:** Watch metrics and logs during and after deployment for at least 30 minutes.

4. **Keep Old Stack Running:** Don't decommission the old stack immediately. Wait 24 hours to ensure stability.

5. **Document Changes:** Update deployment documentation when making changes to the process.

6. **Regular Drills:** Practice rollback procedures regularly to ensure team readiness.

7. **Database Migrations:** Make migrations backward-compatible when possible. Use feature flags for breaking changes.

8. **Communication:** Always communicate deployment plans to the team and stakeholders.

---

## Additional Resources

- [DEPLOYMENT_STRATEGY.md](../../docs/DEPLOYMENT_STRATEGY.md) - Comprehensive deployment strategy documentation
- [DEPLOYMENT.md](../../docs/DEPLOYMENT.md) - General deployment guide
- [DOCKER.md](../../docs/DOCKER.md) - Docker configuration guide
- [MONITORING.md](../../docs/MONITORING.md) - Monitoring and observability setup

---

## Support

For issues or questions about deployment:
1. Check troubleshooting section above
2. Review deployment logs in `logs/` directory
3. Consult the team documentation
4. Contact DevOps team

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial blue/green deployment implementation |
