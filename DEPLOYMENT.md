# 部署指南 (Deployment Guide)

本指南介绍如何将应用部署到阿里云（Aliyun）或腾讯云（Tencent Cloud）。

## 目录

1. [前提条件](#前提条件)
2. [环境配置](#环境配置)
3. [ICP备案](#icp备案)
4. [部署到阿里云](#部署到阿里云)
5. [部署到腾讯云](#部署到腾讯云)
6. [性能监控](#性能监控)
7. [故障排查](#故障排查)

## 前提条件

### 必需条件

- Node.js 20.x 或更高版本
- Docker 和 Docker Compose
- Git
- 阿里云或腾讯云账号
- 已完成ICP备案的域名

### 云服务要求

- **计算资源**: 至少 2 vCPU, 4GB RAM
- **存储**: 至少 20GB SSD
- **带宽**: 建议 5Mbps 或更高
- **操作系统**: Ubuntu 20.04 LTS 或 CentOS 8

## 环境配置

### 1. 克隆仓库

```bash
git clone <repository-url>
cd china-optimized-nuxt-app
```

### 2. 配置环境变量

复制示例环境文件并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置以下变量：

```env
# 站点配置
NUXT_PUBLIC_SITE_URL=https://yourdomain.com
NUXT_PUBLIC_SITE_NAME=在线教育平台

# 百度统计
NUXT_PUBLIC_BAIDU_ANALYTICS_ID=your_baidu_analytics_id

# ICP备案号
NUXT_PUBLIC_ICP_NUMBER=京ICP备XXXXXXXX号-1

# 服务器配置
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

### 3. 安装依赖

```bash
npm install
```

### 4. 构建应用

```bash
npm run build
```

## ICP备案

### 什么是ICP备案？

根据中国法律，所有在中国大陆托管的网站必须进行ICP（互联网内容提供商）备案。

### 备案流程

1. **准备材料**
   - 营业执照或个人身份证
   - 域名证书
   - 服务器租赁合同（由云服务商提供）
   - 网站负责人照片

2. **在云服务商平台提交备案**
   - 阿里云: https://beian.aliyun.com/
   - 腾讯云: https://cloud.tencent.com/product/ba

3. **审核流程**
   - 云服务商初审（1-2个工作日）
   - 管局审核（10-20个工作日）
   - 备案完成后获得备案号

4. **在网站底部显示备案号**
   - 备案号必须显示在网站首页底部
   - 必须链接到 https://beian.miit.gov.cn/

### 重要提示

- 备案期间网站无法访问
- 建议在域名和服务器购买前完成规划
- 备案信息变更需要重新提交审核

## 部署到阿里云

### 方法一：使用 Docker（推荐）

#### 1. 安装 Docker

```bash
# 在阿里云 ECS 实例上
curl -fsSL https://get.docker.com | bash
sudo systemctl start docker
sudo systemctl enable docker
```

#### 2. 配置阿里云容器镜像服务

登录阿里云容器镜像服务控制台：
- 创建命名空间
- 创建镜像仓库
- 获取登录凭证

#### 3. 构建并推送镜像

```bash
# 构建镜像
docker build -t china-nuxt-app:latest .

# 登录阿里云容器镜像服务
docker login --username=your_username registry.cn-hangzhou.aliyuncs.com

# 标记镜像
docker tag china-nuxt-app:latest \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/china-nuxt-app:latest

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/china-nuxt-app:latest
```

#### 4. 在 ECS 上运行容器

```bash
# 拉取镜像
docker pull registry.cn-hangzhou.aliyuncs.com/your-namespace/china-nuxt-app:latest

# 运行容器
docker run -d \
  --name nuxt-app \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NUXT_PUBLIC_SITE_URL=https://yourdomain.com \
  -e NUXT_PUBLIC_BAIDU_ANALYTICS_ID=your_id \
  -e NUXT_PUBLIC_ICP_NUMBER=your_icp_number \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/china-nuxt-app:latest
```

或使用 Docker Compose：

```bash
docker-compose up -d
```

### 方法二：使用 PM2

#### 1. 安装 PM2

```bash
npm install -g pm2
```

#### 2. 创建 PM2 配置文件

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'nuxt-app',
    script: '.output/server/index.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    }
  }]
}
```

#### 3. 启动应用

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 配置 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check endpoint
    location /api/health {
        proxy_pass http://127.0.0.1:3000/api/health;
        access_log off;
    }
}
```

### 配置 CDN

1. 登录阿里云 CDN 控制台
2. 添加加速域名
3. 配置源站信息（指向您的 ECS 实例）
4. 配置缓存规则：
   - 静态资源（图片、CSS、JS）：缓存 30 天
   - HTML 页面：缓存 1 小时
5. 开启 HTTPS 和 HTTP/2
6. 配置 CNAME 记录

## 部署到腾讯云

部署步骤与阿里云类似，主要区别：

### 容器镜像服务

```bash
# 登录腾讯云容器镜像服务
docker login --username=your_username ccr.ccs.tencentyun.com

# 推送镜像
docker tag china-nuxt-app:latest \
  ccr.ccs.tencentyun.com/your-namespace/china-nuxt-app:latest
docker push ccr.ccs.tencentyun.com/your-namespace/china-nuxt-app:latest
```

### CDN 配置

1. 登录腾讯云 CDN 控制台
2. 配置步骤与阿里云类似
3. 使用腾讯云的智能加速功能优化中国境内访问

## 性能监控

### 健康检查

应用提供健康检查端点：

```bash
curl http://your-domain.com/api/health
```

响应示例：

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "production",
  "version": "1.0.0"
}
```

### 运行性能测试

在本地环境运行 Lighthouse 测试：

```bash
# 启动应用
npm run build
npm run preview

# 在另一个终端运行测试
npm run lighthouse
```

### 监控指标

关键性能指标（KPI）：

- **首次内容绘制 (FCP)**: < 2 秒
- **最大内容绘制 (LCP)**: < 3 秒
- **累积布局偏移 (CLS)**: < 0.1
- **总阻塞时间 (TBT)**: < 300ms
- **Lighthouse 性能分数**: > 85
- **Lighthouse SEO 分数**: > 90

### 设置告警

在云服务商控制台设置以下告警：

1. CPU 使用率 > 80%
2. 内存使用率 > 85%
3. 磁盘使用率 > 80%
4. 响应时间 > 3 秒
5. 错误率 > 1%

## 故障排查

### 常见问题

#### 1. 应用无法启动

```bash
# 查看 Docker 日志
docker logs nuxt-app

# 或查看 PM2 日志
pm2 logs nuxt-app
```

#### 2. 性能问题

- 检查服务器资源使用情况
- 启用 CDN 加速
- 优化数据库查询
- 增加服务器实例（水平扩展）

#### 3. SEO 问题

验证以下内容：

```bash
# 检查 robots.txt
curl http://your-domain.com/robots.txt

# 检查 sitemap.xml
curl http://your-domain.com/sitemap.xml

# 验证结构化数据
# 使用百度搜索资源平台的工具
```

#### 4. 百度统计未生效

- 确认已设置 `NUXT_PUBLIC_BAIDU_ANALYTICS_ID`
- 检查用户是否同意 Cookie 使用
- 在浏览器控制台检查脚本加载情况

### 日志管理

#### Docker 日志

```bash
# 查看实时日志
docker logs -f nuxt-app

# 查看最后 100 行
docker logs --tail 100 nuxt-app
```

#### PM2 日志

```bash
# 查看日志
pm2 logs nuxt-app

# 清空日志
pm2 flush
```

## 安全建议

1. **使用 HTTPS**: 强制所有流量使用 HTTPS
2. **防火墙配置**: 只开放必要的端口（80, 443）
3. **定期更新**: 保持系统和依赖项更新
4. **备份**: 定期备份数据和配置
5. **访问控制**: 使用强密码和 SSH 密钥认证
6. **监控**: 设置安全告警和日志审计

## CI/CD 自动化

项目包含 GitHub Actions 工作流，可以自动化构建和部署。

### 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

- `NUXT_PUBLIC_SITE_URL`
- `NUXT_PUBLIC_BAIDU_ANALYTICS_ID`
- `NUXT_PUBLIC_ICP_NUMBER`
- `ALIYUN_USERNAME` 和 `ALIYUN_PASSWORD`（或腾讯云凭证）

### 触发部署

推送到 `main` 或 `production` 分支将自动触发构建和部署。

## 性能优化清单

- [x] 启用 SSR 和静态生成
- [x] 配置图片优化（WebP 格式）
- [x] 使用系统字体（避免外部字体加载）
- [x] 启用资源压缩（Gzip/Brotli）
- [x] 配置 CDN 加速
- [x] 实现代码分割和懒加载
- [x] 添加服务端缓存（SWR）
- [x] 配置安全响应头
- [x] 实现健康检查端点
- [x] 添加结构化数据
- [x] 配置 sitemap.xml 和 robots.txt
- [x] 集成百度统计（带 Cookie 同意）

## 支持

如有问题，请通过以下方式联系：

- 提交 GitHub Issue
- 邮箱: support@example.com

## 许可证

本项目采用 MIT 许可证。
