# 生产环境就绪检查清单 (Production Readiness Checklist)

本文档提供全面的生产环境部署前检查清单，涵盖配置、安全、性能、数据保护、监控、文档和合规性要求。

**目标受众**: DevOps 工程师、系统管理员、技术负责人  
**最后更新**: 2024-11  
**适用环境**: 中国大陆生产环境部署

---

## 📋 快速概览

| 类别 | 关键项目数 | 状态追踪 |
|------|-----------|---------|
| [A. 环境配置](#a-环境配置-environment-configuration) | 8 | ⬜ |
| [B. 安全加固](#b-安全加固-security-hardening) | 12 | ⬜ |
| [C. 性能验证](#c-性能验证-performance-verification) | 7 | ⬜ |
| [D. 数据保护](#d-数据保护-data-protection) | 6 | ⬜ |
| [E. 监控和告警](#e-监控和告警-monitoring--alerting) | 8 | ⬜ |
| [F. 文档和合规](#f-文档和合规-documentation--compliance) | 10 | ⬜ |
| [G. 部署流程](#g-部署流程-deployment-process) | 8 | ⬜ |

**状态图例**: ⬜ 未开始 | 🟡 进行中 | ✅ 已完成 | ⚠️ 需关注

---

## A. 环境配置 (Environment Configuration)

### A.1 环境变量验证

**负责人**: DevOps Team  
**优先级**: 🔴 Critical

- [ ] **A.1.1** 运行环境验证脚本
  ```bash
  ENV_MODE=production pnpm check:env
  ```
  - 确保所有必需的环境变量已设置
  - 验证生产环境密钥已从默认值更改
  - 检查数据库连接配置

- [ ] **A.1.2** Frontend 环境变量
  - `NUXT_PUBLIC_API_BASE_URL`: 生产 API 地址 (HTTPS)
  - `NUXT_PUBLIC_STRAPI_URL`: Strapi CMS 地址 (HTTPS)
  - `NUXT_STRAPI_API_TOKEN`: API 访问令牌（至少 20 字符）
  - `NUXT_PUBLIC_CDN_URL`: CDN 地址（国内 CDN）
  - `NUXT_PUBLIC_SENTRY_DSN`: Sentry 错误追踪 DSN（可选但推荐）

- [ ] **A.1.3** CMS 环境变量
  - `NODE_ENV`: 设置为 `production`
  - `HOST`: `0.0.0.0`
  - `PORT`: 生产端口（默认 1337）
  - `DATABASE_CLIENT`: `postgres` 或 `mysql`（不使用 SQLite）
  - `DATABASE_*`: 数据库连接信息
  - `CLIENT_URL`: 前端域名（HTTPS，用于 CORS）

- [ ] **A.1.4** 安全密钥
  - ⚠️ `APP_KEYS`: 至少 2 个随机密钥，不包含 "toBeModified"
  - ⚠️ `API_TOKEN_SALT`: 至少 32 字符随机字符串
  - ⚠️ `ADMIN_JWT_SECRET`: 至少 32 字符随机字符串
  - ⚠️ `TRANSFER_TOKEN_SALT`: 至少 32 字符随机字符串
  - ⚠️ `JWT_SECRET`: 至少 32 字符随机字符串
  - ⚠️ `ENCRYPTION_KEY`: 至少 32 字符随机字符串

  **生成安全密钥**:
  ```bash
  # 生成随机密钥
  openssl rand -base64 32
  
  # 生成多个 APP_KEYS
  echo "$(openssl rand -base64 32),$(openssl rand -base64 32)"
  ```

### A.2 服务器配置

- [ ] **A.2.1** SSL/TLS 证书
  - SSL 证书已安装且有效（Let's Encrypt 或商业证书）
  - 证书覆盖所有域名和子域名
  - 自动续期已配置
  - 证书过期提醒已设置

- [ ] **A.2.2** 数据库
  - PostgreSQL/MySQL 已安装并配置（版本 ≥ 12/8.0）
  - 数据库用户权限最小化
  - 远程连接已正确配置
  - SSL/TLS 连接已启用（生产环境）

- [ ] **A.2.3** Redis（可选，用于缓存和会话）
  - Redis 已安装并运行
  - 密码保护已启用
  - 最大内存和淘汰策略已配置

- [ ] **A.2.4** 反向代理 (Nginx/Caddy)
  - HTTPS 重定向已配置
  - Gzip/Brotli 压缩已启用
  - 静态资源缓存策略已配置
  - 请求大小限制已设置
  - 超时配置已优化

### A.3 基础设施

- [ ] **A.3.1** 服务器规格
  - CPU: ≥ 2 核心
  - RAM: ≥ 4GB（推荐 8GB）
  - 磁盘: ≥ 50GB SSD
  - 带宽: ≥ 10Mbps（中国境内）

- [ ] **A.3.2** CDN 配置
  - 国内 CDN 已配置（阿里云、腾讯云、七牛等）
  - 静态资源已上传到 CDN
  - CDN 缓存策略已优化
  - CDN 回源配置正确

- [ ] **A.3.3** DNS 配置
  - A/AAAA 记录已配置
  - CNAME 记录已配置（CDN）
  - TTL 设置合理（生产: 3600-86400）
  - DNS 预解析优化已实施

---

## B. 安全加固 (Security Hardening)

### B.1 应用安全

**负责人**: Security Team  
**优先级**: 🔴 Critical

- [ ] **B.1.1** 安全头部
  - Frontend 安全中间件已启用: `apps/frontend/server/middleware/security-headers.ts`
  - CMS 生产安全配置已启用: `apps/cms/config/env/production/middlewares.ts`
  - 验证安全头部:
    ```bash
    curl -I https://your-domain.com | grep -E '(Strict-Transport|Content-Security|X-Frame|X-Content)'
    ```
  - 预期头部:
    - ✓ `Strict-Transport-Security`
    - ✓ `Content-Security-Policy`
    - ✓ `X-Frame-Options: SAMEORIGIN`
    - ✓ `X-Content-Type-Options: nosniff`
    - ✓ `Referrer-Policy: strict-origin-when-cross-origin`
    - ✓ `Permissions-Policy`

- [ ] **B.1.2** CORS 配置
  - `CLIENT_URL` 环境变量已正确设置
  - 只允许可信域名访问 API
  - 预检请求正确处理
  - 测试跨域请求:
    ```bash
    curl -H "Origin: https://your-domain.com" \
         -H "Access-Control-Request-Method: GET" \
         -X OPTIONS https://api.your-domain.com/api/endpoint
    ```

- [ ] **B.1.3** 速率限制
  - Strapi throttle 中间件已配置（100 请求/分钟）
  - API 端点速率限制已测试
  - 白名单端点已正确配置（health check）

- [ ] **B.1.4** 身份验证和授权
  - JWT 令牌过期时间合理（≤ 24 小时）
  - Refresh token 机制已实施
  - 管理员账户使用强密码
  - 双因素认证（2FA）已启用（可选）

### B.2 访问控制

- [ ] **B.2.1** 管理员账户审计
  - 删除所有演示/种子账户
  - 删除不必要的管理员账户
  - 审计现有管理员权限
  - 管理员登录已记录和监控

- [ ] **B.2.2** API 密钥管理
  - API 密钥已轮换（与默认值不同）
  - API 密钥安全存储（环境变量，不在代码中）
  - 限制 API 密钥权限范围
  - API 密钥使用已监控

- [ ] **B.2.3** 数据库安全
  - 数据库用户权限最小化
  - 生产数据库不暴露到公网
  - 数据库连接使用 SSL/TLS
  - 定期更改数据库密码

### B.3 代码和依赖

- [ ] **B.3.1** 依赖扫描
  ```bash
  pnpm audit
  pnpm audit --fix
  ```
  - 无高危或严重漏洞
  - 所有依赖都是最新稳定版本

- [ ] **B.3.2** 代码审计
  - 敏感信息不在代码中（密钥、密码）
  - 调试日志已关闭
  - 开发工具已禁用（Vue DevTools, React DevTools）

- [ ] **B.3.3** 安全测试
  - OWASP Top 10 漏洞已检查
  - SQL 注入防护已验证
  - XSS 防护已验证
  - CSRF 防护已启用

### B.4 服务器安全

- [ ] **B.4.1** 防火墙
  - UFW/iptables 已配置
  - 只开放必要端口（80, 443, SSH）
  - SSH 端口已更改（非 22）
  - SSH 密钥认证已启用，密码认证已禁用

- [ ] **B.4.2** 系统更新
  - 操作系统已更新到最新版本
  - 自动安全更新已启用
  - 定期更新计划已制定

- [ ] **B.4.3** 日志和监控
  - fail2ban 已安装并配置
  - 异常登录尝试已监控
  - 系统日志定期审查

---

## C. 性能验证 (Performance Verification)

### C.1 Lighthouse 审计

**负责人**: Frontend Team  
**优先级**: 🟡 High

- [ ] **C.1.1** 运行 Lighthouse CI
  ```bash
  pnpm lighthouse
  ```
  - 所有关键页面得分 ≥ 90:
    - ✓ 首页 (`/`)
    - ✓ 课程详情 (`/lessons/1`)
    - ✓ 资源中心 (`/resources`)
    - ✓ 学生仪表盘 (`/students`)
    - ✓ 设计日志 (`/design-log`)

- [ ] **C.1.2** Core Web Vitals (桌面)
  - First Contentful Paint (FCP): < 2.0s
  - Largest Contentful Paint (LCP): < 2.5s
  - Cumulative Layout Shift (CLS): < 0.1
  - Total Blocking Time (TBT): < 300ms
  - Speed Index: < 3.0s

- [ ] **C.1.3** Core Web Vitals (移动)
  - First Contentful Paint (FCP): < 2.5s
  - Largest Contentful Paint (LCP): < 3.5s
  - Cumulative Layout Shift (CLS): < 0.1
  - Total Blocking Time (TBT): < 500ms
  - Speed Index: < 4.0s

- [ ] **C.1.4** 可访问性和 SEO
  - Accessibility: ≥ 90
  - Best Practices: ≥ 90
  - SEO: ≥ 90

### C.2 WebPageTest 验证

参考: [`docs/performance/WEBPAGETEST.md`](./performance/WEBPAGETEST.md)

- [ ] **C.2.1** 中国节点测试
  - 北京节点测试完成
  - 上海节点测试完成
  - 广州节点测试完成（可选）

- [ ] **C.2.2** 性能指标（中国网络）
  - TTFB: < 1.0s
  - Start Render: < 2.0s
  - First Contentful Paint: < 3.0s
  - Speed Index: < 4.0s
  - Fully Loaded: < 6.0s

- [ ] **C.2.3** CDN 验证
  - 静态资源从 CDN 加载
  - CDN 命中率 > 90%
  - CDN 响应时间 < 100ms

### C.3 负载测试

- [ ] **C.3.1** API 负载测试
  ```bash
  # 使用 Apache Bench
  ab -n 1000 -c 10 https://api.your-domain.com/api/endpoint
  
  # 或使用 k6
  k6 run load-test.js
  ```
  - 并发用户: 100-500
  - 平均响应时间: < 500ms
  - 95th percentile: < 1000ms
  - 错误率: < 1%

- [ ] **C.3.2** 数据库性能
  - 慢查询已优化（< 100ms）
  - 索引已正确创建
  - 查询计划已审查
  - 连接池已优化

---

## D. 数据保护 (Data Protection)

### D.1 备份策略

**负责人**: DevOps Team  
**优先级**: 🔴 Critical

- [ ] **D.1.1** 备份脚本测试
  ```bash
  # 测试备份
  pnpm backup
  
  # 验证备份完整性
  ls -lh backups/
  ```
  - 备份脚本: `scripts/backup/strapi-backup.sh`
  - 恢复脚本: `scripts/backup/restore.sh`
  - 备份包含:
    - ✓ 数据库完整导出
    - ✓ 上传文件（`public/uploads`）
    - ✓ 配置文件
    - ✓ 元数据和完整性校验

- [ ] **D.1.2** 自动化备份
  - Cron 任务已配置（每日备份）:
    ```bash
    # 编辑 crontab
    crontab -e
    
    # 添加每日凌晨 2 点备份
    0 2 * * * cd /path/to/project && /path/to/project/scripts/backup/strapi-backup.sh
    ```
  - 备份通知已配置（成功/失败）
  - 备份目录有足够空间（≥ 100GB）

- [ ] **D.1.3** 备份保留策略
  - 每日备份: 保留 7 天
  - 每周备份: 保留 4 周
  - 每月备份: 保留 12 个月
  - 自动清理脚本已配置:
    ```bash
    # 在备份脚本中已包含
    BACKUP_RETENTION_DAYS=30
    ```

- [ ] **D.1.4** 异地备份
  - 备份已同步到远程存储（S3, OSS, COS）
  - 异地备份定期验证
  - 恢复流程已测试

### D.2 数据恢复

- [ ] **D.2.1** 恢复流程文档
  - 恢复步骤已文档化
  - 恢复时间目标（RTO）: < 4 小时
  - 恢复点目标（RPO）: < 24 小时

- [ ] **D.2.2** 恢复测试
  ```bash
  # 干运行测试（不实际恢复）
  pnpm backup:restore backups/strapi_backup_YYYYMMDD_HHMMSS --dry-run
  
  # 实际恢复测试（在测试环境）
  pnpm backup:restore backups/strapi_backup_YYYYMMDD_HHMMSS
  ```
  - 在测试环境完成完整恢复测试
  - 恢复数据完整性已验证
  - 恢复时间已记录

---

## E. 监控和告警 (Monitoring & Alerting)

### E.1 应用监控

**负责人**: DevOps Team  
**优先级**: 🟡 High

参考: [`docs/MONITORING.md`](./MONITORING.md)

- [ ] **E.1.1** Sentry 错误追踪
  - Frontend Sentry 已配置
  - CMS Sentry 已配置
  - 配置模板: `config/monitoring/sentry.example.json`
  - 测试错误上报:
    ```bash
    curl https://your-domain.com/api/test-error
    ```
  - Sentry 控制台收到测试错误
  - 告警规则已配置（错误率 > 5%）

- [ ] **E.1.2** Uptime 监控
  - Uptime Robot 已配置
  - 配置模板: `config/monitoring/uptime-robot.example.json`
  - 监控端点:
    - ✓ Frontend 健康检查 (`/api/health`)
    - ✓ CMS 健康检查 (`/_health`)
    - ✓ CMS 管理面板 (`/admin`)
  - 告警接收人已配置
  - 状态页面已创建（可选）

- [ ] **E.1.3** APM (Application Performance Monitoring)
  - Sentry Performance 已启用
  - 或 New Relic / Datadog 已配置
  - 慢事务告警已配置（> 3s）
  - 数据库查询监控已启用

### E.2 基础设施监控

- [ ] **E.2.1** 服务器监控
  - CPU 使用率监控（> 80% 告警）
  - 内存使用率监控（> 85% 告警）
  - 磁盘使用率监控（> 80% 告警）
  - 网络流量监控

- [ ] **E.2.2** 数据库监控
  - 连接数监控
  - 慢查询日志启用
  - 数据库大小监控
  - 备份状态监控

- [ ] **E.2.3** 日志聚合
  - Fluent Bit 已配置: `config/monitoring/fluent-bit.conf`
  - 日志收集源:
    - ✓ Frontend 应用日志
    - ✓ CMS 应用日志
    - ✓ Nginx 日志
    - ✓ 系统日志
  - 日志存储已配置（Elasticsearch, Loki, CloudWatch）
  - 日志查询和可视化已测试

### E.3 告警配置

- [ ] **E.3.1** 告警渠道
  - 邮件告警已配置
  - Slack/钉钉/企业微信告警已配置
  - 短信告警已配置（关键告警）
  - 值班电话已设置

- [ ] **E.3.2** 告警规则
  - 服务宕机告警（立即）
  - 高错误率告警（> 5%）
  - 性能降级告警（响应时间 > 3s）
  - 磁盘空间不足告警（< 20%）
  - SSL 证书即将过期告警（< 30 天）

- [ ] **E.3.3** 告警测试
  - 所有告警渠道已测试
  - 告警接收人已确认
  - 告警升级流程已制定
  - 24/7 值班表已建立

---

## F. 文档和合规 (Documentation & Compliance)

### F.1 技术文档

**负责人**: Tech Lead  
**优先级**: 🟡 High

- [ ] **F.1.1** 部署文档
  - 部署流程已文档化: [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md)
  - 环境配置已文档化
  - 故障排查指南已完善
  - 回滚流程已文档化

- [ ] **F.1.2** API 文档
  - API 端点已文档化
  - 请求/响应示例已提供
  - 身份验证流程已说明
  - 错误代码已定义

- [ ] **F.1.3** 运维文档
  - 监控指标已文档化
  - 告警处理流程已制定
  - 常见问题解答已整理
  - 联系人信息已更新

### F.2 用户协议和隐私

- [ ] **F.2.1** 隐私政策
  - 隐私政策已发布
  - 数据收集范围已说明
  - 数据使用目的已声明
  - 用户权利已告知（访问、删除、修改）

- [ ] **F.2.2** 用户协议
  - 服务条款已发布
  - 免责声明已包含
  - 知识产权声明已明确

- [ ] **F.2.3** Cookie 政策
  - Cookie 使用已声明
  - Cookie 同意弹窗已实施（可选）
  - 第三方 Cookie 已说明

### F.3 中国合规

**负责人**: Legal Team  
**优先级**: 🔴 Critical

- [ ] **F.3.1** ICP 备案
  - 网站域名已完成 ICP 备案
  - ICP 备案号已显示在网站底部
  - 备案信息准确无误
  - 备案年检已完成

- [ ] **F.3.2** 等保认证（如需要）
  - 等保级别已确定（一级/二级/三级）
  - 等保评测已完成
  - 整改措施已实施
  - 等保证书已获取

- [ ] **F.3.3** 内容审核
  - 敏感词过滤已实施
  - 用户生成内容审核机制已建立
  - 违规内容处理流程已制定

- [ ] **F.3.4** 数据本地化
  - 用户数据存储在中国境内
  - 跨境数据传输已申报（如有）
  - 数据出境安全评估已完成（如需要）

### F.4 知识产权

- [ ] **F.4.1** 开源许可
  - 第三方开源组件许可已审查
  - 许可证兼容性已确认
  - 许可证要求已遵守（如归属声明）

- [ ] **F.4.2** 版权声明
  - 网站版权声明已添加
  - 图片和内容版权已确认
  - 字体许可已购买（如需要）

---

## G. 部署流程 (Deployment Process)

### G.1 部署前检查

**负责人**: DevOps Team  
**优先级**: 🔴 Critical

- [ ] **G.1.1** 代码审查
  - 所有 PR 已合并到 main 分支
  - 代码审查已完成
  - 测试已通过（单元测试、集成测试）

- [ ] **G.1.2** CI/CD 检查
  ```bash
  # 本地运行 predeploy 检查
  pnpm predeploy
  ```
  - Lint 检查通过
  - TypeScript 类型检查通过
  - 单元测试通过
  - 环境变量验证通过
  - Lighthouse 审计通过

- [ ] **G.1.3** 构建验证
  ```bash
  # 构建前端
  pnpm build:frontend
  
  # 构建 CMS
  pnpm build:cms
  ```
  - 构建无错误
  - 构建产物大小合理（< 5MB）
  - Source map 已生成（用于错误追踪）

### G.2 部署步骤

- [ ] **G.2.1** 数据库迁移（如需要）
  ```bash
  # Strapi 数据库迁移
  pnpm --filter cms strapi migration:run
  ```
  - 迁移脚本已测试
  - 回滚脚本已准备
  - 数据备份已完成

- [ ] **G.2.2** 部署执行
  - 部署窗口已预约（低流量时段）
  - 用户已通知（计划维护公告）
  - 部署命令已执行:
    ```bash
    # 使用 Docker Compose
    docker-compose pull
    docker-compose up -d
    
    # 或使用 PM2
    pm2 reload ecosystem.config.js
    ```

- [ ] **G.2.3** 服务启动验证
  ```bash
  # 检查服务状态
  docker-compose ps
  # 或
  pm2 status
  
  # 检查健康端点
  curl https://your-domain.com/api/health
  curl https://api.your-domain.com/_health
  ```

### G.3 部署后验证

- [ ] **G.3.1** 冒烟测试
  - 首页加载正常
  - 用户登录功能正常
  - API 端点响应正常
  - 数据库连接正常
  - 静态资源加载正常

- [ ] **G.3.2** 监控检查
  - Sentry 错误追踪正常
  - Uptime 监控显示在线
  - APM 数据正常上报
  - 日志聚合正常工作

- [ ] **G.3.3** 性能验证
  ```bash
  # 运行 Lighthouse 审计
  lighthouse https://your-domain.com --view
  
  # 检查 Core Web Vitals
  curl -I https://your-domain.com
  ```
  - 页面加载速度符合预期
  - Core Web Vitals 达标
  - 无明显性能回归

### G.4 回滚计划

- [ ] **G.4.1** 回滚准备
  - 上一版本镜像/代码已保留
  - 回滚脚本已准备
  - 回滚决策标准已制定

- [ ] **G.4.2** 回滚执行（如需要）
  ```bash
  # Docker 回滚
  docker-compose down
  docker-compose up -d --force-recreate previous-version
  
  # PM2 回滚
  pm2 reload previous-version
  ```

- [ ] **G.4.3** 事后分析
  - 部署日志已记录
  - 问题根因已分析
  - 改进措施已制定
  - 知识库已更新

---

## 📊 检查清单总结

### 完成度统计

```
总项目数: 59
已完成: ___
进行中: ___
未开始: ___

完成率: ___%
```

### 签署确认

| 角色 | 姓名 | 签名 | 日期 |
|------|------|------|------|
| Tech Lead | | | |
| DevOps Engineer | | | |
| Security Engineer | | | |
| QA Lead | | | |
| Product Manager | | | |

### 部署批准

- [ ] 技术负责人批准
- [ ] 运维负责人批准
- [ ] 安全负责人批准
- [ ] 产品负责人批准

**部署日期**: _______________  
**部署时间**: _______________  
**预计时长**: _______________

---

## 🔗 相关资源

- [部署文档](./DEPLOYMENT.md)
- [监控指南](./MONITORING.md)
- [性能测试](./performance/WEBPAGETEST.md)
- [Docker 指南](./DOCKER.md)
- [快速开始](../QUICK_START.md)

---

## 📞 紧急联系

| 角色 | 联系人 | 电话 | 邮箱 |
|------|--------|------|------|
| On-call Engineer | | | |
| Database Admin | | | |
| Security Contact | | | |
| Management | | | |

---

**最后更新**: 2024-11  
**下次审查**: _______________

**注意**: 本检查清单应在每次生产部署前完整审查。根据项目实际情况调整检查项。
