# Blue/Green Deployment Strategy

## Overview

This document outlines the blue/green deployment strategy for the Nuxt 3 + Strapi CMS monorepo, designed to achieve zero-downtime releases with rapid rollback capabilities. The strategy supports both Docker-based deployments and Kubernetes orchestration.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Blue/Green Topology](#bluegreen-topology)
- [Database Migration Strategy](#database-migration-strategy)
- [Deployment Process](#deployment-process)
- [Rollback Procedures](#rollback-procedures)
- [Smoke Testing](#smoke-testing)
- [Canary vs. Full Cutover](#canary-vs-full-cutover)
- [Communication Protocols](#communication-protocols)
- [Monitoring and Verification](#monitoring-and-verification)
- [Timelines and Responsibilities](#timelines-and-responsibilities)

## Architecture Overview

### System Components

The application consists of three main services:

- **Frontend**: Nuxt 3 SSR application (port 3000)
- **CMS**: Strapi headless CMS (port 1337)
- **Database**: PostgreSQL database
- **Load Balancer**: Nginx reverse proxy (port 80/443)

### Blue/Green Architecture

```
                    ┌─────────────────┐
                    │   Nginx/LB      │
                    │  (Traffic Gate) │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ┌───────▼──────┐  ┌──────▼───────┐
            │  Blue Stack  │  │ Green Stack  │
            │              │  │              │
            │ Frontend:3000│  │Frontend:3001 │
            │ CMS:1337     │  │CMS:1338      │
            └──────┬───────┘  └──────┬───────┘
                   │                 │
                   └────────┬────────┘
                            │
                    ┌───────▼────────┐
                    │   PostgreSQL   │
                    │  (Shared DB)   │
                    └────────────────┘
```

## Blue/Green Topology

### Docker-based Deployment

#### Configuration

Two complete stacks run simultaneously using Docker Compose profiles:

**Blue Stack** (production):

- `frontend-blue` container (port 3000)
- `cms-blue` container (port 1337)

**Green Stack** (staging):

- `frontend-green` container (port 3001)
- `cms-green` container (port 1338)

#### Traffic Switching

Traffic is controlled via Nginx configuration symlinks:

```bash
/etc/nginx/sites-enabled/active -> /etc/nginx/sites-available/blue.conf
# or
/etc/nginx/sites-enabled/active -> /etc/nginx/sites-available/green.conf
```

### Kubernetes Deployment

#### Namespace-based Isolation

- `production-blue` namespace
- `production-green` namespace

#### Service and Ingress

```yaml
# Traffic switching via Ingress annotation
metadata:
  annotations:
    nginx.ingress.kubernetes.io/canary: 'false'
    deployment.color: 'blue' # or "green"
```

## Database Migration Strategy

### Principles

1. **Forward Compatibility**: All migrations must be backward compatible with the previous version
2. **Non-Breaking Changes**: Avoid destructive operations during cutover
3. **Feature Flags**: Use feature flags for schema changes that affect application logic
4. **Rollback Safety**: Maintain ability to rollback database changes

### Migration Guardrails

#### Safe Operations (Green Light)

- Adding new tables
- Adding nullable columns
- Adding indexes (with `CONCURRENTLY` for PostgreSQL)
- Creating new views
- Inserting reference data

#### Caution Operations (Yellow Light)

- Adding non-nullable columns (requires default value)
- Renaming columns (requires application code to support both names temporarily)
- Data type changes (requires migration path)

#### Dangerous Operations (Red Light)

- Dropping tables or columns (use deprecation period)
- Changing primary keys
- Altering critical constraints
- Large data transformations

### Migration Process

```bash
# 1. Review pending migrations
npm run migration:diff

# 2. Apply migrations in safe mode (with backup)
npm run migration:up:safe

# 3. Verify migration success
npm run migration:verify

# 4. If rollback needed
npm run migration:down
```

### Database Version Tracking

Maintain a `database_version` table to track compatibility:

```sql
CREATE TABLE database_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT NOW(),
  min_app_version VARCHAR(20),
  compatible_with VARCHAR(50)
);
```

## Deployment Process

### Phase 1: Pre-flight Checks (5-10 minutes)

**Automated Checks** (`scripts/deploy/preflight.sh`):

```bash
✓ Code quality (lint, format)
✓ Unit tests
✓ Environment validation (pnpm check:env)
✓ Smoke tests subset (critical paths)
✓ Database migration review
✓ Docker image builds successfully
✓ Security scans
```

**Manual Approval Gate**:

- Review deployment notes
- Verify rollback plan
- Confirm maintenance window
- Check monitoring dashboards

### Phase 2: Idle Stack Preparation (10-15 minutes)

1. **Determine Active Color**

   ```bash
   ACTIVE_COLOR=$(./scripts/deploy/get-active-color.sh)
   TARGET_COLOR=$([ "$ACTIVE_COLOR" = "blue" ] && echo "green" || echo "blue")
   ```

2. **Build and Tag Images**

   ```bash
   docker build -t app/frontend:${VERSION}-${TARGET_COLOR} ./apps/frontend
   docker build -t app/cms:${VERSION}-${TARGET_COLOR} ./apps/cms
   ```

3. **Deploy to Idle Stack**

   ```bash
   docker-compose --profile ${TARGET_COLOR} up -d
   ```

4. **Apply Database Migrations**
   ```bash
   docker-compose exec cms-${TARGET_COLOR} npm run strapi migration:run
   ```

### Phase 3: Verification (5-10 minutes)

1. **Health Checks**

   ```bash
   # Wait for services to be healthy
   timeout 300 bash -c 'until curl -f http://localhost:3001/api/health; do sleep 5; done'
   timeout 300 bash -c 'until curl -f http://localhost:1338/_health; do sleep 5; done'
   ```

2. **Smoke Tests**

   ```bash
   # Run smoke test suite against idle stack
   SMOKE_TEST_URL=http://localhost:3001 npm run test:smoke
   ```

3. **Integration Checks**
   - CMS API connectivity
   - Database queries
   - External service integrations
   - Asset loading

### Phase 4: Traffic Cutover (1-2 minutes)

**Docker Deployment**:

```bash
# Update Nginx configuration symlink
ln -sf /etc/nginx/sites-available/${TARGET_COLOR}.conf /etc/nginx/sites-enabled/active

# Reload Nginx (zero-downtime)
nginx -t && nginx -s reload
```

**Kubernetes Deployment**:

```bash
# Update Ingress to point to new service
kubectl patch ingress main-ingress -p '{"spec":{"rules":[{"host":"app.example.com","http":{"paths":[{"path":"/","backend":{"service":{"name":"frontend-'${TARGET_COLOR}'","port":{"number":3000}}}}]}}]}}'
```

### Phase 5: Post-Deployment (5-10 minutes)

1. **Live Smoke Tests**

   ```bash
   # Run smoke tests against live production URL
   npm run test:smoke -- --project=production
   ```

2. **Monitoring Verification**
   - Error rates < 0.1%
   - Response times < 500ms p95
   - No critical logs
   - Health checks passing

3. **Traffic Validation**
   - Confirm new version serving traffic
   - Check user sessions maintained
   - Verify WebSocket connections

## Rollback Procedures

### Automatic Rollback Triggers

The deployment process automatically rolls back if:

- Health checks fail after 5 minutes
- Smoke tests fail
- Error rate exceeds 1%
- Response time exceeds 2s p95

### Manual Rollback Process (2-3 minutes)

```bash
# 1. Execute rollback script
./scripts/deploy/rollback.sh [--target-color blue|green] [--skip-db]

# 2. Script performs:
#    - Switch Nginx back to previous color
#    - Reload Nginx
#    - Optionally rollback database migrations
#    - Verify health of previous version

# 3. Verify rollback success
curl http://localhost/api/health
curl http://localhost/api/version  # Should show previous version
```

### Database Rollback

**Safe Rollback** (migrations are backward compatible):

```bash
# No database changes needed, just revert traffic
./scripts/deploy/rollback.sh --skip-db
```

**Database Rollback Required**:

```bash
# Stop new version
docker-compose --profile green down

# Rollback migrations
docker-compose exec cms-blue npm run strapi migration:down

# Switch traffic back
./scripts/deploy/rollback.sh
```

### Post-Rollback Actions

1. **Incident Report**: Document rollback reason
2. **Monitoring**: Verify system stability
3. **Analysis**: Root cause analysis
4. **Fix Plan**: Schedule remediation deployment

## Smoke Testing

### Test Levels

**Critical Path Tests** (must pass for deployment):

- Homepage loads
- User authentication
- Content API responds
- CMS admin accessible
- Database connectivity

**Extended Smoke Tests** (warnings if fail):

- Search functionality
- Media uploads
- Third-party integrations
- Caching layers

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'smoke',
      testMatch: /.*\.smoke\.spec\.ts/,
      timeout: 30000,
      retries: 2,
    },
  ],
})
```

### Smoke Test Examples

```typescript
// tests/smoke/homepage.smoke.spec.ts
test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
  await expect(page).toHaveTitle(/Chinese Learning/)
})

// tests/smoke/api.smoke.spec.ts
test('CMS API responds', async ({ request }) => {
  const response = await request.get('/api/lessons')
  expect(response.status()).toBe(200)
})
```

## Canary vs. Full Cutover

### Decision Criteria

| Factor              | Full Cutover            | Canary Release                        |
| ------------------- | ----------------------- | ------------------------------------- |
| Change Scope        | Small, low-risk changes | Major features, significant refactors |
| Deployment Window   | Short (< 5 minutes)     | Extended (30-60 minutes)              |
| Rollback Complexity | Simple                  | Complex                               |
| Traffic Volume      | Low-medium              | High                                  |
| User Impact Risk    | Minimal                 | Moderate-High                         |
| Testing Coverage    | Comprehensive           | Partial or new features               |

### Full Blue/Green Cutover

**When to Use**:

- Bug fixes
- Performance improvements
- Dependency updates
- Configuration changes

**Process**:

1. Deploy to idle stack
2. Run full test suite
3. Switch 100% traffic at once
4. Monitor for 15 minutes
5. Decommission old stack after 24 hours

### Canary Deployment

**When to Use**:

- New features with uncertain impact
- Architecture changes
- Database schema modifications
- Third-party integration changes

**Process**:

1. Deploy to idle stack (green)
2. Route 5% of traffic to green
3. Monitor for 15 minutes
4. Increase to 25% if stable
5. Increase to 50% after 30 minutes
6. Full cutover to 100% if no issues

**Canary Implementation** (Nginx):

```nginx
# Split traffic using split_clients
split_clients "${remote_addr}${http_user_agent}${date_gmt}" $deployment_color {
    5%   green;
    *    blue;
}

upstream frontend_dynamic {
    server frontend-${deployment_color}:3000;
}
```

**Canary Implementation** (Kubernetes):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/canary: 'true'
    nginx.ingress.kubernetes.io/canary-weight: '5'
```

## Communication Protocols

### Pre-Deployment Communication (T-24 hours)

**Internal Notification** (via Slack/Email):

```
🚀 Deployment Scheduled

Environment: Production
Deployment Window: [Date] [Time] [Timezone]
Duration: ~30 minutes
Deployment Type: Blue/Green Full Cutover

Changes:
- [Feature 1]
- [Bug Fix 2]
- [Dependency Update]

Impact: Zero-downtime expected
Rollback Plan: Automated rollback available

Deploy Lead: [Name]
On-call Engineer: [Name]

Monitoring Dashboard: [URL]
Status Page: [URL]
```

**Customer Notification** (if needed):

```
Scheduled Maintenance: [Date] [Time]

We will be deploying improvements to our platform.
No downtime is expected.

If you experience any issues, please contact support.
```

### During Deployment

**Status Updates** (every 5 minutes):

```
✅ T+0:  Preflight checks complete
✅ T+5:  Green stack deployed
✅ T+10: Smoke tests passed
✅ T+12: Traffic cutover complete
✅ T+15: Monitoring stable - deployment successful
```

### Post-Deployment Communication

**Success Notification**:

```
✅ Deployment Complete

Environment: Production
Duration: 15 minutes
Status: Successful

New Version: v1.2.3
Active Color: Green

All health checks passing
Monitoring: [Dashboard URL]
```

**Rollback Notification**:

```
⚠️ Deployment Rolled Back

Environment: Production
Reason: [Smoke tests failed / High error rate / Health check timeout]

Action Taken: Traffic reverted to blue stack (v1.2.2)
Current Status: System stable

Next Steps: Root cause analysis in progress
Follow-up: Post-incident review scheduled
```

### Communication Channels

1. **Internal Team**: Slack `#deployments` channel
2. **Engineering Leadership**: Email summary
3. **On-call**: PagerDuty alert for failures
4. **Status Page**: Public status updates (https://status.yourapp.com)
5. **Monitoring**: Datadog/Grafana annotations

### Status Page Updates

**Pre-Deployment**:

```bash
# Update status page
curl -X POST https://api.statuspage.io/v1/incidents \
  -d "name=Scheduled Deployment" \
  -d "status=scheduled" \
  -d "impact=none"
```

**During Deployment**:

```bash
# Update to in-progress
curl -X PATCH https://api.statuspage.io/v1/incidents/[ID] \
  -d "status=in_progress"
```

**Post-Deployment**:

```bash
# Mark as resolved
curl -X PATCH https://api.statuspage.io/v1/incidents/[ID] \
  -d "status=resolved"
```

## Monitoring and Verification

### Key Metrics

**Application Health**:

- HTTP 5xx error rate < 0.1%
- HTTP 4xx error rate < 2%
- Response time p95 < 500ms
- Response time p99 < 1000ms

**Infrastructure Health**:

- CPU usage < 70%
- Memory usage < 80%
- Disk usage < 85%
- Network latency < 50ms

**Business Metrics**:

- Active user sessions
- API request rate
- Content delivery success rate
- Search query performance

### Monitoring Dashboards

**Real-time Dashboard** (Grafana):

```
- Active deployment color indicator
- Error rates by service
- Response time percentiles
- Request throughput
- Database connection pool
- Cache hit rates
```

**Deployment Dashboard**:

```
- Deployment timeline
- Health check status
- Smoke test results
- Traffic split percentage (for canary)
- Version comparison metrics
```

### Alerting Rules

**Critical Alerts** (immediate action):

- Service down (health check fails)
- Error rate > 1%
- Database connection pool exhausted
- Disk usage > 90%

**Warning Alerts** (investigate):

- Response time > 1s p95
- Error rate > 0.5%
- Memory usage > 85%
- Unusual traffic patterns

### Log Aggregation

**Structured Logging**:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "deployment_color": "green",
  "version": "v1.2.3",
  "message": "Deployment health check passed",
  "metrics": {
    "response_time": 234,
    "error_rate": 0.001
  }
}
```

**Log Queries** (CloudWatch/ELK):

```
# Errors in last 5 minutes
deployment_color:green AND level:error AND @timestamp:[now-5m TO now]

# Deployment events
message:"deployment" AND @timestamp:[now-1h TO now]
```

## Timelines and Responsibilities

### Standard Deployment Timeline

| Time  | Phase       | Duration | Actions                          | Responsible       |
| ----- | ----------- | -------- | -------------------------------- | ----------------- |
| T-24h | Notice      | -        | Send deployment notification     | Release Manager   |
| T-1h  | Preparation | 15m      | Review checklist, verify backups | DevOps Engineer   |
| T-0   | Preflight   | 10m      | Run automated checks             | CI/CD System      |
| T+10m | Approval    | 5m       | Manual approval gate             | Tech Lead         |
| T+15m | Deploy      | 15m      | Deploy to green stack            | Deployment Script |
| T+30m | Verify      | 10m      | Smoke tests and health checks    | Automation        |
| T+40m | Cutover     | 2m       | Switch traffic to green          | Deployment Script |
| T+42m | Monitor     | 15m      | Active monitoring period         | On-call Engineer  |
| T+57m | Complete    | 3m       | Send success notification        | Release Manager   |

### Canary Deployment Timeline

| Time  | Phase    | Traffic % | Duration | Actions                   |
| ----- | -------- | --------- | -------- | ------------------------- |
| T-0   | Deploy   | 0%        | 15m      | Deploy to green stack     |
| T+15m | Canary   | 5%        | 15m      | Route 5% traffic to green |
| T+30m | Expand   | 25%       | 15m      | Increase to 25%           |
| T+45m | Majority | 50%       | 15m      | Increase to 50%           |
| T+60m | Full     | 100%      | -        | Complete cutover          |

### Roles and Responsibilities

**Release Manager**:

- Coordinate deployment schedule
- Communicate with stakeholders
- Manage deployment checklist
- Post-deployment reporting

**DevOps Engineer**:

- Execute deployment scripts
- Monitor infrastructure metrics
- Handle rollbacks if needed
- Update configuration

**Tech Lead**:

- Code review and approval
- Manual approval gate
- Technical decisions during issues
- Post-mortem facilitation

**On-call Engineer**:

- Monitor alerts during deployment
- First responder for issues
- Execute emergency procedures
- Escalate to Tech Lead if needed

**QA Engineer**:

- Verify smoke test coverage
- Manual testing (if needed)
- Regression validation
- Sign-off on deployment

### Emergency Contacts

```yaml
Release Manager: [Name] - [Phone] - [Slack: @handle]
DevOps Lead: [Name] - [Phone] - [Slack: @handle]
Tech Lead: [Name] - [Phone] - [Slack: @handle]
On-call Engineer: PagerDuty escalation
Infrastructure Lead: [Name] - [Phone]
```

### Deployment Checklist

#### Pre-Deployment

- [ ] All tests passing in CI
- [ ] Database backup completed
- [ ] Rollback plan documented
- [ ] Monitoring dashboards ready
- [ ] On-call engineer notified
- [ ] Deployment notification sent
- [ ] Environment variables verified
- [ ] Docker images built and scanned

#### During Deployment

- [ ] Preflight checks passed
- [ ] Green stack deployed successfully
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] Smoke tests passed
- [ ] Manual approval obtained
- [ ] Traffic cutover executed
- [ ] Monitoring shows healthy metrics

#### Post-Deployment

- [ ] Live smoke tests passed
- [ ] Error rates normal
- [ ] Response times normal
- [ ] User sessions maintained
- [ ] Success notification sent
- [ ] Deployment tagged in git
- [ ] Blue stack marked for decommission
- [ ] Post-deployment report written

## Appendix

### Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - General deployment guide
- [DOCKER.md](./DOCKER.md) - Docker configuration
- [MONITORING.md](./MONITORING.md) - Monitoring setup
- [CI/CD Workflow](../.github/workflows/ci.yml) - GitHub Actions configuration

### Deployment Scripts Reference

- `scripts/deploy/preflight.sh` - Pre-deployment checks
- `scripts/deploy/blue-green-deploy.sh` - Main deployment orchestration
- `scripts/deploy/rollback.sh` - Rollback procedures
- `scripts/deploy/post-deploy-verify.sh` - Post-deployment verification
- `scripts/deploy/get-active-color.sh` - Determine active deployment color

### Configuration Files

- `config/nginx/blue.conf` - Nginx configuration for blue stack
- `config/nginx/green.conf` - Nginx configuration for green stack
- `docker-compose.blue.yml` - Docker Compose for blue stack
- `docker-compose.green.yml` - Docker Compose for green stack

### Version History

| Version | Date       | Changes                                | Author      |
| ------- | ---------- | -------------------------------------- | ----------- |
| 1.0     | 2024-01-15 | Initial blue/green deployment strategy | DevOps Team |
