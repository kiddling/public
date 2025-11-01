# WebPageTest 性能测试指南 (WebPageTest Performance Testing Guide)

本文档说明如何使用 WebPageTest 进行真实用户环境的性能测试，特别是针对中国地区的访问优化。

## 📊 概述

WebPageTest 提供真实设备和网络环境下的性能测试，比 Lighthouse 更接近实际用户体验。对于面向中国用户的应用，使用中国节点测试至关重要。

## 🌏 中国节点测试

### 可用测试节点

推荐使用以下中国境内测试节点：

1. **Beijing, China (北京)** - China Telecom (电信)
2. **Shanghai, China (上海)** - China Unicom (联通)
3. **Guangzhou, China (广州)** - China Mobile (移动)

### 为什么使用中国节点？

- **真实网络环境**: 测试跨境网络延迟
- **CDN 验证**: 验证 CDN 在中国的实际性能
- **合规性检查**: 确保符合中国网络环境要求
- **ICP 影响**: 评估 ICP 备案对访问速度的影响

## 🚀 快速开始

### 1. 访问 WebPageTest

前往: https://www.webpagetest.org/

### 2. 基本测试配置

```
Test URL: https://your-domain.com
Test Location: Beijing, China - Cable
Browser: Chrome
Connection: 4G LTE (recommended for mobile-first apps)
Number of Tests: 3 (for median results)
Repeat View: Yes (tests cached performance)
```

### 3. 高级配置

点击 "Advanced Settings" 进行更详细配置：

#### Script 示例 (测试用户旅程)

```javascript
// 测试首页加载
navigate  https://your-domain.com/

// 等待页面加载完成
waitForComplete

// 测试导航到课程详情页
navigate  https://your-domain.com/lessons/1

// 等待加载
waitForComplete

// 测试搜索功能
navigate  https://your-domain.com/resources?search=example

// 等待加载
waitForComplete
```

#### 自定义 Headers

```
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
```

## 📈 性能阈值

### Core Web Vitals 目标值

基于 Google 的 Core Web Vitals 和中国网络环境：

#### First Contentful Paint (FCP)
- 🟢 良好: < 1.8s
- 🟡 需要改进: 1.8s - 3.0s
- 🔴 差: > 3.0s

#### Largest Contentful Paint (LCP)
- 🟢 良好: < 2.5s
- 🟡 需要改进: 2.5s - 4.0s
- 🔴 差: > 4.0s

#### Cumulative Layout Shift (CLS)
- 🟢 良好: < 0.1
- 🟡 需要改进: 0.1 - 0.25
- 🔴 差: > 0.25

#### Time to Interactive (TTI)
- 🟢 良好: < 3.8s
- 🟡 需要改进: 3.8s - 7.3s
- 🔴 差: > 7.3s

#### Total Blocking Time (TBT)
- 🟢 良好: < 200ms
- 🟡 需要改进: 200ms - 600ms
- 🔴 差: > 600ms

### 中国网络环境调整

由于跨境网络延迟和 Great Firewall (GFW)，建议放宽标准：

- **FCP**: < 3.0s (良好)
- **LCP**: < 4.0s (良好)
- **TTI**: < 5.0s (良好)

## 🔍 关键测试场景

### 场景 1: 首次访问 (First View)

测试新用户首次访问体验：

```javascript
// 清除缓存
clearCache

// 访问首页
navigate  https://your-domain.com/
```

**关注指标**:
- DNS Lookup Time
- Connection Time
- SSL Negotiation Time
- Time to First Byte (TTFB)
- Start Render

### 场景 2: 回访用户 (Repeat View)

测试缓存策略效果：

```javascript
// 首次访问
navigate  https://your-domain.com/
waitForComplete

// 回访（使用缓存）
navigate  https://your-domain.com/
```

**期望改进**:
- TTFB 应显著降低
- 资源加载时间大幅减少
- Start Render 更快

### 场景 3: 用户旅程

测试真实用户行为：

```javascript
// 1. 访问首页
navigate  https://your-domain.com/
waitForComplete

// 2. 浏览课程列表
navigate  https://your-domain.com/lessons
waitForComplete

// 3. 查看课程详情
navigate  https://your-domain.com/lessons/1
waitForComplete

// 4. 访问资源中心
navigate  https://your-domain.com/resources
waitForComplete
```

### 场景 4: CDN 性能验证

测试静态资源 CDN 加载：

```javascript
navigate  https://your-domain.com/
waitForComplete

// 检查特定 CDN 资源
execAndWait  document.querySelector('img[src*="cdn."]').complete
```

## 📊 结果分析

### Waterfall Chart (瀑布图)

关注以下问题：

1. **DNS Lookup**: > 200ms 表示 DNS 服务器慢或未优化
2. **SSL Negotiation**: > 300ms 表示 SSL 握手慢
3. **TTFB**: > 600ms 表示服务器响应慢
4. **Content Download**: 蓝色部分过长表示资源过大
5. **Blocked Requests**: 红色表示被 GFW 阻止

### 优化建议检查清单

- [ ] DNS 预解析 (dns-prefetch)
- [ ] HTTP/2 或 HTTP/3 启用
- [ ] Gzip/Brotli 压缩
- [ ] 图片优化 (WebP, AVIF)
- [ ] 代码分割 (Code Splitting)
- [ ] 关键 CSS 内联
- [ ] 懒加载非关键资源
- [ ] CDN 使用（国内 CDN）
- [ ] Service Worker 缓存策略

### 常见问题诊断

#### 问题 1: TTFB 过高 (> 1s)

可能原因：
- 服务器位置远（跨境延迟）
- 数据库查询慢
- 服务器资源不足
- 未使用缓存

解决方案：
- 使用中国境内服务器
- 优化数据库查询
- 启用服务器缓存 (Redis)
- 使用 CDN

#### 问题 2: 资源加载慢

可能原因：
- 第三方资源未优化
- 图片过大
- JavaScript bundle 过大
- 未使用 CDN

解决方案：
- 压缩图片，使用现代格式
- 代码分割，懒加载
- 使用国内 CDN
- 预加载关键资源

#### 问题 3: CLS (布局偏移) 高

可能原因：
- 图片未设置尺寸
- 动态内容插入
- Web 字体加载导致文本闪烁

解决方案：
- 为图片设置 width/height 属性
- 使用 font-display: swap
- 预留内容空间

## 🤖 自动化测试

### WebPageTest API

使用 API 进行自动化测试：

```bash
# 安装 WebPageTest CLI
npm install -g webpagetest

# 运行测试
webpagetest test https://your-domain.com \
  --key YOUR_API_KEY \
  --location Beijing_China \
  --connectivity 4G \
  --runs 3 \
  --first \
  --video \
  --lighthouse
```

### 集成到 CI/CD

在 GitHub Actions 中添加：

```yaml
- name: Run WebPageTest
  run: |
    npm install -g webpagetest
    webpagetest test ${{ secrets.PRODUCTION_URL }} \
      --key ${{ secrets.WPT_API_KEY }} \
      --location Beijing_China \
      --connectivity 4G \
      --lighthouse \
      --budget ./wpt-budget.json
```

### 性能预算 (wpt-budget.json)

```json
{
  "timings": {
    "firstContentfulPaint": 3000,
    "largestContentfulPaint": 4000,
    "timeToInteractive": 5000,
    "totalBlockingTime": 300,
    "cumulativeLayoutShift": 0.1
  },
  "requests": {
    "total": 50,
    "html": 1,
    "css": 5,
    "js": 10,
    "image": 30,
    "font": 4
  },
  "sizes": {
    "total": 2048,
    "html": 30,
    "css": 100,
    "js": 500,
    "image": 1200,
    "font": 200
  }
}
```

## 📝 测试报告

### 生成报告

WebPageTest 提供多种报告格式：

1. **HTML 报告**: 详细的可视化报告
2. **JSON 数据**: 用于自动化分析
3. **HAR 文件**: 网络请求详情
4. **视频**: 页面加载过程录制
5. **Filmstrip**: 关键帧截图

### 报告共享

```bash
# 测试完成后获取报告链接
https://www.webpagetest.org/result/{TEST_ID}/

# 示例
https://www.webpagetest.org/result/241101_AiDcFD_8B7/
```

## 🔗 相关资源

- [WebPageTest 官网](https://www.webpagetest.org/)
- [WebPageTest 文档](https://docs.webpagetest.org/)
- [WebPageTest API](https://product.webpagetest.org/api)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## 📋 测试检查清单

在发布到生产环境前，完成以下测试：

- [ ] 首页 (First View & Repeat View)
- [ ] 课程详情页
- [ ] 资源中心页
- [ ] 学生仪表盘
- [ ] 设计日志页
- [ ] 搜索功能
- [ ] 图片加载性能
- [ ] 字体加载性能
- [ ] 第三方脚本影响
- [ ] 移动端性能 (4G 网络)
- [ ] 桌面端性能 (宽带)
- [ ] CDN 覆盖验证
- [ ] HTTPS 性能
- [ ] 缓存策略验证
- [ ] Core Web Vitals 达标

## 💡 最佳实践

1. **定期测试**: 每次重大更新后进行性能测试
2. **多地点测试**: 测试多个中国城市节点
3. **真实设备**: 使用实际移动设备测试
4. **网络条件**: 测试不同网络条件 (4G, 3G, 2G)
5. **基准对比**: 保留历史数据进行对比
6. **用户监控**: 结合 RUM (Real User Monitoring) 数据
7. **持续优化**: 设定性能目标，持续改进

---

**注意**: WebPageTest 中国节点可能需要申请 API key，部分功能可能受限。建议结合本地 Lighthouse CI 和线上 WebPageTest 进行综合评估。
