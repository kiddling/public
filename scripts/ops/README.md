# 运维脚本 (Operations Scripts)

本目录包含用于监控、备份和运维的自动化脚本。

## 📋 目录

- [环境变量验证脚本 (validate-env.sh)](#环境变量验证脚本-validate-envsh)
- [备份脚本 (backup.sh)](#备份脚本-backupsh)
- [恢复脚本 (restore.sh)](#恢复脚本-restoresh)
- [健康检查脚本 (healthcheck.sh)](#健康检查脚本-healthchecksh)

## 🔧 前置要求

### 必需工具

所有脚本都需要：

```bash
# Bash shell (内置)
bash --version

# 基础工具
which curl tar
```

备份和恢复脚本额外需要：

```bash
# PostgreSQL 客户端工具
sudo apt-get install postgresql-client

# 或在 macOS 上
brew install postgresql
```

## ✅ 环境变量验证脚本 (validate-env.sh)

验证生产环境配置，确保所有必需的环境变量已正确设置。

### 功能特性

- ✅ 验证核心 Strapi 配置变量
- ✅ 检查安全配置（HSTS、CSP、CORS 等）
- ✅ 验证访问频率限制配置
- ✅ 合规配置检查
- ✅ 生产环境特殊检查
- ✅ 检测默认/弱密钥
- ✅ 彩色输出，清晰的错误和警告信息

### 使用方法

```bash
# 验证当前环境变量
npm run validate:env

# 或直接运行脚本
bash scripts/ops/validate-env.sh

# 在生产环境检查
NODE_ENV=production bash scripts/ops/validate-env.sh
```

### 验证项

**核心配置**：

- `HOST`, `PORT`, `APP_KEYS`
- `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`
- `JWT_SECRET`, `TRANSFER_TOKEN_SALT`

**安全配置**：

- HSTS 设置
- CSP 策略
- CORS 配置
- Cookie 安全
- 访问频率限制

**合规配置**：

- ICP 备案号
- 数据驻留
- 个人信息保护
- 审计日志

### 输出示例

```bash
=========================================
Environment Variables Validation
=========================================

--- Strapi Core Configuration ---
✓ HOST is set
✓ PORT is set
✓ APP_KEYS is set
...

--- Security Configuration ---
✓ SECURITY_HSTS_ENABLED is set
⚠ SECURITY_CORS_ORIGIN is not set (optional)
...

=========================================
Validation Summary
=========================================
✓ Success: 15
⚠ Warnings: 3
✗ Errors: 0
```

### 生产环境检查

在生产环境（`NODE_ENV=production`）下，脚本会执行额外检查：

- 确保安全标头已启用
- 检测默认密钥值
- 验证 Cookie 安全配置
- 确认访问频率限制已启用

### 退出代码

- `0`: 验证通过（可能有警告）
- `1`: 验证失败（有错误）

### 集成到部署流程

建议在部署前运行验证：

```bash
# 在部署脚本中
npm run validate:env || exit 1
npm run build
npm run deploy
```

## 📦 备份脚本 (backup.sh)

自动备份 PostgreSQL 数据库和 Strapi 上传文件。

### 功能特性

- ✅ PostgreSQL 数据库完整备份（使用 `pg_dump`）
- ✅ Strapi uploads 目录打包备份
- ✅ 自动压缩备份文件（gzip/tar.gz）
- ✅ 可配置的备份保留策略
- ✅ 自动清理过期备份
- ✅ 详细的日志记录
- ✅ 适配中国 cron 环境

### 使用方法

```bash
# 基础使用（使用 .env 配置）
./backup.sh

# 自定义保留期（30 天）
./backup.sh --retention 30

# 自定义备份目录
./backup.sh --backup-dir /var/backups/strapi

# 查看帮助
./backup.sh --help
```

### 环境变量

在 `.env` 文件或环境中设置：

```bash
# PostgreSQL 配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your_password

# 备份配置
UPLOADS_DIR=./apps/cms/public/uploads
BACKUP_DIR=./backups
RETENTION_DAYS=7
```

### 定时备份 (Cron)

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * cd /path/to/project && ./scripts/ops/backup.sh >> /var/log/backup.log 2>&1

# 每周日凌晨 3 点备份（保留 90 天）
0 3 * * 0 cd /path/to/project && ./scripts/ops/backup.sh --retention 90 --backup-dir /var/backups/weekly

# 每月 1 号凌晨 4 点备份（保留 1 年）
0 4 1 * * cd /path/to/project && ./scripts/ops/backup.sh --retention 365 --backup-dir /var/backups/monthly
```

### 备份文件格式

```
backups/
├── postgres_strapi_20240101_120000.sql.gz
├── uploads_20240101_120000.tar.gz
├── backup_20240101_120000.log
├── postgres_strapi_20240102_120000.sql.gz
└── uploads_20240102_120000.tar.gz
```

## 🔄 恢复脚本 (restore.sh)

从备份文件恢复数据库和上传文件。

### 功能特性

- ✅ 列出所有可用备份
- ✅ 恢复 PostgreSQL 数据库
- ✅ 恢复 Strapi uploads 目录
- ✅ 自动备份现有数据
- ✅ 交互式确认提示
- ✅ 详细的操作日志

### 使用方法

```bash
# 列出可用备份
./restore.sh --list

# 恢复数据库
./restore.sh --postgres ./backups/postgres_strapi_20240101_120000.sql.gz

# 恢复上传文件
./restore.sh --uploads ./backups/uploads_20240101_120000.tar.gz

# 同时恢复数据库和文件
./restore.sh \
  --postgres ./backups/postgres_strapi_20240101_120000.sql.gz \
  --uploads ./backups/uploads_20240101_120000.tar.gz

# 查看帮助
./restore.sh --help
```

### ⚠️ 重要提示

- 恢复操作会**覆盖现有数据**
- 现有数据会自动备份到 `.backup_TIMESTAMP` 目录
- 数据库会被删除并重建
- 请在执行前确保备份文件完整

## 🏥 健康检查脚本 (healthcheck.sh)

监控应用健康状态的脚本，可用于 cron 定时检查和告警。

### 功能特性

- ✅ 检查前端健康端点 (`/api/health`)
- ✅ 检查 CMS 健康端点 (`/_health`)
- ✅ 可配置超时时间
- ✅ 支持 webhook 告警
- ✅ 详细或静默输出模式
- ✅ 明确的退出码

### 使用方法

```bash
# 检查本地端点
./healthcheck.sh

# 检查生产环境
./healthcheck.sh \
  --frontend https://example.com \
  --cms https://cms.example.com

# 静默模式（仅退出码）
./healthcheck.sh --silent

# 详细输出
./healthcheck.sh --verbose

# 设置超时时间
./healthcheck.sh --timeout 30

# 发送 webhook 告警
./healthcheck.sh --webhook https://hooks.example.com/alert

# 查看帮助
./healthcheck.sh --help
```

### 退出码

- `0` - 所有健康检查通过
- `1` - 前端健康检查失败
- `2` - CMS 健康检查失败
- `3` - 所有健康检查失败

### 定时健康检查

```bash
# 每 5 分钟检查一次
*/5 * * * * /path/to/scripts/ops/healthcheck.sh --silent || /path/to/alert.sh

# 每 10 分钟检查并记录日志
*/10 * * * * /path/to/scripts/ops/healthcheck.sh >> /var/log/healthcheck.log 2>&1

# 生产环境监控（每分钟）
* * * * * /path/to/scripts/ops/healthcheck.sh \
  --frontend https://example.com \
  --cms https://cms.example.com \
  --silent \
  --webhook https://hooks.example.com/alert
```

### 集成告警系统

#### 阿里云 CloudMonitor

```bash
#!/bin/bash
# /path/to/aliyun-health-monitor.sh

/path/to/scripts/ops/healthcheck.sh --silent
EXIT_CODE=$?

# 上报到阿里云 CloudMonitor
aliyun cms PutCustomMetric \
  --MetricName health_check_status \
  --Namespace custom/application \
  --Dimensions "{'service':'web','environment':'production'}" \
  --Value $EXIT_CODE
```

#### 腾讯云监控

```bash
#!/bin/bash
# /path/to/tencent-health-monitor.sh

/path/to/scripts/ops/healthcheck.sh --silent
EXIT_CODE=$?

# 上报到腾讯云监控
tccli monitor PutMonitorData \
  --Namespace QCE/Custom \
  --MetricName HealthCheckStatus \
  --Value $EXIT_CODE
```

#### 钉钉机器人 Webhook

```bash
#!/bin/bash
# /path/to/dingtalk-alert.sh

if ! /path/to/scripts/ops/healthcheck.sh --silent; then
  curl -X POST https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN \
    -H 'Content-Type: application/json' \
    -d '{
      "msgtype": "text",
      "text": {
        "content": "⚠️ 健康检查失败\n时间: '"$(date)"'\n请立即检查服务状态"
      }
    }'
fi
```

#### 企业微信机器人

```bash
#!/bin/bash
# /path/to/wechat-work-alert.sh

if ! /path/to/scripts/ops/healthcheck.sh --silent; then
  curl -X POST https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY \
    -H 'Content-Type: application/json' \
    -d '{
      "msgtype": "text",
      "text": {
        "content": "⚠️ 应用健康检查失败，请立即检查！"
      }
    }'
fi
```

## 🐳 Docker 环境使用

### 连接 Docker 容器中的数据库

```bash
# 设置环境变量指向 Docker 数据库
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
export DATABASE_NAME=strapi
export DATABASE_USERNAME=strapi
export DATABASE_PASSWORD=strapi

# 运行备份
./backup.sh
```

### 从宿主机备份 Docker 容器

```bash
# 备份容器中的数据库
docker exec nuxt-strapi-db pg_dump -U strapi strapi | gzip > backup.sql.gz

# 备份上传文件
docker run --rm -v nuxt-strapi_cms_uploads:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads.tar.gz -C /data .
```

## 📝 日志

所有脚本都会生成详细的日志：

- **backup.sh**: 在备份目录中生成 `backup_TIMESTAMP.log`
- **restore.sh**: 输出到 stdout/stderr
- **healthcheck.sh**: 输出到 stdout/stderr（可重定向）

建议将日志重定向到专门的日志目录：

```bash
# 创建日志目录
mkdir -p /var/log/ops

# 在 cron 中使用
0 2 * * * /path/to/backup.sh >> /var/log/ops/backup.log 2>&1
```

## 🔒 安全建议

1. **保护备份文件**: 确保备份目录权限正确

   ```bash
   chmod 700 /path/to/backups
   chown your-user:your-group /path/to/backups
   ```

2. **敏感信息**: 不要在脚本中硬编码密码，使用环境变量或 `.env` 文件

   ```bash
   chmod 600 .env
   ```

3. **远程备份**: 定期将备份同步到远程存储

   ```bash
   # 使用 rsync
   rsync -avz /path/to/backups/ user@backup-server:/backups/

   # 使用阿里云 OSS
   ossutil cp -r /path/to/backups/ oss://your-bucket/backups/

   # 使用腾讯云 COS
   coscmd upload -r /path/to/backups/ /backups/
   ```

4. **加密备份**: 对敏感数据进行加密
   ```bash
   # 使用 GPG 加密
   gpg --encrypt --recipient your-email backup.sql.gz
   ```

## 🐛 故障排查

### 备份失败

```bash
# 检查数据库连接
psql -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USERNAME -d $DATABASE_NAME -c "SELECT 1"

# 检查磁盘空间
df -h

# 检查权限
ls -la backups/
```

### 恢复失败

```bash
# 验证备份文件
gunzip -t backup.sql.gz

# 手动恢复测试
gunzip -c backup.sql.gz | psql -h localhost -U strapi -d strapi
```

### 健康检查失败

```bash
# 手动测试端点
curl -v http://localhost:3000/api/health
curl -v http://localhost:1337/_health

# 检查服务状态
docker-compose ps
pm2 list
```

## 📚 相关文档

- [MONITORING.md](../../docs/MONITORING.md) - 完整监控和运维指南
- [DEPLOYMENT.md](../../docs/DEPLOYMENT.md) - 部署指南
- [DOCKER.md](../../docs/DOCKER.md) - Docker 使用指南

## 📞 支持

如遇到问题，请：

1. 查看脚本的 `--help` 输出
2. 检查生成的日志文件
3. 确认环境变量配置正确
4. 验证所需工具已安装

---

最后更新: 2024
