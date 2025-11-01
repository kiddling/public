# CDN 策略和配置指南 (CDN Strategy)

本文档详细介绍如何为 Nuxt + Strapi 项目配置 CDN，以优化中国大陆用户的访问速度和体验。

## CDN 概述

内容分发网络（CDN）通过在全国各地部署边缘节点，将静态资源缓存到离用户最近的节点，从而：
- 减少服务器负载
- 降低网络延迟
- 提高可用性
- 节约带宽成本

## 国内主流 CDN 服务商对比

### 1. 阿里云 CDN

**优势**:
- 覆盖全国 2800+ 节点，海外 2300+ 节点
- 与阿里云 OSS 深度集成
- 稳定性极高，适合大型企业
- 提供详细的监控和分析

**价格**（按流量计费）:
- 0-10TB: ¥0.24/GB
- 10TB-50TB: ¥0.23/GB
- 50TB-100TB: ¥0.21/GB
- 更多阶梯优惠

**适用场景**: 大中型项目，对稳定性要求高

**文档**: [阿里云 CDN 文档](https://help.aliyun.com/product/27099.html)

### 2. 腾讯云 CDN

**优势**:
- 覆盖全国 2000+ 节点，海外 800+ 节点
- 与腾讯云 COS 集成良好
- 价格较阿里云稍低
- 适合游戏、视频加速

**价格**（按流量计费）:
- 0-2TB: ¥0.21/GB
- 2TB-10TB: ¥0.20/GB
- 10TB-50TB: ¥0.18/GB
- 更多阶梯优惠

**适用场景**: 中小型项目，预算有限

**文档**: [腾讯云 CDN 文档](https://cloud.tencent.com/document/product/228)

### 3. 七牛云 CDN

**优势**:
- 易用性好，配置简单
- 有免费额度（每月 10GB 流量）
- 适合图片和小文件加速
- 融合 CDN 支持动态加速

**价格**（按流量计费）:
- 0-10TB: ¥0.29/GB
- 10TB-50TB: ¥0.27/GB
- 免费额度: 每月 10GB

**适用场景**: 初创项目、图片网站

**文档**: [七牛云 CDN 文档](https://developer.qiniu.com/fusion)

### 4. 又拍云 CDN

**优势**:
- 性价比极高
- 按流量或按日峰值带宽计费
- 适合创业公司

**价格**:
- 按流量: ¥0.29/GB 起
- 按带宽: ¥88/Mbps/月 起

**适用场景**: 预算紧张的小型项目

**文档**: [又拍云 CDN 文档](https://help.upyun.com/)

## CDN 架构设计

### 推荐架构

```
[用户]
  ↓
[CDN 边缘节点]
  ↓
[源站 - Nginx (反向代理)]
  ↓
[Nuxt 前端] / [Strapi CMS]
  ↓
[对象存储 OSS/COS] (Strapi 上传的媒体文件)
```

### 资源分类和 CDN 策略

#### 1. 静态资源（优先级最高）

**资源类型**:
- JavaScript 文件 (`.js`)
- CSS 文件 (`.css`)
- 字体文件 (`.woff`, `.woff2`, `.ttf`, `.eot`)
- 图片 (`.jpg`, `.png`, `.gif`, `.webp`, `.svg`)
- 图标 (`favicon.ico`)

**CDN 配置**:
- **缓存时间**: 30 天
- **源站**: Nuxt 前端服务器
- **回源策略**: 若源站返回 404，缓存 1 分钟
- **压缩**: 启用 Gzip/Brotli

#### 2. Strapi 媒体文件

**资源类型**:
- 用户上传的图片、视频、文档
- 路径通常为 `/uploads/*`

**CDN 配置**:
- **缓存时间**: 30 天
- **源站**: 对象存储 (OSS/COS) 或 Strapi 服务器
- **防盗链**: 启用 Referer 白名单
- **压缩**: 图片启用，视频禁用

#### 3. API 请求（动态内容）

**资源类型**:
- Strapi API 响应 (`/api/*`)
- Nuxt SSR 页面

**CDN 配置**:
- **不缓存**或**短时间缓存**（1-5 分钟）
- **源站**: Nginx 反向代理
- **智能加速**: 启用动态内容加速（腾讯云 ECDN、阿里云 DCDN）

## CDN 配置步骤

### 阿里云 CDN 配置

#### 1. 添加 CDN 加速域名

```bash
# 登录阿里云控制台
# CDN -> 域名管理 -> 添加域名

加速域名: cdn.example.com
源站类型: 源站域名
源站地址: example.com (或服务器公网 IP)
加速区域: 仅中国大陆
```

#### 2. 配置 HTTPS

```bash
# CDN -> 域名管理 -> 选择域名 -> HTTPS 配置

上传 SSL 证书或选择免费证书
启用 HTTPS 安全加速
强制 HTTPS 跳转: 开启
HTTP/2: 开启
```

#### 3. 配置缓存规则

```bash
# CDN -> 域名管理 -> 选择域名 -> 缓存配置 -> 缓存规则

路径                缓存时间    权重
/                  不缓存      10
/api/*             不缓存      20
/_nuxt/*           30 天       30
/uploads/*         30 天       40
*.js               30 天       50
*.css              30 天       60
*.jpg,*.png,*.gif  30 天       70
*.woff,*.woff2     30 天       80
```

#### 4. 配置回源设置

```bash
# CDN -> 域名管理 -> 选择域名 -> 回源配置

回源 HOST: example.com
回源协议: 跟随（推荐）或 HTTPS
回源超时时间: 30 秒
```

#### 5. 配置性能优化

```bash
# CDN -> 域名管理 -> 选择域名 -> 性能优化

页面优化: 开启（自动去除 HTML 空格和注释）
智能压缩: 开启 (Gzip)
Brotli 压缩: 开启
```

#### 6. 配置访问控制（可选）

```bash
# CDN -> 域名管理 -> 选择域名 -> 访问控制

Referer 防盗链: 开启
  - 允许空 Referer: 否
  - 白名单: example.com, *.example.com

IP 黑白名单: 根据需要配置
User-Agent 黑白名单: 根据需要配置
```

#### 7. CNAME 解析

```bash
# 在域名解析商（如阿里云 DNS）添加 CNAME 记录

记录类型: CNAME
主机记录: cdn
记录值: cdn.example.com.w.alikunlun.com (阿里云提供)
TTL: 10 分钟
```

### 腾讯云 CDN 配置

#### 1. 添加 CDN 加速域名

```bash
# 登录腾讯云控制台
# CDN -> 域名管理 -> 添加域名

加速域名: cdn.example.com
所属项目: 默认项目
源站类型: 自有源
源站地址: example.com
加速区域: 中国境内
```

#### 2. 配置缓存规则

```bash
# CDN -> 域名管理 -> 缓存配置 -> 缓存规则

文件类型          缓存时间    说明
全部文件          0 秒        默认不缓存
.jpg .png .gif    2592000 秒  30 天
.js .css          2592000 秒  30 天
.woff .woff2      2592000 秒  30 天
/uploads/         2592000 秒  30 天
/_nuxt/           2592000 秒  30 天
/api/             0 秒        不缓存
```

#### 3. 配置 HTTPS

```bash
# CDN -> 域名管理 -> HTTPS 配置

上传证书或选择腾讯云 SSL 证书
强制 HTTPS: 开启
HTTP 2.0: 开启
OCSP 装订: 开启
```

#### 4. 配置回源设置

```bash
# CDN -> 域名管理 -> 回源配置

回源协议: 协议跟随
回源 Host: example.com
回源超时: 30 秒
```

#### 5. CNAME 解析

```bash
# 在 DNS 解析商添加 CNAME 记录

记录类型: CNAME
主机记录: cdn
记录值: cdn.example.com.cdn.dnsv1.com (腾讯云提供)
```

## 对象存储 + CDN 配置

### 阿里云 OSS + CDN

#### 1. 创建 OSS Bucket

```bash
# 对象存储 OSS -> Bucket 列表 -> 创建 Bucket

Bucket 名称: my-strapi-uploads
区域: 华东 1（杭州）
存储类型: 标准存储
读写权限: 私有（推荐）
```

#### 2. 配置跨域规则（CORS）

```bash
# OSS -> Bucket -> 权限管理 -> 跨域设置

来源: https://example.com, https://cms.example.com
允许 Methods: GET, POST, PUT, DELETE, HEAD
允许 Headers: *
暴露 Headers: ETag, x-oss-request-id
```

#### 3. 绑定 CDN 加速域名

```bash
# OSS -> Bucket -> 传输管理 -> 域名管理 -> 绑定域名

加速域名: uploads.example.com
自动添加 CNAME 记录: 是
开启 CDN 缓存自动刷新: 是
```

#### 4. 配置 Strapi 使用 OSS

安装 Strapi OSS Provider:

```bash
cd apps/cms
pnpm install @strapi/provider-upload-ali-oss
```

编辑 `apps/cms/config/plugins.ts`:

```typescript
export default {
  upload: {
    config: {
      provider: 'ali-oss',
      providerOptions: {
        accessKeyId: process.env.OSS_ACCESS_KEY_ID,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
        region: process.env.OSS_REGION,
        bucket: process.env.OSS_BUCKET,
        uploadPath: 'uploads',
        baseUrl: process.env.OSS_BASE_URL, // CDN 域名 https://uploads.example.com
        timeout: 60000,
      },
    },
  },
};
```

添加环境变量到 `apps/cms/.env`:

```env
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=my-strapi-uploads
OSS_BASE_URL=https://uploads.example.com
```

### 腾讯云 COS + CDN

#### 1. 创建 COS 存储桶

```bash
# 对象存储 -> 存储桶列表 -> 创建存储桶

名称: my-strapi-uploads
所属地域: 北京
访问权限: 私有读写
```

#### 2. 配置 CDN 加速

```bash
# COS -> 存储桶 -> 域名与传输管理 -> 自定义 CDN 加速域名

加速域名: uploads.example.com
源站类型: 默认源站
回源鉴权: 开启
CDN 服务授权: 同意
```

#### 3. 配置 Strapi 使用 COS

安装 Strapi COS Provider:

```bash
cd apps/cms
pnpm install @strapi/provider-upload-tencent-cloud-cos
```

配置 `apps/cms/config/plugins.ts`:

```typescript
export default {
  upload: {
    config: {
      provider: 'tencent-cloud-cos',
      providerOptions: {
        secretId: process.env.COS_SECRET_ID,
        secretKey: process.env.COS_SECRET_KEY,
        bucket: process.env.COS_BUCKET,
        region: process.env.COS_REGION,
        baseUrl: process.env.COS_BASE_URL, // CDN 域名
      },
    },
  },
};
```

## CDN 刷新和预热

### 阿里云 CDN 刷新

```bash
# 通过控制台
CDN -> 刷新预热 -> 刷新缓存
  - URL 刷新: 输入具体文件 URL
  - 目录刷新: 输入目录 URL

# 通过 API
aliyun cdn RefreshObjectCaches \
  --ObjectPath https://cdn.example.com/path/to/file.js
```

### 腾讯云 CDN 刷新

```bash
# 通过控制台
CDN -> 刷新预热 -> 提交刷新
  - URL 刷新: 输入具体 URL
  - 目录刷新: 输入目录

# 通过 API
tccli cdn PurgeUrlsCache \
  --Urls '["https://cdn.example.com/path/to/file.js"]'
```

### 自动化刷新脚本

创建 `scripts/cdn-purge.sh`:

```bash
#!/bin/bash

# 阿里云 CDN 刷新示例
CDN_URLS=(
  "https://cdn.example.com/_nuxt/*"
  "https://cdn.example.com/manifest.json"
)

for url in "${CDN_URLS[@]}"; do
  echo "Refreshing: $url"
  aliyun cdn RefreshObjectCaches --ObjectPath "$url" --ObjectType Directory
done

echo "CDN refresh completed!"
```

在部署脚本中调用:

```bash
pnpm build
bash scripts/cdn-purge.sh
```

## 监控和性能优化

### CDN 监控指标

定期检查以下指标：
- **命中率**: 应 > 90%
- **回源带宽**: 尽量降低
- **响应时间**: 平均 < 100ms
- **错误率**: 4xx/5xx 错误

### 提高命中率的方法

1. **规范化 URL**: 避免带参数的静态资源
2. **合理的缓存时间**: 静态资源 30 天，动态内容不缓存
3. **预热热门资源**: 在发布后立即预热
4. **监控日志**: 发现低命中率的资源并优化

### 使用 CDN 分析工具

```bash
# 阿里云 CDN 日志下载和分析
# 控制台 -> 日志管理 -> 离线日志

# 腾讯云 CDN 日志分析
# 控制台 -> 统计分析 -> 日志服务
```

## 成本优化

### 1. 选择合适的计费方式

- **按流量计费**: 适合流量波动大的业务
- **按带宽计费**: 适合流量稳定、峰值高的业务

### 2. 多 CDN 调度

根据地域和成本，使用多个 CDN 服务商，智能调度。

### 3. 启用智能压缩

减少传输数据量，降低流量费用。

### 4. 合理设置缓存时间

避免频繁回源，节约流量和计算成本。

## 故障排查

### CDN 缓存未生效

```bash
# 检查响应头
curl -I https://cdn.example.com/static/file.js

# 查看 X-Cache 或 X-Cache-Lookup 头部
# HIT: 命中缓存
# MISS: 未命中，从源站获取
```

### HTTPS 访问失败

- 检查 SSL 证书是否正确配置
- 检查源站是否支持 HTTPS
- 检查回源协议设置

### 404 错误

- 检查源站文件是否存在
- 检查回源 Host 设置
- 检查缓存规则是否正确

## 相关文档

- [中国云部署指南](./china-cloud.md)
- [Nginx 配置指南](./nginx-config.md)
- [监控和日志](./monitoring-logging.md)

## 参考资源

- [阿里云 CDN 最佳实践](https://help.aliyun.com/document_detail/27112.html)
- [腾讯云 CDN 最佳实践](https://cloud.tencent.com/document/product/228/38939)
- [七牛云 CDN 文档](https://developer.qiniu.com/fusion)
