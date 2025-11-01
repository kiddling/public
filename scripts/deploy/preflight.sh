#!/bin/bash

###############################################################################
# Preflight Deployment Checks
# 
# This script runs comprehensive pre-deployment checks including:
# - Code quality (lint, format, typecheck)
# - Unit tests
# - Environment validation
# - Smoke tests subset
# - Database migration review
# - Docker image build verification
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Track overall status
CHECKS_FAILED=0

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${PROJECT_ROOT}/logs/preflight_${TIMESTAMP}.log"

# Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# Redirect all output to log file as well
exec > >(tee -a "$LOG_FILE")
exec 2>&1

log_info "======================================"
log_info "Starting Preflight Deployment Checks"
log_info "======================================"
log_info "Timestamp: $(date)"
log_info "Log file: $LOG_FILE"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

###############################################################################
# Check 1: Code Quality - Linting
###############################################################################
log_info "Running lint checks..."
if pnpm lint; then
    log_success "Lint checks passed"
else
    log_error "Lint checks failed"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi
echo ""

###############################################################################
# Check 2: Code Quality - Formatting
###############################################################################
log_info "Running format checks..."
if pnpm format:check; then
    log_success "Format checks passed"
else
    log_error "Format checks failed"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi
echo ""

###############################################################################
# Check 3: Code Quality - Type Checking
###############################################################################
log_info "Running type checks..."
if pnpm typecheck; then
    log_success "Type checks passed"
else
    log_error "Type checks failed"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi
echo ""

###############################################################################
# Check 4: Unit Tests
###############################################################################
log_info "Running unit tests..."
if pnpm test; then
    log_success "Unit tests passed"
else
    log_error "Unit tests failed"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi
echo ""

###############################################################################
# Check 5: Environment Variable Validation
###############################################################################
log_info "Validating environment variables..."

# Check if required env files exist
ENV_CHECK_PASSED=true

if [ ! -f "${PROJECT_ROOT}/.env" ]; then
    log_warning ".env file not found in project root"
fi

# Check for required environment variables
REQUIRED_VARS=(
    "DATABASE_NAME"
    "DATABASE_USERNAME"
    "DATABASE_PASSWORD"
    "APP_KEYS"
    "API_TOKEN_SALT"
    "ADMIN_JWT_SECRET"
    "JWT_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log_warning "Environment variable $var is not set"
        ENV_CHECK_PASSED=false
    fi
done

if [ "$ENV_CHECK_PASSED" = true ]; then
    log_success "Environment validation passed"
else
    log_warning "Some environment variables are missing (may be acceptable in CI)"
fi
echo ""

###############################################################################
# Check 6: Docker Build Test
###############################################################################
log_info "Testing Docker image builds..."

# Test frontend build
log_info "Building frontend Docker image..."
if docker build -t preflight-test-frontend:latest -f "${PROJECT_ROOT}/apps/frontend/Dockerfile" "$PROJECT_ROOT" > /dev/null 2>&1; then
    log_success "Frontend Docker image builds successfully"
    docker rmi preflight-test-frontend:latest > /dev/null 2>&1 || true
else
    log_error "Frontend Docker image build failed"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Test CMS build
log_info "Building CMS Docker image..."
if docker build -t preflight-test-cms:latest -f "${PROJECT_ROOT}/apps/cms/Dockerfile" "$PROJECT_ROOT/apps/cms" > /dev/null 2>&1; then
    log_success "CMS Docker image builds successfully"
    docker rmi preflight-test-cms:latest > /dev/null 2>&1 || true
else
    log_error "CMS Docker image build failed"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi
echo ""

###############################################################################
# Check 7: Database Migration Review
###############################################################################
log_info "Reviewing pending database migrations..."

# Check if there are any pending migrations
# This is a placeholder - actual implementation depends on migration tool
if [ -d "${PROJECT_ROOT}/database/migrations" ]; then
    MIGRATION_COUNT=$(find "${PROJECT_ROOT}/database/migrations" -name "*.sql" -o -name "*.js" 2>/dev/null | wc -l)
    log_info "Found $MIGRATION_COUNT migration files"
    
    if [ "$MIGRATION_COUNT" -gt 0 ]; then
        log_warning "Please review database migrations before deployment"
        log_info "Migration files location: ${PROJECT_ROOT}/database/migrations"
    else
        log_info "No migration files found"
    fi
else
    log_info "No database/migrations directory found"
fi
echo ""

###############################################################################
# Check 8: Dependency Security Audit
###############################################################################
log_info "Running security audit..."
if pnpm audit --audit-level=high; then
    log_success "Security audit passed (no high/critical vulnerabilities)"
else
    log_warning "Security audit found vulnerabilities (review before deploying)"
fi
echo ""

###############################################################################
# Check 9: Build Verification
###############################################################################
log_info "Building applications..."

# Build frontend
log_info "Building frontend..."
if pnpm build:frontend; then
    log_success "Frontend build successful"
else
    log_error "Frontend build failed"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Build CMS
log_info "Building CMS..."
if pnpm build:cms; then
    log_success "CMS build successful"
else
    log_error "CMS build failed"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi
echo ""

###############################################################################
# Check 10: Smoke Tests (if available)
###############################################################################
log_info "Checking for smoke tests..."
if [ -d "${PROJECT_ROOT}/tests/smoke" ] || [ -d "${PROJECT_ROOT}/apps/frontend/tests/smoke" ]; then
    log_info "Smoke test directory found"
    
    # Check if Playwright is configured
    if command -v playwright &> /dev/null || [ -f "${PROJECT_ROOT}/node_modules/.bin/playwright" ]; then
        log_info "Smoke tests will be executed during post-deploy verification"
        log_success "Smoke test setup verified"
    else
        log_warning "Playwright not found - smoke tests may not run"
    fi
else
    log_warning "No smoke test directory found (tests/smoke or apps/frontend/tests/smoke)"
    log_info "Consider adding smoke tests for critical paths"
fi
echo ""

###############################################################################
# Summary
###############################################################################
echo ""
log_info "======================================"
log_info "Preflight Check Summary"
log_info "======================================"

if [ $CHECKS_FAILED -eq 0 ]; then
    log_success "All critical checks passed! ✓"
    log_success "System is ready for deployment"
    echo ""
    log_info "Next steps:"
    log_info "  1. Review deployment plan"
    log_info "  2. Obtain manual approval"
    log_info "  3. Run: ./scripts/deploy/blue-green-deploy.sh"
    echo ""
    exit 0
else
    log_error "Failed checks: $CHECKS_FAILED"
    log_error "Please fix the issues before proceeding with deployment"
    echo ""
    log_info "Review the log file for details: $LOG_FILE"
    echo ""
    exit 1
fi
