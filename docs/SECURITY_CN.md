# 生产环境安全配置指南

本文档详细说明了 Nuxt + Strapi 应用的生产环境安全配置。

## 目录

- [概述](#概述)
- [Nuxt 前端安全](#nuxt-前端安全)
- [Strapi 后端安全](#strapi-后端安全)
- [环境变量配置](#环境变量配置)
- [反向代理配置](#反向代理配置)
- [安全测试](#安全测试)

## 概述

本系统实现了全面的安全加固措施，包括：

- **安全标头**：HSTS、CSP、X-Frame-Options、Referrer-Policy 等
- **CORS 配置**：跨域资源共享的严格控制
- **访问频率限制**：防止 API 滥用和 DDoS 攻击
- **HTTPS 强制**：自动重定向 HTTP 请求到 HTTPS
- **安全 Cookie**：启用 HttpOnly、Secure、SameSite 属性

## Nuxt 前端安全

### 安全标头中间件

前端应用通过服务器中间件自动设置安全标头：

**位置**：`apps/frontend/server/middleware/security-headers.ts`

**功能**：
- HSTS（HTTP 严格传输安全）
- CSP（内容安全策略）
- X-Frame-Options（防止点击劫持）
- Referrer-Policy（控制引用信息）
- Permissions-Policy（功能权限策略）
- X-Content-Type-Options（防止 MIME 嗅探）
- X-XSS-Protection（XSS 保护）

### HTTPS 强制

系统会检查 `X-Forwarded-Proto` 标头，在生产环境下自动将 HTTP 请求重定向到 HTTPS。

```typescript
// 自动检测并重定向
if (proto === 'http' && process.env.NODE_ENV === 'production') {
  // 301 重定向到 HTTPS
}
```

### 访问频率限制

**位置**：`apps/frontend/server/middleware/rate-limit.ts`

**默认配置**：
- 每个 IP 每分钟最多 100 个请求
- 静态资源路径自动跳过限制
- 超过限制返回 429 状态码

**响应标头**：
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
Retry-After: 60
```

### 环境变量配置

在 `apps/frontend/.env.example` 中配置安全选项：

```bash
# HTTPS 强制
NUXT_PUBLIC_SECURITY_ENFORCE_HTTPS=true

# HSTS 配置
NUXT_PUBLIC_SECURITY_HSTS_ENABLED=true
NUXT_PUBLIC_SECURITY_HSTS_MAX_AGE=31536000
NUXT_PUBLIC_SECURITY_HSTS_INCLUDE_SUBDOMAINS=true
NUXT_PUBLIC_SECURITY_HSTS_PRELOAD=true

# CSP 配置
NUXT_PUBLIC_SECURITY_CSP_ENABLED=true
NUXT_PUBLIC_SECURITY_CSP_DEFAULT_SRC='self'
NUXT_PUBLIC_SECURITY_CSP_SCRIPT_SRC='self' 'unsafe-inline' 'unsafe-eval'
NUXT_PUBLIC_SECURITY_CSP_CONNECT_SRC='self' https://your-api-domain.com

# 访问频率限制
NUXT_PUBLIC_SECURITY_RATE_LIMIT_ENABLED=true
NUXT_PUBLIC_SECURITY_RATE_LIMIT_MAX_REQUESTS=100
NUXT_PUBLIC_SECURITY_RATE_LIMIT_WINDOW_MS=60000
```

### 生产环境 CSP 示例

对于生产环境，建议使用更严格的 CSP 配置：

```bash
# 更严格的脚本策略
NUXT_PUBLIC_SECURITY_CSP_SCRIPT_SRC='self' 'nonce-{random}'

# 允许特定的 CDN 域名
NUXT_PUBLIC_SECURITY_CSP_IMG_SRC='self' data: https://cdn.yourdomain.com

# 允许连接到 API 和 CDN
NUXT_PUBLIC_SECURITY_CSP_CONNECT_SRC='self' https://api.yourdomain.com https://cdn.yourdomain.com

# CSP 违规报告
NUXT_PUBLIC_SECURITY_CSP_REPORT_URI=https://your-csp-report-endpoint.com/report
```

## Strapi 后端安全

### 生产环境中间件

**位置**：`apps/cms/config/env/production/middlewares.ts`

Strapi 在生产环境下使用增强的安全配置：

```typescript
{
  name: 'strapi::security',
  config: {
    contentSecurityPolicy: { ... },
    hsts: { ... },
    frameguard: { ... },
    xssFilter: { ... },
  },
}
```

### CORS 配置

生产环境下的 CORS 使用白名单模式：

```typescript
{
  name: 'strapi::cors',
  config: {
    origin: ['https://yourdomain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
}
```

### 访问频率限制

Strapi 实现了两层访问频率限制：

1. **全局限制**（`global::rate-limit`）
   - 默认：每分钟 100 个请求
   - 应用于所有非跳过路径

2. **API 限制**（`global::api-rate-limit`）
   - 默认：每分钟 1000 个请求
   - 仅应用于 `/api/` 路径

**位置**：
- `apps/cms/src/middlewares/rate-limit.ts`
- `apps/cms/src/middlewares/api-rate-limit.ts`

### Cookie 安全

生产环境下的 Cookie 配置：

```typescript
{
  name: 'strapi::session',
  config: {
    cookie: {
      secure: true,        // 仅 HTTPS
      sameSite: 'strict',  // CSRF 保护
      httpOnly: true,      // 防止 XSS
    },
  },
}
```

### 环境变量配置

在 `apps/cms/.env.example` 中配置：

```bash
# CORS 配置
SECURITY_CORS_ENABLED=true
SECURITY_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
SECURITY_CORS_CREDENTIALS=true

# 安全标头
SECURITY_HSTS_ENABLED=true
SECURITY_HSTS_MAX_AGE=31536000
SECURITY_CSP_ENABLED=true
SECURITY_FRAME_GUARD=true
SECURITY_XSS_FILTER=true

# Cookie 安全
SECURITY_SECURE_COOKIES=true
SECURITY_SAME_SITE=strict

# 访问频率限制
SECURITY_RATE_LIMIT_ENABLED=true
SECURITY_RATE_LIMIT_MAX_REQUESTS=100
SECURITY_RATE_LIMIT_WINDOW_MS=60000

SECURITY_API_RATE_LIMIT_ENABLED=true
SECURITY_API_RATE_LIMIT_MAX_REQUESTS=1000
SECURITY_API_RATE_LIMIT_WINDOW_MS=60000
```

## 环境变量配置

### 根目录配置

在项目根目录的 `.env.example` 中：

```bash
# 安全标头
SECURITY_HSTS_ENABLED=true
SECURITY_HSTS_MAX_AGE=31536000
SECURITY_CSP_ENABLED=true
SECURITY_CORS_ALLOWED_ORIGINS=https://yourdomain.com
SECURITY_CORS_CREDENTIALS=true

# 访问频率限制
SECURITY_RATE_LIMIT_ENABLED=true
SECURITY_RATE_LIMIT_MAX_REQUESTS=100
SECURITY_RATE_LIMIT_WINDOW_MS=60000

# Cookie 安全
SECURITY_SECURE_COOKIES=true
SECURITY_SAME_SITE=strict
```

## 反向代理配置

### Nginx 配置示例

在使用 Nginx 作为反向代理时，需要正确配置标头：

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 传递正确的标头
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP 到 HTTPS 重定向
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 关键配置说明

1. **X-Forwarded-Proto**：必须设置，用于 HTTPS 检测和重定向
2. **X-Real-IP**：用于访问频率限制的 IP 识别
3. **X-Forwarded-For**：用于获取真实客户端 IP

## 安全测试

### 自动化测试

运行安全烟雾测试：

```bash
npm run test:smoke
```

测试包括：
- 安全标头验证
- HTTPS 重定向测试
- 访问频率限制测试
- CORS 配置验证

### 手动测试

#### 1. 测试安全标头

```bash
curl -I https://yourdomain.com
```

检查响应标头：
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

#### 2. 测试 HTTPS 重定向

```bash
curl -I http://yourdomain.com
```

应返回：
```
HTTP/1.1 301 Moved Permanently
Location: https://yourdomain.com/
```

#### 3. 测试访问频率限制

```bash
# 发送多个请求
for i in {1..105}; do
  curl -I https://yourdomain.com/api/test
  sleep 0.1
done
```

第 101 个请求应返回：
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
```

#### 4. 测试 CSP

在浏览器开发者工具中：
1. 打开控制台
2. 尝试注入内联脚本
3. 检查 CSP 违规报告

### 浏览器测试工具

使用以下工具测试安全性：

1. **Mozilla Observatory**
   - https://observatory.mozilla.org/
   - 综合安全评分

2. **Security Headers**
   - https://securityheaders.com/
   - 安全标头检查

3. **SSL Labs**
   - https://www.ssllabs.com/ssltest/
   - SSL/TLS 配置测试

## 生产部署检查清单

在部署到生产环境前，请确保：

- [ ] 所有安全环境变量已正确配置
- [ ] HTTPS 证书已安装并有效
- [ ] 反向代理正确传递 X-Forwarded-* 标头
- [ ] CORS 白名单仅包含授权域名
- [ ] 访问频率限制已启用并测试
- [ ] CSP 策略已调整为生产配置（禁用 unsafe-eval 等）
- [ ] 安全 Cookie 配置已启用
- [ ] 所有密钥和令牌已更新为强随机值
- [ ] 安全烟雾测试全部通过
- [ ] 浏览器安全测试工具评分达标

## 监控和维护

### 日志监控

监控以下安全相关日志：

- CSP 违规报告
- 访问频率限制触发
- CORS 拒绝请求
- 异常的 IP 访问模式

### 定期维护

- 每月审查和更新 CSP 策略
- 每季度更新依赖包（包括安全补丁）
- 每半年审查访问频率限制阈值
- 每年更新 SSL/TLS 证书（如使用手动证书）

## 故障排除

### CSP 阻止资源加载

**症状**：控制台显示 CSP 违规错误

**解决**：
1. 查看具体的违规报告
2. 更新相应的 CSP 指令
3. 添加必要的域名或源

### 访问频率限制过于严格

**症状**：正常用户频繁遇到 429 错误

**解决**：
1. 分析访问模式
2. 调整 `MAX_REQUESTS` 和 `WINDOW_MS`
3. 考虑添加跳过路径

### HTTPS 重定向循环

**症状**：页面无限重定向

**解决**：
1. 检查 Nginx X-Forwarded-Proto 配置
2. 确保应用正确读取标头
3. 检查 SSL 终止配置

## 参考资源

- [OWASP 安全标头项目](https://owasp.org/www-project-secure-headers/)
- [内容安全策略指南](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)
- [Strapi 安全最佳实践](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/optional-software/nginx.html)
- [Nuxt 安全模块](https://nuxt.com/modules/security)

## 联系和支持

如有安全问题或发现漏洞，请通过以下方式联系：

- 邮箱：security@yourdomain.com
- 负责人：[参考 PERSONAL_INFO_OFFICER_NAME 环境变量]
