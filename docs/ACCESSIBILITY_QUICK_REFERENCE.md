# 无障碍快速参考 (Accessibility Quick Reference)

开发时的无障碍最佳实践速查表。

## 🎯 快速检查清单

在提交代码前，快速检查：

- [ ] 使用了正确的 HTML 语义标签（button, nav, main 等）
- [ ] 交互元素有 ARIA 标签
- [ ] 所有图片有 alt 文本或 aria-hidden
- [ ] 表单字段有关联的 label
- [ ] 颜色对比度符合 WCAG AA（4.5:1）
- [ ] 键盘可以操作所有功能
- [ ] 运行了 axe-core 测试

## 🔧 常见场景

### 按钮

```vue
<!-- ✅ 好：文本按钮 -->
<button @click="save">保存</button>

<!-- ✅ 好：图标按钮带 aria-label -->
<button @click="close" aria-label="关闭">
  <Icon name="close" aria-hidden="true" />
</button>

<!-- ❌ 坏：使用 div 代替 button -->
<div @click="save">保存</div>

<!-- ❌ 坏：图标按钮无标签 -->
<button @click="close">
  <Icon name="close" />
</button>
```

### 链接

```vue
<!-- ✅ 好：描述性链接文本 -->
<NuxtLink to="/lesson/wb-101" aria-label="查看水彩基础课程">
  了解更多
</NuxtLink>

<!-- ✅ 好：有意义的链接 -->
<NuxtLink to="/downloads">下载资源包</NuxtLink>

<!-- ❌ 坏：泛泛的链接文本 -->
<NuxtLink to="/lesson/wb-101">点击这里</NuxtLink>

<!-- ❌ 坏：仅有图标 -->
<NuxtLink to="/profile">
  <Icon name="user" />
</NuxtLink>
```

### 图片

```vue
<!-- ✅ 好：信息性图片 -->
<img src="lesson.jpg" alt="水彩基础课程预览" />

<!-- ✅ 好：装饰性图片 -->
<img src="decoration.svg" alt="" aria-hidden="true" />

<!-- ✅ 好：复杂图片 -->
<img src="chart.png" alt="2023年课程报名趋势图" aria-describedby="chart-description" />
<p id="chart-description">
  图表显示报名人数从1月到12月逐步增长
</p>

<!-- ❌ 坏：无 alt 文本 -->
<img src="lesson.jpg" />
```

### 表单

```vue
<!-- ✅ 好：完整的表单字段 -->
<div>
  <label for="email">
    邮箱 <span aria-label="必填">*</span>
  </label>
  <input
    id="email"
    v-model="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-help email-error"
  />
  <p id="email-help" class="text-sm">
    用于接收课程通知
  </p>
  <div
    v-if="emailError"
    id="email-error"
    role="alert"
    aria-live="assertive"
  >
    {{ emailError }}
  </div>
</div>

<!-- ❌ 坏：缺少标签 -->
<input v-model="email" placeholder="邮箱" />
```

### 模态框

```vue
<!-- ✅ 好：可访问的模态框 -->
<template>
  <div v-if="isOpen" role="dialog" aria-modal="true" aria-labelledby="dialog-title" ref="dialogRef">
    <h2 id="dialog-title">确认删除</h2>
    <p>确定要删除这个项目吗？</p>
    <button @click="confirm">确认</button>
    <button @click="close" aria-label="关闭对话框">
      <Icon name="close" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup>
import { useFocusTrap } from '~/composables/useFocusTrap'

const dialogRef = ref(null)
const isOpen = ref(false)

useFocusTrap(dialogRef, isOpen, { returnFocus: true })
</script>
```

### 动态内容

```vue
<!-- ✅ 好：使用 live region -->
<script setup>
import { useAriaLive } from '~/composables/useAriaLive'

const { announcePolite } = useAriaLive()

const handleSave = async () => {
  await saveData()
  announcePolite('数据已保存')
}
</script>

<!-- ✅ 好：加载状态 -->
<button :disabled="isLoading" :aria-busy="isLoading">
  <span v-if="isLoading" role="status">
    <Icon name="spinner" aria-hidden="true" />
    <span class="sr-only">加载中...</span>
  </span>
  <span v-else>提交</span>
</button>
```

## 🎨 ARIA 属性速查

### aria-label

为没有可见文本的元素提供标签：

```vue
<button aria-label="关闭">
  <Icon name="close" />
</button>
```

### aria-labelledby

引用其他元素作为标签：

```vue
<div role="dialog" aria-labelledby="title">
  <h2 id="title">标题</h2>
</div>
```

### aria-describedby

提供额外说明：

```vue
<input id="password" aria-describedby="password-requirements" />
<p id="password-requirements">至少8个字符</p>
```

### aria-live

宣布动态内容：

```vue
<div aria-live="polite" aria-atomic="true">
  {{ statusMessage }}
</div>
```

Politeness levels:

- `polite` - 等待当前发言结束
- `assertive` - 立即打断
- `off` - 不宣布

### aria-expanded

指示可展开元素状态：

```vue
<button aria-expanded="false" aria-controls="menu" @click="toggleMenu">
  菜单
</button>
<div id="menu" :hidden="!menuOpen">...</div>
```

### aria-hidden

隐藏装饰性元素：

```vue
<Icon name="decorative" aria-hidden="true" />
```

### aria-current

指示当前项：

```vue
<a :aria-current="isActive ? 'page' : undefined">
  当前页面
</a>
```

### aria-invalid

指示表单错误：

```vue
<input :aria-invalid="hasError ? 'true' : 'false'" aria-describedby="error" />
```

## ⌨️ 键盘交互模式

### 标准交互

| 元素   | Tab        | Enter/Space | Escape | 箭头键   |
| ------ | ---------- | ----------- | ------ | -------- |
| 按钮   | 聚焦       | 激活        | -      | -        |
| 链接   | 聚焦       | 激活        | -      | -        |
| 输入框 | 聚焦       | -           | -      | -        |
| 模态框 | 循环焦点   | -           | 关闭   | -        |
| 菜单   | 聚焦       | 选择        | 关闭   | 导航项目 |
| 标签页 | 进入标签栏 | -           | -      | 切换标签 |

### 自定义组件键盘支持

```vue
<!-- 可点击的 div（不推荐，优先使用 button） -->
<div
  role="button"
  tabindex="0"
  @click="handleClick"
  @keydown.enter="handleClick"
  @keydown.space.prevent="handleClick"
>
  自定义按钮
</div>

<!-- 可展开的面板 -->
<button
  :aria-expanded="isExpanded"
  aria-controls="panel"
  @click="toggle"
  @keydown.space.prevent="toggle"
>
  {{ title }}
</button>
<div id="panel" :hidden="!isExpanded">
  内容
</div>
```

## 🎨 颜色对比度

### WCAG AA 要求

| 内容类型                      | 最小对比度 |
| ----------------------------- | ---------- |
| 正常文本（< 18pt）            | 4.5:1      |
| 大文本（≥ 18pt 或 14pt 粗体） | 3:1        |
| UI 组件和图形对象             | 3:1        |
| 焦点指示器                    | 3:1        |

### Tailwind 推荐组合

```vue
<!-- 深色文本 + 白色背景 -->
<div class="bg-white text-gray-900">✅ 18.05:1</div>
<div class="bg-white text-gray-700">✅ 7.92:1</div>
<div class="bg-white text-gray-600">✅ 5.74:1</div>

<!-- 浅色文本 + 深色背景 -->
<div class="bg-gray-900 text-white">✅ 18.05:1</div>
<div class="bg-gray-900 text-gray-100">✅ 15.89:1</div>

<!-- Primary 颜色 -->
<div class="text-primary-600 bg-white">✅ 4.66:1</div>
<div class="bg-primary-600 text-white">✅ 4.49:1</div>

<!-- ❌ 避免低对比度 -->
<div class="bg-white text-gray-400">❌ 2.85:1</div>
<div class="bg-gray-100 text-gray-500">❌ 3.02:1</div>
```

## 🧪 测试命令

```bash
# 运行无障碍测试
pnpm test:a11y

# 运行所有 E2E 测试
pnpm test:e2e

# Lighthouse 审计
pnpm lighthouse

# 运行单元测试
pnpm test:unit

# 类型检查
pnpm typecheck
```

## 📚 Composables

### useFocusTrap

```typescript
import { useFocusTrap } from '~/composables/useFocusTrap'

const modalRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

useFocusTrap(modalRef, isOpen, {
  returnFocus: true, // 关闭时返回焦点
  initialFocus: firstButtonRef, // 自定义初始焦点
})
```

### useAriaLive

```typescript
import { useAriaLive } from '~/composables/useAriaLive'

const { announcePolite, announceAssertive } = useAriaLive()

// 礼貌宣布
announcePolite('数据已保存')

// 紧急宣布
announceAssertive('表单提交失败')
```

### useFormAccessibility

```typescript
import { useFormAccessibility, validationRules } from '~/composables/useFormAccessibility'

const email = ref('')
const password = ref('')

const { errors, hasErrors, validateAll, getFieldProps, getErrorProps } = useFormAccessibility({
  email: {
    value: email,
    label: '邮箱',
    required: true,
    rules: [validationRules.email],
  },
  password: {
    value: password,
    label: '密码',
    required: true,
    rules: [validationRules.minLength(8)],
  },
})

// 在模板中使用
// <input v-bind="getFieldProps('email')" />
// <div v-bind="getErrorProps('email')">{{ errors.email }}</div>
```

### useKeyboardShortcuts

```typescript
import { useKeyboardShortcuts } from '~/composables/useKeyboardShortcuts'

useKeyboardShortcuts([
  {
    key: 's',
    meta: true,
    handler: () => save(),
    description: '保存',
  },
  {
    key: 'Escape',
    handler: () => close(),
    description: '关闭',
  },
])
```

## 🚀 参考组件

项目中的参考实现：

- `components/base/AccessibleForm.vue` - 可访问表单
- `components/base/AccessibleInput.vue` - 可访问输入框
- `components/base/BaseButton.vue` - 基础按钮
- `components/navigation/NavigationDrawer.vue` - 导航抽屉（焦点管理）

## 📖 相关文档

- [完整无障碍文档](./ACCESSIBILITY.md)
- [无障碍测试指南](./ACCESSIBILITY_TESTING_GUIDE.md)
- [WCAG 2.1 快速参考](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## 💡 开发提示

1. **优先使用语义化 HTML** - 能用 `<button>` 就不用 `<div>`
2. **键盘先行** - 实现功能时先考虑键盘操作
3. **测试早测试常** - 不要等到最后才测试无障碍
4. **使用 axe DevTools** - 安装浏览器扩展实时检查
5. **参考现有组件** - 查看项目中已有的可访问组件
6. **文档同步** - 添加新模式时更新文档

---

**记住**: 无障碍不是额外功能，而是所有用户体验的基础。
