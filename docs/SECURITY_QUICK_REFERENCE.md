# Security Configuration Quick Reference

快速参考：生产环境安全配置

## Nuxt Frontend Security

### Environment Variables

```bash
# Minimal Production Security Config
NUXT_PUBLIC_SECURITY_ENFORCE_HTTPS=true
NUXT_PUBLIC_SECURITY_HSTS_ENABLED=true
NUXT_PUBLIC_SECURITY_CSP_ENABLED=true
NUXT_PUBLIC_SECURITY_RATE_LIMIT_ENABLED=true

# Adjust CSP for your domain
NUXT_PUBLIC_SECURITY_CSP_CONNECT_SRC='self' https://api.yourdomain.com
NUXT_PUBLIC_SECURITY_CSP_IMG_SRC='self' data: https://cdn.yourdomain.com
```

### Files Created

- `apps/frontend/server/middleware/security-headers.ts`
- `apps/frontend/server/middleware/rate-limit.ts`

## Strapi CMS Security

### Environment Variables

```bash
# Production Security
SECURITY_CORS_ORIGIN=https://yourdomain.com
SECURITY_HSTS_ENABLED=true
SECURITY_CSP_ENABLED=true
SECURITY_SECURE_COOKIES=true
SECURITY_RATE_LIMIT_ENABLED=true
SECURITY_API_RATE_LIMIT_ENABLED=true
```

### Files Created

- `apps/cms/config/env/production/middlewares.ts`
- `apps/cms/src/middlewares/rate-limit.ts`
- `apps/cms/src/middlewares/api-rate-limit.ts`

## Testing

```bash
# Run security smoke tests
npm run test:smoke

# Test specific security features
playwright test tests/smoke/security.smoke.spec.ts
```

## Nginx Configuration

```nginx
# Essential headers for security
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

## Common Rate Limits

- **Frontend**: 100 requests/minute per IP
- **Strapi General**: 100 requests/minute per IP
- **Strapi API**: 1000 requests/minute per IP

## Quick Checks

```bash
# Check security headers
curl -I https://yourdomain.com | grep -i "strict-transport\|content-security\|x-frame"

# Test rate limiting
for i in {1..105}; do curl -I https://yourdomain.com/api/test; sleep 0.1; done

# Verify HTTPS redirect
curl -I -H "X-Forwarded-Proto: http" https://yourdomain.com
```

## Documentation

- Full guide: [docs/SECURITY_CN.md](./SECURITY_CN.md)
- Deployment: [docs/PRODUCTION_DEPLOYMENT_CN.md](./PRODUCTION_DEPLOYMENT_CN.md)
