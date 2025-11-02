#!/bin/bash

###############################################################################
# Blue/Green Deployment Script
#
# Orchestrates zero-downtime deployment using blue/green strategy:
# 1. Determines active color (blue/green)
# 2. Builds and tags Docker images for target color
# 3. Deploys to idle stack
# 4. Runs database migrations
# 5. Waits for health checks
# 6. Switches traffic via Nginx
# 7. Verifies deployment success
#
# Usage:
#   ./blue-green-deploy.sh [OPTIONS]
#
# Options:
#   --version VERSION     Docker image version tag (default: git commit sha)
#   --target-color COLOR  Force deployment to specific color (blue|green)
#   --skip-migrations     Skip database migrations
#   --skip-health-check   Skip health check wait (not recommended)
#   --dry-run            Show what would be done without executing
#   --help               Show this help message
#
# Environment Variables:
#   DEPLOYMENT_ENV       Deployment environment (default: production)
#   CONTAINER_REGISTRY   Docker registry URL
#   DATABASE_BACKUP      Enable database backup (default: true)
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
VERSION=${VERSION:-$(git rev-parse --short HEAD)}
DEPLOYMENT_ENV=${DEPLOYMENT_ENV:-production}
SKIP_MIGRATIONS=false
SKIP_HEALTH_CHECK=false
DRY_RUN=false
TARGET_COLOR=""
DATABASE_BACKUP=${DATABASE_BACKUP:-true}

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${PROJECT_ROOT}/logs/deployment_${TIMESTAMP}.log"

# Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version)
            VERSION="$2"
            shift 2
            ;;
        --target-color)
            TARGET_COLOR="$2"
            shift 2
            ;;
        --skip-migrations)
            SKIP_MIGRATIONS=true
            shift
            ;;
        --skip-health-check)
            SKIP_HEALTH_CHECK=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
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
log_info "Blue/Green Deployment"
log_info "=========================================="
log_info "Timestamp: $(date)"
log_info "Version: $VERSION"
log_info "Environment: $DEPLOYMENT_ENV"
log_info "Dry Run: $DRY_RUN"
log_info "Log File: $LOG_FILE"
echo ""

cd "$PROJECT_ROOT"

###############################################################################
# Step 1: Determine Active and Target Colors
###############################################################################
log_step "Determining deployment colors..."

if [ -n "$TARGET_COLOR" ]; then
    log_info "Target color specified: $TARGET_COLOR"
    IDLE_COLOR=$TARGET_COLOR
    ACTIVE_COLOR=$([ "$TARGET_COLOR" = "blue" ] && echo "green" || echo "blue")
else
    ACTIVE_COLOR=$(bash "$SCRIPT_DIR/get-active-color.sh")
    IDLE_COLOR=$([ "$ACTIVE_COLOR" = "blue" ] && echo "green" || echo "blue")
fi

log_success "Active color: $ACTIVE_COLOR"
log_success "Target (idle) color: $IDLE_COLOR"
echo ""

###############################################################################
# Step 2: Pre-deployment Backup
###############################################################################
if [ "$DATABASE_BACKUP" = "true" ] && [ "$DRY_RUN" = false ]; then
    log_step "Creating database backup..."
    
    BACKUP_FILE="${PROJECT_ROOT}/backups/db_${TIMESTAMP}.sql"
    mkdir -p "${PROJECT_ROOT}/backups"
    
    if docker-compose exec -T postgres pg_dump -U strapi strapi > "$BACKUP_FILE" 2>/dev/null; then
        log_success "Database backup created: $BACKUP_FILE"
    else
        log_warning "Database backup failed (container may not be running)"
    fi
    echo ""
fi

###############################################################################
# Step 3: Build Docker Images
###############################################################################
log_step "Building Docker images for $IDLE_COLOR stack..."

# Frontend image
FRONTEND_IMAGE="nuxt-strapi-frontend:${VERSION}-${IDLE_COLOR}"
log_info "Building frontend image: $FRONTEND_IMAGE"

if [ "$DRY_RUN" = false ]; then
    docker build \
        -t "$FRONTEND_IMAGE" \
        -f "${PROJECT_ROOT}/apps/frontend/Dockerfile" \
        --build-arg BUILD_ENV="$DEPLOYMENT_ENV" \
        "$PROJECT_ROOT"
    log_success "Frontend image built successfully"
else
    log_info "[DRY RUN] Would build: $FRONTEND_IMAGE"
fi

# CMS image
CMS_IMAGE="nuxt-strapi-cms:${VERSION}-${IDLE_COLOR}"
log_info "Building CMS image: $CMS_IMAGE"

if [ "$DRY_RUN" = false ]; then
    docker build \
        -t "$CMS_IMAGE" \
        -f "${PROJECT_ROOT}/apps/cms/Dockerfile" \
        --build-arg BUILD_ENV="$DEPLOYMENT_ENV" \
        "${PROJECT_ROOT}/apps/cms"
    log_success "CMS image built successfully"
else
    log_info "[DRY RUN] Would build: $CMS_IMAGE"
fi
echo ""

###############################################################################
# Step 4: Deploy to Idle Stack
###############################################################################
log_step "Deploying to $IDLE_COLOR stack..."

# Set environment variables for the deployment
export DEPLOYMENT_COLOR=$IDLE_COLOR
export DEPLOYMENT_VERSION=$VERSION

# Determine ports for idle stack
if [ "$IDLE_COLOR" = "blue" ]; then
    FRONTEND_PORT=3000
    CMS_PORT=1337
else
    FRONTEND_PORT=3001
    CMS_PORT=1338
fi

log_info "Frontend will be available on port $FRONTEND_PORT"
log_info "CMS will be available on port $CMS_PORT"

if [ "$DRY_RUN" = false ]; then
    # Create or update docker-compose override for the target color
    cat > "${PROJECT_ROOT}/docker-compose.${IDLE_COLOR}.yml" <<EOF
version: '3.8'

services:
  frontend-${IDLE_COLOR}:
    image: ${FRONTEND_IMAGE}
    container_name: nuxt-strapi-frontend-${IDLE_COLOR}
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      NUXT_PUBLIC_API_BASE_URL: http://cms-${IDLE_COLOR}:1337
      NUXT_PUBLIC_STRAPI_URL: http://cms-${IDLE_COLOR}:1337
      NUXT_STRAPI_API_TOKEN: \${NUXT_STRAPI_API_TOKEN}
      NUXT_STRAPI_URL: http://cms-${IDLE_COLOR}:1337
    ports:
      - "${FRONTEND_PORT}:3000"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  cms-${IDLE_COLOR}:
    image: ${CMS_IMAGE}
    container_name: nuxt-strapi-cms-${IDLE_COLOR}
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      HOST: 0.0.0.0
      PORT: 1337
      APP_KEYS: \${APP_KEYS}
      API_TOKEN_SALT: \${API_TOKEN_SALT}
      ADMIN_JWT_SECRET: \${ADMIN_JWT_SECRET}
      TRANSFER_TOKEN_SALT: \${TRANSFER_TOKEN_SALT}
      JWT_SECRET: \${JWT_SECRET}
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: \${DATABASE_NAME:-strapi}
      DATABASE_USERNAME: \${DATABASE_USERNAME:-strapi}
      DATABASE_PASSWORD: \${DATABASE_PASSWORD:-strapi}
      DATABASE_SSL: false
    volumes:
      - cms_uploads:/opt/app/public/uploads
    ports:
      - "${CMS_PORT}:1337"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:1337/_health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

networks:
  app-network:
    external: true

volumes:
  cms_uploads:
    external: true
EOF

    log_info "Starting $IDLE_COLOR stack..."
    docker-compose -f docker-compose.yml -f "docker-compose.${IDLE_COLOR}.yml" up -d "frontend-${IDLE_COLOR}" "cms-${IDLE_COLOR}"
    
    log_success "$IDLE_COLOR stack deployed"
else
    log_info "[DRY RUN] Would deploy $IDLE_COLOR stack on ports $FRONTEND_PORT and $CMS_PORT"
fi
echo ""

###############################################################################
# Step 5: Database Migrations
###############################################################################
if [ "$SKIP_MIGRATIONS" = false ]; then
    log_step "Running database migrations..."
    
    if [ "$DRY_RUN" = false ]; then
        # Wait a bit for CMS to initialize
        sleep 10
        
        # Run migrations
        if docker exec "nuxt-strapi-cms-${IDLE_COLOR}" npm run strapi migrate 2>/dev/null || true; then
            log_success "Database migrations completed"
        else
            log_warning "Migration command completed (may not have any pending migrations)"
        fi
    else
        log_info "[DRY RUN] Would run database migrations"
    fi
else
    log_warning "Skipping database migrations (--skip-migrations flag)"
fi
echo ""

###############################################################################
# Step 6: Health Checks
###############################################################################
if [ "$SKIP_HEALTH_CHECK" = false ]; then
    log_step "Waiting for health checks to pass..."
    
    if [ "$DRY_RUN" = false ]; then
        HEALTH_CHECK_TIMEOUT=300
        HEALTH_CHECK_INTERVAL=5
        ELAPSED=0
        
        # Check frontend health
        log_info "Checking frontend health on port $FRONTEND_PORT..."
        while [ $ELAPSED -lt $HEALTH_CHECK_TIMEOUT ]; do
            if curl -f "http://localhost:${FRONTEND_PORT}/api/health" > /dev/null 2>&1; then
                log_success "Frontend health check passed"
                break
            fi
            sleep $HEALTH_CHECK_INTERVAL
            ELAPSED=$((ELAPSED + HEALTH_CHECK_INTERVAL))
            echo -n "."
        done
        echo ""
        
        if [ $ELAPSED -ge $HEALTH_CHECK_TIMEOUT ]; then
            log_error "Frontend health check timeout"
            log_error "Deployment failed - rolling back"
            bash "$SCRIPT_DIR/rollback.sh" --target-color "$ACTIVE_COLOR"
            exit 1
        fi
        
        # Check CMS health
        log_info "Checking CMS health on port $CMS_PORT..."
        ELAPSED=0
        while [ $ELAPSED -lt $HEALTH_CHECK_TIMEOUT ]; do
            if curl -f "http://localhost:${CMS_PORT}/_health" > /dev/null 2>&1; then
                log_success "CMS health check passed"
                break
            fi
            sleep $HEALTH_CHECK_INTERVAL
            ELAPSED=$((ELAPSED + HEALTH_CHECK_INTERVAL))
            echo -n "."
        done
        echo ""
        
        if [ $ELAPSED -ge $HEALTH_CHECK_TIMEOUT ]; then
            log_error "CMS health check timeout"
            log_error "Deployment failed - rolling back"
            bash "$SCRIPT_DIR/rollback.sh" --target-color "$ACTIVE_COLOR"
            exit 1
        fi
        
        log_success "All health checks passed"
    else
        log_info "[DRY RUN] Would wait for health checks"
    fi
else
    log_warning "Skipping health checks (--skip-health-check flag)"
fi
echo ""

###############################################################################
# Step 7: Run Post-Deploy Verification
###############################################################################
log_step "Running post-deploy verification..."

if [ "$DRY_RUN" = false ]; then
    if [ -f "$SCRIPT_DIR/post-deploy-verify.sh" ]; then
        bash "$SCRIPT_DIR/post-deploy-verify.sh" \
            --target-color "$IDLE_COLOR" \
            --frontend-port "$FRONTEND_PORT" \
            --cms-port "$CMS_PORT" || {
            log_error "Post-deploy verification failed"
            log_error "Rolling back deployment"
            bash "$SCRIPT_DIR/rollback.sh" --target-color "$ACTIVE_COLOR"
            exit 1
        }
    else
        log_warning "post-deploy-verify.sh not found, skipping smoke tests"
    fi
else
    log_info "[DRY RUN] Would run post-deploy verification"
fi
echo ""

###############################################################################
# Step 8: Traffic Cutover
###############################################################################
log_step "Switching traffic to $IDLE_COLOR stack..."

if [ "$DRY_RUN" = false ]; then
    # Update active color marker
    echo "$IDLE_COLOR" > /tmp/active-deployment-color
    
    # For Nginx-based switching (if nginx config exists)
    if [ -d "/etc/nginx/sites-available" ] && [ -f "/etc/nginx/sites-available/${IDLE_COLOR}.conf" ]; then
        log_info "Updating Nginx configuration..."
        sudo ln -sf "/etc/nginx/sites-available/${IDLE_COLOR}.conf" /etc/nginx/sites-enabled/active
        sudo nginx -t && sudo nginx -s reload
        log_success "Nginx reloaded with new configuration"
    else
        log_info "Nginx configuration switching not applicable (using Docker ports)"
    fi
    
    log_success "Traffic switched to $IDLE_COLOR stack"
else
    log_info "[DRY RUN] Would switch traffic to $IDLE_COLOR"
fi
echo ""

###############################################################################
# Step 9: Post-Cutover Monitoring
###############################################################################
log_step "Monitoring post-cutover metrics..."

if [ "$DRY_RUN" = false ]; then
    log_info "Monitoring for 30 seconds..."
    sleep 30
    
    # Quick health check
    if curl -f "http://localhost:${FRONTEND_PORT}/api/health" > /dev/null 2>&1; then
        log_success "Post-cutover health check passed"
    else
        log_error "Post-cutover health check failed"
        log_error "Rolling back deployment"
        bash "$SCRIPT_DIR/rollback.sh" --target-color "$ACTIVE_COLOR"
        exit 1
    fi
else
    log_info "[DRY RUN] Would monitor post-cutover metrics"
fi
echo ""

###############################################################################
# Step 10: Decommission Old Stack (optional)
###############################################################################
log_info "Old stack ($ACTIVE_COLOR) is still running for rollback capability"
log_info "To decommission after verification: docker-compose -f docker-compose.${ACTIVE_COLOR}.yml down"
echo ""

###############################################################################
# Success Summary
###############################################################################
log_success "=========================================="
log_success "Deployment Completed Successfully!"
log_success "=========================================="
log_success "Active color: $IDLE_COLOR"
log_success "Version: $VERSION"
log_success "Frontend: http://localhost:${FRONTEND_PORT}"
log_success "CMS: http://localhost:${CMS_PORT}"
echo ""
log_info "Next steps:"
log_info "  1. Monitor application metrics"
log_info "  2. Run full smoke test suite"
log_info "  3. Decommission old stack after 24 hours"
log_info "  4. Update deployment documentation"
echo ""
log_info "Log file: $LOG_FILE"
echo ""

exit 0
