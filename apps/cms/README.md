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

### Manual Deployment

1. Set `NODE_ENV=production` in `.env`
2. Configure production database
3. Generate security keys
4. Build: `pnpm build`
5. Start: `pnpm start`

### Docker Deployment

```bash
docker build -t strapi-cms .
docker run -p 1337:1337 --env-file .env strapi-cms
```

### Cloud Platforms

Strapi works well with:
- Alibaba Cloud (China)
- Tencent Cloud (China)
- Huawei Cloud (China)
- AWS (Global)
- DigitalOcean (Global)
- Railway (Global)

Refer to [Strapi deployment documentation](https://docs.strapi.io/dev-docs/deployment) for platform-specific guides.
