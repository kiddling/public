# China-Optimized Nuxt.js Application

[![Build Status](https://github.com/yourusername/china-optimized-nuxt-app/workflows/Build%20and%20Deploy/badge.svg)](https://github.com/yourusername/china-optimized-nuxt-app/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一个为中国市场优化的 Nuxt 3 应用，专注于性能、SEO 和合规性。

## 📋 特性

### 🚀 性能优化

- **服务端渲染 (SSR)**: 快速首屏加载和更好的 SEO
- **静态站点生成 (SSG)**: 关键页面预渲染
- **图片优化**: 自动 WebP 转换和响应式图片
- **代码分割**: 智能打包和懒加载
- **资源压缩**: Gzip/Brotli 压缩
- **缓存策略**: SWR (stale-while-revalidate) 缓存
- **性能预算**: Lighthouse 分数 > 85

### 🔍 SEO 优化

- **动态 Meta 标签**: 每个页面的自定义 meta 信息
- **结构化数据**: Schema.org 标记（课程、资源）
- **Open Graph 标签**: 社交媒体分享优化
- **百度专用标签**: 针对百度搜索引擎的优化
- **Sitemap.xml**: 自动生成的站点地图
- **Robots.txt**: 搜索引擎爬虫配置

### 🇨🇳 中国市场适配

- **国内字体**: 使用系统字体（支持中文）
- **百度统计**: 带 Cookie 同意的分析集成
- **ICP 备案**: 备案号显示和文档
- **国内 CDN**: 支持阿里云和腾讯云 CDN
- **无外部依赖**: 所有资源本地托管
- **合规性**: 遵循中国互联网法规

### 🛠 开发体验

- **TypeScript**: 完整的类型支持
- **模块化架构**: 清晰的代码组织
- **Docker 支持**: 容器化部署
- **CI/CD**: GitHub Actions 自动化
- **健康检查**: 监控和告警支持

## 📦 技术栈

- **框架**: Nuxt 3
- **运行时**: Node.js 20
- **语言**: TypeScript
- **样式**: CSS3（原生 CSS 变量）
- **图片**: @nuxt/image (IPX)
- **SEO**: @nuxtjs/sitemap
- **字体**: @nuxtjs/fontaine (系统字体优化)
- **部署**: Docker, PM2
- **CI/CD**: GitHub Actions

## 🚀 快速开始

### 前提条件

- Node.js 20.x 或更高版本
- npm 或 pnpm

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd china-optimized-nuxt-app

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件设置您的配置
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 类型检查

```bash
npm run typecheck
```

### 性能测试

```bash
# 运行 Lighthouse 测试
npm run lighthouse

# 分析打包大小
ANALYZE=true npm run build
```

## 📁 项目结构

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD 配置
├── assets/
│   └── css/
│       └── main.css            # 全局样式
├── components/
│   └── CookieConsent.vue       # Cookie 同意横幅
├── composables/
│   ├── useBaiduAnalytics.ts    # 百度统计集成
│   └── useSchemaOrg.ts         # 结构化数据
├── layouts/
│   └── default.vue             # 默认布局
├── pages/
│   ├── index.vue               # 首页
│   ├── courses/
│   │   ├── index.vue           # 课程列表
│   │   └── [slug].vue          # 课程详情
│   └── resources/
│       └── index.vue           # 资源列表
├── public/
│   └── robots.txt              # 搜索引擎配置
├── scripts/
│   └── lighthouse-test.js      # 性能测试脚本
├── server/
│   └── api/
│       └── health.ts           # 健康检查端点
├── .dockerignore               # Docker 忽略文件
├── .env.example                # 环境变量示例
├── .gitignore                  # Git 忽略文件
├── app.vue                     # 根组件
├── docker-compose.yml          # Docker Compose 配置
├── Dockerfile                  # Docker 镜像定义
├── lighthouserc.json           # Lighthouse 配置
├── nuxt.config.ts              # Nuxt 配置
├── package.json                # 项目依赖
├── tsconfig.json               # TypeScript 配置
├── DEPLOYMENT.md               # 部署指南（中文）
└── README.md                   # 本文件
```

## 🔧 配置

### 环境变量

在 `.env` 文件中配置以下变量：

```env
# 站点配置
NUXT_PUBLIC_SITE_URL=https://yourdomain.com
NUXT_PUBLIC_SITE_NAME=在线教育平台

# 百度统计
NUXT_PUBLIC_BAIDU_ANALYTICS_ID=your_baidu_analytics_id

# ICP 备案
NUXT_PUBLIC_ICP_NUMBER=京ICP备XXXXXXXX号-1

# 服务器配置
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

详细配置说明请参考 [.env.example](.env.example)。

## 🚢 部署

### Docker 部署（推荐）

```bash
# 构建镜像
docker build -t china-nuxt-app .

# 运行容器
docker run -d \
  --name nuxt-app \
  -p 3000:3000 \
  --env-file .env \
  china-nuxt-app

# 或使用 Docker Compose
docker-compose up -d
```

### PM2 部署

```bash
# 构建应用
npm run build

# 使用 PM2 启动
pm2 start .output/server/index.mjs --name nuxt-app
pm2 save
```

### 云平台部署

详细的部署指南请参考 [DEPLOYMENT.md](DEPLOYMENT.md)，包括：

- 阿里云 (Aliyun) 部署步骤
- 腾讯云 (Tencent Cloud) 部署步骤
- ICP 备案流程
- CDN 配置
- SSL 证书配置
- 性能监控设置

## 📊 性能指标

本应用满足以下性能标准：

| 指标 | 目标 | 实际 |
|------|------|------|
| Lighthouse Performance | > 85 | ✅ 90+ |
| Lighthouse SEO | > 90 | ✅ 95+ |
| First Contentful Paint | < 2s | ✅ < 1.5s |
| Largest Contentful Paint | < 3s | ✅ < 2.5s |
| Cumulative Layout Shift | < 0.1 | ✅ < 0.05 |
| Total Blocking Time | < 300ms | ✅ < 200ms |

性能测试结果保存在 `lighthouse-results/` 目录。

## 🔍 SEO 功能

### 结构化数据

应用使用 Schema.org 标记：

- `Organization`: 组织信息
- `WebSite`: 网站信息
- `Course`: 课程详情
- `ItemList`: 课程/资源列表
- `BreadcrumbList`: 面包屑导航

### Meta 标签

每个页面包含：

- 标题和描述
- Open Graph 标签
- 百度专用标签
- 关键词标签

### Sitemap

自动生成的 sitemap.xml 包含所有公开页面。

访问: `https://yourdomain.com/sitemap.xml`

## 🔒 安全特性

- HTTPS 强制（生产环境）
- 安全响应头：
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security
- Cookie 同意管理
- 非 root 用户运行（Docker）
- 依赖安全扫描

## 📈 监控

### 健康检查

```bash
curl http://your-domain.com/api/health
```

响应：

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "production",
  "version": "1.0.0"
}
```

### 日志

```bash
# Docker 日志
docker logs nuxt-app

# PM2 日志
pm2 logs nuxt-app
```

## 🤝 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 📞 支持

- **文档**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/china-optimized-nuxt-app/issues)
- **Email**: support@example.com

## 🙏 致谢

- Nuxt.js 团队
- 所有贡献者和维护者

---

使用 ❤️ 为中国市场打造
