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
NUXT_STRAPI_URL=http://localhost:1337
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

- ✅ 键盘导航支持
- ✅ 屏幕阅读器优化
- ✅ ARIA 标签和角色
- ✅ 清晰的焦点样式
- ✅ 颜色对比度符合标准
- ✅ Skip links 快速导航
- ✅ 减少动画模式支持

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
