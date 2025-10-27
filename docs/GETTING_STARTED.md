# 快速入门指南 (Getting Started Guide)

欢迎使用教育平台设计系统！本指南将帮助您快速上手并开始开发。

## 前置要求 (Prerequisites)

- **Node.js**: 版本 18 或更高
- **npm**: 版本 9 或更高（随 Node.js 安装）
- 基本的 Vue 3 和 TypeScript 知识

## 安装 (Installation)

### 1. 克隆仓库并安装依赖

```bash
# 克隆仓库
git clone <repository-url>
cd <project-directory>

# 安装依赖
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动。

## 项目脚本 (Available Scripts)

```bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run typecheck

# 启动 Histoire 组件文档
npm run story:dev

# 构建 Histoire 静态文档
npm run story:build
```

## 首次访问 (First Visit)

启动开发服务器后，访问以下页面：

1. **首页** (`/`) - 查看设计系统概览和示例
2. **组件库** (`/components`) - 浏览所有可用组件
3. **无障碍示例** (`/accessibility-demo`) - 了解无障碍功能
4. **打印示例** (`/print-demo`) - 查看打印优化

## 创建第一个页面 (Create Your First Page)

### 1. 创建新页面

在 `pages/` 目录创建新文件，例如 `pages/my-page.vue`：

```vue
<template>
  <AppShell>
    <div class="content-container py-8">
      <SectionHeader
        title="我的新页面"
        subtitle="这是一个示例页面"
      />

      <div class="mt-8">
        <BaseCard>
          <h2 class="heading-4 mb-3">欢迎</h2>
          <p class="body-base">
            这是您的第一个自定义页面！
          </p>
        </BaseCard>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'
import SectionHeader from '~/components/base/SectionHeader.vue'
import BaseCard from '~/components/base/BaseCard.vue'
</script>
```

访问 `http://localhost:3000/my-page` 查看您的新页面。

### 2. 使用组件

设计系统提供了多个可复用组件：

#### 按钮 (Buttons)

```vue
<BaseButton variant="primary">主要操作</BaseButton>
<BaseButton variant="outline">次要操作</BaseButton>
<BaseButton :loading="true">加载中...</BaseButton>
```

#### 卡片 (Cards)

```vue
<BaseCard interactive part-color="foundation">
  <h3 class="heading-5">卡片标题</h3>
  <p class="body-base">卡片内容</p>
</BaseCard>
```

#### 标签 (Tags)

```vue
<BaseTag variant="success">成功</BaseTag>
<BaseTag variant="warning">警告</BaseTag>
<BaseTag removable @remove="handleRemove">可移除</BaseTag>
```

### 3. 使用样式类

Tailwind CSS 工具类和自定义样式类：

```vue
<template>
  <div class="content-container py-8">
    <!-- 标题 -->
    <h1 class="heading-1">大标题</h1>
    <h2 class="heading-2">次级标题</h2>
    
    <!-- 正文 -->
    <p class="body-base">标准正文</p>
    <p class="body-small">小号正文</p>
    
    <!-- 代码 -->
    <code class="code-inline">行内代码</code>
    <pre class="code-block">代码块</pre>
    
    <!-- 链接 -->
    <a href="#" class="link">链接样式</a>
  </div>
</template>
```

## 常用模式 (Common Patterns)

### 响应式布局

```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- 移动端 1 列，平板 2 列，桌面 3 列 -->
  <BaseCard>内容 1</BaseCard>
  <BaseCard>内容 2</BaseCard>
  <BaseCard>内容 3</BaseCard>
</div>
```

### 动画效果

```vue
<template>
  <div v-motion-pop-bottom>
    <!-- 此元素会从底部弹出 -->
    <BaseCard>动画卡片</BaseCard>
  </div>
</template>
```

### 国际化

```vue
<template>
  <div>
    <h1>{{ $t('app.title') }}</h1>
    <p>{{ $t('app.description') }}</p>
  </div>
</template>
```

添加新翻译到 `locales/zh-CN.json`：

```json
{
  "mySection": {
    "title": "我的标题",
    "message": "我的消息"
  }
}
```

## 样式指南 (Style Guidelines)

### 颜色使用

```vue
<!-- 课程部分颜色 -->
<BaseCard part-color="foundation">基础课程</BaseCard>
<BaseCard part-color="intermediate">中级课程</BaseCard>
<BaseCard part-color="advanced">高级课程</BaseCard>
<BaseCard part-color="expert">专家课程</BaseCard>

<!-- 语义颜色 -->
<div class="bg-success-50 text-success-700">成功消息</div>
<div class="bg-warning-50 text-warning-700">警告消息</div>
<div class="bg-error-50 text-error-700">错误消息</div>
```

### 间距规范

```vue
<!-- 页面内边距 -->
<div class="content-container py-8">
  
  <!-- 章节间距 -->
  <section class="mt-12">
    
    <!-- 卡片间距 -->
    <div class="space-y-6">
      <BaseCard>卡片 1</BaseCard>
      <BaseCard>卡片 2</BaseCard>
    </div>
  </section>
</div>
```

## 无障碍访问 (Accessibility)

### 键盘导航

确保所有交互元素都支持键盘操作：

```vue
<button
  type="button"
  :aria-label="buttonLabel"
  @click="handleClick"
  @keydown.enter="handleClick"
  @keydown.space="handleClick"
>
  操作
</button>
```

### ARIA 属性

```vue
<!-- 动态内容更新 -->
<div role="status" aria-live="polite">
  {{ statusMessage }}
</div>

<!-- 展开/折叠状态 -->
<button
  type="button"
  :aria-expanded="isOpen"
  :aria-controls="panelId"
>
  切换面板
</button>
```

## 调试技巧 (Debugging Tips)

### 查看类型错误

```bash
npm run typecheck
```

### 查看构建输出

```bash
npm run build
```

### 测试响应式

使用浏览器开发工具的响应式设计模式测试不同屏幕尺寸。

### 测试打印

使用 `Ctrl+P`（或 `Cmd+P`）打开打印预览，查看打印样式。

## 常见问题 (Common Issues)

### 组件未找到

确保正确导入组件：

```vue
<script setup lang="ts">
import BaseButton from '~/components/base/BaseButton.vue'
</script>
```

### 样式未生效

1. 检查 Tailwind 类名是否正确
2. 确保类名在 `tailwind.config.js` 的 `content` 数组中
3. 重启开发服务器

### 图标未显示

确保使用正确的图标名称（来自 Heroicons）：

```vue
<Icon name="heroicons:star" />
<Icon name="heroicons:arrow-right" />
```

查看可用图标：https://heroicons.com/

## 下一步 (Next Steps)

1. 📚 阅读[设计系统文档](./DESIGN_SYSTEM.md)了解详细信息
2. 🧩 浏览 `/components` 页面查看所有组件示例
3. ♿ 查看 `/accessibility-demo` 了解无障碍功能
4. 🖨️ 访问 `/print-demo` 了解打印优化
5. 📖 启动 Histoire (`npm run story:dev`) 查看交互式文档

## 获取帮助 (Getting Help)

- 查看[设计系统文档](./DESIGN_SYSTEM.md)
- 阅读组件源代码和注释
- 参考示例页面的实现
- 查看 [Nuxt 3 文档](https://nuxt.com/docs)
- 查看 [Tailwind CSS 文档](https://tailwindcss.com/docs)

## 贡献 (Contributing)

欢迎贡献代码！在提交之前：

1. 运行 `npm run typecheck` 确保无类型错误
2. 测试响应式布局
3. 验证无障碍访问功能
4. 添加适当的文档和示例
5. 遵循现有代码风格

祝您开发愉快！ 🎉
