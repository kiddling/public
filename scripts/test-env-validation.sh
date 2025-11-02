#!/bin/bash

# Test script to demonstrate environment validation functionality
# This shows success and failure cases with clear output

echo "=========================================="
echo "Environment Validation Test Suite"
echo "=========================================="
echo ""

# Save current environment
BACKUP_ENV=$(env | grep -E '^(APP_KEYS|JWT_SECRET|NUXT_|DATABASE_)')

# Test 1: Success case with valid environment
echo "Test 1: Valid Environment (should pass)"
echo "----------------------------------------"
export APP_KEYS="valid-key-1,valid-key-2,valid-key-3,valid-key-4"
export API_TOKEN_SALT="valid-salt-123"
export ADMIN_JWT_SECRET="valid-admin-secret"
export TRANSFER_TOKEN_SALT="valid-transfer-salt"
export JWT_SECRET="valid-jwt-secret"
export DATABASE_CLIENT="sqlite"
export DATABASE_FILENAME=".tmp/data.db"
export CLIENT_URL="http://localhost:3000"
export NUXT_PUBLIC_STRAPI_URL="http://localhost:1337"
export NUXT_STRAPI_API_TOKEN="valid-token"
export NUXT_PUBLIC_API_BASE_URL="http://localhost:1337"

if pnpm check:env > /dev/null 2>&1; then
    echo "✅ PASSED: Valid environment accepted"
else
    echo "❌ FAILED: Valid environment rejected"
fi
echo ""

# Test 2: Failure case - default values
echo "Test 2: Default Values (should fail)"
echo "----------------------------------------"
export APP_KEYS="toBeModified1,toBeModified2"

if pnpm check:env > /dev/null 2>&1; then
    echo "❌ FAILED: Default values accepted (should have been rejected)"
else
    echo "✅ PASSED: Default values correctly rejected"
fi
echo ""

# Test 3: Failure case - missing required field
echo "Test 3: Missing Required Field (should fail)"
echo "----------------------------------------"
unset JWT_SECRET

if pnpm check:env > /dev/null 2>&1; then
    echo "❌ FAILED: Missing JWT_SECRET accepted (should have been rejected)"
else
    echo "✅ PASSED: Missing field correctly detected"
fi
echo ""

# Test 4: Strapi-only validation
echo "Test 4: Strapi-only Validation (should work with partial env)"
echo "----------------------------------------"
export APP_KEYS="valid-key-1,valid-key-2"
export JWT_SECRET="valid-jwt-secret"

if pnpm check:env:strapi > /dev/null 2>&1; then
    echo "✅ PASSED: Strapi-only validation works"
else
    echo "❌ FAILED: Strapi-only validation failed"
fi
echo ""

# Test 5: Nuxt-only validation
echo "Test 5: Nuxt-only Validation (should work with partial env)"
echo "----------------------------------------"
if pnpm check:env:nuxt > /dev/null 2>&1; then
    echo "✅ PASSED: Nuxt-only validation works"
else
    echo "❌ FAILED: Nuxt-only validation failed"
fi
echo ""

# Test 6: Database configuration validation
echo "Test 6: PostgreSQL Configuration (should fail without DB details)"
echo "----------------------------------------"
export DATABASE_CLIENT="postgres"
unset DATABASE_HOST
unset DATABASE_PORT

if pnpm check:env:strapi > /dev/null 2>&1; then
    echo "❌ FAILED: Incomplete PostgreSQL config accepted"
else
    echo "✅ PASSED: Incomplete PostgreSQL config correctly rejected"
fi
echo ""

echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Valid environments are accepted"
echo "  - Default/placeholder values are rejected"
echo "  - Missing required fields are detected"
echo "  - Selective validation (--strapi, --nuxt) works"
echo "  - Database-specific requirements are enforced"
echo ""
echo "Run 'pnpm check:env' to validate your current environment"
