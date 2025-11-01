# CMS - Strapi Headless CMS

Modern headless CMS built with Strapi v5, configured for Chinese hosting and development environments.

## 🚀 Tech Stack

- **Strapi v5** - Headless CMS
- **TypeScript** - Type-safe development
- **SQLite** - Default database (development)
- **PostgreSQL** - Recommended for production
- **Docker** - Containerization support

## 📦 Features

- ✅ Headless CMS with REST & GraphQL APIs
- ✅ User authentication & permissions
- ✅ Content type builder
- ✅ Media library
- ✅ Docker support for easy deployment
- ✅ TypeScript support
- ✅ Configured for Chinese registries

## 🔧 Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

**Important**: Update all security keys in `.env` before deploying to production:

```env
HOST=0.0.0.0
PORT=1337
NODE_ENV=development

# IMPORTANT: Generate strong random values for production!
APP_KEYS="generate-random-key-1,generate-random-key-2"
API_TOKEN_SALT=generate-random-salt
ADMIN_JWT_SECRET=generate-random-secret
TRANSFER_TOKEN_SALT=generate-random-salt
JWT_SECRET=generate-random-secret
ENCRYPTION_KEY=generate-random-key

# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

### Generating Security Keys

Use these commands to generate secure random strings:

```bash
# Generate APP_KEYS (2 keys separated by comma)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate other secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🏃 Development

### Local Development (SQLite)

Start the development server:

```bash
pnpm dev
```

The admin panel will be available at `http://localhost:1337/admin`

On first run, you'll be prompted to create an admin user.

### Global Search API Setup

The global search API uses Chinese word segmentation via `nodejieba`. After installing dependencies:

```bash
npm install
```

The global search endpoint will be available at:

```
GET /api/global-search?query=<search-term>&type=<lesson|knowledge-card|student-work|resource>&difficulty=<beginner|intermediate|advanced>&page=<1>&pageSize=<20>
```

**Query Parameters:**
- `query` (required): Search term (minimum 2 characters)
- `type` (optional): Comma-separated content types to search
- `difficulty` (optional): Filter lessons by difficulty (comma-separated)
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Results per page (default: 20, max: 100)

**Response includes:**
- Grouped results by content type
- Highlighted match ranges for keywords
- Search suggestions
- Pagination metadata

**Cache Management:**
Results are cached for 60 seconds. To clear cache:

```
POST /api/global-search/clear-cache
```

### Using Docker Compose

Start with PostgreSQL database:

```bash
docker-compose up -d
```

This will start:
- Strapi CMS on `http://localhost:1337`
- PostgreSQL database on port `5432`

Stop services:

```bash
docker-compose down
```

Stop and remove volumes:

```bash
docker-compose down -v
```

## 🔨 Building

Build for production:

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

## 🗄️ Database Configuration

### SQLite (Development)

Default configuration - no additional setup required.

```env
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

### PostgreSQL (Production)

Recommended for production use:

```env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-secure-password
DATABASE_SSL=false
```

### MySQL/MariaDB (Alternative)

```env
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-secure-password
```

## 🌐 API Usage

### REST API

After creating content types, they'll be available at:

```
GET    http://localhost:1337/api/[content-type]
POST   http://localhost:1337/api/[content-type]
GET    http://localhost:1337/api/[content-type]/:id
PUT    http://localhost:1337/api/[content-type]/:id
DELETE http://localhost:1337/api/[content-type]/:id
```

### Authentication

Generate API tokens in the admin panel:
1. Go to Settings → API Tokens
2. Create new API token
3. Use in requests: `Authorization: Bearer YOUR_API_TOKEN`

### Example Request

```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  http://localhost:1337/api/articles
```

## 🔐 Security

### CORS Configuration

Edit `config/middlewares.ts` to configure allowed origins:

```typescript
export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', 'https://your-domain.com'],
      credentials: true,
    },
  },
  // ... other middlewares
]
```

### Rate Limiting

Configure rate limiting in `config/middlewares.ts` for production.

## 🇨🇳 China Deployment

### Docker Registry Mirrors

For faster Docker image pulls in China, configure Docker to use mirrors:

Create or edit `/etc/docker/daemon.json`:

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com"
  ]
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

### NPM Registry

Use Taobao mirror for faster package installation:

```bash
# In project root .npmrc
registry=https://registry.npmmirror.com
```

### Database Hosting

Popular Chinese cloud providers:
- **Alibaba Cloud** - RDS for PostgreSQL/MySQL
- **Tencent Cloud** - TencentDB
- **Huawei Cloud** - RDS

### CDN Configuration

For media files, consider using:
- Alibaba Cloud OSS
- Tencent Cloud COS
- Qiniu Cloud Storage

Configure in `config/plugins.ts`:

```typescript
export default {
  upload: {
    config: {
      provider: 'your-provider',
      providerOptions: {
        // Provider-specific configuration
      },
    },
  },
}
```

## 📁 Project Structure

```
apps/cms/
├── config/              # Configuration files
│   ├── admin.ts        # Admin panel config
│   ├── api.ts          # API config
│   ├── database.ts     # Database config
│   ├── middlewares.ts  # Middleware config
│   ├── plugins.ts      # Plugin config
│   └── server.ts       # Server config
├── database/           # Database migrations
├── public/             # Public assets
│   └── uploads/        # Uploaded files
├── src/
│   ├── admin/          # Admin panel customizations
│   ├── api/            # API endpoints and content types
│   ├── extensions/     # Extensions
│   └── index.ts        # Entry point
├── .env                # Environment variables (gitignored)
├── .env.example        # Environment template
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Docker image definition
└── package.json        # Dependencies and scripts
```

## 🔧 Common Tasks

### Create Content Type

1. Start dev server: `pnpm dev`
2. Open admin panel: `http://localhost:1337/admin`
3. Go to Content-Type Builder
4. Click "Create new collection type"
5. Define fields and save
6. Server will restart automatically

### Create API Endpoint

```bash
pnpm strapi generate api article title:string content:text
```

### Install Plugin

```bash
pnpm strapi install [plugin-name]
```

### Export/Import Data

```bash
# Export
pnpm strapi export

# Import
pnpm strapi import -f export_[timestamp].tar.gz
```

## 🔍 Troubleshooting

### Port Already in Use

Change port in `.env`:

```env
PORT=1338
```

### Database Connection Issues

Check database credentials and ensure:
- Database server is running
- Firewall allows connections
- Credentials are correct

### Module Installation Issues

Clear cache and reinstall:

```bash
rm -rf node_modules .cache
pnpm install
```

For China-based developers:

```bash
# Use Taobao mirror
pnpm --registry=https://registry.npmmirror.com install
```

### Docker Build Issues

Use build arguments for registry:

```bash
docker build --build-arg NPM_REGISTRY=https://registry.npmmirror.com .
```

## 📚 Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi API Reference](https://docs.strapi.io/dev-docs/api/rest)
- [Strapi Plugin Marketplace](https://market.strapi.io)
- [Strapi GitHub](https://github.com/strapi/strapi)

## 🚀 Deployment

### Docker Deployment (Recommended)

The CMS is optimized for Docker deployment with a hardened, production-ready image.

#### Quick Start

Build the Docker image:

```bash
cd apps/cms
docker build -t strapi-cms:latest .
```

Run the container:

```bash
docker run -d \
  --name strapi-cms \
  -p 1337:1337 \
  -e DATABASE_CLIENT=sqlite \
  -e APP_KEYS="your-key-1,your-key-2" \
  -e API_TOKEN_SALT=your-salt \
  -e ADMIN_JWT_SECRET=your-secret \
  -e JWT_SECRET=your-jwt-secret \
  -e TRANSFER_TOKEN_SALT=your-transfer-salt \
  strapi-cms:latest
```

#### Image Features

✅ **Multi-stage build** - Optimized image size (<450MB)  
✅ **Alpine Linux** - Minimal attack surface  
✅ **Non-root user** - Enhanced security (runs as `strapi` user with UID 1001)  
✅ **Health check** - Built-in health monitoring at `/health`  
✅ **China-optimized** - Timezone set to Asia/Shanghai, supports registry mirrors  
✅ **Production-ready** - Includes proper signal handling and graceful shutdown

#### Build Options

**Use Chinese registry mirror for faster builds:**

```bash
docker build \
  --build-arg NPM_REGISTRY=https://registry.npmmirror.com \
  -t strapi-cms:latest .
```

**Multi-platform build:**

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t strapi-cms:latest .
```

#### Environment Variables

**Required variables:**

- `APP_KEYS` - Comma-separated app keys (generate with `crypto.randomBytes(32).toString('base64')`)
- `API_TOKEN_SALT` - Salt for API tokens
- `ADMIN_JWT_SECRET` - JWT secret for admin authentication
- `JWT_SECRET` - JWT secret for user authentication
- `TRANSFER_TOKEN_SALT` - Salt for transfer tokens

**Optional variables:**

- `HOST` - Bind address (default: `0.0.0.0`)
- `PORT` - Port number (default: `1337`)
- `NODE_ENV` - Environment (default: `production`)
- `NODE_OPTIONS` - Node.js options (default: `--max-old-space-size=2048`)
- `TZ` - Timezone (default: `Asia/Shanghai`)
- `DATABASE_CLIENT` - Database type (`sqlite`, `postgres`, `mysql`)
- `DATABASE_HOST` - Database host (for postgres/mysql)
- `DATABASE_PORT` - Database port
- `DATABASE_NAME` - Database name
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password

#### Database Configuration

**SQLite (Development/Testing):**

```bash
docker run -d \
  --name strapi-cms \
  -p 1337:1337 \
  -v $(pwd)/data:/app/.tmp \
  -e DATABASE_CLIENT=sqlite \
  -e APP_KEYS="..." \
  strapi-cms:latest
```

**PostgreSQL (Production):**

```bash
docker run -d \
  --name strapi-cms \
  -p 1337:1337 \
  -e DATABASE_CLIENT=postgres \
  -e DATABASE_HOST=postgres \
  -e DATABASE_PORT=5432 \
  -e DATABASE_NAME=strapi \
  -e DATABASE_USERNAME=strapi \
  -e DATABASE_PASSWORD=secure-password \
  -e APP_KEYS="..." \
  strapi-cms:latest
```

#### Docker Compose

See `docker-compose.yml` for a complete setup with PostgreSQL.

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f cms

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

#### Health Check

The container includes a built-in health check that monitors Strapi's availability:

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' strapi-cms

# Test health endpoint directly
curl http://localhost:1337/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

#### Registry Mirrors (China)

For faster Docker image pulls in China, configure Docker daemon:

**Edit `/etc/docker/daemon.json`:**

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

**Restart Docker:**

```bash
sudo systemctl restart docker
```

**Alternative: Use Aliyun Container Registry**

```bash
# Login to Aliyun
docker login --username=your-account registry.cn-hangzhou.aliyuncs.com

# Tag and push your image
docker tag strapi-cms:latest registry.cn-hangzhou.aliyuncs.com/your-namespace/strapi-cms:latest
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/strapi-cms:latest
```

#### Production Deployment Best Practices

1. **Use external database** - Don't use SQLite in production
2. **Mount volumes** for persistent data:
   ```bash
   -v /path/to/uploads:/app/public/uploads
   ```
3. **Use secrets management** - Don't hardcode sensitive values
4. **Enable SSL/TLS** - Use reverse proxy (nginx, Traefik, Caddy)
5. **Set resource limits**:
   ```bash
   docker run --memory=2g --cpus=2 ...
   ```
6. **Monitor health** - Use orchestration health checks
7. **Regular backups** - Backup database and uploads regularly

#### Kubernetes Deployment

Example deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: strapi-cms
spec:
  replicas: 2
  selector:
    matchLabels:
      app: strapi-cms
  template:
    metadata:
      labels:
        app: strapi-cms
    spec:
      containers:
      - name: strapi
        image: strapi-cms:latest
        ports:
        - containerPort: 1337
        env:
        - name: DATABASE_CLIENT
          value: postgres
        - name: DATABASE_HOST
          value: postgres-service
        envFrom:
        - secretRef:
            name: strapi-secrets
        livenessProbe:
          httpGet:
            path: /health
            port: 1337
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 1337
          initialDelaySeconds: 30
          periodSeconds: 10
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

#### Troubleshooting

**Container won't start:**
- Check logs: `docker logs strapi-cms`
- Verify environment variables are set correctly
- Ensure database is accessible

**Permission denied errors:**
- Check volume permissions match UID 1001 (strapi user)
- Fix with: `chown -R 1001:1001 /path/to/volume`

**Health check failing:**
- Increase `start-period` if Strapi takes longer to start
- Check if `/health` endpoint is accessible inside container

**Image size too large:**
- Verify multi-stage build is working
- Check for unnecessary files in final image
- Expected size: ~400-450MB

### Manual Deployment

1. Set `NODE_ENV=production` in `.env`
2. Configure production database
3. Generate security keys
4. Build: `pnpm build`
5. Start: `pnpm start`

### Cloud Platforms

Strapi works well with:
- Alibaba Cloud (China) - Recommended for China deployments
- Tencent Cloud (China)
- Huawei Cloud (China)
- AWS (Global)
- DigitalOcean (Global)
- Railway (Global)

Refer to [Strapi deployment documentation](https://docs.strapi.io/dev-docs/deployment) for platform-specific guides.
