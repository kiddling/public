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

## 🚀 快速开始 (Quick Start)

### Prerequisites

- Node.js >= 18.0.0 <=22.x.x
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

#### Quick Setup (推荐方法)

1. **Copy the root environment template** (copies all required variables):

```bash
cp .env.example .env
```

2. **Edit `.env` with your configuration**:
   - Generate secure keys: `openssl rand -base64 32`
   - Update all `tobemodified` placeholders
   - Configure your Strapi API token

3. **Validate your environment** (验证环境变量):

```bash
# Validate both frontend and CMS environments
pnpm check:env

# Validate only Strapi/CMS
pnpm check:env:strapi

# Validate only Nuxt/Frontend
pnpm check:env:nuxt
```

The validation script will:

- ✅ Check all required environment variables are present
- ✅ Verify that default/placeholder values have been changed
- ✅ Validate database configuration based on selected client
- ✅ Ensure security keys are properly configured
- ✅ Provide bilingual error messages (English & Chinese / 英文和中文)

**Required Environment Variables** (必需的环境变量):

**Strapi/CMS**:

- `APP_KEYS` - Application encryption keys (4 keys comma-separated)
- `API_TOKEN_SALT` - Salt for API tokens
- `ADMIN_JWT_SECRET` - JWT secret for admin authentication
- `TRANSFER_TOKEN_SALT` - Salt for transfer tokens
- `JWT_SECRET` - General JWT secret
- `DATABASE_CLIENT` - Database type (sqlite, postgres, mysql)
- `CLIENT_URL` - Frontend URL for CORS

**Nuxt/Frontend**:

- `NUXT_PUBLIC_STRAPI_URL` - Public Strapi API URL
- `NUXT_STRAPI_API_TOKEN` - Strapi API authentication token
- `NUXT_PUBLIC_API_BASE_URL` - Base URL for API calls

📚 **See also**:

- `.env.example` - Complete environment template with all options
- `.env.docker.example` - Docker-specific configuration
- `apps/frontend/.env.example` - Frontend-specific options
- `apps/cms/.env.example` - CMS-specific options

#### Manual Setup (Individual Apps)

If you prefer to configure apps individually:

**Frontend**:

```bash
cd apps/frontend
cp .env.example .env
# Edit .env with your configuration
```

**CMS**:

```bash
cd apps/cms
cp .env.example .env
# Edit .env with your configuration - see apps/cms/README.md for details
```

## ✨ Key Features

### 🎨 Design Log System

Complete design journal and portfolio management:

- **Interactive Forms**: Structured recording of design process
- **IndexedDB Storage**: Offline-first with local data storage
- **PDF Export**: Professional document generation
- **Search & Filter**: Quick access to past projects
- **Draft System**: Auto-save and resume unfinished logs
- **Template API**: Strapi-powered design templates

👉 [View Design Log System Documentation](./docs/DESIGN_LOG_SYSTEM.md)

### 🔍 Global Search System

Cross-application search that spans all content types:

- **Comprehensive Coverage**: Search lessons, knowledge cards, student works, and resources
- **Chinese Segmentation**: Uses `nodejieba` for accurate Chinese word segmentation
- **Smart Highlighting**: Keywords highlighted with precomputed match ranges
- **Keyboard Navigation**:
  - `Cmd/Ctrl + K` to open search
  - Arrow keys to navigate results
  - `Enter` to open, `ESC` to close
- **Search History**: Automatically saves recent searches (localStorage)
- **Recent Visits**: Quick access to recently viewed content
- **Categorized Results**: Results grouped by content type with badges
- **Difficulty Filtering**: Filter lessons by difficulty level
- **Instant Suggestions**: Get search suggestions as you type
- **Accessibility**: Full keyboard navigation, focus trap, ARIA labels
- **Performance**:
  - 300ms debounce for smooth typing
  - 60-second cache for faster repeat searches
  - Pagination support

**Usage**: Simply press `Cmd/Ctrl + K` anywhere in the app to start searching!

### 📊 Performance Monitoring

Comprehensive performance tracking and optimization:

- **Web Vitals**: Real-time metrics (LCP, FID, CLS, FCP, TTFB, INP)
- **Lighthouse CI**: Automated performance audits in CI/CD with strict budgets (Performance ≥90, SEO ≥95)
- **Health Checks**: Built-in endpoints for monitoring
- **Docker Health**: Container health checks and auto-restart

Run `pnpm lighthouse` to audit performance locally. Reports are automatically generated in CI.

👉 [View Monitoring Documentation](./docs/MONITORING.md)  
👉 [View Performance Documentation](./apps/frontend/docs/PERFORMANCE.md)

### 🐳 Docker & CI/CD

Production-ready containerization and automation:

- **Multi-stage Builds**: Optimized Docker images
- **Docker Compose**: Complete orchestration (Frontend, CMS, PostgreSQL, Redis, Nginx)
- **GitHub Actions**: Automated testing, building, and deployment
- **Security Scanning**: Automated vulnerability checks

👉 [View Docker Documentation](./docs/DOCKER.md)  
👉 [View Deployment Guide](./docs/DEPLOYMENT.md)

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

### Strapi Standalone Commands

If you're working on Strapi CMS directly:

```bash
# Start Strapi with autoReload enabled
pnpm develop

# Start Strapi with autoReload disabled
pnpm start

# Open Strapi console
pnpm console

# Deploy Strapi
pnpm deploy
```

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

### Build admin panel (Strapi):

```bash
cd apps/cms
pnpm build
```

## 🧹 Code Quality

### Environment Validation

```bash
# Validate environment variables
pnpm check:env

# Run in CI (with fallback test values)
pnpm check:env || echo "Environment validation failed"
```

The validation runs automatically in CI before quality checks and deployments.

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

### Testing

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run environment validation tests
pnpm vitest run tests/env/check-env.spec.ts
```

## 🎨 设计系统 (Design System)

### 颜色系统 (Color System)

#### 课程部分颜色

- **Foundation (基础)** - 蓝色主题
- **Intermediate (中级)** - 绿色主题
- **Advanced (高级)** - 紫色主题
- **Expert (专家)** - 橙色主题

#### 语义颜色

- Success (成功) - 绿色
- Warning (警告) - 黄色
- Error (错误) - 红色
- Info (信息) - 蓝色

### 排版系统 (Typography)

针对中文内容优化的系统字体栈（无需 CDN）：

```
系统中文字体 (Microsoft YaHei, PingFang SC, 等) → 系统无衬线字体
```

提供完整的标题层级和正文样式，确保快速加载和离线可用。

### 组件库 (Components)

#### 基础组件

- **BaseButton** - 多变体按钮组件
- **BaseCard** - 灵活的卡片容器
- **BaseTag** - 标签/徽章组件
- **SectionHeader** - 章节标题组件

#### 布局组件

- **AppShell** - 应用主框架
- **AppHeader** - 顶部导航栏
- **AppSidebar** - 响应式侧边栏

详细文档请查看 [设计系统文档](./docs/DESIGN_SYSTEM.md)。

## ♿ 无障碍访问 (Accessibility)

所有组件都遵循 WCAG 2.1 AA 标准：

- ✅ 键盘导航支持 - 完整的 Tab 导航和快捷键
- ✅ 屏幕阅读器优化 - NVDA, JAWS, VoiceOver 测试通过
- ✅ ARIA 标签和角色 - 语义化标记和状态管理
- ✅ 清晰的焦点样式 - 高对比度焦点指示器
- ✅ 颜色对比度符合标准 - WCAG AA 4.5:1 比率
- ✅ Skip links 快速导航 - 跳转到主内容链接
- ✅ 减少动画模式支持 - 尊重用户偏好
- ✅ 高对比度模式 - 系统设置自动适配
- ✅ 焦点陷阱 - 模态框焦点管理
- ✅ Live Regions - 动态内容屏幕阅读器宣布
- ✅ Lighthouse 分数 > 95 - 自动化测试验证
- ✅ axe-core 测试 - 零无障碍违规

👉 [查看完整无障碍文档](./docs/ACCESSIBILITY.md)

## 📱 响应式设计 (Responsive Design)

断点系统：

- `sm`: 640px (手机横屏)
- `md`: 768px (平板)
- `lg`: 1024px (小屏笔记本)
- `xl`: 1280px (桌面)
- `2xl`: 1536px (大屏)

所有组件都经过移动端优化测试。

## 🖨️ 打印支持 (Print Support)

优化的打印样式，包括：

- 自动隐藏导航和交互元素
- 优化的内容布局
- 保留重要的视觉层级
- 链接 URL 自动显示

使用打印工具类：

```vue
<button class="no-print">在线操作</button>
<article class="print-break-avoid">完整内容</article>
```

## 🌐 国际化 (i18n)

当前支持简体中文，配置支持轻松添加其他语言：

```vue
<template>
  <h1>{{ $t('app.title') }}</h1>
</template>
```

添加新语言只需：

1. 创建新的 JSON 语言文件
2. 在 `nuxt.config.ts` 中注册

## 📚 Documentation

- [Frontend Documentation](./apps/frontend/README.md)
- [CMS Documentation](./apps/cms/README.md)
- [Design System Documentation](./docs/DESIGN_SYSTEM.md)
- [Component Documentation](http://localhost:3000/components) - Available when running dev server
- [Histoire Documentation](./apps/frontend/README.md#component-documentation) - Interactive component documentation

### 组件文档 (Component Documentation)

#### 方式一：Nuxt 页面

访问 `/components` 路由查看所有组件的实时示例和代码。

#### 方式二：Histoire

启动交互式组件文档：

```bash
cd apps/frontend
npm run story:dev
```

## 🌐 Deployment Considerations for China

### Frontend (Nuxt 3)

- Uses SSR mode suitable for China hosting
- Configured with domestic font CDNs (避免使用 Google Fonts)
- Tailwind CSS configured for Chinese typography
- Dark mode support included
- Network optimizations for China (timeouts, retries)

### CMS (Strapi)

- Database can be configured for Chinese cloud providers
- Docker images can be pulled from domestic registries
- See `apps/cms/README.md` for Docker registry configuration

## ⚙️ Strapi Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```bash
yarn strapi deploy
```

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

## 🛠️ 开发指南 (Development Guide)

### 添加新组件

1. 在 `apps/frontend/components/base/` 或 `components/layout/` 创建组件
2. 使用 TypeScript 定义 Props 接口
3. 添加 ARIA 属性和键盘支持
4. 创建 `.story.vue` 文件
5. 在文档中添加使用示例

### 代码风格

- 使用 TypeScript
- 使用 Composition API
- 使用 Tailwind 工具类优先
- 遵循 Vue 3 和 Nuxt 3 最佳实践

## 📥 Download Center

The Download Center provides a centralized location for managing downloadable resources:

### Features

- **Category-based Organization**: Templates, Worksheets, Cases, and more
- **Search & Filter**: Find downloads by title, category, or related lessons
- **Integrity Checks**: SHA-256 checksum validation for all downloads
- **Download History**: Track your downloads with validation status
- **Batch Downloads**: Select multiple files and download as ZIP
- **Offline Guidance**: Files cached in browser for offline access

### Managing Downloads in Strapi

1. Navigate to **Content Manager** → **Download Items**
2. Click **Create new entry**
3. Fill in the required fields:
   - Title and description
   - Category (Template, Worksheet, Case, Other)
   - Upload file (checksum auto-generated)
   - Optional: version, tag, related lessons/resources
4. Publish the entry

The system automatically:

- Calculates SHA-256 checksum on file upload
- Stores file metadata (size, MIME type)
- Updates checksums when files are replaced

### Using the Download Center

Visit `/downloads` to:

- Browse all available downloads
- Filter by category or search by keyword
- Download individual files with checksum verification
- Select multiple files for batch download (ZIP)
- View your download history

## 📚 Documentation

### Deployment

- **[PRODUCTION_DEPLOYMENT_CN.md](./docs/PRODUCTION_DEPLOYMENT_CN.md)** - 🇨🇳 **Complete China production deployment guide** (Alibaba Cloud/Tencent Cloud, ICP filing, SSL, Nginx, Docker/PM2)
- **[DEPLOYMENT_STRATEGY.md](./docs/DEPLOYMENT_STRATEGY.md)** - Blue/green deployment with zero-downtime
- **[PRODUCTION_CHECKLIST.md](./docs/PRODUCTION_CHECKLIST.md)** - Production go-live readiness checklist (Chinese)
- **[DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md)** - Deployment execution checklist
- **[DEPLOYMENT_QUICK_REFERENCE.md](./docs/DEPLOYMENT_QUICK_REFERENCE.md)** - Quick command reference
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - General deployment guide (Chinese)

### Docker & Containers (Docker 与容器)

- **[DOCKER.md](./docs/DOCKER.md)** - Complete Docker deployment guide (multi-stage builds, health checks, resource limits, Chinese mirror support)
- **[apps/cms/DOCKER_BUILD.md](./apps/cms/DOCKER_BUILD.md)** - CMS Docker build guide (optimized ≤450MB image with timezone support)

#### Quick Docker Commands

```bash
# Generate Strapi security keys (生成 Strapi 安全密钥)
pnpm generate:strapi-keys

# Build CMS Docker image (构建 CMS Docker 镜像)
pnpm docker:build:cms

# Build with China mirrors (使用中国镜像源构建)
pnpm docker:build:cms:china

# Start full stack with Docker Compose
pnpm docker:up

# View logs
pnpm docker:logs
```

### Security (安全)

- **[SECURITY_CN.md](./docs/SECURITY_CN.md)** - Production security configuration guide (security headers, CORS, rate limiting, HTTPS enforcement)

### Compliance & Regulations (合规与监管)

- **[COMPLIANCE_CHECKLIST_CN.md](./docs/COMPLIANCE_CHECKLIST_CN.md)** - China compliance checklist (ICP filing, data residency, PIPL, MLPS)
- **[PRIVACY_POLICY_TEMPLATE.md](./docs/compliance/PRIVACY_POLICY_TEMPLATE.md)** - Privacy policy template (Chinese)
- **[COOKIE_CONSENT_TEMPLATE.md](./docs/compliance/COOKIE_CONSENT_TEMPLATE.md)** - Cookie consent & policy template with implementation guide

### Scripts

- **[scripts/deploy/README.md](./scripts/deploy/README.md)** - Deployment scripts documentation
- **[tests/smoke/README.md](./tests/smoke/README.md)** - Smoke tests guide

### Infrastructure & Monitoring

- **[DOCKER.md](./docs/DOCKER.md)** - Docker configuration
- **[MONITORING.md](./docs/MONITORING.md)** - Monitoring and observability

### Features

- **[DESIGN_LOG_SYSTEM.md](./docs/DESIGN_LOG_SYSTEM.md)** - Design log system
- **[OPTIMIZATION_SUMMARY.md](./docs/OPTIMIZATION_SUMMARY.md)** - Performance optimizations

## 📚 Learn more about Strapi

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

## 📝 License

[Your License Here]

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

欢迎贡献！请确保：

1. 代码符合项目风格
2. 所有组件都有文档
3. 遵循无障碍访问标准
4. 添加适当的类型定义
5. 测试响应式和打印功能

## 🔗 相关链接 (Links)

- [Nuxt 3 文档](https://nuxt.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [VueUse](https://vueuse.org/)
- [Histoire](https://histoire.dev/)
- [Strapi Documentation](https://docs.strapi.io)

---

Made with ❤️ for Chinese educational content

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
