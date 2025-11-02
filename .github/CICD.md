# CI/CD Pipeline Documentation

This document provides detailed information about the CI/CD pipelines configured for this project.

## Overview

This project uses GitHub Actions to automate testing, building, and deployment processes. The pipelines are designed to work efficiently in both international and Chinese environments.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Trigger:** Pull requests and pushes to `main` or `develop` branches

**Purpose:** Ensure code quality and prevent bugs from being merged

**Steps:**
1. Checkout code
2. Setup pnpm with caching
3. Configure npm registry (supports China mirrors)
4. Install dependencies with frozen lockfile
5. Run format check
6. Run linting
7. Run type checking
8. Run unit tests for both apps
9. Run Lighthouse CI (if configured)
10. Upload test results as artifacts

**Cache Strategy:**
- Uses pnpm store caching to speed up installations
- Cache key based on `pnpm-lock.yaml` hash
- Fallback to partial matches for faster cold starts

**Timeout:** 15 minutes (configurable)

### 2. Build and Push Workflow (`build-and-push.yml`)

**Trigger:** 
- Pushes to `main` branch
- Version tags (`v*.*.*`)
- Manual workflow dispatch

**Purpose:** Build Docker images and publish to container registry

**Jobs:**

#### Job 1: Validate Stack
- Validates `docker-compose.yml` configuration
- Ensures deployment integrity before building images

#### Job 2: Build and Push Frontend
- Sets up Docker Buildx for multi-platform builds
- Builds frontend Docker image
- Runs Trivy security scan
- Uploads security findings to GitHub Security tab
- Pushes to GHCR (if credentials configured)
- Generates deployment instructions

#### Job 3: Build and Push CMS
- Same process as frontend but for CMS image
- Independent job for parallel execution

#### Job 4: Deployment Summary
- Generates comprehensive deployment documentation
- Lists built images and required secrets
- Provides deployment commands

**Image Tagging Strategy:**
- `latest` - Latest version from main branch
- `main-<sha>` - Specific commit on main branch
- `v1.0.0` - Semantic version from git tags
- `v1.0` - Major.minor version
- `v1` - Major version

## Configuration

### Required Secrets

Configure in **Settings → Secrets and variables → Actions → Secrets**

| Secret | Required | Purpose |
|--------|----------|---------|
| `GITHUB_TOKEN` | ✅ Yes | Automatically provided, used for pushing to GHCR |
| `LHCI_GITHUB_APP_TOKEN` | ❌ Optional | Lighthouse CI GitHub App integration |

**Note:** For `GITHUB_TOKEN` to work with GHCR, ensure package write permissions are enabled:
- Go to **Settings → Actions → General**
- Under "Workflow permissions", select "Read and write permissions"

### Repository Variables

Configure in **Settings → Secrets and variables → Actions → Variables**

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `USE_CHINA_MIRROR` | ❌ Optional | `false` | Set to `true` to use Taobao npm mirror |
| `CHINA_REGISTRY_URL` | ❌ Optional | - | Custom container registry URL for China |

### Environment Variables in Workflows

#### CI Workflow
- `NODE_VERSION`: Node.js version (currently `20`)
- `PNPM_VERSION`: pnpm version (currently `10.19.0`)

#### Build Workflow
- `REGISTRY`: Container registry URL (defaults to `ghcr.io`)
- `IMAGE_FRONTEND`: Frontend image name
- `IMAGE_CMS`: CMS image name

## China-Specific Optimizations

### NPM Registry Mirror

When `USE_CHINA_MIRROR=true`:
```bash
pnpm config set registry https://registry.npmmirror.com
```

This significantly speeds up dependency installation in China.

### Container Registry Mirror

Configure `CHINA_REGISTRY_URL` variable to use a domestic container registry:
- Aliyun Container Registry: `registry.cn-hangzhou.aliyuncs.com`
- Tencent Cloud Container Registry: `ccr.ccs.tencentyun.com`
- Huawei Cloud SWR: `swr.cn-north-4.myhuaweicloud.com`

## Security Scanning

### Trivy Vulnerability Scanner

All built images are scanned for security vulnerabilities:
- Scans for Critical and High severity issues
- Results uploaded to GitHub Security tab
- Can be viewed under **Security → Code scanning**

### Best Practices
- Review security findings regularly
- Update base images frequently
- Keep dependencies up to date
- Monitor security advisories

## Deployment

### Manual Deployment

After images are built and pushed:

```bash
# Authenticate with GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull images
docker pull ghcr.io/YOUR_ORG/YOUR_REPO/frontend:latest
docker pull ghcr.io/YOUR_ORG/YOUR_REPO/cms:latest

# Deploy
docker compose up -d

# Check status
docker compose ps
docker compose logs -f
```

### Production Deployment

For production, use specific version tags:

```bash
# Pull specific version
docker pull ghcr.io/YOUR_ORG/YOUR_REPO/frontend:v1.0.0
docker pull ghcr.io/YOUR_ORG/YOUR_REPO/cms:v1.0.0

# Update docker-compose.yml to use specific versions
# Then deploy
docker compose up -d
```

### Environment Variables

Ensure these environment variables are set on your deployment server:

**Frontend:**
- `NUXT_PUBLIC_API_BASE_URL`
- `NUXT_PUBLIC_STRAPI_URL`
- `NUXT_STRAPI_API_TOKEN`
- `NUXT_STRAPI_URL`

**CMS:**
- `DATABASE_CLIENT`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `APP_KEYS`

## Troubleshooting

### CI Failures

#### Lint Errors
```bash
# Run locally to fix
pnpm lint:fix
```

#### Type Errors
```bash
# Check types locally
pnpm typecheck
```

#### Test Failures
```bash
# Run tests locally
pnpm test
```

### Build Failures

#### Docker Build Fails
- Check Dockerfile syntax
- Verify all COPY paths exist
- Ensure .dockerignore doesn't exclude required files

#### Push Fails
- Verify GITHUB_TOKEN has package write permissions
- Check if you're authenticated with the registry
- Ensure repository name is correct in workflow

### Deployment Issues

#### Container Won't Start
```bash
# Check logs
docker compose logs cms
docker compose logs frontend

# Verify environment variables
docker compose config
```

#### Database Connection Issues
- Ensure postgres container is healthy
- Check database credentials
- Verify network connectivity

## Performance Optimization

### Cache Efficiency

The workflows use multiple caching strategies:
1. **pnpm store cache**: Speeds up dependency installation
2. **Docker layer cache**: Reuses unchanged layers
3. **GitHub Actions cache**: Persists between workflow runs

### Build Time Optimization

- Dependencies are installed only once using pnpm workspaces
- Docker BuildKit for faster builds
- Multi-stage builds to reduce image size
- Parallel job execution where possible

## Monitoring and Alerting

### Workflow Status

Monitor workflow runs:
- **Actions tab**: View all workflow runs
- **CI badges**: Display status in README
- **Email notifications**: Configure in GitHub settings

### Security Alerts

Security scan results are available at:
- **Security tab → Code scanning**
- Review and triage findings regularly

## Local Testing

### Test CI Workflow Locally

Using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or download from releases

# Run CI workflow
act pull_request

# Run specific job
act -j lint-and-test
```

### Test Docker Builds Locally

```bash
# Build frontend
docker build -f apps/frontend/Dockerfile -t frontend:test .

# Build CMS
docker build -f apps/cms/Dockerfile -t cms:test ./apps/cms

# Test with docker-compose
docker compose up --build
```

## Maintenance

### Updating Workflows

When updating workflows:
1. Test changes in a feature branch
2. Review workflow run results
3. Update documentation
4. Merge to main after approval

### Dependency Updates

Regular updates are important for security:
```bash
# Update dependencies
pnpm update --latest

# Rebuild lock file
pnpm install --frozen-lockfile

# Test thoroughly before committing
pnpm test
```

### Action Version Updates

Keep GitHub Actions up to date:
- Review Dependabot PRs for action updates
- Test updated actions in feature branches
- Check for breaking changes in action changelogs

## Cost Optimization

### GitHub Actions Minutes

- Public repositories: Unlimited
- Private repositories: 2,000 minutes/month (free tier)

**Tips to reduce usage:**
- Use caching effectively
- Set appropriate timeouts
- Skip unnecessary jobs with conditionals
- Use `continue-on-error` for optional steps

### Storage Costs

**Artifacts:**
- Automatically deleted after 7 days
- Adjust retention based on needs

**Container Images:**
- Clean up old images regularly
- Use image lifecycle policies
- Consider retention limits for tags

## Support and Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy)
- [pnpm Documentation](https://pnpm.io/)

## Contributing

When contributing to CI/CD:
1. Test changes thoroughly
2. Document new configurations
3. Update this file
4. Seek review from maintainers
