# 快速开始指南 (Quick Start Guide)

欢迎使用 Nuxt 3 + Strapi CMS 单体仓库！本指南帮助您快速启动项目。

## 📋 前提条件

- Node.js >= 18.0.0 <= 22.x.x
- pnpm >= 8.0.0
- Docker & Docker Compose (可选，用于容器化部署)

## 🚀 5 分钟快速启动

### 1. 安装 pnpm

```bash
npm install -g pnpm
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 环境配置

```bash
# Frontend
cd apps/frontend
cp .env.example .env

# CMS
cd ../cms
cp .env.example .env
```

### 4. 启动开发服务器

```bash
# 返回根目录
cd ../..

# 同时启动 Frontend 和 CMS
pnpm dev
```

访问：

- **Frontend**: http://localhost:3000
- **CMS Admin**: http://localhost:1337/admin

## 🐳 Docker 快速启动

### 开发环境（仅数据库）

```bash
# 启动 PostgreSQL 和 Redis
pnpm docker:dev

# 本地运行应用
pnpm dev
```

### 完整容器化

```bash
# 1. 配置环境变量
cp .env.docker.example .env.docker
# 编辑 .env.docker 填入配置

# 2. 构建并启动
pnpm docker:build
pnpm docker:up

# 3. 查看日志
pnpm docker:logs

# 4. 停止服务
pnpm docker:down
```

## ✨ 主要功能

### 1. 设计日志系统

访问 http://localhost:3000/design-log

- 📝 创建设计日志
- 💾 自动保存草稿
- 📄 导出 PDF
- 🔍 搜索和过滤

### 2. 全局搜索

按 `Cmd/Ctrl + K` 打开搜索：

- 搜索课程、知识卡片、学生作品
- 智能中文分词
- 键盘导航

### 3. 下载中心

访问 http://localhost:3000/downloads

- 📦 资源下载
- ✅ 文件完整性验证
- 📊 下载历史

## 📦 常用命令

### 开发

```bash
pnpm dev              # 启动所有服务
pnpm dev:frontend     # 仅启动 Frontend
pnpm dev:cms          # 仅启动 CMS
```

### 构建

```bash
pnpm build            # 构建所有应用
pnpm build:frontend   # 仅构建 Frontend
pnpm build:cms        # 仅构建 CMS
```

### 代码质量

```bash
pnpm lint             # 代码检查
pnpm lint:fix         # 自动修复
pnpm format           # 格式化代码
pnpm typecheck        # 类型检查
pnpm test             # 运行测试
```

### Docker

```bash
pnpm docker:build     # 构建镜像
pnpm docker:up        # 启动服务
pnpm docker:down      # 停止服务
pnpm docker:logs      # 查看日志
pnpm docker:dev       # 开发环境
```

### 性能监控

```bash
pnpm lighthouse       # 运行 Lighthouse CI
```

## 📚 文档导航

### 核心文档

- [README.md](./README.md) - 项目概览
- [CHANGELOG.md](./CHANGELOG.md) - 更新日志

### 技术文档

- [部署指南](./docs/DEPLOYMENT.md) - 生产环境部署
- [Docker 文档](./docs/DOCKER.md) - 容器化详解
- [监控指南](./docs/MONITORING.md) - 性能监控
- [优化总结](./docs/OPTIMIZATION_SUMMARY.md) - 批量优化任务

### 功能文档

- [设计日志系统](./docs/DESIGN_LOG_SYSTEM.md) - 设计工具套件

### 应用文档

- [Frontend README](./apps/frontend/README.md) - Nuxt 应用文档
- [CMS README](./apps/cms/README.md) - Strapi 文档

## 🔧 配置说明

### Frontend 环境变量

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:1337
NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
NUXT_STRAPI_API_TOKEN=your-api-token-here
NUXT_STRAPI_URL=http://localhost:1337
```

### CMS 环境变量

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

## 🎯 下一步

### 开发者

1. 查看 [项目结构](./README.md#project-structure)
2. 了解 [代码规范](./README.md#code-style)
3. 阅读 [组件文档](./README.md#component-documentation)
4. 探索 [API 文档](./apps/cms/README.md)

### 部署

1. 阅读 [部署指南](./docs/DEPLOYMENT.md)
2. 配置 [CI/CD](./docs/DEPLOYMENT.md#cicd-流程)
3. 设置 [监控](./docs/MONITORING.md)
4. 了解 [备份策略](./docs/DEPLOYMENT.md#备份和恢复)

### 使用者

1. 创建第一个 [设计日志](./docs/DESIGN_LOG_SYSTEM.md)
2. 探索 [全局搜索](./README.md#global-search-system)
3. 访问 [下载中心](./README.md#download-center)

## 🐛 故障排除

### 端口冲突

```bash
# 检查端口占用
lsof -i :3000
lsof -i :1337

# 杀死进程
kill -9 <PID>
```

### 数据库连接失败

```bash
# 重启数据库容器
docker-compose restart postgres

# 检查数据库日志
docker-compose logs postgres
```

### 依赖安装失败

```bash
# 清理缓存
pnpm store prune

# 删除 node_modules 重新安装
rm -rf node_modules apps/*/node_modules
pnpm install
```

### Docker 问题

```bash
# 查看容器状态
docker-compose ps

# 查看容器日志
docker-compose logs <service-name>

# 重建镜像
docker-compose build --no-cache

# 清理系统
docker system prune -a
```

## 📞 获取帮助

- 📖 查看 [文档目录](./docs/)
- 🐛 提交 [Issue](https://github.com/your-repo/issues)
- 💬 加入讨论区
- 📧 联系维护者

## 🎓 学习资源

### 技术栈

- [Nuxt 3 文档](https://nuxt.com/)
- [Strapi 文档](https://docs.strapi.io)
- [Vue 3 文档](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Docker 文档](https://docs.docker.com/)

### 工具

- [pnpm 文档](https://pnpm.io/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Lighthouse 文档](https://developer.chrome.com/docs/lighthouse/)

## ✅ 检查清单

完成以下步骤确保环境正常：

- [ ] Node.js 版本正确 (`node -v`)
- [ ] pnpm 已安装 (`pnpm -v`)
- [ ] 依赖已安装 (`pnpm install`)
- [ ] 环境变量已配置 (`.env` 文件)
- [ ] Frontend 可以访问 (http://localhost:3000)
- [ ] CMS Admin 可以访问 (http://localhost:1337/admin)
- [ ] 健康检查通过:
  - `curl http://localhost:3000/api/health`
  - `curl http://localhost:1337/_health`

## 🎉 开始开发

一切就绪！现在您可以：

1. **创建设计日志**: 访问 `/design-log`
2. **浏览内容**: 访问首页
3. **管理内容**: 访问 CMS Admin
4. **搜索内容**: 按 `Cmd/Ctrl + K`
5. **下载资源**: 访问 `/downloads`

祝您开发愉快！🚀

---

**需要帮助？** 查看 [完整文档](./README.md) 或 [故障排除指南](./docs/DEPLOYMENT.md#故障排除)
