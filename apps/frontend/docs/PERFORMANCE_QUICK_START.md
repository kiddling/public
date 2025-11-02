# 性能优化快速开始 (Performance Quick Start)

## 🚀 5 分钟快速开始

### 1. 分析当前性能

```bash
# 构建应用（带分析）
cd apps/frontend
pnpm build:analyze

# 生成性能报告
pnpm perf:report
```

**输出：**

- Bundle 可视化：`.nuxt/analyze/stats.html`
- 性能报告：`performance-report.json`

### 2. 查看性能指标

```bash
# 启动开发服务器
pnpm dev

# 在浏览器控制台
window.__webVitals  // 查看 Web Vitals 指标
```

### 3. 运行 Lighthouse 测试

```bash
# 从项目根目录
pnpm build:frontend
pnpm lighthouse
```

## 📋 常用性能优化模式

### 懒加载大型组件

```vue
<script setup>
// 使用 Lazy 前缀
</script>

<template>
  <LazyHeavyComponent v-if="show" />
</template>
```

### 动态导入依赖

```typescript
// ❌ 避免
import { jsPDF } from 'jspdf'

// ✅ 推荐
const exportPDF = async () => {
  const { jsPDF } = await import('jspdf')
  // 使用 jsPDF
}
```

### 优化图片

```vue
<template>
  <NuxtImg
    src="/images/hero.jpg"
    preset="hero"
    sizes="sm:100vw md:80vw lg:1200px"
    loading="lazy"
    alt="Hero"
  />
</template>
```

### 防抖和节流

```typescript
const { debounce, throttle } = usePerformance()

// 搜索防抖
const search = debounce((query) => {
  // 执行搜索
}, 300)

// 滚动节流
const handleScroll = throttle((event) => {
  // 处理滚动
}, 100)
```

### 使用 v-memo

```vue
<template>
  <!-- 只在 id 或 updatedAt 变化时重新渲染 -->
  <div v-for="item in items" :key="item.id" v-memo="[item.id, item.updatedAt]">
    <ExpensiveComponent :item="item" />
  </div>
</template>
```

## 🎯 性能预算检查

### 目标值

| 指标    | 目标              |
| ------- | ----------------- |
| 首屏 JS | < 200KB (gzipped) |
| 总 JS   | < 500KB (gzipped) |
| 总 CSS  | < 100KB           |
| FCP     | < 1.5s            |
| LCP     | < 2.5s            |
| CLS     | < 0.1             |

### 检查命令

```bash
# 检查 bundle 大小
pnpm perf:report

# 检查 Lighthouse 分数
pnpm lighthouse
```

## 🔧 开发工具

### usePerformance Composable

```typescript
const {
  mark, // 标记性能点
  measure, // 测量性能
  debounce, // 防抖
  throttle, // 节流
  getConnectionSpeed, // 连接速度
  isSlowConnection, // 慢速检测
  preloadResource, // 预加载
  prefetchResource, // 预取
} = usePerformance()
```

### 使用示例

```typescript
// 测量操作耗时
mark('fetch-start')
await fetchData()
mark('fetch-end')
measure('fetch', 'fetch-start', 'fetch-end')

// 慢速连接适配
if (isSlowConnection()) {
  // 加载低质量版本
  loadLowQuality()
} else {
  loadHighQuality()
}

// 预加载下一页
preloadResource('/api/next-page')
```

## 📊 性能监控

### 开发环境

```typescript
// 自动记录 Web Vitals
// 超预算会在控制台显示警告

// 查看所有指标
console.log(window.__webVitals)

// 查看性能条目
performance.getEntries()
```

### 生产环境

Web Vitals 数据会自动发送到分析端点（已配置）。

## 🚨 常见问题排查

### Bundle 过大

```bash
# 1. 分析 bundle
pnpm build:analyze

# 2. 查找大型依赖
# 查看 stats.html 中的依赖树

# 3. 优化措施
- 使用动态导入
- 寻找更轻量的替代品
- 移除未使用的依赖
```

### LCP 过高

```vue
<!-- 1. 优化最大元素（通常是图片） -->
<NuxtImg src="/hero.jpg" preset="hero" priority loading="eager" />

<!-- 2. 预加载关键资源 -->
<Link rel="preload" href="/hero.jpg" as="image" />
```

### CLS 过高

```vue
<!-- 为图片设置尺寸 -->
<NuxtImg src="/image.jpg" width="400" height="300" alt="Image" />

<!-- 或使用 aspect-ratio -->
<div class="aspect-w-16 aspect-h-9">
  <NuxtImg src="/image.jpg" />
</div>
```

## 📚 更多资源

- [完整性能指南](./PERFORMANCE.md)
- [优化模式示例](./examples/performance-patterns.vue)
- [实施报告](../PERFORMANCE_OPTIMIZATION.md)

## 💡 小贴士

1. **始终测量** - 优化前后都要测量
2. **关注用户体验** - 数字只是指标，用户感知才重要
3. **渐进式优化** - 先优化影响最大的部分
4. **定期审查** - 每次发布前运行性能测试
5. **监控生产** - 关注真实用户数据

## ✅ 检查清单

开发新功能时：

- [ ] 大型组件使用懒加载
- [ ] 图片使用 `<NuxtImg>`
- [ ] 搜索/滚动使用防抖/节流
- [ ] 列表使用唯一 key
- [ ] 避免不必要的响应式

提交前：

- [ ] 运行 `pnpm build:analyze`
- [ ] 检查 bundle 大小
- [ ] 运行 `pnpm perf:report`
- [ ] 检查性能预算

部署前：

- [ ] 运行 `pnpm lighthouse`
- [ ] 检查 Performance 分数
- [ ] 验证 Web Vitals 指标

---

**需要帮助？** 查看 [完整文档](./PERFORMANCE.md) 或联系团队。
