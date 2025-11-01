#!/bin/bash

# Test script for Docker Compose deployment
# This script validates the deployment configuration

set -e

echo "=================================================="
echo "Docker Compose Deployment Validation"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Docker
echo "Checking prerequisites..."
if command -v docker &> /dev/null; then
    success "Docker is installed ($(docker --version | cut -d' ' -f3 | cut -d',' -f1))"
else
    error "Docker is not installed"
    exit 1
fi

# Check Docker Compose
if docker compose version &> /dev/null; then
    success "Docker Compose is installed ($(docker compose version --short))"
else
    error "Docker Compose is not installed"
    exit 1
fi

# Check required files
echo ""
echo "Checking configuration files..."
files=(
    "docker-compose.yml"
    ".env.example"
    "docker-compose.override.example.yml"
    "apps/cms/Dockerfile"
    "apps/frontend/Dockerfile"
    "config/nginx/nginx.conf"
    "config/nginx/conf.d/default.conf"
    "docs/deployment/docker-compose.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        success "$file exists"
    else
        error "$file is missing"
        exit 1
    fi
done

# Validate docker-compose.yml syntax
echo ""
echo "Validating Docker Compose configuration..."
if docker compose config > /dev/null 2>&1; then
    success "docker-compose.yml syntax is valid"
else
    error "docker-compose.yml has syntax errors"
    docker compose config
    exit 1
fi

# Validate with override example
if docker compose -f docker-compose.yml -f docker-compose.override.example.yml config > /dev/null 2>&1; then
    success "docker-compose.override.example.yml syntax is valid"
else
    error "docker-compose.override.example.yml has syntax errors"
    exit 1
fi

# Check services
echo ""
echo "Checking service definitions..."
services=$(docker compose config --services)
required_services=("postgres" "cms" "frontend")

for service in "${required_services[@]}"; do
    if echo "$services" | grep -q "^${service}$"; then
        success "Service '$service' is defined"
    else
        error "Required service '$service' is missing"
        exit 1
    fi
done

# Check optional services with profiles
optional_services=$(docker compose --profile worker --profile nginx config --services)
if echo "$optional_services" | grep -q "cms-worker"; then
    success "Optional service 'cms-worker' is defined (profile: worker)"
else
    warning "Optional service 'cms-worker' not found"
fi

if echo "$optional_services" | grep -q "nginx"; then
    success "Optional service 'nginx' is defined (profile: nginx)"
else
    warning "Optional service 'nginx' not found"
fi

# Check volumes
echo ""
echo "Checking volume definitions..."
volumes=$(docker compose config --volumes)
required_volumes=("postgres_data" "strapi_uploads")

for volume in "${required_volumes[@]}"; do
    if echo "$volumes" | grep -q "$volume"; then
        success "Volume '$volume' is defined"
    else
        error "Required volume '$volume' is missing"
        exit 1
    fi
done

# Check healthchecks
echo ""
echo "Checking healthcheck configurations..."
config=$(docker compose config)

if echo "$config" | grep -q "pg_isready"; then
    success "PostgreSQL healthcheck is configured"
else
    error "PostgreSQL healthcheck is missing"
    exit 1
fi

if echo "$config" | grep -q "condition: service_healthy"; then
    success "Services have healthcheck dependencies"
else
    warning "No healthcheck dependencies found"
fi

# Check environment variables in .env.example
echo ""
echo "Checking environment variables..."
required_vars=(
    "DATABASE_NAME"
    "DATABASE_USERNAME"
    "DATABASE_PASSWORD"
    "APP_KEYS"
    "API_TOKEN_SALT"
    "ADMIN_JWT_SECRET"
    "JWT_SECRET"
    "ENCRYPTION_KEY"
    "NUXT_STRAPI_API_TOKEN"
)

for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env.example || grep -q "^# ${var}=" .env.example || grep -q "^${var}$" .env.example; then
        success "Variable '$var' is documented in .env.example"
    else
        error "Required variable '$var' is missing from .env.example"
        exit 1
    fi
done

# Check Dockerfiles
echo ""
echo "Checking Dockerfiles..."
if [ -f "apps/cms/Dockerfile" ]; then
    success "CMS Dockerfile exists"
else
    error "CMS Dockerfile is missing"
    exit 1
fi

if [ -f "apps/frontend/Dockerfile" ]; then
    success "Frontend Dockerfile exists"
else
    error "Frontend Dockerfile is missing"
    exit 1
fi

# Check .dockerignore files
if [ -f "apps/cms/.dockerignore" ]; then
    success "CMS .dockerignore exists"
else
    warning "CMS .dockerignore is missing"
fi

if [ -f "apps/frontend/.dockerignore" ]; then
    success "Frontend .dockerignore exists"
else
    warning "Frontend .dockerignore is missing"
fi

# Check nginx configuration
echo ""
echo "Checking Nginx configuration..."
if [ -f "config/nginx/nginx.conf" ]; then
    success "Nginx main configuration exists"
else
    warning "Nginx main configuration is missing (optional)"
fi

if [ -f "config/nginx/conf.d/default.conf" ]; then
    success "Nginx site configuration exists"
else
    warning "Nginx site configuration is missing (optional)"
fi

# Check documentation
echo ""
echo "Checking documentation..."
if [ -f "docs/deployment/docker-compose.md" ]; then
    success "Deployment documentation exists"
    lines=$(wc -l < docs/deployment/docker-compose.md)
    success "Documentation has $lines lines"
else
    error "Deployment documentation is missing"
    exit 1
fi

if [ -f "DOCKER_QUICK_START.md" ]; then
    success "Quick start guide exists"
else
    warning "Quick start guide is missing"
fi

# Check CI workflow
echo ""
echo "Checking CI/CD configuration..."
if [ -f ".github/workflows/docker-compose-validate.yml" ]; then
    success "CI validation workflow exists"
else
    warning "CI validation workflow is missing"
fi

# Final summary
echo ""
echo "=================================================="
echo "Validation Complete!"
echo "=================================================="
echo ""
success "All critical checks passed!"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and configure secrets"
echo "  2. Run: docker compose up -d"
echo "  3. Check status: docker compose ps"
echo "  4. View logs: docker compose logs -f"
echo ""
echo "For detailed instructions, see:"
echo "  - DOCKER_QUICK_START.md (quick reference)"
echo "  - docs/deployment/docker-compose.md (comprehensive guide)"
echo ""
