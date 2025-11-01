# Docker Compose Deployment Checklist

Use this checklist to ensure successful deployment of the Nuxt + Strapi + PostgreSQL stack.

## Pre-Deployment

### Environment Setup
- [ ] Docker installed (>= 20.10)
- [ ] Docker Compose installed (>= 2.0)
- [ ] Repository cloned
- [ ] All required files present (run `scripts/test-deployment.sh`)

### Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Generate strong `DATABASE_PASSWORD`
- [ ] Generate all Strapi secrets (APP_KEYS, JWT secrets, etc.)
- [ ] Set `NUXT_STRAPI_API_TOKEN` (after Strapi setup)
- [ ] Configure Baidu API keys (if needed)
- [ ] Review and adjust ports (if conflicts exist)

### Security
- [ ] All secrets are strong and unique
- [ ] `.env` file is in `.gitignore`
- [ ] No secrets in code or compose files
- [ ] Firewall rules configured (production)
- [ ] SSL certificates obtained (production)

## Development Deployment

### Setup
- [ ] Run `docker compose config` to validate
- [ ] Start stack: `docker compose up -d`
- [ ] Wait for all services to be healthy
- [ ] Check status: `docker compose ps`

### Verification
- [ ] PostgreSQL is running and healthy
- [ ] Strapi CMS accessible at http://localhost:1337
- [ ] Frontend accessible at http://localhost:3000
- [ ] No error logs: `docker compose logs`

### Strapi Configuration
- [ ] Create first admin user at http://localhost:1337/admin
- [ ] Configure content types
- [ ] Generate API token (Settings → API Tokens)
- [ ] Add token to `.env` as `NUXT_STRAPI_API_TOKEN`
- [ ] Restart frontend: `docker compose restart frontend`
- [ ] Configure permissions (Settings → Roles)

### Testing
- [ ] Frontend can fetch data from Strapi
- [ ] Database persists data (test by restarting)
- [ ] Upload files work and persist
- [ ] Health endpoints respond correctly

## Staging Deployment

### Configuration
- [ ] Create `.env.staging` with staging values
- [ ] Create `docker-compose.staging.yml` if needed
- [ ] Update domain/URLs for staging environment
- [ ] Configure staging database

### Deployment
- [ ] Validate: `docker compose -f docker-compose.yml -f docker-compose.staging.yml config`
- [ ] Deploy: `docker compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d`
- [ ] Verify all services are healthy
- [ ] Run smoke tests

## Production Deployment

### Pre-Production
- [ ] All secrets rotated and unique
- [ ] SSL certificates obtained and configured
- [ ] Domain DNS configured correctly
- [ ] Backup and disaster recovery plan documented
- [ ] Monitoring and alerting set up
- [ ] Load testing completed
- [ ] Security audit completed

### Infrastructure
- [ ] Firewall rules configured (only necessary ports)
- [ ] Database backups automated
- [ ] Log aggregation configured
- [ ] Health monitoring set up
- [ ] CDN configured (if using)

### Configuration
- [ ] Create `.env.production` with production values
- [ ] Create `docker-compose.prod.yml` with production settings
- [ ] Configure nginx reverse proxy
- [ ] Enable SSL/HTTPS
- [ ] Set resource limits
- [ ] Configure restart policies

### Deployment
- [ ] Validate: `docker compose -f docker-compose.yml -f docker-compose.prod.yml config`
- [ ] Build images: `docker compose -f docker-compose.yml -f docker-compose.prod.yml build`
- [ ] Deploy with nginx: `docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile nginx up -d`
- [ ] Verify all services are healthy
- [ ] Test SSL certificate
- [ ] Run full integration tests

### Post-Deployment
- [ ] Verify frontend loads correctly
- [ ] Verify Strapi admin accessible
- [ ] Test API endpoints
- [ ] Check logs for errors
- [ ] Verify backups are running
- [ ] Monitor performance metrics
- [ ] Document any issues or deviations

## China Deployment

### Pre-Deployment
- [ ] Docker registry mirrors configured
- [ ] NPM registry mirror configured (.npmrc)
- [ ] CDN configured for China (domestic provider)
- [ ] Baidu API keys obtained and configured
- [ ] Cloud provider account set up (Aliyun/Tencent/Huawei)

### Configuration
- [ ] Create `docker-compose.china.yml`
- [ ] Use domestic Docker registry images
- [ ] Configure NPM_REGISTRY build arg
- [ ] Set BAIDU_API_KEY and BAIDU_SECRET_KEY
- [ ] Configure CDN_URL to domestic CDN

### Deployment
- [ ] Deploy: `docker compose -f docker-compose.yml -f docker-compose.china.yml up -d`
- [ ] Verify registry pulls are fast
- [ ] Test Baidu API integration
- [ ] Verify CDN serving assets correctly

## Optional Services

### Nginx Reverse Proxy
- [ ] nginx configuration files created
- [ ] SSL certificates in `./ssl/` directory
- [ ] HTTPS server block configured
- [ ] Deploy: `docker compose --profile nginx up -d`
- [ ] Test: `curl -I http://localhost` or `https://yourdomain.com`

### CMS Worker (Cron Jobs)
- [ ] Worker scripts prepared
- [ ] Deploy: `docker compose --profile worker up -d`
- [ ] Verify worker is running
- [ ] Check worker logs

## Maintenance

### Regular Tasks
- [ ] Monitor service health daily
- [ ] Review logs weekly
- [ ] Update services monthly
- [ ] Rotate secrets quarterly
- [ ] Test backups monthly
- [ ] Security updates as needed

### Backup Procedures
- [ ] Database backup: `docker compose exec postgres pg_dump -U strapi strapi > backup.sql`
- [ ] Uploads backup: `docker compose exec cms tar czf /tmp/uploads.tar.gz /opt/app/public/uploads`
- [ ] Verify backup integrity
- [ ] Test restore procedure

### Updates
- [ ] Pull latest changes: `git pull`
- [ ] Review changelog
- [ ] Validate config: `docker compose config`
- [ ] Pull images: `docker compose pull`
- [ ] Update: `docker compose up -d`
- [ ] Verify all services healthy
- [ ] Test functionality

## Rollback Plan

### If Deployment Fails
1. [ ] Stop services: `docker compose down`
2. [ ] Check logs: `docker compose logs`
3. [ ] Review configuration changes
4. [ ] Restore previous version: `git checkout <previous-commit>`
5. [ ] Restore database from backup if needed
6. [ ] Restart: `docker compose up -d`
7. [ ] Document issue for post-mortem

## Validation Commands

```bash
# Test deployment configuration
bash scripts/test-deployment.sh

# Validate docker-compose syntax
docker compose config

# Check service status
docker compose ps

# View logs
docker compose logs -f

# Check healthchecks
docker compose ps --format json | jq '.[] | {name: .Name, health: .Health}'

# Test endpoints
curl http://localhost:3000/
curl http://localhost:1337/_health
curl http://localhost:1337/api
```

## Troubleshooting

If issues occur, check:
- [ ] Service logs: `docker compose logs [service]`
- [ ] Environment variables set correctly
- [ ] Ports not conflicting
- [ ] Volumes have correct permissions
- [ ] Network connectivity between services
- [ ] Database connection from CMS
- [ ] API connection from frontend

## Documentation

Keep these documents updated:
- [ ] `.env.example` - all variables documented
- [ ] `docs/deployment/docker-compose.md` - deployment guide
- [ ] `DOCKER_QUICK_START.md` - quick reference
- [ ] This checklist for your environment

## Sign-Off

Deployment completed by: ________________  
Date: ________________  
Environment: ________________  
Version/Tag: ________________  

Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**For detailed instructions, see [docs/deployment/docker-compose.md](../docs/deployment/docker-compose.md)**
