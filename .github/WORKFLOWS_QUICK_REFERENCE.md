# Workflow Quick Reference

Quick reference guide for developers working with the CI/CD pipelines.

## 🚦 Workflow Status

Check workflow status:
- **Repository Actions Tab**: https://github.com/YOUR_ORG/YOUR_REPO/actions
- **CI Badge**: Shows status of latest CI run
- **Build Badge**: Shows status of latest build

## ✅ Pre-commit Checklist

Before pushing code, run these locally:

```bash
# Format check
pnpm format:check

# Lint
pnpm lint

# Type check
pnpm typecheck

# Run tests
pnpm test
```

Fix any issues:
```bash
# Auto-fix formatting
pnpm format

# Auto-fix linting
pnpm lint:fix
```

## 🔄 When Workflows Run

### CI Workflow
**Triggers:**
- Opening a pull request
- Pushing to a pull request
- Pushing to `main` or `develop`

**Duration:** ~5-10 minutes (with cache)

### Build & Push Workflow
**Triggers:**
- Merging to `main`
- Pushing a version tag (e.g., `v1.0.0`)
- Manual dispatch from Actions tab

**Duration:** ~15-20 minutes

## 🏷️ Creating Releases

To create a new release with Docker images:

```bash
# Tag the commit
git tag v1.0.0
git push origin v1.0.0

# Or create via GitHub UI
# Releases → Draft a new release → Create new tag
```

The build workflow will automatically:
1. Build both images
2. Tag with version
3. Push to GHCR
4. Run security scans

## 🐛 Troubleshooting Failed Workflows

### CI Failures

#### "Lint failed"
```bash
pnpm lint:fix
git add .
git commit -m "fix: lint issues"
```

#### "Type check failed"
```bash
# Check what's failing
pnpm typecheck

# Fix issues and commit
```

#### "Tests failed"
```bash
# Run tests locally
pnpm test

# Or run for specific app
pnpm --filter frontend test
pnpm --filter cms test
```

### Build Failures

#### "Docker build failed"
Check the build logs in Actions tab for specific errors.

Common issues:
- Missing files in COPY commands
- Build-time dependency issues
- Out of memory (rare)

#### "Trivy scan blocked"
If security vulnerabilities are found:
1. Review the security findings
2. Update vulnerable dependencies
3. Rebuild and push

#### "Push to registry failed"
Check:
- GITHUB_TOKEN has package write permissions
- Repository permissions are correct
- You're not rate-limited

## 🔐 Secrets Configuration

### View Current Secrets
Settings → Secrets and variables → Actions → Secrets

### Required Secrets
- `GITHUB_TOKEN` - Auto-provided, check permissions

### Optional Secrets
- `LHCI_GITHUB_APP_TOKEN` - For Lighthouse CI

### Variables (Not Secrets)
Settings → Secrets and variables → Actions → Variables
- `USE_CHINA_MIRROR` - Set to `true` for China npm mirror
- `CHINA_REGISTRY_URL` - Custom registry URL

## 🇨🇳 China Mirror Setup

For faster builds in China:

1. Go to Settings → Secrets and variables → Actions → Variables
2. Click "New repository variable"
3. Add:
   - Name: `USE_CHINA_MIRROR`
   - Value: `true`

Optional: Add custom registry
- Name: `CHINA_REGISTRY_URL`
- Value: Your registry URL (e.g., `registry.cn-hangzhou.aliyuncs.com`)

## 📦 Pulling Published Images

```bash
# Authenticate
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Pull latest
docker pull ghcr.io/YOUR_ORG/YOUR_REPO/frontend:latest
docker pull ghcr.io/YOUR_ORG/YOUR_REPO/cms:latest

# Pull specific version
docker pull ghcr.io/YOUR_ORG/YOUR_REPO/frontend:v1.0.0
```

## 🧪 Testing Locally

### Test with act (GitHub Actions locally)

```bash
# Install act
brew install act  # macOS
# or download from https://github.com/nektos/act

# Run CI workflow
act pull_request

# Run specific job
act -j lint-and-test
```

### Test Docker Builds

```bash
# Build images locally
docker build -f apps/frontend/Dockerfile -t frontend:local .
docker build -f apps/cms/Dockerfile -t cms:local ./apps/cms

# Test with docker-compose
docker compose up --build
```

## 📊 Viewing Test Results

After CI runs:
1. Go to Actions tab
2. Click on the workflow run
3. Scroll to "Artifacts" section
4. Download "test-results" artifact

## 🔍 Security Scan Results

View security findings:
1. Go to Security tab
2. Click "Code scanning"
3. Filter by:
   - `category:frontend-image` - Frontend security issues
   - `category:cms-image` - CMS security issues

## ⚡ Speeding Up Workflows

Tips for faster workflow runs:

1. **Use cache effectively**: Cache is automatic, no action needed
2. **Fix lint/type errors locally**: Prevents CI from failing early
3. **Run tests before pushing**: Catch issues early
4. **Keep dependencies updated**: Reduces security scan time

## 📝 Workflow Logs

To view detailed logs:
1. Actions tab → Select workflow run
2. Click on job name
3. Expand steps to see logs
4. Use search (Cmd/Ctrl + F) to find specific messages

## 🔄 Re-running Workflows

To re-run a failed workflow:
1. Go to the failed workflow run
2. Click "Re-run jobs" dropdown
3. Select:
   - "Re-run failed jobs" - Only re-run what failed
   - "Re-run all jobs" - Start from scratch

## 📞 Getting Help

If workflows are consistently failing:
1. Check workflow logs for error messages
2. Review recent changes to workflow files
3. Consult `.github/CICD.md` for detailed documentation
4. Ask in team chat or create an issue

## 🛠️ Workflow Maintenance

### Updating Actions

When Dependabot creates PRs to update actions:
1. Review the changelog for breaking changes
2. Test in a feature branch if unsure
3. Approve and merge if tests pass

### Modifying Workflows

When modifying workflows:
1. Create a feature branch
2. Make changes to workflow files
3. Test with a pull request
4. Review workflow run results
5. Merge when everything passes

## 📚 Additional Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Full CI/CD Documentation](.github/CICD.md)
- [Project README](../README.md)
- [Docker Documentation](https://docs.docker.com/)
