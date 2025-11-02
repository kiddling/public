# 性能优化指南 (Performance Optimization Guide)

## 概述 (Overview)

本文档详细说明了前端应用的性能优化策略和实施细节。

## 目标 (Goals)

- 首屏 JS bundle 大小 < 200KB (gzipped)
- Lighthouse Performance 分数 > 90
- 首次内容绘制 (FCP) < 1.5s
- 最大内容绘制 (LCP) < 2.5s
- 累积布局偏移 (CLS) < 0.1
- 交互到下次绘制 (INP) < 200ms

## 已实施的优化 (Implemented Optimizations)

### 1. Bundle 分析和优化 (Bundle Analysis)

#### 使用工具
- `rollup-plugin-visualizer` - 可视化 bundle 组成
- `vite-plugin-compression` - 生成 gzip 和 brotli 压缩文件

#### 分析命令
```bash
# 构建并分析 bundle
pnpm build:analyze

# 查看性能报告
pnpm perf:report
```

#### 手动 Chunk 策略
```typescript
// nuxt.config.ts
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    // 大型库独立打包
    if (id.includes('jspdf')) return 'vendor-jspdf'
    if (id.includes('qrcode')) return 'vendor-qrcode'
    if (id.includes('markdown-it')) return 'vendor-markdown'
    
    // Vue 生态系统
    if (id.includes('@vue') || id.includes('vue-router')) {
      return 'vendor-vue'
    }
    
    // 其他依赖
    return 'vendor'
  }
}
```

### 2. 代码分割 (Code Splitting)

#### 路由级别分割
Nuxt 3 自动为每个页面创建独立的 chunk：
- `/pages/index.vue` → `pages/index.[hash].js`
- `/pages/lessons/[id].vue` → `pages/lessons/[id].[hash].js`

#### 组件懒加载
```vue
<script setup lang="ts">
// 使用 defineAsyncComponent 懒加载大型组件
const HeavyComponent = defineAsyncComponent(() => 
  import('~/components/HeavyComponent.vue')
)

// 或者使用 Nuxt 的 Lazy 前缀
</script>

<template>
  <!-- 懒加载组件 -->
  <LazyHeavyComponent v-if="showComponent" />
</template>
```

#### 条件导入
```typescript
// 仅在需要时导入
const exportPDF = async () => {
  const { jsPDF } = await import('jspdf')
  // 使用 jsPDF
}
```

### 3. 图片优化 (Image Optimization)

使用 `@nuxt/image` 模块进行自动优化：

```vue
<template>
  <!-- 自动 WebP 转换和响应式图片 -->
  <NuxtImg
    src="/images/hero.jpg"
    preset="hero"
    sizes="sm:100vw md:80vw lg:1200px"
    loading="lazy"
    alt="Hero image"
  />
  
  <!-- 使用预设配置 -->
  <NuxtImg
    src="/images/card.jpg"
    preset="card"
    loading="lazy"
    alt="Card image"
  />
</template>
```

#### 配置的预设
- `thumbnail` - 200x200, WebP
- `card` - 400x300, WebP
- `gallery` - 800px width, WebP
- `hero` - 1920px width, WebP

### 4. 性能监控 (Performance Monitoring)

#### Web Vitals 集成
自动收集和报告核心性能指标：
- LCP (Largest Contentful Paint)
- FCP (First Contentful Paint)
- CLS (Cumulative Layout Shift)
- FID (First Input Delay)
- INP (Interaction to Next Paint)
- TTFB (Time to First Byte)

#### 使用性能工具
```typescript
// 在组件中使用
const { 
  mark, 
  measure, 
  debounce, 
  throttle,
  isSlowConnection 
} = usePerformance()

// 标记性能点
mark('data-fetch-start')
await fetchData()
mark('data-fetch-end')
measure('data-fetch', 'data-fetch-start', 'data-fetch-end')

// 防抖搜索
const debouncedSearch = debounce(search, 300)

// 节流滚动
const throttledScroll = throttle(handleScroll, 100)

// 检测慢速连接
if (isSlowConnection()) {
  // 加载低质量图片或跳过某些功能
}
```

### 5. 资源预加载 (Resource Preloading)

#### 关键资源预加载
```typescript
const { preloadResource, prefetchResource } = usePerformance()

// 预加载关键资源
preloadResource('/fonts/source-han-sans.woff2', 'font')

// 预取下一页资源
prefetchResource('/api/lessons/next')
```

#### 字体加载优化
```html
<!-- 在 app.vue 或 layouts/default.vue 中 -->
<template>
  <Head>
    <Link
      rel="preload"
      href="/fonts/source-han-sans-cn-regular.woff2"
      as="font"
      type="font/woff2"
      crossorigin="anonymous"
    />
  </Head>
</template>
```

### 6. 运行时性能优化 (Runtime Performance)

#### Vue 组件优化
```vue
<script setup lang="ts">
// 使用 computed 缓存计算结果
const filteredItems = computed(() => {
  return items.value.filter(item => item.active)
})

// 使用 shallowRef 减少响应式开销
const heavyData = shallowRef(largeDataset)
</script>

<template>
  <!-- 使用 v-memo 缓存渲染结果 -->
  <div v-memo="[item.id, item.updatedAt]">
    <ExpensiveComponent :item="item" />
  </div>
  
  <!-- 使用 v-once 只渲染一次 -->
  <div v-once>
    <StaticContent />
  </div>
  
  <!-- 使用 v-show 而不是 v-if（频繁切换） -->
  <div v-show="isVisible">
    <Content />
  </div>
</template>
```

#### 长列表优化
对于超过 100 项的列表，考虑使用虚拟滚动：
```bash
pnpm add vue-virtual-scroller
```

```vue
<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
</script>

<template>
  <RecycleScroller
    :items="items"
    :item-size="80"
    key-field="id"
  >
    <template #default="{ item }">
      <ListItem :item="item" />
    </template>
  </RecycleScroller>
</template>
```

### 7. CSS 优化 (CSS Optimization)

#### Tailwind CSS 优化
```javascript
// tailwind.config.ts
export default {
  // 只扫描使用的文件
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  
  // 启用 JIT 模式（默认）
  mode: 'jit',
  
  // 移除未使用的样式
  purge: {
    enabled: process.env.NODE_ENV === 'production',
  },
}
```

#### 关键 CSS 内联
Nuxt 自动提取和内联关键 CSS，无需额外配置。

### 8. 服务端渲染优化 (SSR Optimization)

#### 组件缓存
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    routeRules: {
      // 缓存静态页面 1 小时
      '/resources': { 
        swr: 3600,
        cache: {
          maxAge: 3600,
        }
      },
      // ISR：每 10 分钟重新验证
      '/lessons/**': { 
        swr: 600,
        cache: {
          maxAge: 600,
        }
      },
    },
  },
})
```

### 9. 依赖优化 (Dependency Optimization)

#### 审查和替换大型依赖
| 原依赖 | 大小 | 替代方案 | 节省 |
|--------|------|----------|------|
| moment.js | ~70KB | date-fns | ~50KB |
| lodash | ~70KB | lodash-es + tree-shaking | ~60KB |
| axios | ~15KB | 原生 fetch API | ~15KB |

#### Tree-shaking 友好的导入
```typescript
// ❌ 导入整个库
import _ from 'lodash'
import * as vueuse from '@vueuse/core'

// ✅ 只导入需要的功能
import { debounce } from 'lodash-es'
import { useDebounce } from '@vueuse/core'
```

### 10. 压缩和缓存 (Compression & Caching)

#### 静态资源缓存
```typescript
// nuxt.config.ts
nitro: {
  routeRules: {
    '/fonts/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
    '/images/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  },
}
```

#### Gzip 和 Brotli 压缩
自动在构建时生成 `.gz` 和 `.br` 文件，由 Nginx 或 CDN 提供服务。

## 性能预算 (Performance Budgets)

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| 首屏 JS (gzipped) | < 200KB | - | - |
| 总 JS (gzipped) | < 500KB | - | - |
| 总 CSS | < 100KB | - | - |
| 总资源 | < 1MB | - | - |
| LCP | < 2.5s | - | - |
| FCP | < 1.5s | - | - |
| CLS | < 0.1 | - | - |

运行 `pnpm perf:report` 查看实际数据。

## 监控和测试 (Monitoring & Testing)

### Lighthouse CI

Lighthouse CI 自动审计应用性能、可访问性、SEO 和最佳实践。

#### 本地运行
```bash
# 运行 Lighthouse 测试
pnpm lighthouse
```

#### 配置
配置文件：`.lighthouserc.json`（项目根目录）

测试的关键路由：
- 首页 (`/`)
- 学生作品 (`/students`)
- 设计日志 (`/design-log`)
- 下载中心 (`/downloads`)

#### 性能预算
- **Performance**: ≥ 90
- **SEO**: ≥ 95
- **Accessibility**: ≥ 95
- **Best Practices**: ≥ 90

#### 资源预算
- JavaScript: ≤ 200KB
- CSS: ≤ 100KB
- 总资源: ≤ 1MB

#### CI/CD 集成
Lighthouse CI 在每次 PR 和 push 到 main/develop 分支时自动运行。报告以以下格式上传为 artifacts：

```
lighthouse-results-{branch}-{run_number}-{commit_sha}
```

#### 查看报告
1. 在 GitHub Actions 中导航到 Lighthouse CI 作业
2. 下载 `lighthouse-results-*` artifact
3. 解压并在浏览器中打开 `.html` 报告文件

#### 解读结果
- **Green (90-100)**: 良好，符合预期
- **Orange (50-89)**: 需要改进
- **Red (0-49)**: 需要立即修复

如果任何核心指标（Performance、SEO）低于预算，构建将失败。

### 性能报告
```bash
# 生成性能报告
pnpm build:frontend
pnpm perf:report
```

### 开发环境监控
在浏览器控制台查看实时性能指标：
```javascript
// 查看 Web Vitals
window.__webVitals

// 查看性能条目
performance.getEntries()
```

## 最佳实践清单 (Best Practices Checklist)

### 开发阶段
- [ ] 使用 computed 而不是 methods（频繁调用）
- [ ] 大型组件使用 defineAsyncComponent
- [ ] 列表使用 key 属性
- [ ] 避免深层嵌套的 watch
- [ ] 使用 shallowRef/shallowReactive（大型对象）

### 构建阶段
- [ ] 运行 bundle 分析
- [ ] 检查重复打包的模块
- [ ] 验证代码分割策略
- [ ] 检查性能预算

### 部署前
- [ ] 运行 Lighthouse 测试
- [ ] 检查压缩文件生成
- [ ] 验证缓存策略
- [ ] 测试慢速网络下的加载

### 生产环境
- [ ] 启用 CDN
- [ ] 配置正确的缓存头
- [ ] 监控实际用户指标 (RUM)
- [ ] 定期审查性能报告

## 故障排查 (Troubleshooting)

### Bundle 过大
1. 运行 `pnpm build:analyze` 查看组成
2. 检查是否有重复打包的模块
3. 考虑懒加载或代码分割
4. 寻找更轻量的替代库

### LCP 过高
1. 优化最大内容元素（通常是图片或文本块）
2. 使用 `<NuxtImg>` 优化图片
3. 预加载关键资源
4. 减少渲染阻塞资源

### CLS 过高
1. 为图片和视频设置尺寸
2. 避免在现有内容上方插入内容
3. 使用 CSS transforms 而不是改变尺寸
4. 预留广告或动态内容的空间

### FCP/FID 过高
1. 减少 JavaScript 执行时间
2. 代码分割和懒加载
3. 移除未使用的代码
4. 使用 Web Workers 处理复杂计算

## 参考资源 (Resources)

- [Nuxt Performance](https://nuxt.com/docs/guide/concepts/rendering)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Vue Performance](https://vuejs.org/guide/best-practices/performance.html)
- [Vite Performance](https://vitejs.dev/guide/performance.html)

## 更新日志 (Changelog)

### 2024-11-01
- ✅ 添加 bundle 分析配置
- ✅ 实施代码分割策略
- ✅ 配置性能监控
- ✅ 创建性能报告脚本
- ✅ 添加性能工具 composable
- ✅ 优化构建配置
