# Environment Variable Validation

## Overview

This project uses automated environment variable validation to ensure all required configuration is present and properly formatted before starting development or deploying to production.

## Quick Start

### Validate All Environments

```bash
pnpm check:env
```

This will validate both Strapi/CMS and Nuxt/Frontend environment variables.

### Validate Specific Environments

```bash
# Validate only Strapi/CMS
pnpm check:env:strapi

# Validate only Nuxt/Frontend
pnpm check:env:nuxt
```

## Features

✅ **Comprehensive Validation**

- Checks all required environment variables are present
- Validates format and type of values
- Ensures database configuration is complete based on selected client

✅ **Security Checks**

- Detects default/placeholder values that must be changed
- Validates security keys are properly configured
- Ensures production secrets are never committed

✅ **Bilingual Error Messages**

- Error messages in both English and Chinese (英文和中文)
- Helpful hints for fixing common issues
- References to documentation and examples

✅ **CI/CD Integration**

- Runs automatically in GitHub Actions before quality checks
- Blocks deployments if environment validation fails
- Provides clear failure messages in CI logs

## Required Variables

### Strapi/CMS Environment Variables

| Variable              | Required          | Description                                           | Example                       |
| --------------------- | ----------------- | ----------------------------------------------------- | ----------------------------- |
| `APP_KEYS`            | ✅ Yes            | Application encryption keys (4 keys, comma-separated) | `key1,key2,key3,key4`         |
| `API_TOKEN_SALT`      | ✅ Yes            | Salt for API token generation                         | `randomSalt123`               |
| `ADMIN_JWT_SECRET`    | ✅ Yes            | JWT secret for admin authentication                   | `adminSecret456`              |
| `TRANSFER_TOKEN_SALT` | ✅ Yes            | Salt for transfer tokens                              | `transferSalt789`             |
| `JWT_SECRET`          | ✅ Yes            | General JWT secret                                    | `jwtSecret012`                |
| `ENCRYPTION_KEY`      | ⚠️ Optional       | General encryption key                                | `encryptKey345`               |
| `DATABASE_CLIENT`     | ✅ Yes            | Database type                                         | `sqlite`, `postgres`, `mysql` |
| `DATABASE_FILENAME`   | ✅ SQLite         | Database file path (for SQLite)                       | `.tmp/data.db`                |
| `DATABASE_HOST`       | ✅ Postgres/MySQL | Database host                                         | `localhost`                   |
| `DATABASE_PORT`       | ✅ Postgres/MySQL | Database port                                         | `5432`                        |
| `DATABASE_NAME`       | ✅ Postgres/MySQL | Database name                                         | `strapi`                      |
| `DATABASE_USERNAME`   | ✅ Postgres/MySQL | Database username                                     | `strapi`                      |
| `DATABASE_PASSWORD`   | ✅ Postgres/MySQL | Database password                                     | `secure-password`             |
| `CLIENT_URL`          | ✅ Yes            | Frontend URL for CORS                                 | `http://localhost:3000`       |
| `HOST`                | ⚠️ Optional       | Server host (default: 0.0.0.0)                        | `0.0.0.0`                     |
| `PORT`                | ⚠️ Optional       | Server port (default: 1337)                           | `1337`                        |

### Nuxt/Frontend Environment Variables

| Variable                   | Required    | Description                     | Example                   |
| -------------------------- | ----------- | ------------------------------- | ------------------------- |
| `NUXT_PUBLIC_STRAPI_URL`   | ✅ Yes      | Public Strapi API URL           | `http://localhost:1337`   |
| `NUXT_STRAPI_API_TOKEN`    | ✅ Yes      | Strapi API authentication token | `your-api-token`          |
| `NUXT_PUBLIC_API_BASE_URL` | ✅ Yes      | Base URL for API calls          | `http://localhost:1337`   |
| `PORT`                     | ⚠️ Optional | Frontend server port            | `3000`                    |
| `NUXT_PUBLIC_CDN_URL`      | ⚠️ Optional | CDN URL for assets              | `https://cdn.example.com` |

All security-related variables (CSP, HSTS, Rate Limiting, etc.) are optional but recommended for production.

## Generating Secure Keys

### For Strapi Security Keys

Use OpenSSL to generate secure random keys:

```bash
# Generate a single key
openssl rand -base64 32

# Generate multiple keys for APP_KEYS
echo "$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
```

### Example Output

```bash
$ openssl rand -base64 32
gdrLy2VmnrAJDwcagWFyyQ==
```

Use the generated values in your `.env` file:

```env
APP_KEYS=gdrLy2VmnrAJDwcagWFyyQ==,HxTqxGzOa+h6diKMak8M7w==,uo5eqXvzEDeJJDJ0bBp8wQ==,iZv7xY4tkkUDheJySVpYeA==
API_TOKEN_SALT=ym/WHfRkL2PZEFPHiMgFMw==
ADMIN_JWT_SECRET=fOIJ4sUtuUxvdaLjG8/onw==
TRANSFER_TOKEN_SALT=Kl5fKzuzOq2804rom2kVMQ==
JWT_SECRET=8kM9fTwU2xZpV7hJnL4qDcA3rG6eYbN5
```

## Error Messages

The validation script provides clear, bilingual error messages:

### Example: Missing Required Field

```
❌ Strapi/CMS Environment Validation Failed / Strapi/CMS环境变量验证失败

🔴 Field / 字段: JWT_SECRET
   EN: Missing required field: JWT_SECRET
   CN: 缺少必需字段: JWT_SECRET
   💡 Hint / 提示: Check .env.example for required Strapi variables / 请检查 .env.example 中的必需 Strapi 变量
```

### Example: Default Values Detected

```
🔴 Field / 字段: APP_KEYS
   EN: APP_KEYS contains default/placeholder values and must be changed
   CN: APP_KEYS 包含默认/占位值，必须修改
   💡 Hint / 提示: Generate secure values using: openssl rand -base64 32 / 使用以下命令生成安全值: openssl rand -base64 32
```

### Example: Invalid Format

```
🔴 Field / 字段: NUXT_PUBLIC_STRAPI_URL
   EN: Invalid format for NUXT_PUBLIC_STRAPI_URL: Invalid url
   CN: NUXT_PUBLIC_STRAPI_URL 格式无效: Invalid url
   💡 Hint / 提示: Must be a valid URL (e.g., http://localhost:1337) / 必须是有效的 URL (例如: http://localhost:1337)
```

## CI/CD Integration

### GitHub Actions

The validation script is integrated into the CI/CD pipeline:

1. **Quality Job** - Validates environment before linting, formatting, and type checking
2. **Deployment Job** - Validates production secrets before deployment

Example from `.github/workflows/ci.yml`:

```yaml
- name: Validate environment variables
  run: pnpm check:env
  env:
    APP_KEYS: ${{ secrets.APP_KEYS || 'ci-test-key-1,ci-test-key-2' }}
    API_TOKEN_SALT: ${{ secrets.API_TOKEN_SALT || 'ci-test-salt' }}
    # ... other variables
```

The CI uses GitHub Secrets for production values, with fallback test values for non-production environments.

## Testing

### Unit Tests

The validation logic is thoroughly tested:

```bash
# Run environment validation tests
pnpm vitest run tests/env/check-env.spec.ts
```

Test coverage includes:

- ✅ Valid configurations (SQLite and PostgreSQL)
- ✅ Missing required fields
- ✅ Default/placeholder values detection
- ✅ Invalid formats (URLs, ports, etc.)
- ✅ Database-specific requirements
- ✅ Default value application

### Manual Testing

Test the script locally with different configurations:

```bash
# Test with valid configuration
pnpm check:env

# Test with missing variable (should fail)
unset JWT_SECRET && pnpm check:env

# Test with default values (should fail)
APP_KEYS="toBeModified1,toBeModified2" pnpm check:env
```

## Environment Templates

### `.env.example` (Root)

Complete template with all Strapi, Nuxt, and compliance variables. Use this as your starting point:

```bash
cp .env.example .env
```

### `.env.docker.example`

Docker-specific configuration for containerized deployments:

```bash
cp .env.docker.example .env.docker
```

### `apps/frontend/.env.example`

Frontend-specific options and security headers.

### `apps/cms/.env.example`

CMS-specific options including database and email configuration.

## Best Practices

### Development

1. **Never commit `.env` files** - They contain secrets
2. **Keep `.env.example` updated** - Reflect all required variables
3. **Run validation locally** - Before committing changes
4. **Use strong secrets** - Generate with `openssl rand -base64 32`

### Production

1. **Store secrets securely** - Use GitHub Secrets, AWS Secrets Manager, etc.
2. **Validate before deployment** - CI automatically checks this
3. **Use environment-specific values** - Different keys for dev/staging/prod
4. **Monitor secret rotation** - Update secrets regularly
5. **Enable all security headers** - CSP, HSTS, etc.

### Team Collaboration

1. **Document custom variables** - Add to this guide
2. **Update templates** - Keep `.env.example` files in sync
3. **Share setup instructions** - Link to this document in onboarding
4. **Use consistent naming** - Follow the existing patterns

## Troubleshooting

### "Missing required field" error

**Solution**: Check `.env.example` for the required variable and add it to your `.env` file.

### "Contains default/placeholder values" error

**Solution**: Generate a secure value using `openssl rand -base64 32` and replace the placeholder.

### "Database connection details required" error

**Solution**: If using PostgreSQL or MySQL, ensure all database connection variables are set:

- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`

### "Invalid format" or "Invalid url" error

**Solution**: Ensure URLs start with `http://` or `https://` and ports are numeric values.

### Script fails in CI but works locally

**Solution**: Check that all required GitHub Secrets are configured in your repository settings.

## Extending the Validation

### Adding New Required Variables

1. Edit `scripts/check-env.ts`
2. Add the variable to the appropriate Zod schema:

```typescript
const StrapiEnvSchema = z.object({
  // ... existing fields
  NEW_VARIABLE: z.string().min(1, 'NEW_VARIABLE is required'),
})
```

3. Update `.env.example` with the new variable
4. Add the variable to CI workflow files
5. Update this documentation

### Custom Validation Rules

Add custom validation using Zod's `.refine()` method:

```typescript
.refine(
  (val) => val.length >= 32,
  { message: 'Must be at least 32 characters long' }
)
```

## Related Documentation

- [README.md](../README.md) - Main project documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [SECURITY_IMPLEMENTATION_SUMMARY.md](../SECURITY_IMPLEMENTATION_SUMMARY.md) - Security configuration
- [.env.example](../.env.example) - Complete environment template

## Support

If you encounter issues with environment validation:

1. Check the error message and hints provided
2. Review this documentation
3. Compare your `.env` with `.env.example`
4. Ensure all required variables are set
5. Validate variable formats (URLs, ports, etc.)

For questions or issues, please open a GitHub issue with:

- The error message
- Your environment configuration (redact secrets!)
- Steps to reproduce the issue
