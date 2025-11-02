# 无障碍访问文档 (Accessibility Documentation)

本应用遵循 **WCAG 2.1 AA** 标准，确保所有用户都能访问和使用，包括使用辅助技术的用户。

## 📋 目录

- [概述](#概述)
- [键盘导航](#键盘导航)
- [屏幕阅读器支持](#屏幕阅读器支持)
- [语义化 HTML](#语义化-html)
- [ARIA 属性](#aria-属性)
- [颜色和对比度](#颜色和对比度)
- [表单无障碍](#表单无障碍)
- [动态内容](#动态内容)
- [测试和验证](#测试和验证)
- [开发指南](#开发指南)

## 概述

### 符合标准

- ✅ WCAG 2.1 Level AA
- ✅ ARIA 1.2
- ✅ Lighthouse Accessibility Score > 95
- ✅ Axe-core 自动化测试通过

### 支持的辅助技术

- **屏幕阅读器**: NVDA, JAWS, VoiceOver
- **键盘导航**: 完整的键盘操作支持
- **语音控制**: 所有交互元素都有适当的标签
- **放大镜**: 支持高达 200% 的文本缩放

## 键盘导航

### 全局快捷键

| 快捷键 | 功能 |
|--------|------|
| `Tab` | 前进到下一个可交互元素 |
| `Shift + Tab` | 后退到上一个可交互元素 |
| `Enter` / `Space` | 激活按钮或链接 |
| `Escape` | 关闭模态框或菜单 |
| `Cmd/Ctrl + K` | 打开全局搜索 |
| `Arrow Keys` | 在列表或菜单中导航 |

### 跳转链接

每个页面顶部都有一个"跳转到主内容"链接，允许键盘用户快速跳过导航直接访问主要内容。

按 `Tab` 键即可激活此链接。

### 焦点指示器

所有可交互元素都有清晰可见的焦点指示器：
- 蓝色外框
- 高对比度
- 符合 WCAG 2.1 AA 标准

### 焦点管理

#### 模态框
- 打开时焦点自动移至模态框内
- 焦点限制在模态框内（焦点陷阱）
- 关闭时焦点返回到触发元素

#### 页面导航
- 页面切换后焦点重置到主内容区域
- 保留用户的导航位置

## 屏幕阅读器支持

### ARIA Live Regions

应用使用 ARIA live regions 宣布动态内容更新：

```vue
<template>
  <div role="status" aria-live="polite" aria-atomic="true">
    {{ statusMessage }}
  </div>
</template>
```

### 使用 Live Region Composable

```typescript
import { useAriaLive } from '~/composables/useAriaLive'

const { announcePolite, announceAssertive } = useAriaLive()

// 礼貌宣布（不打断）
announcePolite('页面已加载')

// 紧急宣布（立即通知）
announceAssertive('表单提交失败，请检查错误信息')
```

### 图片和图标

所有有意义的图片都有描述性的 `alt` 文本：

```vue
<!-- 有意义的图片 -->
<img src="lesson-preview.jpg" alt="水彩基础课程：学习色彩混合技巧" />

<!-- 装饰性图片 -->
<img src="decoration.svg" alt="" aria-hidden="true" />
<Icon name="icon-name" aria-hidden="true" />
```

### 按钮和链接

所有交互元素都有适当的标签：

```vue
<!-- 图标按钮带 aria-label -->
<button aria-label="打开菜单">
  <Icon name="menu" aria-hidden="true" />
</button>

<!-- 链接带描述性文本 -->
<a href="/lesson/wb-101" aria-label="查看课程：水彩基础入门">
  了解更多
</a>
```

## 语义化 HTML

### Landmark Regions

应用使用语义化 HTML5 标签定义页面结构：

```html
<header>顶部导航</header>
<nav aria-label="课程导航">侧边栏菜单</nav>
<main id="main-content">主要内容</main>
<aside>辅助信息</aside>
<footer>页脚</footer>
```

### 标题层级

正确的标题层级（h1-h6）：

```html
<h1>页面主标题</h1>
  <h2>章节标题</h2>
    <h3>子章节标题</h3>
      <h4>小节标题</h4>
```

规则：
- 每页只有一个 `<h1>`
- 标题层级连续，不跳级
- 使用语义标题而非样式类

### 列表和表格

使用语义化结构：

```vue
<!-- 列表 -->
<ul>
  <li>项目 1</li>
  <li>项目 2</li>
</ul>

<!-- 表格 -->
<table>
  <caption>课程列表</caption>
  <thead>
    <tr>
      <th scope="col">课程名称</th>
      <th scope="col">难度</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>水彩基础</td>
      <td>初级</td>
    </tr>
  </tbody>
</table>
```

## ARIA 属性

### 常用 ARIA 属性

#### aria-label
为元素提供无可见文本时的标签：

```vue
<button aria-label="关闭对话框">
  <Icon name="close" />
</button>
```

#### aria-labelledby
引用其他元素作为标签：

```vue
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">确认删除</h2>
  ...
</div>
```

#### aria-describedby
提供额外的描述信息：

```vue
<input
  id="password"
  type="password"
  aria-describedby="password-requirements"
/>
<div id="password-requirements">
  密码必须至少 8 个字符
</div>
```

#### aria-expanded
指示可展开元素的状态：

```vue
<button
  aria-expanded="false"
  aria-controls="menu"
  @click="toggleMenu"
>
  菜单
</button>
```

#### aria-hidden
隐藏装饰性元素：

```vue
<Icon name="decorative" aria-hidden="true" />
```

#### aria-live
宣布动态内容更新：

```vue
<div aria-live="polite" aria-atomic="true">
  {{ notifications }}
</div>
```

### ARIA Roles

常用角色：

```vue
<!-- 对话框 -->
<div role="dialog" aria-modal="true">...</div>

<!-- 警告框 -->
<div role="alert">错误：表单提交失败</div>

<!-- 状态 -->
<div role="status">加载中...</div>

<!-- 搜索 -->
<form role="search">...</form>

<!-- 导航 -->
<nav role="navigation" aria-label="主导航">...</nav>
```

## 颜色和对比度

### WCAG AA 标准

所有文本都符合 WCAG 2.1 AA 对比度要求：

- **正常文本**: 4.5:1
- **大文本** (18pt+ 或 14pt+ 粗体): 3:1
- **UI 组件和图形**: 3:1

### 不依赖颜色

信息传达不仅仅依赖颜色：

```vue
<!-- ✅ 好的做法：使用图标 + 颜色 -->
<div class="text-red-600">
  <Icon name="error" aria-hidden="true" />
  <span>错误：无效的输入</span>
</div>

<!-- ❌ 坏的做法：仅使用颜色 -->
<div class="text-red-600">无效的输入</div>
```

### 高对比度模式

应用支持系统高对比度模式：

```css
.high-contrast {
  --text-color: black;
  --background: white;
  --link-color: blue;
}

.high-contrast.dark {
  --text-color: white;
  --background: black;
  --link-color: yellow;
}
```

### 色盲友好

设计考虑色盲用户：
- 避免仅用红绿区分
- 使用模式、形状、文本辅助
- 测试色盲模拟器

## 表单无障碍

### 标签关联

所有表单字段都有关联的标签：

```vue
<!-- 使用 <label> -->
<label for="username">用户名</label>
<input id="username" type="text" />

<!-- 或使用 aria-label -->
<input type="search" aria-label="搜索课程" />
```

### 必填字段

清晰标记必填字段：

```vue
<label for="email">
  邮箱 <span aria-label="必填">*</span>
</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
/>
```

### 错误提示

可访问的错误消息：

```vue
<template>
  <div>
    <label for="password">密码</label>
    <input
      id="password"
      type="password"
      :aria-invalid="hasError"
      aria-describedby="password-error"
    />
    <div
      v-if="hasError"
      id="password-error"
      role="alert"
      class="text-red-600"
    >
      密码必须至少 8 个字符
    </div>
  </div>
</template>
```

### 帮助文本

提供清晰的说明：

```vue
<label for="phone">电话号码</label>
<input
  id="phone"
  type="tel"
  aria-describedby="phone-format"
/>
<div id="phone-format" class="text-sm text-gray-600">
  格式：xxx-xxxx-xxxx
</div>
```

## 动态内容

### 模态框

可访问的模态框实现：

```vue
<template>
  <div
    v-if="isOpen"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    ref="modalRef"
  >
    <h2 id="modal-title">{{ title }}</h2>
    <div>{{ content }}</div>
    <button @click="close" aria-label="关闭对话框">
      关闭
    </button>
  </div>
</template>

<script setup>
import { useFocusTrap } from '~/composables/useFocusTrap'

const modalRef = ref(null)
const isOpen = ref(false)

useFocusTrap(modalRef, isOpen, { returnFocus: true })
</script>
```

### Focus Trap

使用 `useFocusTrap` composable：

```typescript
import { useFocusTrap } from '~/composables/useFocusTrap'

const containerRef = ref<HTMLElement | null>(null)
const isActive = ref(false)

useFocusTrap(containerRef, isActive, {
  returnFocus: true, // 关闭时返回焦点
  initialFocus: firstButtonRef, // 自定义初始焦点
})
```

### Loading States

可访问的加载状态：

```vue
<template>
  <div>
    <button
      :disabled="isLoading"
      :aria-busy="isLoading"
      aria-live="polite"
    >
      <span v-if="isLoading">加载中...</span>
      <span v-else>提交</span>
    </button>
  </div>
</template>
```

## 测试和验证

### 自动化测试

使用 axe-core 进行自动化无障碍测试：

```typescript
import { runAxeCheck, formatAxeViolations } from '../helpers/accessibility'

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/')
  const results = await runAxeCheck(page)
  
  expect(
    results.violations.length,
    formatAxeViolations(results.violations)
  ).toBe(0)
})
```

### 手动测试清单

#### 键盘导航
- [ ] 所有功能可通过键盘访问
- [ ] Tab 顺序逻辑合理
- [ ] 焦点指示器清晰可见
- [ ] 没有键盘陷阱（除了模态框）

#### 屏幕阅读器
- [ ] 使用 NVDA 或 VoiceOver 测试
- [ ] 所有内容都能被读出
- [ ] ARIA 标签准确描述功能
- [ ] 动态内容更新有宣布

#### 视觉检查
- [ ] 文本对比度符合 WCAG AA
- [ ] 200% 缩放下仍可用
- [ ] 不仅依赖颜色传达信息
- [ ] 高对比度模式下正常显示

#### 表单测试
- [ ] 所有字段有关联标签
- [ ] 错误消息清晰且可访问
- [ ] 必填字段明确标记
- [ ] 表单验证即时反馈

### 测试工具

#### 浏览器扩展
- **axe DevTools**: Chrome/Firefox 扩展
- **WAVE**: Web 无障碍评估工具
- **Lighthouse**: Chrome DevTools 内置

#### 屏幕阅读器
- **Windows**: NVDA (免费), JAWS (商业)
- **macOS**: VoiceOver (内置)
- **Linux**: Orca (免费)

#### 命令行工具
```bash
# 运行 Lighthouse 无障碍审计
pnpm lighthouse

# 运行 E2E 无障碍测试
pnpm test:e2e tests/e2e/specs/accessibility.spec.ts
```

## 开发指南

### 创建新组件时

1. **使用语义化 HTML**
   ```vue
   <!-- ✅ 好 -->
   <button @click="submit">提交</button>
   
   <!-- ❌ 坏 -->
   <div @click="submit">提交</div>
   ```

2. **添加 ARIA 属性**
   ```vue
   <button
     aria-label="删除项目"
     aria-describedby="delete-warning"
   >
     <Icon name="delete" aria-hidden="true" />
   </button>
   ```

3. **确保键盘可访问**
   ```vue
   <div
     role="button"
     tabindex="0"
     @click="handleClick"
     @keydown.enter="handleClick"
     @keydown.space.prevent="handleClick"
   >
     可点击区域
   </div>
   ```

4. **提供焦点样式**
   ```vue
   <button class="focus:ring-2 focus:ring-primary-500 focus:outline-none">
     按钮
   </button>
   ```

5. **测试无障碍性**
   ```typescript
   test('component should be accessible', async () => {
     const { container } = render(MyComponent)
     const results = await axe(container)
     expect(results.violations).toHaveLength(0)
   })
   ```

### 常见陷阱

#### ❌ 避免的做法

```vue
<!-- 缺少替代文本 -->
<img src="important.jpg" />

<!-- 使用 div 而非 button -->
<div @click="action">点击</div>

<!-- 点击处理器无键盘支持 -->
<span @click="toggle">切换</span>

<!-- 缺少标签 -->
<input type="text" placeholder="名字" />

<!-- 仅用颜色区分 -->
<div :class="{ 'text-red-500': isError }">{{ message }}</div>
```

#### ✅ 正确的做法

```vue
<!-- 有意义的替代文本 -->
<img src="important.jpg" alt="课程预览：水彩基础" />

<!-- 使用 button 元素 -->
<button @click="action">点击</button>

<!-- 键盘支持 -->
<span
  role="button"
  tabindex="0"
  @click="toggle"
  @keydown.enter="toggle"
  @keydown.space.prevent="toggle"
>
  切换
</span>

<!-- 关联标签 -->
<label for="name">名字</label>
<input id="name" type="text" />

<!-- 图标 + 文本 -->
<div :class="{ 'text-red-500': isError }">
  <Icon v-if="isError" name="error" aria-hidden="true" />
  {{ message }}
</div>
```

### Composables 参考

#### useFocusTrap
```typescript
import { useFocusTrap } from '~/composables/useFocusTrap'

const modalRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

useFocusTrap(modalRef, isOpen, {
  returnFocus: true,
})
```

#### useAriaLive
```typescript
import { useAriaLive } from '~/composables/useAriaLive'

const { announcePolite, announceAssertive } = useAriaLive()

// 宣布状态更新
announcePolite('数据已保存')

// 宣布错误
announceAssertive('操作失败')
```

## 参考资源

### 官方文档
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### 中文资源
- [Web 无障碍标准](https://www.w3.org/translations/WCAG21-zh/)
- [无障碍开发指南](https://developer.mozilla.org/zh-CN/docs/Web/Accessibility)

### 工具和库
- [axe-core](https://github.com/dequelabs/axe-core)
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [VueUse - useEventListener](https://vueuse.org/core/useEventListener/)

## 联系和反馈

如果您在使用本应用时遇到无障碍问题，请通过以下方式联系我们：

- 提交 GitHub Issue
- 发送邮件至 [accessibility@example.com]

我们致力于持续改进应用的无障碍性，感谢您的反馈！

---

**最后更新**: 2024-11
**版本**: 1.0.0
**标准**: WCAG 2.1 AA
