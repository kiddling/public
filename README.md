# Nuxt 3 + Strapi CMS Monorepo

A modern full-stack web application using Nuxt 3 for the frontend and Strapi CMS for content management, organized as a pnpm workspace monorepo.

## 📁 Project Structure

```
.
├── apps/
│   ├── frontend/     # Nuxt 3 application
│   └── cms/          # Strapi CMS
├── package.json      # Root package with workspace scripts
├── pnpm-workspace.yaml
└── README.md
```

## 🛠️ Tech Stack

### Frontend (`apps/frontend`)
- **Nuxt 3** - The Intuitive Vue Framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management
- **VueUse** - Collection of Vue Composition Utilities
- **Nuxt Content** - File-based CMS

### Backend (`apps/cms`)
- **Strapi** - Headless CMS
- **PostgreSQL/SQLite** - Database (configurable)
- **Docker** - Containerization support

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

1. **Install pnpm** (if not already installed):
```bash
npm install -g pnpm
```

2. **Clone the repository** and install dependencies:
```bash
git clone <repository-url>
cd <project-directory>
pnpm install
```

### Environment Setup

#### Frontend Environment Variables

Copy the example environment file:
```bash
cd apps/frontend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:1337
NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
NUXT_STRAPI_API_TOKEN=your-api-token-here
```

#### CMS Environment Variables

Copy the example environment file:
```bash
cd apps/cms
cp .env.example .env
```

Edit `.env` with your configuration - see `apps/cms/README.md` for details.

## 📦 Package Manager & Chinese Mirrors

This project uses **pnpm** for fast, efficient dependency management. For users in China, we provide mirror configuration options:

### Using Taobao Registry (Recommended for China)

Edit `.npmrc` in the project root:
```ini
registry=https://registry.npmmirror.com
```

### Alternative Mirrors

- **Taobao (npmmirror)**: `https://registry.npmmirror.com`
- **Tencent Cloud**: `https://mirrors.cloud.tencent.com/npm/`
- **Huawei Cloud**: `https://mirrors.huaweicloud.com/repository/npm/`

### Why pnpm?

- **Fast**: Up to 2x faster than npm
- **Efficient**: Saves disk space with content-addressable storage
- **Strict**: Avoids phantom dependencies
- **Workspace-friendly**: Excellent monorepo support

## 🏃 Development

### Run both apps in parallel:
```bash
pnpm dev
```

### Run frontend only:
```bash
pnpm dev:frontend
```

### Run CMS only:
```bash
pnpm dev:cms
```

The frontend will be available at `http://localhost:3000` and Strapi at `http://localhost:1337`.

## 🔨 Building

### Build all apps:
```bash
pnpm build
```

### Build frontend only:
```bash
pnpm build:frontend
```

### Build CMS only:
```bash
pnpm build:cms
```

## 🧹 Code Quality

### Linting

```bash
# Check all apps
pnpm lint

# Fix linting issues
pnpm lint:fix
```

### Formatting

```bash
# Format all files
pnpm format

# Check formatting
pnpm format:check
```

### Type Checking

```bash
pnpm typecheck
```

## 📚 Documentation

- [Frontend Documentation](./apps/frontend/README.md)
- [CMS Documentation](./apps/cms/README.md)

## 🌐 Deployment Considerations for China

### Frontend (Nuxt 3)
- Uses SSR mode suitable for China hosting
- Configured with domestic font CDNs (避免使用 Google Fonts)
- Tailwind CSS configured for Chinese typography
- Dark mode support included

### CMS (Strapi)
- Database can be configured for Chinese cloud providers
- Docker images can be pulled from domestic registries
- See `apps/cms/README.md` for Docker registry configuration

## 🔧 Troubleshooting

### Installation Issues

If you encounter slow downloads:
1. Switch to Taobao registry in `.npmrc`
2. Try clearing the pnpm store: `pnpm store prune`
3. Use a VPN if necessary

### Port Conflicts

If ports 3000 or 1337 are in use:
- Frontend: Set `PORT` in `apps/frontend/.env`
- CMS: Set `PORT` in `apps/cms/.env`

## 📝 License

[Your License Here]

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.
