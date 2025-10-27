# 设计系统文档 (Design System Documentation)

## 概述 (Overview)

本设计系统为中文教育内容平台提供了一套完整的 UI 基础设施，包括：

- **Tailwind CSS** 配置，优化中文字体和排版
- **可复用的基础组件**（按钮、卡片、标签等）
- **响应式布局系统**（AppShell、Header、Sidebar）
- **无障碍访问支持**（ARIA 标签、键盘导航、屏幕阅读器优化）
- **国际化支持**（i18n 配置，初始支持简体中文）
- **打印友好样式**

## 目录结构 (Project Structure)

```
project/
├── assets/
│   └── css/
│       ├── main.css              # 全局样式和 Tailwind 导入
│       └── _variables.scss       # SCSS 变量
├── components/
│   ├── base/                     # 基础组件
│   │   ├── BaseButton.vue
│   │   ├── BaseCard.vue
│   │   ├── BaseTag.vue
│   │   └── SectionHeader.vue
│   └── layout/                   # 布局组件
│       ├── AppShell.vue
│       ├── AppHeader.vue
│       └── AppSidebar.vue
├── locales/
│   └── zh-CN.json               # 中文翻译
├── pages/
│   ├── index.vue                # 主页示例
│   └── components.vue           # 组件展示页
├── nuxt.config.ts               # Nuxt 配置
├── tailwind.config.js           # Tailwind 配置
└── histoire.config.ts           # Histoire 组件文档配置
```

## 颜色系统 (Color System)

### 课程部分颜色 (Course Part Colors)

设计系统为不同的课程部分提供了独特的颜色标识：

- **Foundation (基础)**: 蓝色 `#3b82f6`
- **Intermediate (中级)**: 绿色 `#22c55e`
- **Advanced (高级)**: 紫色 `#a855f7`
- **Expert (专家)**: 橙色 `#f97316`

使用方式：

```vue
<BaseCard part-color="foundation">
  基础课程内容
</BaseCard>

<BaseTag variant="intermediate">中级</BaseTag>
```

### 语义颜色 (Semantic Colors)

- **Success**: `#22c55e` (成功/完成状态)
- **Warning**: `#f59e0b` (警告状态)
- **Error**: `#ef4444` (错误状态)
- **Info**: `#3b82f6` (信息状态)

### 中性色 (Neutral Colors)

从 `neutral-50` (最浅) 到 `neutral-950` (最深) 的灰度色阶。

## 排版系统 (Typography System)

### 中文字体栈 (Chinese Font Stack)

```css
font-family: '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
             'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB',
             'Source Han Sans SC', 'Noto Sans CJK SC', 'sans-serif';
```

系统使用本地系统字体，无需依赖 CDN 加载，确保快速加载和离线可用性。支持所有主流中文字体。

### 标题样式 (Heading Styles)

| Class | 尺寸 | 用途 |
|-------|------|------|
| `heading-1` | 3-5xl | 页面主标题 |
| `heading-2` | 2-4xl | 主要章节标题 |
| `heading-3` | xl-3xl | 次要章节标题 |
| `heading-4` | lg-2xl | 小节标题 |
| `heading-5` | base-xl | 组件标题 |
| `heading-6` | sm-lg | 最小标题 |

### 正文样式 (Body Text Styles)

| Class | 尺寸 | 用途 |
|-------|------|------|
| `body-large` | 1.125rem | 重要段落 |
| `body-base` | 1rem | 标准正文 |
| `body-small` | 0.875rem | 次要信息 |
| `caption` | 0.875rem | 说明文字 |
| `caption-small` | 0.75rem | 细小说明 |

### 代码样式 (Code Styles)

```vue
<!-- 行内代码 -->
<code class="code-inline">const x = 10;</code>

<!-- 代码块 -->
<pre class="code-block">
function greet(name: string) {
  return `你好，${name}！`;
}
</pre>
```

## 基础组件 (Base Components)

### BaseButton

功能丰富的按钮组件，支持多种变体和状态。

**Props:**

- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `loading`: boolean
- `iconLeft`: string (图标名称)
- `iconRight`: string (图标名称)
- `fullWidth`: boolean

**示例:**

```vue
<BaseButton variant="primary" icon-right="heroicons:arrow-right">
  开始学习
</BaseButton>

<BaseButton variant="outline" :loading="true">
  加载中
</BaseButton>
```

### BaseCard

灵活的卡片容器组件。

**Props:**

- `variant`: 'default' | 'bordered' | 'elevated'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `interactive`: boolean (鼠标悬停效果)
- `partColor`: 'foundation' | 'intermediate' | 'advanced' | 'expert'
- `image`: string (图片 URL)
- `imageAlt`: string

**Slots:**

- `default`: 卡片主体内容
- `header`: 卡片头部
- `footer`: 卡片底部

**示例:**

```vue
<BaseCard interactive part-color="foundation">
  <template #header>
    <h3>课程标题</h3>
  </template>
  
  <p>课程描述内容...</p>
  
  <template #footer>
    <BaseButton size="sm">查看详情</BaseButton>
  </template>
</BaseCard>
```

### BaseTag

标签/徽章组件。

**Props:**

- `variant`: 'default' | 'foundation' | 'intermediate' | 'advanced' | 'expert' | 'success' | 'warning' | 'error' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: string (图标名称)
- `removable`: boolean

**Events:**

- `remove`: 点击移除按钮时触发

**示例:**

```vue
<BaseTag variant="foundation" icon="heroicons:academic-cap">
  基础课程
</BaseTag>

<BaseTag removable @remove="handleRemove">
  可移除标签
</BaseTag>
```

### SectionHeader

章节标题组件，带有可选的课程部分标识和操作按钮。

**Props:**

- `title`: string (必需)
- `subtitle`: string
- `partColor`: 'foundation' | 'intermediate' | 'advanced' | 'expert'
- `partLabel`: string
- `headingLevel`: 1 | 2 | 3 | 4 | 5 | 6
- `centered`: boolean

**Slots:**

- `actions`: 标题右侧的操作按钮

**示例:**

```vue
<SectionHeader
  title="欢迎来到基础课程"
  subtitle="从零开始学习编程"
  part-color="foundation"
  part-label="基础"
>
  <template #actions>
    <BaseButton variant="primary">开始学习</BaseButton>
  </template>
</SectionHeader>
```

## 布局组件 (Layout Components)

### AppShell

应用程序主框架，包含 Header、Sidebar 和主内容区域。

**示例:**

```vue
<template>
  <AppShell>
    <!-- 页面内容 -->
  </AppShell>
</template>
```

### AppHeader

顶部导航栏，包含 Logo、导航链接和操作按钮。

**Slots:**

- `nav`: 导航链接
- `actions`: 右侧操作区域

**Events:**

- `toggle-sidebar`: 切换侧边栏显示

**示例:**

```vue
<AppHeader @toggle-sidebar="handleToggleSidebar">
  <template #nav>
    <NuxtLink to="/">首页</NuxtLink>
    <NuxtLink to="/courses">课程</NuxtLink>
  </template>
  
  <template #actions>
    <BaseButton size="sm">登录</BaseButton>
  </template>
</AppHeader>
```

### AppSidebar

侧边栏导航，支持响应式和移动端抽屉模式。

**Props:**

- `open`: boolean (控制移动端显示)

**Events:**

- `close`: 关闭侧边栏

**Slots:**

- `default`: 侧边栏内容（默认为课程导航）

## 无障碍访问 (Accessibility)

### 键盘导航 (Keyboard Navigation)

所有交互组件都支持键盘导航：

- `Tab`: 在可聚焦元素间移动
- `Enter` / `Space`: 激活按钮和链接
- `Escape`: 关闭模态框和侧边栏

### ARIA 标签 (ARIA Labels)

所有组件都包含适当的 ARIA 属性：

```vue
<!-- 示例 -->
<button
  type="button"
  :aria-label="$t('navigation.menu')"
  :aria-expanded="String(sidebarOpen)"
>
  菜单
</button>
```

### Skip Links

页面包含跳转到主内容的快捷链接：

```vue
<a href="#main-content" class="skip-link">
  跳转到主内容
</a>
```

### Focus 样式

所有交互元素都有明显的 focus 样式：

```css
*:focus-visible {
  @apply outline-2 outline-offset-2 outline-primary-500 rounded;
}
```

### 减少动画 (Reduced Motion)

系统自动检测用户的动画偏好：

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 响应式设计 (Responsive Design)

### 断点 (Breakpoints)

| 名称 | 宽度 | 用途 |
|------|------|------|
| `sm` | 640px | 手机横屏 |
| `md` | 768px | 平板 |
| `lg` | 1024px | 小屏笔记本 |
| `xl` | 1280px | 桌面 |
| `2xl` | 1536px | 大屏 |

### 响应式工具类

```vue
<!-- 示例 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- 移动端 1 列，平板 2 列，桌面 3 列 -->
</div>

<div class="text-sm md:text-base lg:text-lg">
  <!-- 响应式字体大小 -->
</div>
```

## 打印样式 (Print Styles)

### 打印工具类

- `.no-print`: 打印时隐藏元素
- `.print-break-before`: 在元素前分页
- `.print-break-after`: 在元素后分页
- `.print-break-avoid`: 避免在元素内分页

### 示例

```vue
<button class="no-print">
  此按钮在打印时不会显示
</button>

<article class="print-break-avoid">
  此内容在打印时会保持在同一页
</article>
```

## 国际化 (Internationalization)

### 使用翻译

```vue
<template>
  <h1>{{ $t('app.title') }}</h1>
  <p>{{ $t('app.description') }}</p>
</template>
```

### 添加新的翻译键

编辑 `locales/zh-CN.json`:

```json
{
  "mySection": {
    "title": "我的标题",
    "description": "我的描述"
  }
}
```

### 添加新语言

1. 创建新的语言文件：`locales/en-US.json`
2. 在 `nuxt.config.ts` 中添加语言配置：

```ts
i18n: {
  locales: [
    {
      code: 'zh-CN',
      iso: 'zh-CN',
      name: '简体中文',
      file: 'zh-CN.json'
    },
    {
      code: 'en-US',
      iso: 'en-US',
      name: 'English',
      file: 'en-US.json'
    }
  ],
  defaultLocale: 'zh-CN'
}
```

## 动画 (Animations)

### VueUse Motion

系统集成了 VueUse Motion，支持声明式动画：

```vue
<div v-motion-pop-bottom>
  <!-- 此元素会从底部弹出 -->
</div>
```

### 自定义动画

在 `nuxt.config.ts` 中添加自定义动画指令：

```ts
motion: {
  directives: {
    'fade-in': {
      initial: { opacity: 0 },
      visible: { opacity: 1 }
    }
  }
}
```

## 扩展设计系统 (Extending the Design System)

### 添加新的颜色

编辑 `tailwind.config.js`:

```js
colors: {
  // ... 现有颜色
  custom: {
    light: '#...',
    DEFAULT: '#...',
    dark: '#...'
  }
}
```

### 创建新组件

1. 在 `components/base/` 或 `components/layout/` 中创建新组件
2. 遵循现有组件的模式和命名约定
3. 使用 TypeScript 定义 Props 接口
4. 添加必要的 ARIA 属性
5. 创建对应的 `.story.vue` 文件用于文档

**组件模板:**

```vue
<template>
  <div :class="componentClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface MyComponentProps {
  variant?: 'default' | 'primary'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<MyComponentProps>(), {
  variant: 'default',
  size: 'md'
})

const componentClasses = computed(() => {
  // 计算样式类
  return []
})
</script>

<style scoped>
/* 组件特定样式 */
</style>
```

### 添加新的工具类

在 `assets/css/main.css` 的 `@layer utilities` 中添加：

```css
@layer utilities {
  .my-custom-utility {
    @apply /* Tailwind 类 */;
  }
}
```

## 组件文档 (Component Documentation)

### 查看组件库

有两种方式查看组件文档：

1. **Nuxt 页面**: 访问 `/components` 路由查看所有组件示例
2. **Histoire**: 运行 `npm run story:dev` 启动 Histoire 服务器

### Histoire 使用

```bash
# 开发模式
npm run story:dev

# 构建静态文档
npm run story:build
```

Histoire 提供了交互式的组件预览和文档，可以实时调整 Props 查看效果。

## 最佳实践 (Best Practices)

### 组件使用

1. **优先使用基础组件**: 不要重复创建按钮、卡片等基础组件
2. **保持一致性**: 使用设计系统提供的颜色、间距和排版
3. **响应式优先**: 始终考虑移动端体验
4. **无障碍访问**: 添加适当的 ARIA 标签和键盘支持

### 样式编写

1. **使用 Tailwind 工具类**: 优先使用 Tailwind，减少自定义 CSS
2. **组件级作用域**: 使用 `<style scoped>` 避免样式冲突
3. **语义化命名**: CSS 类名应该描述用途而非样式

### 性能优化

1. **按需加载**: 大型组件使用 `defineAsyncComponent`
2. **图片优化**: 使用适当的图片格式和尺寸
3. **减少重绘**: 避免在动画中改变布局

## 开发工作流 (Development Workflow)

### 启动开发服务器

```bash
npm install
npm run dev
```

### 类型检查

```bash
npm run typecheck
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 问题排查 (Troubleshooting)

### Tailwind 类不生效

确保文件路径在 `tailwind.config.js` 的 `content` 数组中。

### 中文字体未加载

检查 `app.vue` 中的字体链接是否正确，或使用系统字体作为后备。

### 组件类型错误

运行 `npm run postinstall` 重新生成 Nuxt 类型。

## 贡献指南 (Contributing)

1. 保持代码风格一致
2. 所有新组件都需要文档和示例
3. 确保无障碍访问标准
4. 添加适当的类型定义
5. 测试响应式和打印样式

## 资源链接 (Resources)

- [Nuxt 3 文档](https://nuxt.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [VueUse 文档](https://vueuse.org/)
- [Histoire 文档](https://histoire.dev/)
- [WCAG 无障碍指南](https://www.w3.org/WAI/WCAG21/quickref/)
