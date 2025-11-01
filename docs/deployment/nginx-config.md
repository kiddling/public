# Nginx 配置指南 (Nginx Configuration Guide)

本指南提供了针对 Nuxt 3 + Strapi 项目的 Nginx 反向代理配置，包括 HTTPS 重定向、Gzip/Brotli 压缩和缓存策略。

## 完整 Nginx 配置示例

### 前端服务器 Nginx 配置

创建配置文件 `/etc/nginx/sites-available/frontend.conf`:

```nginx
# 上游服务器配置 - Nuxt SSR
upstream nuxt_upstream {
    # 如果使用多个 Nuxt 实例，可以添加多个 server
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    # server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    
    keepalive 64;
}

# HTTP 服务器 - 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    # Let's Encrypt ACME 验证
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 强制 HTTPS 重定向
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com www.example.com;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 日志配置
    access_log /var/log/nginx/frontend_access.log combined buffer=16k flush=5s;
    error_log /var/log/nginx/frontend_error.log warn;

    # 客户端请求限制
    client_max_body_size 10M;
    client_body_buffer_size 128k;

    # Gzip 压缩配置
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";
    gzip_min_length 1000;

    # Brotli 压缩配置（需要安装 nginx-module-brotli）
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot|otf)$ {
        proxy_pass http://nuxt_upstream;
        proxy_cache nuxt_cache;
        proxy_cache_valid 200 30d;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;
        proxy_cache_lock on;
        add_header X-Cache-Status $upstream_cache_status;
        expires 30d;
        access_log off;
    }

    location ~* \.(css|js)$ {
        proxy_pass http://nuxt_upstream;
        proxy_cache nuxt_cache;
        proxy_cache_valid 200 7d;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        add_header X-Cache-Status $upstream_cache_status;
        expires 7d;
    }

    # Nuxt 应用反向代理
    location / {
        proxy_pass http://nuxt_upstream;
        proxy_http_version 1.1;
        
        # WebSocket 支持（如果使用 HMR）
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 反向代理头部
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲配置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # 健康检查端点（不缓存）
    location /api/health {
        proxy_pass http://nuxt_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass 1;
        proxy_no_cache 1;
        access_log off;
    }

    # Favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    # Robots.txt
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
}

# Nginx 缓存配置
proxy_cache_path /var/cache/nginx/nuxt levels=1:2 keys_zone=nuxt_cache:10m max_size=1g inactive=60m use_temp_path=off;
```

### CMS (Strapi) 服务器 Nginx 配置

创建配置文件 `/etc/nginx/sites-available/cms.conf`:

```nginx
# 上游服务器配置 - Strapi
upstream strapi_upstream {
    server 127.0.0.1:1337 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

# HTTP 服务器 - 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name cms.example.com;

    # Let's Encrypt ACME 验证
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 强制 HTTPS 重定向
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cms.example.com;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/cms.example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/cms.example.com.key;

    # SSL 安全配置（同上）
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 日志配置
    access_log /var/log/nginx/cms_access.log combined buffer=16k flush=5s;
    error_log /var/log/nginx/cms_error.log warn;

    # Strapi 需要较大的上传限制
    client_max_body_size 100M;
    client_body_buffer_size 256k;

    # Gzip 压缩配置
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
    gzip_min_length 1000;

    # Brotli 压缩配置
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    # Strapi 管理面板和 API
    location / {
        proxy_pass http://strapi_upstream;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # 更长的超时时间（适应文件上传）
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;

        # 缓冲配置
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # 健康检查端点
    location /cms/health {
        proxy_pass http://strapi_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # 静态资源（上传的文件）
    location /uploads/ {
        proxy_pass http://strapi_upstream;
        proxy_cache strapi_cache;
        proxy_cache_valid 200 30d;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        add_header X-Cache-Status $upstream_cache_status;
        expires 30d;
    }
}

# Strapi 缓存配置
proxy_cache_path /var/cache/nginx/strapi levels=1:2 keys_zone=strapi_cache:10m max_size=2g inactive=30d use_temp_path=off;
```

## 安装和启用配置

### 1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. 安装 Brotli 模块（可选但推荐）

```bash
# Ubuntu/Debian
sudo apt install libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static

# 或者从源码编译
git clone https://github.com/google/ngx_brotli.git
cd ngx_brotli && git submodule update --init
# 编译 Nginx 时添加 --add-module=/path/to/ngx_brotli
```

### 3. 创建缓存目录

```bash
sudo mkdir -p /var/cache/nginx/nuxt
sudo mkdir -p /var/cache/nginx/strapi
sudo chown -R nginx:nginx /var/cache/nginx
```

### 4. 部署配置文件

```bash
# 复制配置到 sites-available
sudo cp frontend.conf /etc/nginx/sites-available/
sudo cp cms.conf /etc/nginx/sites-available/

# 创建软链接到 sites-enabled
sudo ln -s /etc/nginx/sites-available/frontend.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/cms.conf /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

### 5. 配置 SSL 证书

#### 使用 Let's Encrypt (推荐)

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot --nginx -d cms.example.com

# 自动续期（Certbot 会自动添加 cron 任务）
sudo certbot renew --dry-run
```

#### 手动配置证书

如果使用阿里云或腾讯云的 SSL 证书：

```bash
# 下载证书文件
# 将证书放到 /etc/nginx/ssl/
sudo mkdir -p /etc/nginx/ssl
sudo cp example.com.crt /etc/nginx/ssl/
sudo cp example.com.key /etc/nginx/ssl/
sudo chmod 600 /etc/nginx/ssl/*.key
```

## 性能优化建议

### 1. 调整 Worker 进程数

编辑 `/etc/nginx/nginx.conf`:

```nginx
# 根据 CPU 核心数设置
worker_processes auto;

# 增加单个 worker 的连接数
events {
    worker_connections 2048;
    use epoll;
}
```

### 2. 启用 HTTP/2

配置中已包含 `http2` 指令。确保 Nginx 版本 >= 1.9.5。

### 3. 配置缓存头部

在应用层面（Nuxt/Strapi）设置合理的 `Cache-Control` 头部，Nginx 会遵循这些指令。

### 4. 使用 CDN

将 Nginx 作为源站，前面配置 CDN。详见 [cdn-strategy.md](./cdn-strategy.md)。

## 监控和日志

### 查看实时日志

```bash
# 前端访问日志
sudo tail -f /var/log/nginx/frontend_access.log

# CMS 访问日志
sudo tail -f /var/log/nginx/cms_access.log

# 错误日志
sudo tail -f /var/log/nginx/frontend_error.log
sudo tail -f /var/log/nginx/cms_error.log
```

### 日志轮转

Nginx 通常会自动配置日志轮转。检查 `/etc/logrotate.d/nginx`。

### 启用 Nginx 状态监控

在 `/etc/nginx/sites-available/default` 中添加：

```nginx
server {
    listen 127.0.0.1:8080;
    server_name localhost;

    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
```

访问 `curl http://127.0.0.1:8080/nginx_status` 查看状态。

## 故障排查

### 检查配置语法

```bash
sudo nginx -t
```

### 502 Bad Gateway

- 检查上游服务器是否运行（Nuxt/Strapi）
- 检查端口是否正确
- 查看 Nginx 错误日志

### SSL 证书问题

```bash
# 检查证书有效期
sudo certbot certificates

# 手动续期
sudo certbot renew
```

### 缓存问题

```bash
# 清除 Nginx 缓存
sudo rm -rf /var/cache/nginx/nuxt/*
sudo rm -rf /var/cache/nginx/strapi/*
sudo systemctl reload nginx
```

## 相关文档

- [中国云部署指南](./china-cloud.md)
- [CDN 策略](./cdn-strategy.md)
- [监控和日志](./monitoring-logging.md)

## 参考资源

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Nuxt 3 部署文档](https://nuxt.com/docs/getting-started/deployment)
- [Strapi 部署文档](https://docs.strapi.io/dev-docs/deployment)
