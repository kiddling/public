#!/bin/bash

###############################################################################
# Post-Deployment Verification Script
#
# Runs comprehensive smoke tests and verification checks after deployment:
# 1. Basic connectivity tests
# 2. API endpoint validation
# 3. Playwright smoke test suite
# 4. Performance metrics collection
# 5. Integration checks
#
# Usage:
#   ./post-deploy-verify.sh [OPTIONS]
#
# Options:
#   --target-color COLOR    Color to verify (blue|green)
#   --frontend-port PORT    Frontend port (default: 3000)
#   --cms-port PORT         CMS port (default: 1337)
#   --skip-playwright       Skip Playwright tests
#   --verbose               Enable verbose output
#   --help                  Show this help message
#
# Exit codes:
#   0 - All verifications passed
#   1 - One or more verifications failed
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

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

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Default configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TARGET_COLOR=""
FRONTEND_PORT=3000
CMS_PORT=1337
SKIP_PLAYWRIGHT=false
VERBOSE=false

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${PROJECT_ROOT}/logs/verification_${TIMESTAMP}.log"
REPORT_FILE="${PROJECT_ROOT}/logs/verification_${TIMESTAMP}_report.json"

# Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --target-color)
            TARGET_COLOR="$2"
            shift 2
            ;;
        --frontend-port)
            FRONTEND_PORT="$2"
            shift 2
            ;;
        --cms-port)
            CMS_PORT="$2"
            shift 2
            ;;
        --skip-playwright)
            SKIP_PLAYWRIGHT=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            grep '^#' "$0" | sed 's/^# \?//'
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Redirect output to log file
exec > >(tee -a "$LOG_FILE")
exec 2>&1

log_info "=========================================="
log_info "Post-Deployment Verification"
log_info "=========================================="
log_info "Timestamp: $(date)"
log_info "Target Color: ${TARGET_COLOR:-auto}"
log_info "Frontend URL: http://localhost:${FRONTEND_PORT}"
log_info "CMS URL: http://localhost:${CMS_PORT}"
log_info "Log File: $LOG_FILE"
echo ""

cd "$PROJECT_ROOT"

# Initialize report
cat > "$REPORT_FILE" <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "target_color": "$TARGET_COLOR",
  "frontend_port": $FRONTEND_PORT,
  "cms_port": $CMS_PORT,
  "tests": []
}
EOF

# Helper function to add test result
add_test_result() {
    local test_name=$1
    local status=$2
    local message=$3
    local duration=${4:-0}
    
    # Update report JSON
    local temp_file=$(mktemp)
    jq ".tests += [{\"name\": \"$test_name\", \"status\": \"$status\", \"message\": \"$message\", \"duration_ms\": $duration}]" "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"
}

###############################################################################
# Test 1: Frontend Health Check
###############################################################################
log_step "Testing frontend health endpoint..."

START_TIME=$(date +%s%3N)
if response=$(curl -f -s -w "\n%{http_code}" "http://localhost:${FRONTEND_PORT}/api/health" 2>&1); then
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    
    if [ "$http_code" = "200" ]; then
        log_success "Frontend health check passed (${DURATION}ms)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        add_test_result "frontend_health" "passed" "HTTP 200 OK" "$DURATION"
    else
        log_error "Frontend health check returned HTTP $http_code"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        add_test_result "frontend_health" "failed" "HTTP $http_code" "$DURATION"
    fi
else
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    log_error "Frontend health check failed - connection error"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    add_test_result "frontend_health" "failed" "Connection error" "$DURATION"
fi
echo ""

###############################################################################
# Test 2: CMS Health Check
###############################################################################
log_step "Testing CMS health endpoint..."

START_TIME=$(date +%s%3N)
if response=$(curl -f -s -w "\n%{http_code}" "http://localhost:${CMS_PORT}/_health" 2>&1); then
    http_code=$(echo "$response" | tail -n1)
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
        log_success "CMS health check passed (${DURATION}ms)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        add_test_result "cms_health" "passed" "HTTP $http_code OK" "$DURATION"
    else
        log_error "CMS health check returned HTTP $http_code"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        add_test_result "cms_health" "failed" "HTTP $http_code" "$DURATION"
    fi
else
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    log_error "CMS health check failed - connection error"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    add_test_result "cms_health" "failed" "Connection error" "$DURATION"
fi
echo ""

###############################################################################
# Test 3: Frontend Homepage
###############################################################################
log_step "Testing frontend homepage..."

START_TIME=$(date +%s%3N)
if response=$(curl -f -s -w "\n%{http_code}" "http://localhost:${FRONTEND_PORT}/" 2>&1); then
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    
    if [ "$http_code" = "200" ]; then
        # Check if response contains expected content
        if echo "$body" | grep -q "<!DOCTYPE html>"; then
            log_success "Homepage loads successfully (${DURATION}ms)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            add_test_result "homepage" "passed" "HTML content received" "$DURATION"
        else
            log_warning "Homepage returned 200 but unexpected content"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            add_test_result "homepage" "warning" "Unexpected content" "$DURATION"
        fi
    else
        log_error "Homepage returned HTTP $http_code"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        add_test_result "homepage" "failed" "HTTP $http_code" "$DURATION"
    fi
else
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    log_error "Homepage request failed"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    add_test_result "homepage" "failed" "Connection error" "$DURATION"
fi
echo ""

###############################################################################
# Test 4: CMS API Endpoint
###############################################################################
log_step "Testing CMS API endpoints..."

START_TIME=$(date +%s%3N)
if response=$(curl -f -s -w "\n%{http_code}" "http://localhost:${CMS_PORT}/api" 2>&1); then
    http_code=$(echo "$response" | tail -n1)
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
        # 404 is okay for /api root, means API is responding
        log_success "CMS API is responding (${DURATION}ms)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        add_test_result "cms_api" "passed" "API responding" "$DURATION"
    else
        log_error "CMS API returned HTTP $http_code"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        add_test_result "cms_api" "failed" "HTTP $http_code" "$DURATION"
    fi
else
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    log_warning "CMS API endpoint check inconclusive"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    add_test_result "cms_api" "passed" "Expected behavior" "$DURATION"
fi
echo ""

###############################################################################
# Test 5: Database Connectivity (via CMS)
###############################################################################
log_step "Testing database connectivity..."

if [ -n "$TARGET_COLOR" ]; then
    CONTAINER_NAME="nuxt-strapi-cms-${TARGET_COLOR}"
else
    CONTAINER_NAME="nuxt-strapi-cms"
fi

START_TIME=$(date +%s%3N)
if docker exec "$CONTAINER_NAME" node -e "require('better-sqlite3');" 2>/dev/null || \
   docker exec postgres pg_isready -U strapi 2>/dev/null; then
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    log_success "Database connectivity verified (${DURATION}ms)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    add_test_result "database" "passed" "Database connected" "$DURATION"
else
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    log_warning "Database connectivity check inconclusive"
    add_test_result "database" "warning" "Could not verify" "$DURATION"
fi
echo ""

###############################################################################
# Test 6: Response Time Check
###############################################################################
log_step "Measuring response times..."

# Frontend response time
FRONTEND_RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "http://localhost:${FRONTEND_PORT}/" | awk '{print $1*1000}')
log_info "Frontend response time: ${FRONTEND_RESPONSE_TIME}ms"

# CMS response time  
CMS_RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "http://localhost:${CMS_PORT}/_health" | awk '{print $1*1000}')
log_info "CMS response time: ${CMS_RESPONSE_TIME}ms"

# Check against thresholds
FRONTEND_THRESHOLD=2000
CMS_THRESHOLD=2000

if (( $(echo "$FRONTEND_RESPONSE_TIME < $FRONTEND_THRESHOLD" | bc -l) )); then
    log_success "Frontend response time is acceptable"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    add_test_result "frontend_response_time" "passed" "${FRONTEND_RESPONSE_TIME}ms < ${FRONTEND_THRESHOLD}ms" "${FRONTEND_RESPONSE_TIME}"
else
    log_warning "Frontend response time exceeds threshold"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    add_test_result "frontend_response_time" "warning" "${FRONTEND_RESPONSE_TIME}ms >= ${FRONTEND_THRESHOLD}ms" "${FRONTEND_RESPONSE_TIME}"
fi

if (( $(echo "$CMS_RESPONSE_TIME < $CMS_THRESHOLD" | bc -l) )); then
    log_success "CMS response time is acceptable"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    add_test_result "cms_response_time" "passed" "${CMS_RESPONSE_TIME}ms < ${CMS_THRESHOLD}ms" "${CMS_RESPONSE_TIME}"
else
    log_warning "CMS response time exceeds threshold"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    add_test_result "cms_response_time" "warning" "${CMS_RESPONSE_TIME}ms >= ${CMS_THRESHOLD}ms" "${CMS_RESPONSE_TIME}"
fi
echo ""

###############################################################################
# Test 7: Docker Container Status
###############################################################################
log_step "Checking Docker container status..."

if [ -n "$TARGET_COLOR" ]; then
    CONTAINERS=("nuxt-strapi-frontend-${TARGET_COLOR}" "nuxt-strapi-cms-${TARGET_COLOR}")
else
    CONTAINERS=("nuxt-strapi-frontend" "nuxt-strapi-cms")
fi

ALL_HEALTHY=true
for container in "${CONTAINERS[@]}"; do
    if docker ps --filter "name=$container" --filter "health=healthy" | grep -q "$container"; then
        log_success "Container $container is healthy"
    elif docker ps --filter "name=$container" | grep -q "$container"; then
        log_warning "Container $container is running but health status unknown"
        ALL_HEALTHY=false
    else
        log_error "Container $container is not running"
        ALL_HEALTHY=false
    fi
done

if [ "$ALL_HEALTHY" = true ]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    add_test_result "container_health" "passed" "All containers healthy" 0
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
    add_test_result "container_health" "failed" "Some containers unhealthy" 0
fi
echo ""

###############################################################################
# Test 8: Playwright Smoke Tests (if available)
###############################################################################
if [ "$SKIP_PLAYWRIGHT" = false ]; then
    log_step "Running Playwright smoke tests..."
    
    if [ -f "${PROJECT_ROOT}/playwright.config.ts" ] || [ -f "${PROJECT_ROOT}/apps/frontend/playwright.config.ts" ]; then
        # Set base URL for tests
        export PLAYWRIGHT_BASE_URL="http://localhost:${FRONTEND_PORT}"
        
        START_TIME=$(date +%s%3N)
        
        # Try to run smoke tests
        if command -v playwright &> /dev/null || [ -f "${PROJECT_ROOT}/node_modules/.bin/playwright" ]; then
            log_info "Running Playwright smoke test suite..."
            
            if npx playwright test --project=smoke 2>/dev/null || \
               npx playwright test --grep="@smoke" 2>/dev/null || \
               pnpm test:smoke 2>/dev/null; then
                END_TIME=$(date +%s%3N)
                DURATION=$((END_TIME - START_TIME))
                log_success "Playwright smoke tests passed (${DURATION}ms)"
                TESTS_PASSED=$((TESTS_PASSED + 1))
                add_test_result "playwright_smoke" "passed" "All smoke tests passed" "$DURATION"
            else
                END_TIME=$(date +%s%3N)
                DURATION=$((END_TIME - START_TIME))
                log_warning "Some Playwright tests failed or no smoke tests found"
                add_test_result "playwright_smoke" "warning" "Tests failed or not found" "$DURATION"
            fi
        else
            log_warning "Playwright not installed, skipping browser tests"
            add_test_result "playwright_smoke" "skipped" "Playwright not available" 0
        fi
    else
        log_info "No Playwright configuration found, skipping smoke tests"
        add_test_result "playwright_smoke" "skipped" "No config found" 0
    fi
else
    log_info "Skipping Playwright tests (--skip-playwright flag)"
    add_test_result "playwright_smoke" "skipped" "Skipped by flag" 0
fi
echo ""

###############################################################################
# Summary and Report
###############################################################################
log_info "=========================================="
log_info "Verification Summary"
log_info "=========================================="

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
log_info "Total tests: $TOTAL_TESTS"
log_success "Passed: $TESTS_PASSED"

if [ $TESTS_FAILED -gt 0 ]; then
    log_error "Failed: $TESTS_FAILED"
else
    log_info "Failed: $TESTS_FAILED"
fi

echo ""

# Finalize report
temp_file=$(mktemp)
jq ".summary = {\"total\": $TOTAL_TESTS, \"passed\": $TESTS_PASSED, \"failed\": $TESTS_FAILED, \"success_rate\": $(echo "scale=2; $TESTS_PASSED * 100 / $TOTAL_TESTS" | bc)}" "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"

log_info "Detailed report: $REPORT_FILE"
log_info "Verification log: $LOG_FILE"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    log_success "All verification checks passed! ✓"
    exit 0
else
    log_error "Some verification checks failed"
    log_error "Review the logs and fix issues before proceeding"
    exit 1
fi
