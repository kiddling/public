#!/bin/bash

###############################################################################
# Environment Variables Validation Script
# 
# Validates that required environment variables are set and have valid values
# for production deployment.
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
SUCCESS=0

# Print header
echo "========================================="
echo "Environment Variables Validation"
echo "========================================="
echo ""

# Function to check if variable is set
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    local required=${2:-false}
    
    if [ -z "$var_value" ]; then
        if [ "$required" = true ]; then
            echo -e "${RED}✗ $var_name is not set (REQUIRED)${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ $var_name is not set (optional)${NC}"
            ((WARNINGS++))
        fi
        return 1
    else
        echo -e "${GREEN}✓ $var_name is set${NC}"
        ((SUCCESS++))
        return 0
    fi
}

# Function to check boolean value
check_boolean() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ "$var_value" != "true" ] && [ "$var_value" != "false" ]; then
        echo -e "${RED}✗ $var_name must be 'true' or 'false', got: $var_value${NC}"
        ((ERRORS++))
        return 1
    fi
    return 0
}

# Function to check numeric value
check_numeric() {
    local var_name=$1
    local var_value=${!var_name}
    
    if ! [[ "$var_value" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}✗ $var_name must be numeric, got: $var_value${NC}"
        ((ERRORS++))
        return 1
    fi
    return 0
}

echo "--- Strapi Core Configuration ---"
check_var "HOST" true
check_var "PORT" true
check_var "APP_KEYS" true
check_var "API_TOKEN_SALT" true
check_var "ADMIN_JWT_SECRET" true
check_var "TRANSFER_TOKEN_SALT" true
check_var "JWT_SECRET" true

echo ""
echo "--- Security Configuration ---"

# Security headers
check_var "SECURITY_HSTS_ENABLED" false
if [ -n "$SECURITY_HSTS_ENABLED" ]; then
    check_boolean "SECURITY_HSTS_ENABLED"
fi

check_var "SECURITY_HSTS_MAX_AGE" false
if [ -n "$SECURITY_HSTS_MAX_AGE" ]; then
    check_numeric "SECURITY_HSTS_MAX_AGE"
fi

check_var "SECURITY_CSP_ENABLED" false
if [ -n "$SECURITY_CSP_ENABLED" ]; then
    check_boolean "SECURITY_CSP_ENABLED"
fi

# CORS
check_var "SECURITY_CORS_ENABLED" false
check_var "SECURITY_CORS_ORIGIN" false
check_var "SECURITY_CORS_CREDENTIALS" false
if [ -n "$SECURITY_CORS_CREDENTIALS" ]; then
    check_boolean "SECURITY_CORS_CREDENTIALS"
fi

# Cookie security
check_var "SECURITY_SECURE_COOKIES" false
if [ -n "$SECURITY_SECURE_COOKIES" ]; then
    check_boolean "SECURITY_SECURE_COOKIES"
fi

check_var "SECURITY_SAME_SITE" false

# Rate limiting
check_var "SECURITY_RATE_LIMIT_ENABLED" false
if [ -n "$SECURITY_RATE_LIMIT_ENABLED" ]; then
    check_boolean "SECURITY_RATE_LIMIT_ENABLED"
fi

check_var "SECURITY_RATE_LIMIT_MAX_REQUESTS" false
if [ -n "$SECURITY_RATE_LIMIT_MAX_REQUESTS" ]; then
    check_numeric "SECURITY_RATE_LIMIT_MAX_REQUESTS"
fi

check_var "SECURITY_RATE_LIMIT_WINDOW_MS" false
if [ -n "$SECURITY_RATE_LIMIT_WINDOW_MS" ]; then
    check_numeric "SECURITY_RATE_LIMIT_WINDOW_MS"
fi

check_var "SECURITY_API_RATE_LIMIT_ENABLED" false
check_var "SECURITY_API_RATE_LIMIT_MAX_REQUESTS" false
check_var "SECURITY_API_RATE_LIMIT_WINDOW_MS" false

echo ""
echo "--- Compliance Configuration ---"
check_var "ICP_FILING_NUMBER" false
check_var "DATA_RESIDENCY" false
check_var "PERSONAL_INFO_PROTECTION_ENABLED" false
check_var "AUDIT_LOG_ENABLED" false

echo ""
echo "--- Nuxt Frontend Security ---"
check_var "NUXT_PUBLIC_SECURITY_ENFORCE_HTTPS" false
check_var "NUXT_PUBLIC_SECURITY_HSTS_ENABLED" false
check_var "NUXT_PUBLIC_SECURITY_CSP_ENABLED" false
check_var "NUXT_PUBLIC_SECURITY_RATE_LIMIT_ENABLED" false

echo ""
echo "========================================="
echo "Validation Summary"
echo "========================================="
echo -e "${GREEN}✓ Success: $SUCCESS${NC}"
echo -e "${YELLOW}⚠ Warnings: $WARNINGS${NC}"
echo -e "${RED}✗ Errors: $ERRORS${NC}"
echo ""

# Production-specific checks
if [ "$NODE_ENV" = "production" ]; then
    echo "--- Production Environment Checks ---"
    
    # Check critical security settings for production
    if [ "$SECURITY_HSTS_ENABLED" != "true" ]; then
        echo -e "${YELLOW}⚠ SECURITY_HSTS_ENABLED should be 'true' in production${NC}"
        ((WARNINGS++))
    fi
    
    if [ "$SECURITY_CSP_ENABLED" != "true" ]; then
        echo -e "${YELLOW}⚠ SECURITY_CSP_ENABLED should be 'true' in production${NC}"
        ((WARNINGS++))
    fi
    
    if [ "$SECURITY_SECURE_COOKIES" != "true" ]; then
        echo -e "${YELLOW}⚠ SECURITY_SECURE_COOKIES should be 'true' in production${NC}"
        ((WARNINGS++))
    fi
    
    if [ "$SECURITY_RATE_LIMIT_ENABLED" != "true" ]; then
        echo -e "${YELLOW}⚠ SECURITY_RATE_LIMIT_ENABLED should be 'true' in production${NC}"
        ((WARNINGS++))
    fi
    
    # Check for default/weak secrets
    if [ "$APP_KEYS" = "toBeModified1,toBeModified2" ]; then
        echo -e "${RED}✗ APP_KEYS contains default values - must be changed!${NC}"
        ((ERRORS++))
    fi
    
    if [ "$API_TOKEN_SALT" = "tobemodified" ] || [ "$ADMIN_JWT_SECRET" = "tobemodified" ]; then
        echo -e "${RED}✗ Security keys contain default values - must be changed!${NC}"
        ((ERRORS++))
    fi
    
    echo ""
fi

# Exit with error if any errors found
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}Validation failed with $ERRORS error(s)${NC}"
    exit 1
else
    echo -e "${GREEN}Validation passed!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}Note: There are $WARNINGS warning(s) that should be reviewed${NC}"
    fi
    exit 0
fi
