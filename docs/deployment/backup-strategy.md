# 备份策略指南 (Backup Strategy Guide)

本文档详细说明 Nuxt + Strapi 项目的备份策略，包括 PostgreSQL 数据库备份和 Strapi 上传文件备份。

## 备份原则

### 3-2-1 备份规则

- **3 份副本**：原始数据 + 2 份备份
- **2 种存储介质**：本地磁盘 + 云存储
- **1 份异地备份**：确保灾难恢复能力

### 备份类型

1. **全量备份**：完整的数据副本（每周/每月）
2. **增量备份**：仅备份变更的数据（每天）
3. **实时备份**：数据库主从复制、对象存储自动复制

## PostgreSQL 数据库备份

### 方案 A: pg_dump（推荐用于中小型数据库）

#### 优势
- 逻辑备份，易于理解和恢复
- 支持跨版本恢复
- 可以选择性备份表或数据库

#### 基础备份脚本

创建 `scripts/backup-postgres.sh`:

```bash
#!/bin/bash

# 配置变量
DB_NAME="${DB_NAME:-strapi}"
DB_USER="${DB_USER:-strapi}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="/var/backups/postgres"
RETENTION_DAYS=30

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 生成备份文件名（带时间戳）
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

# 执行备份
echo "Starting backup of database: $DB_NAME"
PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=plain \
  --no-owner \
  --no-acl \
  | gzip > "$BACKUP_FILE"

# 检查备份是否成功
if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_FILE"
  
  # 输出备份文件大小
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "Backup size: $BACKUP_SIZE"
else
  echo "Backup failed!" >&2
  exit 1
fi

# 清理旧备份（保留最近 N 天）
echo "Cleaning up old backups (retention: $RETENTION_DAYS days)"
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# 列出当前备份文件
echo "Current backups:"
ls -lh "$BACKUP_DIR"/${DB_NAME}_*.sql.gz

echo "Backup completed successfully!"
```

#### 高级备份脚本（带压缩和上传）

创建 `scripts/backup-postgres-advanced.sh`:

```bash
#!/bin/bash

set -euo pipefail

# 配置
DB_NAME="${DB_NAME:-strapi}"
DB_USER="${DB_USER:-strapi}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="/var/backups/postgres"
RETENTION_DAYS=30
S3_BUCKET="${S3_BUCKET:-}"  # 可选：上传到 S3 兼容存储

# 日志函数
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
}

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 生成备份文件名
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE=$(date +"%Y%m%d")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"
BACKUP_CUSTOM_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.backup"

log "Starting PostgreSQL backup..."
log "Database: $DB_NAME"
log "Host: $DB_HOST:$DB_PORT"

# 1. 创建文本格式备份（易于检查）
log "Creating plain SQL backup..."
PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=plain \
  --no-owner \
  --no-acl \
  --verbose \
  | gzip -9 > "$BACKUP_FILE"

if [ $? -ne 0 ]; then
  error "Plain SQL backup failed!"
  exit 1
fi

# 2. 创建自定义格式备份（支持并行恢复）
log "Creating custom format backup..."
PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-acl \
  --verbose \
  --file="$BACKUP_CUSTOM_FILE"

if [ $? -ne 0 ]; then
  error "Custom format backup failed!"
  exit 1
fi

# 3. 验证备份文件
log "Verifying backup files..."
if [ ! -s "$BACKUP_FILE" ]; then
  error "Backup file is empty: $BACKUP_FILE"
  exit 1
fi

if [ ! -s "$BACKUP_CUSTOM_FILE" ]; then
  error "Backup file is empty: $BACKUP_CUSTOM_FILE"
  exit 1
fi

# 输出备份信息
SQL_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
CUSTOM_SIZE=$(du -h "$BACKUP_CUSTOM_FILE" | cut -f1)
log "SQL backup size: $SQL_SIZE"
log "Custom backup size: $CUSTOM_SIZE"

# 4. 上传到对象存储（可选）
if [ -n "$S3_BUCKET" ]; then
  log "Uploading backups to S3..."
  
  # 假设使用阿里云 OSS（也支持 AWS S3）
  ossutil cp "$BACKUP_FILE" "oss://$S3_BUCKET/postgres/$DATE/" || error "Failed to upload SQL backup"
  ossutil cp "$BACKUP_CUSTOM_FILE" "oss://$S3_BUCKET/postgres/$DATE/" || error "Failed to upload custom backup"
  
  log "Upload completed"
fi

# 5. 清理旧备份
log "Cleaning up old local backups (retention: $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "${DB_NAME}_*.backup" -type f -mtime +$RETENTION_DAYS -delete

# 6. 发送通知（可选）
if command -v mail &> /dev/null; then
  echo "PostgreSQL backup completed successfully at $(date)" | \
    mail -s "Backup Success: $DB_NAME" admin@example.com
fi

log "Backup completed successfully!"
log "Files:"
ls -lh "$BACKUP_DIR"/${DB_NAME}_${TIMESTAMP}.*
```

#### 设置定时任务

添加到 crontab (`crontab -e`):

```bash
# 每天凌晨 2 点执行数据库备份
0 2 * * * /path/to/scripts/backup-postgres.sh >> /var/log/postgres-backup.log 2>&1

# 每周日凌晨 3 点执行全量备份并上传
0 3 * * 0 S3_BUCKET=my-backups /path/to/scripts/backup-postgres-advanced.sh >> /var/log/postgres-backup.log 2>&1
```

### 方案 B: 使用云数据库自动备份（推荐用于生产）

#### 阿里云 RDS PostgreSQL

**配置自动备份**：

1. 登录阿里云控制台 → RDS → 实例列表
2. 选择实例 → 备份恢复 → 备份设置
3. 配置：
   ```
   备份方式: 物理备份（推荐）或逻辑备份
   备份周期: 每天
   备份时间: 凌晨 2:00-3:00（业务低峰期）
   日志备份: 开启
   日志备份保留: 7 天
   数据备份保留: 30 天
   ```

**手动备份**：
```bash
# 通过 API 触发备份
aliyun rds CreateBackup \
  --DBInstanceId rm-xxxxx \
  --BackupMethod Physical
```

**下载备份到本地**：
```bash
# 获取备份下载链接
aliyun rds DescribeBackups \
  --DBInstanceId rm-xxxxx \
  --BackupId 12345

# 下载备份文件
wget -O backup.tar.gz "备份下载链接"
```

#### 腾讯云 PostgreSQL

**配置自动备份**：

1. 登录腾讯云控制台 → 云数据库 PostgreSQL → 实例列表
2. 选择实例 → 备份管理 → 自动备份设置
3. 配置：
   ```
   备份方式: 物理备份
   备份周期: 每天
   备份开始时间: 02:00-03:00
   备份保留时间: 30 天
   ```

**手动备份**：
```bash
# 通过 API
tccli postgres CreateBackup \
  --DBInstanceId postgres-xxxxx
```

### PostgreSQL 恢复

#### 从 SQL 文件恢复

```bash
#!/bin/bash

BACKUP_FILE="/var/backups/postgres/strapi_20240101_020000.sql.gz"
DB_NAME="strapi"
DB_USER="strapi"
DB_HOST="localhost"
DB_PORT="5432"

# 解压并恢复
gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME"
```

#### 从自定义格式恢复

```bash
#!/bin/bash

BACKUP_FILE="/var/backups/postgres/strapi_20240101_020000.backup"
DB_NAME="strapi_restore"
DB_USER="strapi"
DB_HOST="localhost"
DB_PORT="5432"

# 创建新数据库
PGPASSWORD="$DB_PASSWORD" createdb \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  "$DB_NAME"

# 恢复（支持并行）
PGPASSWORD="$DB_PASSWORD" pg_restore \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --jobs=4 \
  --no-owner \
  --no-acl \
  --verbose \
  "$BACKUP_FILE"
```

## Strapi 上传文件备份

### 方案 A: 本地存储备份

如果 Strapi 使用本地文件系统存储上传文件：

#### 备份脚本

创建 `scripts/backup-strapi-uploads.sh`:

```bash
#!/bin/bash

set -euo pipefail

# 配置
UPLOADS_DIR="/path/to/apps/cms/public/uploads"
BACKUP_DIR="/var/backups/strapi"
RETENTION_DAYS=30
S3_BUCKET="${S3_BUCKET:-}"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 生成备份文件名
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE=$(date +"%Y%m%d")
BACKUP_FILE="$BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz"

echo "Starting Strapi uploads backup..."

# 创建压缩备份
tar -czf "$BACKUP_FILE" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"

if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_FILE"
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "Backup size: $BACKUP_SIZE"
else
  echo "Backup failed!" >&2
  exit 1
fi

# 上传到对象存储（可选）
if [ -n "$S3_BUCKET" ]; then
  echo "Uploading to S3..."
  ossutil cp "$BACKUP_FILE" "oss://$S3_BUCKET/strapi-uploads/$DATE/"
fi

# 清理旧备份
echo "Cleaning up old backups (retention: $RETENTION_DAYS days)"
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed!"
```

#### 增量备份（使用 rsync）

创建 `scripts/backup-strapi-uploads-incremental.sh`:

```bash
#!/bin/bash

set -euo pipefail

UPLOADS_DIR="/path/to/apps/cms/public/uploads"
BACKUP_DIR="/var/backups/strapi/uploads-sync"
REMOTE_BACKUP="${REMOTE_BACKUP:-}"  # 可选：远程服务器

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "Starting incremental backup with rsync..."

# 本地增量备份
rsync -avz --delete \
  --exclude='*.tmp' \
  --exclude='.DS_Store' \
  "$UPLOADS_DIR/" \
  "$BACKUP_DIR/"

# 远程备份（可选）
if [ -n "$REMOTE_BACKUP" ]; then
  echo "Syncing to remote backup..."
  rsync -avz --delete \
    -e "ssh -i /path/to/key.pem" \
    "$UPLOADS_DIR/" \
    "$REMOTE_BACKUP"
fi

echo "Incremental backup completed!"
```

### 方案 B: 对象存储自动备份（推荐）

如果使用阿里云 OSS 或腾讯云 COS，配置自动跨区域复制。

#### 阿里云 OSS 跨区域复制

1. 登录阿里云控制台 → OSS → Bucket 列表
2. 选择源 Bucket → 冗余与容错 → 跨区域复制
3. 配置：
   ```
   目标 Bucket: 选择不同地域的 Bucket
   复制内容: 全部文件
   复制操作: 新增和覆盖
   实时同步: 开启
   ```

#### 腾讯云 COS 版本控制和生命周期

1. 登录腾讯云控制台 → COS → 存储桶列表
2. 选择存储桶 → 容错与容灾 → 版本控制
3. 启用版本控制（防止误删除）
4. 配置生命周期规则：
   ```
   历史版本保留: 90 天
   删除过期版本
   ```

### 方案 C: 混合备份策略

结合本地备份和对象存储：

创建 `scripts/backup-all.sh`:

```bash
#!/bin/bash

set -euo pipefail

LOG_FILE="/var/log/backup-all.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" | tee -a "$LOG_FILE" >&2
}

log "=== Starting full backup ==="

# 1. 备份 PostgreSQL 数据库
log "Backing up PostgreSQL database..."
if /path/to/scripts/backup-postgres.sh >> "$LOG_FILE" 2>&1; then
  log "PostgreSQL backup: SUCCESS"
else
  error "PostgreSQL backup: FAILED"
  exit 1
fi

# 2. 备份 Strapi 上传文件
log "Backing up Strapi uploads..."
if /path/to/scripts/backup-strapi-uploads.sh >> "$LOG_FILE" 2>&1; then
  log "Strapi uploads backup: SUCCESS"
else
  error "Strapi uploads backup: FAILED"
  exit 1
fi

# 3. 备份应用代码（可选）
log "Backing up application code..."
APP_DIR="/path/to/project"
BACKUP_DIR="/var/backups/app"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

tar -czf "$BACKUP_DIR/app_${TIMESTAMP}.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  -C "$(dirname "$APP_DIR")" "$(basename "$APP_DIR")"

if [ $? -eq 0 ]; then
  log "Application code backup: SUCCESS"
else
  error "Application code backup: FAILED"
fi

# 4. 清理旧备份
log "Cleaning up old backups..."
find /var/backups -name "*.tar.gz" -type f -mtime +30 -delete
find /var/backups -name "*.sql.gz" -type f -mtime +30 -delete

log "=== Full backup completed ==="

# 5. 发送通知
if command -v mail &> /dev/null; then
  echo "Full backup completed successfully at $(date)" | \
    mail -s "Backup Success: Full Backup" admin@example.com
fi
```

#### 设置定时任务

```bash
# 每天凌晨 2 点执行完整备份
0 2 * * * /path/to/scripts/backup-all.sh

# 每 6 小时执行增量上传文件备份
0 */6 * * * /path/to/scripts/backup-strapi-uploads-incremental.sh >> /var/log/backup-incremental.log 2>&1
```

## 备份验证

定期验证备份是否可用：

### 自动验证脚本

创建 `scripts/verify-backup.sh`:

```bash
#!/bin/bash

set -euo pipefail

BACKUP_FILE="${1:-}"
DB_NAME="strapi_test"
DB_USER="strapi"
DB_HOST="localhost"
DB_PORT="5432"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  exit 1
fi

echo "Verifying backup: $BACKUP_FILE"

# 创建测试数据库
PGPASSWORD="$DB_PASSWORD" createdb \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  "$DB_NAME" 2>/dev/null || true

# 尝试恢复
gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✓ Backup verification PASSED"
  
  # 检查表数量
  TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'")
  
  echo "✓ Tables restored: $TABLE_COUNT"
else
  echo "✗ Backup verification FAILED"
  exit 1
fi

# 清理测试数据库
PGPASSWORD="$DB_PASSWORD" dropdb \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  "$DB_NAME"

echo "Verification completed"
```

### 每周验证任务

```bash
# 每周日凌晨 4 点验证最新备份
0 4 * * 0 /path/to/scripts/verify-backup.sh $(ls -t /var/backups/postgres/*.sql.gz | head -1) >> /var/log/backup-verify.log 2>&1
```

## 灾难恢复计划

### 恢复时间目标 (RTO) 和恢复点目标 (RPO)

- **RTO**: 系统恢复所需时间（目标：< 4 小时）
- **RPO**: 可接受的数据丢失时间（目标：< 24 小时）

### 灾难恢复步骤

#### 1. 评估灾难程度
- 数据损坏
- 服务器故障
- 数据中心故障

#### 2. 启动恢复流程

```bash
# 1. 准备新服务器（如需要）
# 2. 安装必要软件
sudo apt update
sudo apt install postgresql-14 nginx

# 3. 恢复数据库
gunzip -c /var/backups/postgres/latest.sql.gz | \
  PGPASSWORD="$DB_PASSWORD" psql -U strapi -d strapi

# 4. 恢复上传文件
tar -xzf /var/backups/strapi/uploads_latest.tar.gz -C /path/to/apps/cms/public/

# 5. 部署应用代码
cd /path/to/project
git pull
pnpm install
pnpm build
pm2 start pm2.config.cjs

# 6. 验证服务
curl https://example.com/api/health
curl https://cms.example.com/cms/health

# 7. 更新 DNS（如需要）
```

## 监控备份状态

### 备份监控脚本

创建 `scripts/monitor-backups.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/postgres"
MAX_AGE_HOURS=26  # 备份不应超过 26 小时

LATEST_BACKUP=$(find "$BACKUP_DIR" -name "*.sql.gz" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)

if [ -z "$LATEST_BACKUP" ]; then
  echo "ERROR: No backups found!"
  exit 1
fi

BACKUP_AGE=$(($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")))
BACKUP_AGE_HOURS=$((BACKUP_AGE / 3600))

echo "Latest backup: $LATEST_BACKUP"
echo "Backup age: $BACKUP_AGE_HOURS hours"

if [ $BACKUP_AGE_HOURS -gt $MAX_AGE_HOURS ]; then
  echo "WARNING: Backup is too old!"
  # 发送告警
  echo "Backup too old: $BACKUP_AGE_HOURS hours" | \
    mail -s "Backup Alert" admin@example.com
  exit 1
fi

echo "Backup status: OK"
```

### 集成到监控系统

在 Grafana/Prometheus 中添加备份监控指标。

## 相关文档

- [中国云部署指南](./china-cloud.md)
- [监控和日志](./monitoring-logging.md)
- [ICP 合规检查清单](./icp-compliance-checklist.md)

## 参考资源

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [阿里云 RDS 备份](https://help.aliyun.com/document_detail/96147.html)
- [腾讯云数据库备份](https://cloud.tencent.com/document/product/409/9642)
