# 生产环境上线检查清单 (Production Go-Live Checklist)

本文档提供全面的生产环境上线准备清单,涵盖安全、性能、备份和合规等关键领域。此清单适用于首次生产部署或重大版本发布前的准备工作。

> **📋 部署执行清单**: 关于具体部署操作步骤,请参考 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 📖 目录

- [上线前准备 (T-2周)](#上线前准备-t-2周)
- [环境配置验证](#环境配置验证)
- [Docker 镜像构建验证](#docker-镜像构建验证)
- [安全加固确认](#安全加固确认)
- [性能基线测试](#性能基线测试)
- [备份恢复测试](#备份恢复测试)
- [监控告警激活](#监控告警激活)
- [合规性审核](#合规性审核)
- [最终上线决策](#最终上线决策)
- [上线后验证](#上线后验证)

---

## 上线前准备 (T-2周)

### 项目管理
- [ ] 确定上线时间窗口和项目里程碑
- [ ] 建立跨职能团队(开发、运维、QA、安全、合规)
- [ ] 制定详细的上线计划和时间表
- [ ] 准备回滚计划和应急响应流程
- [ ] 安排上线期间的值班工程师
- [ ] 通知所有利益相关方上线时间

**责任人**: 项目经理、技术负责人

### 文档审核
- [ ] 审核并更新 [README.md](../README.md)
- [ ] 审核并更新 [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] 审核并更新 [DEPLOYMENT_STRATEGY.md](./DEPLOYMENT_STRATEGY.md)
- [ ] 审核并更新 [MONITORING.md](./MONITORING.md)
- [ ] 确保 [CHANGELOG.md](../CHANGELOG.md) 记录完整
- [ ] 准备用户文档和发布说明
- [ ] 创建运维手册(Runbook)

**责任人**: 技术文档工程师、开发团队

### 代码质量
- [ ] 所有 CI/CD 流程测试通过
- [ ] 代码审查完成并获得批准
- [ ] 没有已知的严重 Bug 或安全漏洞
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] E2E 测试通过(参考 [tests/smoke/](../tests/smoke/))
- [ ] 性能测试通过

**责任人**: 开发团队、QA 团队

---

## 环境配置验证

### 服务器基础设施
- [ ] 确认服务器硬件配置满足要求
  - CPU: 4 核以上
  - 内存: 8GB+ RAM
  - 存储: 50GB+ SSD
  - 参考: [DEPLOYMENT.md - 系统要求](./DEPLOYMENT.md#系统要求)
- [ ] 验证操作系统版本(Ubuntu 22.04 LTS 推荐)
- [ ] 检查磁盘空间充足(至少 50% 空闲)
- [ ] 验证网络配置和防火墙规则
- [ ] 确认负载均衡器配置正确

**验证脚本**: 手动检查服务器配置

**责任人**: 运维团队

### 软件依赖
- [ ] Node.js 版本正确 (>=18.0.0 <=22.x.x)
  ```bash
  node --version
  ```
- [ ] pnpm 版本正确 (>=8.0.0)
  ```bash
  pnpm --version
  ```
- [ ] PostgreSQL 数据库已安装并运行 (>=14)
  ```bash
  psql --version
  docker exec postgres psql -U postgres -c "SELECT version();"
  ```
- [ ] Docker 和 Docker Compose 已安装
  ```bash
  docker --version
  docker-compose --version
  ```
- [ ] Nginx 已配置(如使用反向代理)

**验证脚本**: `scripts/deploy/preflight.sh` (环境检查部分)

**责任人**: 运维团队

### 环境变量配置
- [ ] 生产环境 `.env` 文件已配置
- [ ] 所有必需的密钥和令牌已设置
  - `NUXT_STRAPI_API_TOKEN`
  - `APP_KEYS`
  - `API_TOKEN_SALT`
  - `ADMIN_JWT_SECRET`
  - `TRANSFER_TOKEN_SALT`
  - `JWT_SECRET`
- [ ] 数据库连接字符串正确
  - `DATABASE_HOST`
  - `DATABASE_PORT`
  - `DATABASE_NAME`
  - `DATABASE_USERNAME`
  - `DATABASE_PASSWORD`
- [ ] API 端点 URL 配置正确
  - `NUXT_PUBLIC_API_BASE_URL`
  - `NUXT_PUBLIC_STRAPI_URL`
- [ ] 第三方服务配置(如有)
  - Sentry DSN
  - 云存储配置
  - 邮件服务配置
- [ ] 环境变量文件权限设置正确(600)
  ```bash
  chmod 600 .env
  ```

**验证脚本**: `scripts/deploy/preflight.sh` (环境验证)

**责任人**: 运维团队、安全团队

### SSL/TLS 证书
- [ ] SSL 证书已安装并有效
- [ ] 证书过期时间 > 30 天
- [ ] 证书覆盖所有必需的域名
- [ ] HTTPS 重定向已配置
- [ ] 测试 SSL 配置评级 (使用 SSL Labs)
  ```bash
  # 使用 SSL Labs 或类似工具测试
  curl -I https://your-domain.com
  ```

**责任人**: 运维团队、安全团队

---

## Docker 镜像构建验证

### 镜像构建
- [ ] Frontend Docker 镜像构建成功
  ```bash
  docker-compose build frontend
  ```
- [ ] CMS Docker 镜像构建成功
  ```bash
  docker-compose build cms
  ```
- [ ] 数据库 Docker 镜像准备就绪
  ```bash
  docker-compose build postgres
  ```
- [ ] 所有镜像已打上正确的版本标签
  ```bash
  docker images | grep nuxt-strapi
  ```

**验证脚本**: `scripts/deploy/preflight.sh` (Docker 构建检查)

**责任人**: DevOps 团队

### 镜像安全扫描
- [ ] Docker 镜像安全漏洞扫描通过
  ```bash
  docker scan frontend:latest
  docker scan cms:latest
  ```
- [ ] 没有严重(Critical)或高(High)级别漏洞
- [ ] 所有中等(Medium)级别漏洞已评估
- [ ] 镜像大小优化(推荐 < 500MB)
  ```bash
  docker images --format "{{.Repository}}:{{.Tag}}\t{{.Size}}"
  ```

**责任人**: 安全团队、DevOps 团队

### 镜像推送与版本管理
- [ ] 镜像已推送到生产环境镜像仓库
- [ ] 镜像标签策略明确(如 v1.0.0, latest)
- [ ] 保留之前版本的镜像用于回滚
- [ ] 镜像仓库访问权限配置正确

**责任人**: DevOps 团队

### 容器运行验证
- [ ] 使用生产镜像启动容器成功
  ```bash
  docker-compose -f docker-compose.yml up -d
  ```
- [ ] 所有容器健康检查通过
  ```bash
  docker-compose ps
  docker ps --filter health=healthy
  ```
- [ ] 容器日志无严重错误
  ```bash
  docker-compose logs --tail=100
  ```
- [ ] 容器资源限制配置正确(CPU、内存)

**验证脚本**: `scripts/deploy/post-deploy-verify.sh`

**责任人**: DevOps 团队

---

## 安全加固确认

### 应用层安全
- [ ] 所有输入验证已实现
- [ ] SQL 注入防护已启用(使用 ORM/参数化查询)
- [ ] XSS 防护已启用(CSP、输出转义)
- [ ] CSRF 保护已启用
- [ ] 安全头部已配置
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Strict-Transport-Security`
  - `Content-Security-Policy`
- [ ] 文件上传限制已配置
- [ ] 速率限制已实施

**验证方法**: 手动检查代码和配置

**责任人**: 安全团队、开发团队

### 认证与授权
- [ ] 强密码策略已实施
- [ ] 会话管理安全配置
- [ ] JWT 令牌有效期合理(推荐 1-24 小时)
- [ ] API 认证机制正常工作
- [ ] 角色权限控制(RBAC)已配置
- [ ] 默认管理员账户已更改
- [ ] 测试账户已删除或禁用

**验证脚本**: 手动测试登录和权限

**责任人**: 安全团队

### 网络安全
- [ ] 防火墙规则已配置(仅开放必要端口)
  - 80/443 (HTTP/HTTPS)
  - 22 (SSH,限制IP)
  - 数据库端口不对外暴露
- [ ] 禁用不必要的服务和端口
- [ ] DDoS 防护已启用(如使用 CloudFlare 或 AWS Shield)
- [ ] WAF (Web 应用防火墙) 已配置
- [ ] 入侵检测系统(IDS)已部署

**责任人**: 网络安全团队、运维团队

### 数据安全
- [ ] 数据库连接已加密(SSL/TLS)
- [ ] 敏感数据已加密存储
- [ ] API 通信强制使用 HTTPS
- [ ] 日志中不包含敏感信息(密码、令牌等)
- [ ] 数据脱敏策略已实施(非生产环境)

**责任人**: 安全团队、DBA

### 安全审计
- [ ] 安全扫描工具已运行(如 OWASP ZAP、Nessus)
- [ ] 漏洞扫描报告已审核
- [ ] 第三方依赖安全审计通过
  ```bash
  pnpm audit
  npm audit
  ```
- [ ] 代码安全审查完成
- [ ] 渗透测试已完成(如适用)

**责任人**: 安全团队

---

## 性能基线测试

### Web Vitals 性能指标
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] FCP (First Contentful Paint) < 1.8s
- [ ] TTFB (Time to First Byte) < 0.8s
- [ ] INP (Interaction to Next Paint) < 200ms

**测试方法**: 浏览器开发者工具、Chrome DevTools Performance
```javascript
// 查看 apps/frontend/plugins/web-vitals.client.ts
// 在浏览器控制台查看实时 Web Vitals 指标
```

**参考文档**: [MONITORING.md - Web Vitals](./MONITORING.md#1-web-vitals-性能监控)

**责任人**: 前端团队、QA 团队

### Lighthouse CI 测试
- [ ] Lighthouse 性能得分 ≥ 90
- [ ] Lighthouse 可访问性得分 ≥ 95
- [ ] Lighthouse 最佳实践得分 ≥ 90
- [ ] Lighthouse SEO 得分 ≥ 95

**测试脚本**:
```bash
pnpm lighthouse
```

**配置文件**: [.lighthouserc.json](../.lighthouserc.json)

**参考文档**: [LIGHTHOUSE_CI.md](./LIGHTHOUSE_CI.md)

**责任人**: 前端团队、QA 团队

### 负载测试
- [ ] 负载测试工具已配置(如 k6、JMeter、Artillery)
- [ ] 正常负载下响应时间 < 500ms (p95)
- [ ] 峰值负载测试通过(预期流量的 2-3 倍)
- [ ] 压力测试确定系统极限
- [ ] 数据库连接池配置优化
- [ ] 缓存策略验证有效

**测试脚本**: 自定义负载测试脚本

**性能目标**:
- 并发用户: 1000+ (根据业务需求调整)
- 响应时间: p95 < 500ms, p99 < 1000ms
- 错误率: < 0.1%
- 吞吐量: 100+ req/s (根据业务需求调整)

**责任人**: QA 团队、性能工程师

### 数据库性能
- [ ] 数据库查询优化已完成
- [ ] 慢查询日志已启用和审查
- [ ] 数据库索引已优化
- [ ] 连接池配置合理
- [ ] 数据库监控已配置
- [ ] 数据库备份不影响性能

**测试方法**: 
```sql
-- PostgreSQL 慢查询
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

**责任人**: DBA、后端团队

### CDN 和缓存
- [ ] CDN 已配置并测试
- [ ] 静态资源缓存策略正确
- [ ] HTTP 缓存头配置正确
- [ ] Redis/Memcached 缓存(如使用)已配置
- [ ] 缓存失效策略已验证

**责任人**: 运维团队、前端团队

---

## 备份恢复测试

### 数据库备份策略
- [ ] 自动备份已配置
  - 每日全量备份
  - 每小时增量备份(可选)
  - 事务日志持续归档
- [ ] 备份存储位置配置(异地存储)
- [ ] 备份保留策略明确
  - 每日备份保留 30 天
  - 每周备份保留 3 个月
  - 每月备份保留 1 年
- [ ] 备份加密已启用

**配置参考**: [DEPLOYMENT.md - 备份和恢复](./DEPLOYMENT.md#备份和恢复)

**责任人**: DBA、运维团队

### 备份恢复测试
- [ ] 执行完整的数据库恢复测试
  ```bash
  # 创建测试备份
  pg_dump -U postgres -d dbname > backup_test.sql
  
  # 恢复到测试数据库
  psql -U postgres -d test_dbname < backup_test.sql
  
  # 验证数据完整性
  psql -U postgres -d test_dbname -c "SELECT COUNT(*) FROM critical_table;"
  ```
- [ ] 验证恢复数据的完整性和一致性
- [ ] 测量恢复时间目标(RTO)
  - 目标: RTO < 4 小时
  - 实际测量: _____ 小时
- [ ] 测量恢复点目标(RPO)
  - 目标: RPO < 15 分钟
  - 实际测量: _____ 分钟
- [ ] 记录恢复过程和所需时间

**责任人**: DBA、运维团队

### 应用数据备份
- [ ] CMS 媒体文件备份策略已配置
- [ ] 应用配置文件已备份
- [ ] 备份自动化脚本已测试
- [ ] 异地备份验证(不同可用区/区域)

**责任人**: 运维团队

### 灾难恢复计划
- [ ] 灾难恢复(DR)计划已制定
- [ ] DR 演练已完成
- [ ] 故障切换流程已文档化
- [ ] 关键联系人列表已更新
- [ ] 业务连续性计划(BCP)已审核

**责任人**: 运维总监、项目经理

---

## 监控告警激活

### 基础监控
- [ ] 服务器资源监控已配置
  - CPU 使用率监控
  - 内存使用率监控
  - 磁盘空间监控
  - 网络流量监控
- [ ] 应用健康检查端点已配置
  - Frontend: `/api/health`
  - CMS: `/_health`
- [ ] Docker 容器健康检查已启用
  ```bash
  docker ps --filter health=healthy
  docker-compose ps
  ```

**参考文档**: [MONITORING.md - 健康检查端点](./MONITORING.md#3-健康检查端点)

**责任人**: 运维团队

### 应用监控
- [ ] APM (应用性能监控) 已配置
  - 推荐: Prometheus + Grafana
  - 或: New Relic, Datadog, AppDynamics
- [ ] 错误追踪已配置
  - 推荐: Sentry
  - 配置参考: [MONITORING.md - Sentry 集成](./MONITORING.md#sentry-集成)
- [ ] 日志聚合已配置
  - ELK Stack (Elasticsearch + Logstash + Kibana)
  - 或: CloudWatch, Splunk, Graylog
- [ ] 自定义业务指标监控
  - 用户登录成功/失败率
  - API 响应时间
  - 数据库查询时间
  - 缓存命中率

**参考文档**: [MONITORING.md](./MONITORING.md)

**责任人**: 运维团队、DevOps 团队

### 告警配置
- [ ] CPU 使用率告警 (阈值: 70%)
- [ ] 内存使用率告警 (阈值: 80%)
- [ ] 磁盘空间告警 (阈值: 75%)
- [ ] 应用错误率告警 (阈值: 0.1%)
- [ ] 响应时间告警 (阈值: p95 > 500ms)
- [ ] 数据库连接告警
- [ ] 服务宕机告警
- [ ] SSL 证书过期告警 (提前 30 天)

**配置参考**: [MONITORING.md - 告警配置](./MONITORING.md#告警配置)

**责任人**: 运维团队

### 告警通知渠道
- [ ] 邮件通知已配置
- [ ] Slack/钉钉/企业微信通知已配置
- [ ] 短信通知已配置(关键告警)
- [ ] PagerDuty 或类似值班系统已配置
- [ ] 告警升级策略已定义
  - L1: 5 分钟无响应升级
  - L2: 15 分钟无响应升级
  - L3: 30 分钟无响应升级
- [ ] 告警通知测试已完成

**责任人**: 运维团队、值班工程师

### 监控仪表板
- [ ] 实时监控仪表板已创建
- [ ] 关键指标可视化
  - 系统资源使用
  - 应用性能指标
  - 业务指标
  - 用户活动
- [ ] 仪表板访问权限已配置
- [ ] 监控大屏已部署(如需要)

**责任人**: 运维团队、DevOps 团队

---

## 合规性审核

> **🇨🇳 中国合规要求**: 如果您的应用在中国大陆运营，请务必查看详细的 [中国合规检查清单](./COMPLIANCE_CHECKLIST_CN.md)，包括ICP备案、数据驻留、个人信息保护法(PIPL)、网络安全等级保护等要求。

### 中国大陆合规 (China Mainland Compliance)
- [ ] ICP备案已完成并展示备案号
  - 详见: [COMPLIANCE_CHECKLIST_CN.md - ICP备案要求](./COMPLIANCE_CHECKLIST_CN.md#icp备案要求)
- [ ] 公安备案已完成（上线后30天内）
- [ ] 数据存储在中国境内服务器
  - 详见: [COMPLIANCE_CHECKLIST_CN.md - 数据驻留](./COMPLIANCE_CHECKLIST_CN.md#数据驻留与跨境传输)
- [ ] 个人信息保护法(PIPL)合规
  - 详见: [COMPLIANCE_CHECKLIST_CN.md - 个人信息保护](./COMPLIANCE_CHECKLIST_CN.md#个人信息保护)
- [ ] 隐私政策使用简体中文并包含所有法定要求
  - 模板: [隐私政策模板](./compliance/PRIVACY_POLICY_TEMPLATE.md)
- [ ] Cookie同意机制已实施
  - 实现指南: [Cookie同意模板](./compliance/COOKIE_CONSENT_TEMPLATE.md)
- [ ] 网络安全等级保护(二级/三级)备案已完成
  - 详见: [COMPLIANCE_CHECKLIST_CN.md - 网络安全等级保护](./COMPLIANCE_CHECKLIST_CN.md#网络安全等级保护)
- [ ] 内容审核机制已实施（如有用户生成内容）

**责任人**: 合规官、法务团队

### 国际数据合规
- [ ] GDPR 合规审核完成(如适用于欧盟用户)
  - 用户数据收集同意
  - 数据访问权利
  - 数据删除权利("被遗忘权")
  - 数据可移植性
- [ ] CCPA 合规审核完成(如适用于加州用户)
- [ ] 数据本地化要求满足(各地区)
- [ ] 数据分类和标记完成
- [ ] 数据保留策略已实施

**责任人**: 合规官、法务团队

### 隐私政策和法律文档
- [ ] 隐私政策已发布并可访问
  - 模板参考: [隐私政策模板](./compliance/PRIVACY_POLICY_TEMPLATE.md)
- [ ] Cookie 政策已发布
  - 模板参考: [Cookie政策](./compliance/COOKIE_CONSENT_TEMPLATE.md)
- [ ] 用户协议/服务条款已发布
- [ ] 数据处理协议已签署（与第三方供应商）
- [ ] 隐私影响评估(PIA)已完成
- [ ] 个人信息保护负责人信息已公开

**责任人**: 法务团队、产品团队

### 审计日志
- [ ] 审计日志功能已实现
  - 用户登录/登出
  - 权限变更
  - 数据修改
  - 配置变更
- [ ] 审计日志保留期限符合要求
- [ ] 审计日志防篡改机制已实施
- [ ] 审计日志访问权限已限制

**参考文档**: [DESIGN_LOG_SYSTEM.md](./DESIGN_LOG_SYSTEM.md)

**责任人**: 安全团队、开发团队

### 行业合规
- [ ] ISO 27001 合规审核(如适用)
- [ ] SOC 2 审计(如适用)
- [ ] PCI DSS 合规(如处理支付)
- [ ] HIPAA 合规(如处理医疗数据)
- [ ] 行业特定合规要求已满足

**责任人**: 合规官、外部审计师

### 可访问性合规
- [ ] WCAG 2.1 AA 级合规
- [ ] 辅助技术兼容性测试
  - 屏幕阅读器测试
  - 键盘导航测试
  - 高对比度模式测试
- [ ] 可访问性审计报告

**参考文档**: [ACCESSIBILITY.md](./ACCESSIBILITY.md)

**责任人**: 前端团队、可访问性专家

---

## 最终上线决策

### 上线前评审会议 (T-24 小时)
- [ ] 召开上线前评审会议
- [ ] 所有团队确认准备就绪
  - [ ] 开发团队
  - [ ] QA 团队
  - [ ] 运维团队
  - [ ] 安全团队
  - [ ] 产品团队
- [ ] 所有检查项已完成或有缓解措施
- [ ] 风险评估已完成
- [ ] 上线计划和时间表确认

**参与人员**: 所有关键干系人

**责任人**: 项目经理、技术负责人

### Go/No-Go 决策
- [ ] 所有关键检查项通过
- [ ] 无阻塞性问题
- [ ] 团队信心评分 ≥ 8/10
- [ ] 利益相关方批准

**最终决策**: ☐ **GO (继续上线)** / ☐ **NO-GO (推迟上线)**

**决策时间**: _______________  
**决策人**: _______________  
**推迟原因**(如适用): _______________

### 上线前最终检查 (T-1 小时)
- [ ] 执行预检脚本
  ```bash
  pnpm deploy:preflight
  # 或
  bash scripts/deploy/preflight.sh
  ```
- [ ] 所有预检项通过
- [ ] 备份已完成并验证
- [ ] 值班人员就位
- [ ] 通讯渠道已建立(战情室/会议桥)
- [ ] 监控仪表板已打开

**验证脚本**: [scripts/deploy/preflight.sh](../scripts/deploy/preflight.sh)

**责任人**: 上线指挥官、DevOps 团队

---

## 上线后验证

### 立即验证 (T+0 - T+15 分钟)
- [ ] 执行部署验证脚本
  ```bash
  pnpm deploy:verify
  # 或
  bash scripts/deploy/post-deploy-verify.sh
  ```
- [ ] 健康检查端点响应正常
  ```bash
  curl https://your-domain.com/api/health
  curl https://your-domain.com/_health
  ```
- [ ] 核心页面可访问
  - [ ] 首页加载成功
  - [ ] 用户登录功能正常
  - [ ] CMS 管理界面可访问
- [ ] 关键 API 端点测试
- [ ] 数据库连接正常
- [ ] 监控指标正常

**验证脚本**: [scripts/deploy/post-deploy-verify.sh](../scripts/deploy/post-deploy-verify.sh)

**责任人**: 值班工程师、QA 团队

### 持续监控 (T+15分钟 - T+2小时)
- [ ] 错误率 < 0.1%
- [ ] 响应时间 p95 < 500ms
- [ ] CPU 使用率 < 70%
- [ ] 内存使用率 < 80%
- [ ] 无严重告警触发
- [ ] 用户反馈监控
- [ ] 日志错误模式分析

**参考文档**: [DEPLOYMENT_CHECKLIST.md - 后续监控](./DEPLOYMENT_CHECKLIST.md#post-deployment-t15-minutes)

**责任人**: 运维团队、值班工程师

### 业务验证 (T+2小时 - T+24小时)
- [ ] 关键业务流程测试
  - [ ] 用户注册/登录
  - [ ] 内容浏览
  - [ ] 搜索功能
  - [ ] 表单提交
  - [ ] 文件上传
- [ ] 用户行为分析正常
- [ ] 业务指标符合预期
- [ ] 客服反馈正常
- [ ] 无重大用户投诉

**责任人**: 产品团队、客服团队

### 性能验证
- [ ] 重新运行 Lighthouse CI
  ```bash
  pnpm lighthouse
  ```
- [ ] Web Vitals 指标符合基线
- [ ] 实际用户监控(RUM)数据正常
- [ ] 负载测试验证生产性能

**责任人**: 前端团队、性能工程师

### 上线总结 (T+24小时)
- [ ] 记录上线过程和问题
- [ ] 更新运维文档
- [ ] 团队复盘会议
- [ ] 发布上线报告
- [ ] 更新项目状态
- [ ] 感谢团队成员

**责任人**: 项目经理、技术负责人

---

## 应急响应流程

### 如需回滚
- [ ] 决策回滚
- [ ] 通知所有团队成员
- [ ] 执行回滚脚本
  ```bash
  pnpm deploy:rollback --force --skip-db
  # 或
  bash scripts/deploy/rollback.sh
  ```
- [ ] 验证回滚成功
- [ ] 创建事故报告
- [ ] 根因分析

**回滚脚本**: [scripts/deploy/rollback.sh](../scripts/deploy/rollback.sh)

**参考文档**: [DEPLOYMENT_CHECKLIST.md - 回滚程序](./DEPLOYMENT_CHECKLIST.md#rollback-procedure-if-needed)

**责任人**: 上线指挥官、DevOps 团队

---

## 关键联系人

| 角色 | 姓名 | 联系方式 |
|------|------|---------|
| 项目经理 | [姓名] | [电话/Slack] |
| 技术负责人 | [姓名] | [电话/Slack] |
| DevOps 负责人 | [姓名] | [电话/Slack] |
| 安全负责人 | [姓名] | [电话/Slack] |
| DBA | [姓名] | [电话/Slack] |
| 值班工程师 | 查看值班系统 | [PagerDuty/其他] |
| 产品负责人 | [姓名] | [电话/Slack] |
| 客服负责人 | [姓名] | [电话/Slack] |

---

## 相关文档

- **部署执行**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - 具体部署步骤
- **部署指南**: [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署详细说明
- **部署策略**: [DEPLOYMENT_STRATEGY.md](./DEPLOYMENT_STRATEGY.md) - Blue/Green 部署策略
- **监控指南**: [MONITORING.md](./MONITORING.md) - 监控和运维
- **可访问性**: [ACCESSIBILITY.md](./ACCESSIBILITY.md) - 可访问性合规
- **测试指南**: [TESTING.md](./TESTING.md) - 测试策略
- **Docker 指南**: [DOCKER.md](./DOCKER.md) - 容器化部署

---

## 关键脚本

| 脚本 | 用途 | 路径 |
|------|------|------|
| 预检脚本 | 部署前检查 | [scripts/deploy/preflight.sh](../scripts/deploy/preflight.sh) |
| 部署脚本 | Blue/Green 部署 | [scripts/deploy/blue-green-deploy.sh](../scripts/deploy/blue-green-deploy.sh) |
| 验证脚本 | 部署后验证 | [scripts/deploy/post-deploy-verify.sh](../scripts/deploy/post-deploy-verify.sh) |
| 回滚脚本 | 紧急回滚 | [scripts/deploy/rollback.sh](../scripts/deploy/rollback.sh) |
| 获取活动颜色 | 查询当前部署 | [scripts/deploy/get-active-color.sh](../scripts/deploy/get-active-color.sh) |

---

## 附录: 性能基线参考值

### Web Vitals 目标值
| 指标 | 良好 | 需要改进 | 差 |
|------|------|---------|-----|
| LCP | < 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| FCP | < 1.8s | 1.8s - 3.0s | > 3.0s |
| TTFB | < 0.8s | 0.8s - 1.8s | > 1.8s |
| INP | < 200ms | 200ms - 500ms | > 500ms |

**配置文件**: [lighthouserc.js](../lighthouserc.js)

### Lighthouse 得分目标
| 类别 | 最低分数 |
|------|---------|
| 性能 (Performance) | 90 |
| 可访问性 (Accessibility) | 95 |
| 最佳实践 (Best Practices) | 90 |
| SEO | 90 |

### 系统资源目标
| 资源 | 正常 | 告警阈值 | 严重阈值 |
|------|------|---------|---------|
| CPU 使用率 | < 50% | 70% | 90% |
| 内存使用率 | < 60% | 80% | 95% |
| 磁盘使用率 | < 60% | 75% | 90% |
| 数据库连接 | < 50% 池大小 | 80% 池大小 | 95% 池大小 |

### API 性能目标
| 指标 | 目标值 |
|------|-------|
| 响应时间 (p50) | < 200ms |
| 响应时间 (p95) | < 500ms |
| 响应时间 (p99) | < 1000ms |
| 错误率 | < 0.1% |
| 可用性 | > 99.9% |

---

## 版本历史

| 版本 | 日期 | 变更说明 | 作者 |
|------|------|---------|------|
| 1.0 | 2024-01-15 | 初始生产上线检查清单 | DevOps 团队 |

---

## 签字确认

本清单需由以下负责人确认完成:

**项目经理**: _______________  日期: _______________

**技术负责人**: _______________  日期: _______________

**DevOps 负责人**: _______________  日期: _______________

**安全负责人**: _______________  日期: _______________

**QA 负责人**: _______________  日期: _______________

**产品负责人**: _______________  日期: _______________

**最终批准人**: _______________  日期: _______________

---

**上线版本**: _______________  
**上线日期**: _______________  
**上线状态**: ☐ **成功** / ☐ **回滚** / ☐ **部分成功**  
**备注**: _______________
