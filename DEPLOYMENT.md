# Deployment Guide

This guide covers deploying the Knowledge Cards application to various platforms.

## Prerequisites

- Node.js 18+ installed
- Strapi backend deployed and accessible
- Environment variables configured

## Environment Variables

Create a `.env.production` file with:

```env
VITE_STRAPI_URL=https://your-strapi-domain.com
```

## Building for Production

```bash
# Install dependencies
npm install

# Run tests
npm test -- --run

# Type check
npm run typecheck

# Lint code
npm run lint

# Build for production
npm run build
```

The build output will be in the `dist/` directory.

## Deployment Options

### Option 1: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Navigate to project settings
   - Add `VITE_STRAPI_URL` environment variable
   - Redeploy

4. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod
   ```

3. **Configure via `netlify.toml`**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_VERSION = "18"
   ```

4. **Set Environment Variables**
   ```bash
   netlify env:set VITE_STRAPI_URL https://your-strapi-domain.com
   ```

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update `package.json`**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://username.github.io/repository-name"
   }
   ```

3. **Update `vite.config.ts`**
   ```typescript
   export default defineConfig({
     base: '/repository-name/',
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 4: Docker

1. **Create `Dockerfile`**
   ```dockerfile
   FROM node:18-alpine as builder

   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create `nginx.conf`**
   ```nginx
   server {
     listen 80;
     server_name localhost;
     root /usr/share/nginx/html;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     location /api {
       proxy_pass ${STRAPI_URL};
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

3. **Build and run**
   ```bash
   docker build -t knowledge-cards .
   docker run -p 80:80 -e STRAPI_URL=https://your-strapi.com knowledge-cards
   ```

### Option 5: AWS S3 + CloudFront

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Create S3 bucket**
   ```bash
   aws s3 mb s3://knowledge-cards
   ```

3. **Configure bucket for static hosting**
   ```bash
   aws s3 website s3://knowledge-cards --index-document index.html --error-document index.html
   ```

4. **Upload files**
   ```bash
   aws s3 sync dist/ s3://knowledge-cards --delete
   ```

5. **Create CloudFront distribution**
   - Origin: S3 bucket
   - Default root object: index.html
   - Error pages: 404 -> /index.html (200)

6. **Set up environment variables**
   - Use AWS Systems Manager Parameter Store
   - Or build with environment variables

## Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test all card types render properly
- [ ] Test filtering and search functionality
- [ ] Test QR code generation
- [ ] Test copy-to-clipboard on different devices
- [ ] Verify images load correctly
- [ ] Test on mobile devices
- [ ] Check performance (Lighthouse score)
- [ ] Verify CORS settings with Strapi
- [ ] Test E2E scenarios
- [ ] Monitor error logs

## Performance Optimization

### Strapi Configuration
```javascript
// config/middlewares.js
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', 'cdn.example.com'],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

### CDN Setup
- Use CDN for static assets
- Enable Brotli/Gzip compression
- Set appropriate cache headers
- Use image CDN for media assets

### Monitoring
- Set up error tracking (Sentry)
- Monitor performance (Google Analytics, New Relic)
- Set up uptime monitoring
- Track API response times

## Rollback Procedure

### Vercel/Netlify
```bash
# List deployments
vercel ls
# or
netlify deploy:list

# Rollback to previous deployment
vercel rollback [deployment-url]
# or
netlify rollback
```

### Docker
```bash
# Tag previous version as latest
docker tag knowledge-cards:previous knowledge-cards:latest

# Restart container
docker-compose restart
```

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Clear `node_modules` and reinstall
- Check for TypeScript errors
- Verify all dependencies are installed

### Strapi Connection Issues
- Verify CORS settings on Strapi
- Check environment variable is set
- Ensure Strapi URL is accessible
- Check API permissions are public

### QR Codes Not Generating
- Check browser console for errors
- Verify qrcode.react is installed
- Test on different browsers
- Check if blocked by CSP

### Images Not Loading
- Verify image URLs are accessible
- Check CORS headers on image domain
- Verify CDN configuration
- Check for mixed content (HTTP/HTTPS)

## Security Considerations

- Use HTTPS for all connections
- Set appropriate CORS policies
- Sanitize user input
- Keep dependencies updated
- Use environment variables for secrets
- Enable CSP headers
- Regular security audits

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor error rates
- Review performance metrics
- Check security advisories
- Test on new browser versions
- Backup Strapi data regularly

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions carefully
npm install <package>@latest

# Run tests after updates
npm test -- --run
npm run typecheck
npm run lint
```
