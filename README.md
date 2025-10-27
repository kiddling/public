# 教育平台 - Nuxt 设计系统 (Educational Platform - Nuxt Design System)

一个为中文教育内容优化的 Nuxt 3 前端设计系统，提供完整的 UI 组件库、响应式布局和无障碍访问支持。

## ✨ 特性 (Features)

- 🎨 **完整的设计系统** - 基于 Tailwind CSS，针对中文排版优化
- 🧩 **可复用组件** - 包含按钮、卡片、标签等基础组件
- 📱 **响应式设计** - 移动端优先，适配所有屏幕尺寸
- ♿ **无障碍访问** - 支持键盘导航、屏幕阅读器和 ARIA 标签
- 🌐 **国际化** - 内置 i18n 支持，初始支持简体中文
- 🖨️ **打印友好** - 优化的打印样式
- 🎭 **动画支持** - 集成 VueUse Motion，尊重用户减少动画偏好
- 📚 **组件文档** - 使用 Histoire 构建的交互式文档

## 🚀 快速开始 (Quick Start)

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 查看组件库

1. **浏览器预览**: 访问 [http://localhost:3000/components](http://localhost:3000/components)
2. **Histoire 文档**: 运行 `npm run story:dev`

### 构建生产版本

```bash
npm run build
npm run preview
```

## 📁 项目结构 (Project Structure)

```
project/
├── assets/
│   └── css/                        # 全局样式
│       ├── main.css               # Tailwind 和自定义样式
│       └── _variables.scss        # SCSS 变量
├── components/
│   ├── base/                       # 基础 UI 组件
│   │   ├── BaseButton.vue
│   │   ├── BaseCard.vue
│   │   ├── BaseTag.vue
│   │   └── SectionHeader.vue
│   └── layout/                     # 布局组件
│       ├── AppShell.vue
│       ├── AppHeader.vue
│       └── AppSidebar.vue
├── docs/
│   └── DESIGN_SYSTEM.md           # 详细的设计系统文档
├── locales/
│   └── zh-CN.json                 # 中文翻译
├── pages/
│   ├── index.vue                  # 首页
│   ├── components.vue             # 组件展示页
│   ├── accessibility-demo.vue     # 无障碍访问示例
│   └── print-demo.vue             # 打印预览示例
├── nuxt.config.ts                 # Nuxt 配置
├── tailwind.config.js             # Tailwind 配置
└── histoire.config.ts             # Histoire 配置
```

## 🎨 设计系统 (Design System)

### 颜色系统 (Color System)

#### 课程部分颜色

- **Foundation (基础)** - 蓝色主题
- **Intermediate (中级)** - 绿色主题
- **Advanced (高级)** - 紫色主题
- **Expert (专家)** - 橙色主题

#### 语义颜色

- Success (成功) - 绿色
- Warning (警告) - 黄色
- Error (错误) - 红色
- Info (信息) - 蓝色

### 排版系统 (Typography)

针对中文内容优化的系统字体栈（无需 CDN）：

```
系统中文字体 (Microsoft YaHei, PingFang SC, 等) → 系统无衬线字体
```

提供完整的标题层级和正文样式，确保快速加载和离线可用。

### 组件库 (Components)

#### 基础组件

- **BaseButton** - 多变体按钮组件
- **BaseCard** - 灵活的卡片容器
- **BaseTag** - 标签/徽章组件
- **SectionHeader** - 章节标题组件

#### 布局组件

- **AppShell** - 应用主框架
- **AppHeader** - 顶部导航栏
- **AppSidebar** - 响应式侧边栏

详细文档请查看 [设计系统文档](./docs/DESIGN_SYSTEM.md)。

## 🧩 使用示例 (Usage Examples)

### 按钮 (Button)

```vue
<BaseButton variant="primary" icon-right="heroicons:arrow-right">
  开始学习
</BaseButton>

<BaseButton variant="outline" :loading="true">
  加载中
</BaseButton>
```

### 卡片 (Card)

```vue
<BaseCard interactive part-color="foundation">
  <template #header>
    <h3>课程标题</h3>
  </template>
  
  <p>课程描述...</p>
  
  <template #footer>
    <BaseButton size="sm">查看详情</BaseButton>
  </template>
</BaseCard>
```

### 标签 (Tag)

```vue
<BaseTag variant="foundation" icon="heroicons:academic-cap">
  基础课程
</BaseTag>

<BaseTag removable @remove="handleRemove">
  可移除
</BaseTag>
```

### 布局 (Layout)

```vue
<template>
  <AppShell>
    <SectionHeader
      title="页面标题"
      subtitle="页面描述"
      part-color="foundation"
      part-label="基础"
    />
    
    <!-- 页面内容 -->
  </AppShell>
</template>
```

## ♿ 无障碍访问 (Accessibility)

所有组件都遵循 WCAG 2.1 AA 标准：

- ✅ 键盘导航支持
- ✅ 屏幕阅读器优化
- ✅ ARIA 标签和角色
- ✅ 清晰的焦点样式
- ✅ 颜色对比度符合标准
- ✅ Skip links 快速导航
- ✅ 减少动画模式支持

## 📱 响应式设计 (Responsive Design)

断点系统：

- `sm`: 640px (手机横屏)
- `md`: 768px (平板)
- `lg`: 1024px (小屏笔记本)
- `xl`: 1280px (桌面)
- `2xl`: 1536px (大屏)

所有组件都经过移动端优化测试。

## 🖨️ 打印支持 (Print Support)

优化的打印样式，包括：

- 自动隐藏导航和交互元素
- 优化的内容布局
- 保留重要的视觉层级
- 链接 URL 自动显示

使用打印工具类：

```vue
<button class="no-print">在线操作</button>
<article class="print-break-avoid">完整内容</article>
```

## 🌐 国际化 (i18n)

当前支持简体中文，配置支持轻松添加其他语言：

```vue
<template>
  <h1>{{ $t('app.title') }}</h1>
</template>
```

添加新语言只需：
1. 创建新的 JSON 语言文件
2. 在 `nuxt.config.ts` 中注册

## 📚 组件文档 (Component Documentation)

### 方式一：Nuxt 页面

访问 `/components` 路由查看所有组件的实时示例和代码。

### 方式二：Histoire

启动交互式组件文档：

```bash
npm run story:dev
```

## 🛠️ 开发指南 (Development)

### 添加新组件

1. 在 `components/base/` 或 `components/layout/` 创建组件
2. 使用 TypeScript 定义 Props 接口
3. 添加 ARIA 属性和键盘支持
4. 创建 `.story.vue` 文件
5. 在文档中添加使用示例

### 代码风格

- 使用 TypeScript
- 使用 Composition API
- 使用 Tailwind 工具类优先
- 遵循 Vue 3 和 Nuxt 3 最佳实践

### 类型检查

```bash
npm run typecheck
```

## 📦 技术栈 (Tech Stack)

- **框架**: Nuxt 3
- **UI**: Vue 3 + Composition API
- **样式**: Tailwind CSS
- **图标**: @nuxt/icon (Heroicons)
- **动画**: VueUse Motion
- **国际化**: @nuxtjs/i18n
- **文档**: Histoire
- **语言**: TypeScript

## 🤝 贡献 (Contributing)

欢迎贡献！请确保：

1. 代码符合项目风格
2. 所有组件都有文档
3. 遵循无障碍访问标准
4. 添加适当的类型定义
5. 测试响应式和打印功能

## 📄 许可证 (License)

MIT

## 🔗 相关链接 (Links)

- [Nuxt 3 文档](https://nuxt.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [VueUse](https://vueuse.org/)
- [Histoire](https://histoire.dev/)
- [设计系统详细文档](./docs/DESIGN_SYSTEM.md)

---

Made with ❤️ for Chinese educational content
