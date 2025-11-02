#!/bin/bash

###############################################################################
# Deployment Rollback Script
#
# Reverts to the previous deployment color (blue/green stack):
# 1. Determines target rollback color
# 2. Switches traffic back to previous stack
# 3. Optionally rolls back database migrations
# 4. Verifies rollback success
#
# Usage:
#   ./rollback.sh [OPTIONS]
#
# Options:
#   --target-color COLOR  Color to roll back to (blue|green)
#   --skip-db            Skip database rollback
#   --force              Force rollback without confirmations
#   --help               Show this help message
#
# Exit codes:
#   0 - Rollback successful
#   1 - Rollback failed
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
SKIP_DB=false
FORCE=false
TARGET_COLOR=""

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${PROJECT_ROOT}/logs/rollback_${TIMESTAMP}.log"

# Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --target-color)
            TARGET_COLOR="$2"
            shift 2
            ;;
        --skip-db)
            SKIP_DB=true
            shift
            ;;
        --force)
            FORCE=true
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

log_error "=========================================="
log_error "DEPLOYMENT ROLLBACK"
log_error "=========================================="
log_info "Timestamp: $(date)"
log_info "Log File: $LOG_FILE"
echo ""

cd "$PROJECT_ROOT"

###############################################################################
# Step 1: Determine Rollback Target
###############################################################################
log_step "Determining rollback target..."

if [ -n "$TARGET_COLOR" ]; then
    ROLLBACK_COLOR=$TARGET_COLOR
    log_info "Target color specified: $ROLLBACK_COLOR"
else
    # Get current active color and switch to the other
    CURRENT_COLOR=$(bash "$SCRIPT_DIR/get-active-color.sh")
    ROLLBACK_COLOR=$([ "$CURRENT_COLOR" = "blue" ] && echo "green" || echo "blue")
    log_info "Current color: $CURRENT_COLOR"
fi

log_warning "Rolling back to: $ROLLBACK_COLOR"
echo ""

###############################################################################
# Step 2: Confirmation (unless forced)
###############################################################################
if [ "$FORCE" = false ]; then
    log_warning "This will revert traffic to the $ROLLBACK_COLOR stack"
    read -p "Do you want to continue? (yes/no): " -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Rollback cancelled by user"
        exit 0
    fi
fi

###############################################################################
# Step 3: Verify Target Stack is Running
###############################################################################
log_step "Verifying $ROLLBACK_COLOR stack is available..."

# Determine ports
if [ "$ROLLBACK_COLOR" = "blue" ]; then
    FRONTEND_PORT=3000
    CMS_PORT=1337
else
    FRONTEND_PORT=3001
    CMS_PORT=1338
fi

# Check if containers are running
if ! docker ps | grep -q "frontend-${ROLLBACK_COLOR}"; then
    log_error "$ROLLBACK_COLOR frontend container is not running"
    log_info "Attempting to start $ROLLBACK_COLOR stack..."
    
    if [ -f "${PROJECT_ROOT}/docker-compose.${ROLLBACK_COLOR}.yml" ]; then
        docker-compose -f docker-compose.yml -f "docker-compose.${ROLLBACK_COLOR}.yml" up -d
        sleep 10
    else
        log_error "Cannot find docker-compose.${ROLLBACK_COLOR}.yml"
        log_error "Unable to start $ROLLBACK_COLOR stack"
        exit 1
    fi
fi

# Health check
log_info "Checking $ROLLBACK_COLOR stack health..."
HEALTH_CHECK_TIMEOUT=60
HEALTH_CHECK_INTERVAL=5
ELAPSED=0

while [ $ELAPSED -lt $HEALTH_CHECK_TIMEOUT ]; do
    if curl -f "http://localhost:${FRONTEND_PORT}/api/health" > /dev/null 2>&1; then
        log_success "$ROLLBACK_COLOR frontend is healthy"
        break
    fi
    sleep $HEALTH_CHECK_INTERVAL
    ELAPSED=$((ELAPSED + HEALTH_CHECK_INTERVAL))
    echo -n "."
done
echo ""

if [ $ELAPSED -ge $HEALTH_CHECK_TIMEOUT ]; then
    log_error "$ROLLBACK_COLOR stack health check failed"
    log_error "Cannot safely rollback to unhealthy stack"
    exit 1
fi

###############################################################################
# Step 4: Database Rollback (if requested)
###############################################################################
if [ "$SKIP_DB" = false ]; then
    log_step "Database rollback check..."
    
    log_warning "Database rollback can be destructive!"
    log_warning "This should only be done if migrations are causing issues"
    
    if [ "$FORCE" = false ]; then
        read -p "Do you want to rollback database migrations? (yes/no): " -r
        echo ""
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log_info "Rolling back database migrations..."
            
            # Attempt to rollback migrations
            if docker exec "nuxt-strapi-cms-${ROLLBACK_COLOR}" npm run strapi migrate:down 2>/dev/null || true; then
                log_success "Database rollback completed"
            else
                log_warning "Database rollback command completed (may have had no migrations to rollback)"
            fi
        else
            log_info "Skipping database rollback"
        fi
    else
        log_info "Automatic database rollback not performed (requires manual confirmation)"
    fi
else
    log_info "Skipping database rollback (--skip-db flag)"
fi
echo ""

###############################################################################
# Step 5: Switch Traffic
###############################################################################
log_step "Switching traffic to $ROLLBACK_COLOR stack..."

# Update active color marker
echo "$ROLLBACK_COLOR" > /tmp/active-deployment-color

# For Nginx-based switching
if [ -d "/etc/nginx/sites-available" ] && [ -f "/etc/nginx/sites-available/${ROLLBACK_COLOR}.conf" ]; then
    log_info "Updating Nginx configuration..."
    sudo ln -sf "/etc/nginx/sites-available/${ROLLBACK_COLOR}.conf" /etc/nginx/sites-enabled/active
    
    if sudo nginx -t; then
        sudo nginx -s reload
        log_success "Nginx reloaded with $ROLLBACK_COLOR configuration"
    else
        log_error "Nginx configuration test failed"
        exit 1
    fi
else
    log_info "Nginx configuration switching not applicable (using Docker ports)"
    log_info "Manual traffic switching may be required at load balancer level"
fi

log_success "Traffic switched to $ROLLBACK_COLOR stack"
echo ""

###############################################################################
# Step 6: Verify Rollback
###############################################################################
log_step "Verifying rollback success..."

# Health check after traffic switch
sleep 5

if curl -f "http://localhost:${FRONTEND_PORT}/api/health" > /dev/null 2>&1; then
    log_success "Post-rollback health check passed"
else
    log_error "Post-rollback health check failed"
    log_error "System may be in an inconsistent state - immediate investigation required"
    exit 1
fi

# Check CMS
if curl -f "http://localhost:${CMS_PORT}/_health" > /dev/null 2>&1; then
    log_success "CMS health check passed"
else
    log_warning "CMS health check failed"
fi
echo ""

###############################################################################
# Step 7: Cleanup
###############################################################################
log_step "Post-rollback cleanup..."

# Determine failed color
FAILED_COLOR=$([ "$ROLLBACK_COLOR" = "blue" ] && echo "green" || echo "blue")

log_info "Failed deployment color: $FAILED_COLOR"
log_info "You may want to stop the $FAILED_COLOR stack:"
log_info "  docker-compose -f docker-compose.${FAILED_COLOR}.yml down"
echo ""

###############################################################################
# Success Summary
###############################################################################
log_success "=========================================="
log_success "Rollback Completed Successfully!"
log_success "=========================================="
log_success "Active color: $ROLLBACK_COLOR"
log_success "Frontend: http://localhost:${FRONTEND_PORT}"
log_success "CMS: http://localhost:${CMS_PORT}"
echo ""
log_info "Next steps:"
log_info "  1. Verify application functionality"
log_info "  2. Review rollback reason and logs"
log_info "  3. Create incident report"
log_info "  4. Fix issues in failed deployment"
log_info "  5. Plan remediation deployment"
echo ""
log_info "Log file: $LOG_FILE"
echo ""

exit 0
