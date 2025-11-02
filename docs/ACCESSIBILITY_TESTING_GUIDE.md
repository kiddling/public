# 无障碍测试指南 (Accessibility Testing Guide)

本指南介绍如何测试应用的无障碍性，确保符合 WCAG 2.1 AA 标准。

## 📋 目录

- [自动化测试](#自动化测试)
- [手动测试](#手动测试)
- [屏幕阅读器测试](#屏幕阅读器测试)
- [键盘导航测试](#键盘导航测试)
- [颜色对比度测试](#颜色对比度测试)
- [测试清单](#测试清单)

## 自动化测试

### axe-core E2E 测试

我们使用 axe-core 进行自动化无障碍测试。

#### 运行测试

```bash
# 运行所有无障碍测试
pnpm test:a11y

# 运行特定测试文件
pnpm test:e2e tests/e2e/specs/accessibility.spec.ts

# 使用 UI 模式运行
pnpm test:e2e:ui
```

#### 编写新的无障碍测试

```typescript
import { test, expect } from '@playwright/test'
import { runAxeCheck, formatAxeViolations } from '../helpers/accessibility'

test('my page should be accessible', async ({ page }) => {
  await page.goto('/my-page')
  await page.waitForLoadState('networkidle')

  const results = await runAxeCheck(page)
  
  expect(
    results.violations.length,
    formatAxeViolations(results.violations)
  ).toBe(0)
})
```

#### 测试特定 WCAG 规则

```typescript
// 仅测试颜色对比度
const results = await runAxeCheck(page, {
  includeTags: ['wcag2aa'],
})

// 排除某些规则
const results = await runAxeCheck(page, {
  excludeTags: ['experimental'],
})
```

### Lighthouse CI

Lighthouse CI 在每次构建时自动运行。

#### 本地运行 Lighthouse

```bash
# 构建并运行 Lighthouse 审计
pnpm lighthouse

# 查看结果
open .lighthouseci/
```

#### Lighthouse 配置

位于 `.lighthouserc.json`：

```javascript
assertions: {
  'categories:accessibility': ['error', { minScore: 0.95 }],
}
```

当前要求：**无障碍分数 ≥ 95%**

### 单元测试

为无障碍功能编写单元测试：

```typescript
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

test('should have proper ARIA labels', () => {
  const wrapper = mount(MyComponent)
  
  const button = wrapper.find('button')
  expect(button.attributes('aria-label')).toBeTruthy()
})
```

## 手动测试

自动化测试只能发现约 30-40% 的无障碍问题。手动测试至关重要。

### 视觉检查

#### 1. 焦点指示器

- [ ] 按 `Tab` 键浏览页面
- [ ] 每个可聚焦元素都有清晰的焦点指示器
- [ ] 焦点指示器有足够的对比度
- [ ] 焦点顺序符合逻辑

#### 2. 文本可读性

- [ ] 文本与背景对比度 ≥ 4.5:1
- [ ] 大文本（18pt+）对比度 ≥ 3:1
- [ ] 文本在 200% 缩放下仍可读
- [ ] 段落宽度不超过 80 字符

#### 3. 颜色和图标

- [ ] 信息不仅通过颜色传达
- [ ] 错误消息有图标和文字
- [ ] 链接不仅通过颜色区分（有下划线或其他视觉提示）

#### 4. 表单

- [ ] 所有输入框有可见标签
- [ ] 必填字段有明确标记
- [ ] 错误消息清晰且靠近相关字段
- [ ] 禁用的字段有视觉提示

### 交互测试

#### 1. 模态框和对话框

- [ ] 打开时焦点移至模态框
- [ ] 按 `Tab` 焦点保持在模态框内
- [ ] 按 `Escape` 可关闭
- [ ] 关闭后焦点返回触发元素

#### 2. 菜单和下拉列表

- [ ] 使用箭头键导航
- [ ] 按 `Enter` 或 `Space` 选择
- [ ] 按 `Escape` 关闭
- [ ] 选择后焦点移至合适位置

#### 3. 表单提交

- [ ] 可以使用键盘提交
- [ ] 提交中有加载状态
- [ ] 成功/失败有明确反馈
- [ ] 错误字段自动获得焦点

## 屏幕阅读器测试

### Windows - NVDA (推荐)

NVDA 是免费开源的屏幕阅读器。

#### 安装

1. 下载：https://www.nvaccess.org/download/
2. 安装并重启计算机
3. NVDA 会自动启动

#### 基本操作

| 操作 | 快捷键 |
|------|--------|
| 开始/停止阅读 | `NVDA + Down Arrow` |
| 停止阅读 | `Ctrl` |
| 下一行 | `Down Arrow` |
| 上一行 | `Up Arrow` |
| 下一个元素 | `Tab` |
| 下一个标题 | `H` |
| 下一个链接 | `K` |
| 下一个按钮 | `B` |
| 下一个表单字段 | `F` |
| 元素列表 | `NVDA + F7` |

注：`NVDA` 键默认是 `Insert` 或 `Caps Lock`

#### 测试步骤

1. **启动 NVDA**
   ```
   启动 NVDA → 打开浏览器 → 访问应用
   ```

2. **测试页面结构**
   - 按 `H` 浏览标题
   - 确认标题层级正确
   - 按 `NVDA + F7` 查看元素列表

3. **测试导航**
   - 使用 `Tab` 键导航
   - 确认每个元素都能听到描述
   - 检查链接文本是否有意义

4. **测试表单**
   - 焦点到表单字段
   - 确认能听到标签和帮助文本
   - 提交表单，确认能听到错误消息

5. **测试动态内容**
   - 触发动态更新
   - 确认 live region 宣布更新
   - 检查加载状态是否被读出

### macOS - VoiceOver

VoiceOver 是 macOS 内置的屏幕阅读器。

#### 启动

```
按 Cmd + F5 或在系统偏好设置 → 辅助功能 → VoiceOver 中启动
```

#### 基本操作

注：`VO` = `Ctrl + Option`

| 操作 | 快捷键 |
|------|--------|
| 开始/停止阅读 | `VO + A` |
| 下一个项目 | `VO + Right Arrow` |
| 上一个项目 | `VO + Left Arrow` |
| 与项目交互 | `VO + Space` |
| 停止交互 | `VO + Shift + Up Arrow` |
| 下一个标题 | `VO + Cmd + H` |
| Web Rotor | `VO + U` |

#### 测试步骤

与 NVDA 类似，但使用 VoiceOver 特定的快捷键。

### 测试清单

使用屏幕阅读器测试时，确认：

- [ ] 页面标题被正确读出
- [ ] 所有标题按正确顺序读出
- [ ] 链接文本有意义（脱离上下文也能理解）
- [ ] 按钮说明其功能
- [ ] 表单字段有标签
- [ ] 错误消息被读出
- [ ] 图片有替代文本
- [ ] 动态内容更新被宣布
- [ ] 没有"button"、"link"等无意义的标签
- [ ] 导航地标清晰（main, nav, aside）

## 键盘导航测试

### 基本键盘测试

#### 1. Tab 顺序

**测试步骤：**
1. 关闭鼠标或不使用鼠标
2. 按 `Tab` 键浏览整个页面
3. 记录焦点顺序

**验收标准：**
- [ ] 焦点顺序符合视觉顺序
- [ ] 所有交互元素都能获得焦点
- [ ] 隐藏的元素不在 Tab 顺序中
- [ ] 没有键盘陷阱（除模态框）

#### 2. 跳转链接

**测试步骤：**
1. 刷新页面
2. 立即按 `Tab` 键
3. 应该看到"跳转到主内容"链接

**验收标准：**
- [ ] 跳转链接是第一个可聚焦元素
- [ ] 按 `Enter` 后焦点移至主内容
- [ ] 跳过导航栏和侧边栏

#### 3. 快捷键

**测试步骤：**

| 快捷键 | 预期行为 |
|--------|----------|
| `Cmd/Ctrl + K` | 打开全局搜索 |
| `/` | 聚焦搜索框（如果不在输入框中） |
| `Escape` | 关闭模态框/菜单 |
| `Cmd/Ctrl + H` | 返回首页 |

**验收标准：**
- [ ] 所有快捷键都能正常工作
- [ ] 快捷键不与浏览器默认快捷键冲突
- [ ] 在输入框中时，字母快捷键不触发

#### 4. 模态框焦点管理

**测试步骤：**
1. 打开模态框
2. 按 `Tab` 多次
3. 观察焦点是否限制在模态框内

**验收标准：**
- [ ] 焦点限制在模态框内
- [ ] 从最后一个元素 Tab 回到第一个
- [ ] `Shift + Tab` 反向循环
- [ ] `Escape` 关闭模态框
- [ ] 关闭后焦点返回触发元素

### 高级键盘测试

#### 1. 自定义组件

对于自定义组件（如轮播、手风琴），确保支持：

- **轮播**
  - `Left/Right Arrow` - 前/后导航
  - `Home/End` - 第一张/最后一张
  - `Tab` - 进入/退出轮播

- **手风琴**
  - `Space/Enter` - 展开/折叠
  - `Up/Down Arrow` - 上/下一个面板
  - `Home/End` - 第一个/最后一个面板

- **标签页**
  - `Left/Right Arrow` - 切换标签
  - `Home/End` - 第一个/最后一个标签
  - `Tab` - 进入标签内容

#### 2. 表格导航

**测试步骤：**
1. 使用 `Tab` 进入表格
2. 尝试使用箭头键导航

**验收标准：**
- [ ] `Tab` 移动到表格内的交互元素
- [ ] 表格标题清晰
- [ ] 数据单元格与标题正确关联

## 颜色对比度测试

### 在线工具

#### WebAIM Contrast Checker
- URL: https://webaim.org/resources/contrastchecker/
- 输入前景色和背景色
- 检查是否符合 WCAG AA/AAA

#### Contrast Ratio
- URL: https://contrast-ratio.com/
- 实时计算对比度
- 可视化结果

### 浏览器扩展

#### Colour Contrast Analyser (Chrome/Firefox)
1. 安装扩展
2. 打开页面
3. 点击扩展图标
4. 使用取色器选择颜色

### 开发工具

#### Chrome DevTools
1. 打开 DevTools (`F12`)
2. 选择元素
3. 在 Styles 面板查看颜色
4. 点击颜色旁边的对比度信息

#### Firefox 无障碍检查器
1. 打开 DevTools (`F12`)
2. 切换到 "无障碍性" 标签
3. 选择元素
4. 查看对比度信息

### 测试清单

- [ ] 正文文本对比度 ≥ 4.5:1
- [ ] 大文本（18pt 或 14pt 粗体）≥ 3:1
- [ ] UI 组件对比度 ≥ 3:1
- [ ] 焦点指示器对比度 ≥ 3:1
- [ ] 链接与周围文本对比度 ≥ 3:1

### Tailwind 颜色对比度参考

我们的 Tailwind 配置使用的颜色组合：

| 组合 | 对比度 | 符合标准 |
|------|--------|----------|
| `text-gray-900` / `bg-white` | 18.05:1 | ✅ AAA |
| `text-gray-700` / `bg-white` | 7.92:1 | ✅ AAA |
| `text-gray-600` / `bg-white` | 5.74:1 | ✅ AA |
| `text-primary-600` / `bg-white` | 4.66:1 | ✅ AA |

## 测试清单

### 每次发布前测试

#### 自动化测试
- [ ] 运行 `pnpm test:a11y` 无错误
- [ ] Lighthouse 无障碍分数 ≥ 95
- [ ] axe-core 无违规

#### 键盘导航
- [ ] Tab 顺序正确
- [ ] 跳转链接工作
- [ ] 所有交互可用键盘完成
- [ ] 焦点可见
- [ ] 无键盘陷阱

#### 屏幕阅读器（至少用 NVDA 或 VoiceOver 测试一次）
- [ ] 页面标题正确
- [ ] 标题结构正确
- [ ] 所有按钮和链接有标签
- [ ] 表单字段有标签
- [ ] 图片有替代文本
- [ ] 动态内容被宣布

#### 视觉检查
- [ ] 对比度符合标准
- [ ] 200% 缩放正常
- [ ] 颜色不是唯一信息来源
- [ ] 禁用状态清晰

### 新功能开发测试

在开发新功能时：

1. **编码阶段**
   - 使用语义化 HTML
   - 添加 ARIA 标签
   - 实现键盘支持

2. **自测阶段**
   - 运行 axe-core 测试
   - 键盘导航测试
   - 使用 Chrome DevTools 检查对比度

3. **提交前**
   - 运行完整的无障碍测试套件
   - 用屏幕阅读器快速测试
   - 更新文档

## 报告问题

### 问题模板

发现无障碍问题时，使用此模板报告：

```markdown
**问题描述**
简短描述无障碍问题

**WCAG 标准**
违反的 WCAG 标准（如：1.3.1 信息和关系）

**严重程度**
- [ ] 严重（阻止使用）
- [ ] 中等（影响使用）
- [ ] 轻微（可以绕过）

**复现步骤**
1. 打开页面 xxx
2. 使用屏幕阅读器
3. 导航到元素 xxx

**预期行为**
描述符合无障碍标准的行为

**实际行为**
描述当前的问题行为

**截图/视频**
如果适用，添加截图或屏幕录制

**辅助技术**
- 屏幕阅读器：NVDA 2023.1
- 浏览器：Chrome 120
- 操作系统：Windows 11

**建议修复方案**
如果有，提供可能的修复方案
```

## 学习资源

### 官方文档
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Web Docs - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### 在线课程
- [Web Accessibility by Google](https://www.udacity.com/course/web-accessibility--ud891)
- [Introduction to Web Accessibility](https://www.w3.org/WAI/fundamentals/accessibility-intro/)

### 工具和扩展
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### 社区
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM Community](https://webaim.org/community/)

---

**提示**: 无障碍是持续改进的过程，不是一次性的任务。定期测试和更新，确保应用对所有用户都友好。
