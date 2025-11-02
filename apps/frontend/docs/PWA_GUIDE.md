# PWA 功能指南

## 概述

本应用已实现完整的 PWA (Progressive Web App) 功能，支持离线访问、安装到设备主屏幕，并提供类似原生应用的体验。

## 功能特性

### 1. 离线访问
- ✅ 自动缓存已访问的页面和资源
- ✅ 离线模式下可访问缓存内容
- ✅ 智能缓存策略（API 使用 NetworkFirst，静态资源使用 CacheFirst）
- ✅ 离线状态实时提示
- ✅ 专门的离线页面 (/offline)

### 2. 安装功能
- ✅ 自动检测安装条件
- ✅ 智能安装提示（3秒后显示）
- ✅ iOS 和 Android 安装引导
- ✅ 记住用户选择（不重复提示已拒绝的用户）
- ✅ 支持"添加到主屏幕"功能

### 3. 自动更新
- ✅ 检测新版本可用
- ✅ 更新通知提示
- ✅ 一键更新功能
- ✅ 每小时自动检查更新
- ✅ 更新后自动重载页面

### 4. 缓存策略

#### 静态资源（CacheFirst）
- 图片（PNG, JPG, JPEG, SVG, GIF, WebP）
- 字体文件（WOFF, WOFF2）
- JavaScript 和 CSS 文件
- 缓存时间：30 天
- 最大条目：100

#### API 请求（NetworkFirst）
- 所有 API 调用
- 网络超时：10 秒
- 缓存时间：1 天
- 最大条目：50

#### 谷歌字体（CacheFirst）
- 缓存时间：1 年
- 最大条目：10

### 5. 应用图标

已配置以下尺寸的图标：
- 192x192 - 标准 PWA 图标
- 512x512 - 高分辨率 PWA 图标
- 180x180 - iOS Apple Touch Icon

## 组件说明

### PwaOfflineNotification
显示离线状态的顶部通知栏
- 位置：页面顶部
- 显示条件：网络断开时
- 功能：提示用户当前处于离线模式，可点击了解更多

### PwaInstallPrompt
应用安装提示卡片
- 位置：页面右下角（移动端底部）
- 显示时机：页面加载 3 秒后
- 功能：
  - Android/Chrome: 显示一键安装按钮
  - iOS Safari: 显示手动安装步骤
  - 可关闭提示（记录用户选择）

### PwaUpdateNotification
应用更新通知
- 位置：页面右下角
- 显示条件：检测到新版本
- 功能：提示用户更新，支持一键更新

## 使用说明

### 开发环境测试

1. **启动开发服务器**
```bash
cd apps/frontend
npm run dev
```

2. **在 Chrome DevTools 中测试**
   - 打开开发者工具
   - 切换到 Application 标签
   - 查看 Service Workers 部分
   - 使用 "Offline" 模式测试离线功能

3. **测试安装功能**
   - Chrome: 右上角会显示安装按钮
   - 或者通过应用内的安装提示进行安装

### 生产环境部署

1. **构建应用**
```bash
npm run build
```

2. **预览生产版本**
```bash
npm run preview
```

3. **验证 PWA 功能**
   - 使用 Lighthouse 审计工具
   - 检查 PWA 评分
   - 确保所有检查项通过

## Lighthouse PWA 审计清单

✅ 必须项：
- [x] 注册 Service Worker
- [x] 响应式设计
- [x] 提供 manifest.json
- [x] 配置应用图标
- [x] 设置主题色
- [x] 离线时有回退页面
- [x] HTTPS 部署（生产环境）
- [x] 快速加载速度
- [x] 可安装

## 平台特定说明

### iOS (Safari)
- 需要手动添加到主屏幕
- 应用提供了详细的安装指引
- 支持 Apple Touch Icon
- 状态栏样式：黑色半透明
- viewport-fit: cover（支持刘海屏）

### Android (Chrome)
- 自动显示安装横幅
- 支持一键安装
- 显示自定义启动画面
- 完整的 PWA 功能支持

### Desktop (Chrome/Edge)
- 可安装为桌面应用
- 独立窗口运行
- 支持快捷方式

## 配置说明

### Manifest 配置
位置：`nuxt.config.ts` → `pwa.manifest`

主要配置项：
- `name`: 应用完整名称
- `short_name`: 应用短名称
- `description`: 应用描述
- `theme_color`: 主题颜色
- `background_color`: 背景颜色
- `display`: 显示模式（standalone）
- `orientation`: 屏幕方向（portrait）
- `icons`: 应用图标数组

### Service Worker 配置
位置：`nuxt.config.ts` → `pwa.workbox`

主要配置项：
- `navigateFallback`: 离线回退页面
- `globPatterns`: 预缓存文件匹配模式
- `runtimeCaching`: 运行时缓存策略
- `cleanupOutdatedCaches`: 清理过期缓存
- `skipWaiting`: 立即激活新 Service Worker
- `clientsClaim`: 立即控制所有页面

## 最佳实践

1. **定期清理缓存**
   - Service Worker 会自动清理过期缓存
   - 可在开发者工具中手动清理

2. **测试离线功能**
   - 先在线访问页面
   - 切换到离线模式
   - 验证页面仍可访问

3. **监控缓存大小**
   - 使用 Chrome DevTools → Application → Storage
   - 查看各个缓存的大小
   - 根据需要调整缓存策略

4. **更新策略**
   - 使用 autoUpdate 模式
   - 检测到更新时提示用户
   - 避免强制刷新影响用户体验

## 故障排查

### Service Worker 未注册
1. 检查是否在 HTTPS 或 localhost 环境
2. 查看浏览器控制台错误信息
3. 清除浏览器缓存后重试

### 离线功能不工作
1. 确保先在线访问过页面
2. 检查 Service Worker 是否正在运行
3. 查看缓存存储中是否有内容

### 安装提示不显示
1. 检查是否已安装应用
2. 确认是否满足 PWA 安装条件
3. 查看是否已关闭过提示

### 更新通知不显示
1. 确保有新版本部署
2. 检查 Service Worker 更新检测
3. 手动触发更新检查

## 性能指标

目标指标：
- Lighthouse PWA 评分：≥ 90
- 首次内容绘制（FCP）：< 1.8s
- 最大内容绘制（LCP）：< 2.5s
- 首次输入延迟（FID）：< 100ms
- 累积布局偏移（CLS）：< 0.1

## 相关资源

- [MDN PWA 指南](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps)
- [Workbox 文档](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://developer.mozilla.org/zh-CN/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)

## 维护记录

### 2024-11-02
- ✅ 初始化 PWA 功能
- ✅ 配置 @vite-pwa/nuxt 模块
- ✅ 创建应用图标（192x192, 512x512, 180x180）
- ✅ 配置 manifest.json
- ✅ 实现 Service Worker 缓存策略
- ✅ 创建离线页面和通知组件
- ✅ 实现安装提示功能
- ✅ 实现更新通知功能
- ✅ 添加 iOS 特定支持
