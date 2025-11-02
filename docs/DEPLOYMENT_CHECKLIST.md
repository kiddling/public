# Deployment Checklist

This checklist ensures all necessary steps are completed for a successful production deployment using the blue/green strategy.

> **🚀 Production Readiness**: For comprehensive go-live preparation including security, compliance, and performance baselines, see [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

## Pre-Deployment (T-24 hours)

### Communication

- [ ] Schedule deployment window and notify team
- [ ] Communicate deployment to stakeholders
- [ ] Update status page with scheduled maintenance
- [ ] Confirm on-call engineer availability
- [ ] Send deployment notification via Slack/email

### Preparation

- [ ] Review all changes since last deployment
- [ ] Verify all required approvals obtained
- [ ] Review database migration scripts
- [ ] Confirm rollback plan is documented
- [ ] Check monitoring dashboards are accessible
- [ ] Verify backup systems are operational

### Environment

- [ ] Confirm all required secrets are configured
- [ ] Verify environment variables are up to date
- [ ] Test SSH access to deployment servers (if applicable)
- [ ] Confirm Docker registry credentials are valid
- [ ] Check available disk space on servers

## Pre-Flight Checks (T-1 hour)

### Code Quality

- [ ] All CI/CD pipeline tests passing
- [ ] Code review approved by tech lead
- [ ] No critical security vulnerabilities
- [ ] Lint checks passing
- [ ] Type checks passing
- [ ] Unit tests passing

### Infrastructure

- [ ] Database backup completed successfully
- [ ] Verify database backup is restorable
- [ ] Check system resources (CPU, memory, disk)
- [ ] Verify load balancer health
- [ ] Confirm monitoring is capturing metrics

### Documentation

- [ ] CHANGELOG.md updated with version changes
- [ ] Deployment notes documented
- [ ] Known issues documented
- [ ] Rollback procedure reviewed

## Deployment Execution (T-0)

### Phase 1: Preflight (10 minutes)

- [ ] Run `pnpm deploy:preflight` or `./scripts/deploy/preflight.sh`
- [ ] Review preflight check results
- [ ] All checks passing (no critical failures)
- [ ] Docker images build successfully
- [ ] Environment validation passed

### Phase 2: Manual Approval Gate

- [ ] Tech lead approval obtained
- [ ] Deployment window confirmed
- [ ] Team ready for monitoring
- [ ] Rollback plan reviewed
- [ ] Go/no-go decision: **GO** ☐ / **NO-GO** ☐

### Phase 3: Deployment (15-20 minutes)

- [ ] Execute `pnpm deploy:blue-green` or `./scripts/deploy/blue-green-deploy.sh`
- [ ] Idle stack deployed successfully
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] Post-deployment verification passed
- [ ] Traffic cutover completed
- [ ] Active deployment color: **BLUE** ☐ / **GREEN** ☐

### Phase 4: Verification (15 minutes)

- [ ] Run `pnpm deploy:verify` or `./scripts/deploy/post-deploy-verify.sh`
- [ ] Frontend health endpoint responding
- [ ] CMS health endpoint responding
- [ ] Homepage loads successfully
- [ ] API endpoints accessible
- [ ] Database connectivity verified
- [ ] Smoke tests passing

## Post-Deployment (T+15 minutes)

### Monitoring

- [ ] Error rates < 0.1%
- [ ] Response times < 500ms p95
- [ ] No critical alerts firing
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%
- [ ] Database connections healthy

### Functional Testing

- [ ] User authentication working
- [ ] Content API responding correctly
- [ ] CMS admin accessible
- [ ] Search functionality working
- [ ] Media uploads working
- [ ] Key user flows functioning

### Application Metrics

- [ ] Active user sessions maintained
- [ ] Request throughput normal
- [ ] Cache hit rates normal
- [ ] WebSocket connections stable
- [ ] Third-party integrations working

## Extended Monitoring (T+1 hour)

### Stability Checks

- [ ] No increase in error rates
- [ ] Response times stable
- [ ] Memory leaks absent
- [ ] Database performance normal
- [ ] Log patterns normal

### User Experience

- [ ] No user-reported issues
- [ ] Support ticket volume normal
- [ ] User session metrics healthy
- [ ] Page load times acceptable

## Cleanup (T+24 hours)

### Decommission Old Stack

- [ ] New stack stable for 24 hours
- [ ] No rollback needed
- [ ] Stop old stack containers
- [ ] Clean up old Docker images
- [ ] Archive old deployment logs

### Documentation

- [ ] Update deployment log
- [ ] Document any issues encountered
- [ ] Update runbook if needed
- [ ] Post-deployment report written
- [ ] Team retrospective scheduled (if needed)

## Rollback Procedure (If Needed)

### Immediate Actions

- [ ] Decision to rollback made
- [ ] Team notified of rollback
- [ ] Execute `pnpm deploy:rollback --force --skip-db`
- [ ] Verify traffic switched back
- [ ] Confirm old stack healthy

### Verification

- [ ] Health endpoints responding
- [ ] Error rates returned to normal
- [ ] User sessions maintained
- [ ] Core functionality working
- [ ] Monitoring shows stability

### Post-Rollback

- [ ] Incident report created
- [ ] Root cause analysis initiated
- [ ] Fix plan developed
- [ ] Stakeholders notified
- [ ] Status page updated

## Communication Templates

### Pre-Deployment Notification

```
🚀 Production Deployment Scheduled

Date: [DATE]
Time: [TIME] [TIMEZONE]
Duration: ~30 minutes
Type: Blue/Green Zero-Downtime

Changes:
- [Change 1]
- [Change 2]

Impact: No downtime expected
Rollback: Automated rollback available

Contact: [NAME] via [SLACK/PHONE]
```

### Deployment In Progress

```
⏳ Deployment in progress (T+[X]m)

Status: [Green stack deployed / Health checks passed / Traffic cutover]
Current Phase: [Phase name]
Issues: None / [Issue description]

Next Update: T+[X]m
```

### Deployment Success

```
✅ Deployment Completed Successfully

Version: [VERSION]
Duration: [X] minutes
Active Color: [blue/green]

All systems operational
Monitoring: [Dashboard URL]
```

### Rollback Notification

```
⚠️ Deployment Rolled Back

Reason: [Reason]
Action: Traffic reverted to [color] stack
Status: System stable

Next Steps:
- Root cause analysis
- Fix implementation
- Rescheduled deployment

Incident Report: [URL]
```

## Emergency Contacts

| Role             | Name            | Contact          |
| ---------------- | --------------- | ---------------- |
| Release Manager  | [Name]          | [Phone/Slack]    |
| DevOps Lead      | [Name]          | [Phone/Slack]    |
| Tech Lead        | [Name]          | [Phone/Slack]    |
| On-Call Engineer | Check PagerDuty | [PagerDuty Link] |
| Database Admin   | [Name]          | [Phone/Slack]    |

## Key URLs

- **Production Frontend:** https://your-domain.com
- **CMS Admin:** https://your-domain.com/admin
- **Health Endpoint:** https://your-domain.com/api/health
- **Monitoring Dashboard:** [Grafana/Datadog URL]
- **Log Aggregation:** [CloudWatch/ELK URL]
- **Status Page:** https://status.your-domain.com
- **Deployment Docs:** [GitHub/Wiki URL]

## Notes

- This checklist should be completed for every production deployment
- Document any deviations from the checklist
- Update the checklist as processes evolve
- Keep a copy of completed checklists for audit trail
- Review checklist items during post-deployment retrospectives

## Version History

| Version | Date       | Changes                      | Author      |
| ------- | ---------- | ---------------------------- | ----------- |
| 1.0     | 2024-01-15 | Initial deployment checklist | DevOps Team |

---

**Deployment Date:** ******\_\_\_******  
**Deployment Lead:** ******\_\_\_******  
**Version Deployed:** ******\_\_\_******  
**Deployment Color:** BLUE ☐ / GREEN ☐  
**Overall Status:** SUCCESS ☐ / ROLLBACK ☐

**Signatures:**

- Tech Lead: ******\_\_\_******
- DevOps Lead: ******\_\_\_******
- Release Manager: ******\_\_\_******
