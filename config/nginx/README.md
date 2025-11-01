# Nginx Configuration

This directory contains nginx configuration files for the reverse proxy service.

## Files

- `nginx.conf` - Main nginx configuration
- `conf.d/default.conf` - Default site configuration with upstream definitions

## Usage

### Enable Nginx Service

The nginx service is optional and disabled by default. To enable it:

```bash
# Start with nginx profile
docker compose --profile nginx up -d
```

### Configuration

The nginx service acts as a reverse proxy for:
- **Frontend (Nuxt)**: All requests to `/` 
- **CMS API**: Requests to `/api/`
- **CMS Admin**: Requests to `/admin`
- **Uploads**: Requests to `/uploads`

### HTTPS/SSL

For production, uncomment and configure the HTTPS server block in `conf.d/default.conf`:

1. Obtain SSL certificates (e.g., using Let's Encrypt)
2. Place certificates in `./ssl/` directory
3. Update certificate paths in the HTTPS server block
4. Uncomment the HTTPS server block
5. Restart nginx: `docker compose restart nginx`

### China-Specific Optimizations

For deployments in China, the configuration includes:
- CDN integration for static assets
- Domestic registry support
- Optimized timeout settings

Uncomment the China-specific server block in `conf.d/default.conf` to enable these optimizations.

## Testing Configuration

```bash
# Test nginx configuration
docker compose exec nginx nginx -t

# Reload nginx after changes
docker compose exec nginx nginx -s reload
```

## Logs

```bash
# View nginx access logs
docker compose exec nginx tail -f /var/log/nginx/access.log

# View nginx error logs
docker compose exec nginx tail -f /var/log/nginx/error.log
```

## Rate Limiting

The configuration includes rate limiting zones:
- **general**: 10 requests/second for general traffic
- **api**: 30 requests/second for API endpoints

Adjust these in `nginx.conf` as needed for your use case.
