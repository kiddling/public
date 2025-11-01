# 备份和恢复脚本 (Backup and Restore Scripts)

本目录包含用于 Strapi CMS 数据备份和恢复的脚本。

## 📋 脚本说明

### strapi-backup.sh

创建完整的 Strapi 备份，包括：
- 数据库导出（PostgreSQL/MySQL/SQLite）
- 上传文件（`public/uploads/`）
- 配置文件
- 元数据和完整性校验

### restore.sh

从备份中恢复 Strapi 数据。

## 🚀 使用方法

### 创建备份

#### 基本用法

```bash
# 使用默认备份目录 (./backups)
./scripts/backup/strapi-backup.sh

# 或使用 npm script
pnpm backup
```

#### 自定义备份目录

```bash
./scripts/backup/strapi-backup.sh /path/to/backup/directory
```

#### 设置保留天数

```bash
export BACKUP_RETENTION_DAYS=60
./scripts/backup/strapi-backup.sh
```

### 恢复备份

#### 干运行（查看将要恢复的内容，不实际执行）

```bash
./scripts/backup/restore.sh ./backups/strapi_backup_20241101_120000 --dry-run

# 或使用 npm script
pnpm backup:restore ./backups/strapi_backup_20241101_120000 --dry-run
```

#### 实际恢复

```bash
./scripts/backup/restore.sh ./backups/strapi_backup_20241101_120000

# 或使用 npm script
pnpm backup:restore ./backups/strapi_backup_20241101_120000
```

**⚠️ 警告**: 恢复操作将覆盖现有数据！脚本会自动创建恢复前备份作为安全措施。

## ⚙️ 环境变量

备份和恢复脚本使用以下环境变量（从 `apps/cms/.env` 读取）：

### 必需变量

- `DATABASE_CLIENT`: 数据库类型（`postgres`, `mysql`, `sqlite`）
- `DATABASE_HOST`: 数据库主机（非 SQLite）
- `DATABASE_PORT`: 数据库端口（非 SQLite）
- `DATABASE_NAME`: 数据库名称（非 SQLite）
- `DATABASE_USERNAME`: 数据库用户名（非 SQLite）
- `DATABASE_PASSWORD`: 数据库密码（非 SQLite）

### 可选变量

- `BACKUP_DIR`: 备份目录（默认: `./backups`）
- `BACKUP_RETENTION_DAYS`: 备份保留天数（默认: 30）
- `DATABASE_FILENAME`: SQLite 数据库文件路径（仅 SQLite）

## 📦 备份内容

每个备份包含以下文件：

```
strapi_backup_YYYYMMDD_HHMMSS/
├── database.sql.gz         # 数据库导出（PostgreSQL/MySQL）
│   或 database.db.gz       # SQLite 数据库
├── uploads.tar.gz          # 上传的文件
├── config.tar.gz           # 配置文件
└── metadata.json           # 备份元数据
```

### metadata.json 示例

```json
{
  "timestamp": "20241101_120000",
  "date": "2024-11-01T12:00:00+08:00",
  "database_client": "postgres",
  "database_name": "strapi",
  "hostname": "production-server",
  "user": "deploy",
  "backup_path": "/path/to/backup",
  "files": [
    "database.sql.gz",
    "uploads.tar.gz",
    "config.tar.gz"
  ]
}
```

## 🔄 自动化备份

### 使用 Cron

#### 每日备份（凌晨 2 点）

```bash
# 编辑 crontab
crontab -e

# 添加以下行
0 2 * * * cd /path/to/project && /path/to/project/scripts/backup/strapi-backup.sh >> /var/log/strapi-backup.log 2>&1
```

#### 每周备份（周日凌晨 3 点）

```bash
0 3 * * 0 cd /path/to/project && /path/to/project/scripts/backup/strapi-backup.sh /path/to/weekly-backups
```

#### 带通知的备份

```bash
#!/bin/bash
# backup-with-notification.sh

cd /path/to/project

if /path/to/project/scripts/backup/strapi-backup.sh; then
    echo "Backup successful: $(date)" | mail -s "Backup Success" admin@example.com
else
    echo "Backup failed: $(date)" | mail -s "Backup FAILED" admin@example.com
fi
```

### 使用 systemd Timer

创建 `/etc/systemd/system/strapi-backup.service`:

```ini
[Unit]
Description=Strapi Backup Service
After=network.target

[Service]
Type=oneshot
User=deploy
WorkingDirectory=/path/to/project
ExecStart=/path/to/project/scripts/backup/strapi-backup.sh
StandardOutput=journal
StandardError=journal
```

创建 `/etc/systemd/system/strapi-backup.timer`:

```ini
[Unit]
Description=Daily Strapi Backup Timer
Requires=strapi-backup.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

启用 timer:

```bash
sudo systemctl enable strapi-backup.timer
sudo systemctl start strapi-backup.timer

# 检查状态
sudo systemctl status strapi-backup.timer
```

## ☁️ 异地备份

### 同步到 S3 (AWS)

```bash
#!/bin/bash
# sync-to-s3.sh

BACKUP_DIR="/path/to/backups"
S3_BUCKET="s3://my-strapi-backups"

# 创建本地备份
/path/to/project/scripts/backup/strapi-backup.sh

# 同步到 S3
aws s3 sync "$BACKUP_DIR" "$S3_BUCKET" --storage-class STANDARD_IA

# 删除 S3 上 90 天前的备份
aws s3 ls "$S3_BUCKET" | while read -r line; do
    createDate=$(echo "$line" | awk '{print $1}')
    createTime=$(echo "$line" | awk '{print $2}')
    fileName=$(echo "$line" | awk '{$1=$2=$3=""; print $0}' | sed 's/^[ \t]*//')
    
    if [ -n "$createDate" ]; then
        if [[ $(date -d "$createDate $createTime" +%s) -lt $(date -d "90 days ago" +%s) ]]; then
            aws s3 rm "$S3_BUCKET/$fileName"
        fi
    fi
done
```

### 同步到阿里云 OSS

```bash
#!/bin/bash
# sync-to-oss.sh

BACKUP_DIR="/path/to/backups"
OSS_BUCKET="oss://my-strapi-backups"

# 创建本地备份
/path/to/project/scripts/backup/strapi-backup.sh

# 同步到 OSS
ossutil cp -r "$BACKUP_DIR" "$OSS_BUCKET"

# 删除 90 天前的备份
ossutil rm "$OSS_BUCKET" -r --include "strapi_backup_*" --age 90
```

## 🔐 安全建议

### 1. 加密备份

```bash
# 备份后加密
gpg --symmetric --cipher-algo AES256 backups/strapi_backup_YYYYMMDD_HHMMSS.tar.gz

# 解密
gpg --decrypt backups/strapi_backup_YYYYMMDD_HHMMSS.tar.gz.gpg > backup.tar.gz
```

### 2. 限制文件权限

```bash
# 限制备份目录权限
chmod 700 backups/
chmod 600 backups/*

# 只有 owner 可以读写
```

### 3. 定期测试恢复

```bash
# 在测试环境定期验证恢复流程
# 1. 复制生产备份到测试服务器
# 2. 执行恢复
# 3. 验证数据完整性
# 4. 记录恢复时间（RTO）
```

## 📊 备份策略建议

### 3-2-1 原则

- **3** 份数据副本
- **2** 种不同存储介质
- **1** 份异地备份

### 推荐备份频率

| 环境 | 频率 | 保留期 | 存储位置 |
|------|------|--------|----------|
| 生产 | 每日 | 7 天 | 本地 |
| 生产 | 每周 | 4 周 | 本地 + 云存储 |
| 生产 | 每月 | 12 个月 | 云存储 |
| 生产 | 部署前 | 7 天 | 本地 |
| 测试 | 每周 | 2 周 | 本地 |

## 🔧 故障排除

### 数据库连接失败

```bash
# PostgreSQL
psql -h $DATABASE_HOST -U $DATABASE_USERNAME -d $DATABASE_NAME -c "SELECT 1;"

# MySQL
mysql -h $DATABASE_HOST -u $DATABASE_USERNAME -p$DATABASE_PASSWORD $DATABASE_NAME -e "SELECT 1;"
```

### 权限问题

```bash
# 检查脚本权限
ls -l scripts/backup/*.sh

# 添加执行权限
chmod +x scripts/backup/*.sh
```

### 磁盘空间不足

```bash
# 检查磁盘空间
df -h

# 清理旧备份
find backups/ -name "strapi_backup_*" -mtime +30 -exec rm -rf {} \;

# 压缩备份
tar -czf backups_archive.tar.gz backups/
```

### 恢复后数据不一致

1. 检查备份完整性
   ```bash
   # 验证 gzip 文件
   gzip -t backups/strapi_backup_*/database.sql.gz
   
   # 验证 tar 文件
   tar -tzf backups/strapi_backup_*/uploads.tar.gz > /dev/null
   ```

2. 检查数据库字符集和排序规则

3. 检查 Strapi 版本兼容性

## 📞 获取帮助

如果遇到问题：

1. 检查脚本输出的错误信息
2. 查看 [故障排除](#故障排除) 部分
3. 参考 [生产环境就绪检查清单](../../docs/PRODUCTION_READINESS_CHECKLIST.md)
4. 查看 [部署文档](../../docs/DEPLOYMENT.md)

---

**最后更新**: 2024-11  
**维护者**: DevOps Team
