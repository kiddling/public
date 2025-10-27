<template>
  <AppShell>
    <div class="content-container py-8">
      <SectionHeader
        title="无障碍访问示例"
        subtitle="演示键盘导航、ARIA 标签和屏幕阅读器支持"
        :heading-level="1"
      />

      <div class="mt-8 space-y-8">
        <BaseCard>
          <h2 class="heading-4 mb-4">键盘导航测试</h2>
          <p class="body-base mb-4">
            使用 Tab 键在以下按钮间导航，使用 Enter 或 Space 键激活：
          </p>
          <div class="flex flex-wrap gap-3">
            <BaseButton variant="primary" @click="handleClick('按钮 1')">
              按钮 1
            </BaseButton>
            <BaseButton variant="secondary" @click="handleClick('按钮 2')">
              按钮 2
            </BaseButton>
            <BaseButton variant="outline" @click="handleClick('按钮 3')">
              按钮 3
            </BaseButton>
          </div>
          <p v-if="lastClicked" class="mt-4 text-sm text-neutral-600" role="status" aria-live="polite">
            最后点击：{{ lastClicked }}
          </p>
        </BaseCard>

        <BaseCard>
          <h2 class="heading-4 mb-4">可交互卡片</h2>
          <p class="body-base mb-4">
            这些卡片支持键盘操作（Tab + Enter/Space）：
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseCard
              interactive
              part-color="foundation"
              @click="handleCardClick('基础卡片')"
            >
              <div class="space-y-2">
                <BaseTag variant="foundation">基础</BaseTag>
                <h3 class="heading-5">基础课程</h3>
                <p class="body-small">点击或使用键盘选择</p>
              </div>
            </BaseCard>

            <BaseCard
              interactive
              part-color="intermediate"
              @click="handleCardClick('中级卡片')"
            >
              <div class="space-y-2">
                <BaseTag variant="intermediate">中级</BaseTag>
                <h3 class="heading-5">中级课程</h3>
                <p class="body-small">点击或使用键盘选择</p>
              </div>
            </BaseCard>

            <BaseCard
              interactive
              part-color="advanced"
              @click="handleCardClick('高级卡片')"
            >
              <div class="space-y-2">
                <BaseTag variant="advanced">高级</BaseTag>
                <h3 class="heading-5">高级课程</h3>
                <p class="body-small">点击或使用键盘选择</p>
              </div>
            </BaseCard>
          </div>
          <p v-if="lastCardClicked" class="mt-4 text-sm text-neutral-600" role="status" aria-live="polite">
            选择的卡片：{{ lastCardClicked }}
          </p>
        </BaseCard>

        <BaseCard>
          <h2 class="heading-4 mb-4">ARIA 标签和语义化</h2>
          <p class="body-base mb-4">
            所有组件都包含适当的 ARIA 属性，确保屏幕阅读器能正确理解内容：
          </p>
          <ul class="list-disc list-inside space-y-2 body-base ml-4">
            <li><code class="code-inline">role</code> 属性定义元素的角色</li>
            <li><code class="code-inline">aria-label</code> 提供可访问的名称</li>
            <li><code class="code-inline">aria-live</code> 通知动态内容更新</li>
            <li><code class="code-inline">aria-expanded</code> 指示展开/折叠状态</li>
            <li><code class="code-inline">tabindex</code> 控制键盘导航顺序</li>
          </ul>
        </BaseCard>

        <BaseCard>
          <h2 class="heading-4 mb-4">焦点样式</h2>
          <p class="body-base mb-4">
            所有可交互元素都有清晰的焦点指示器（蓝色轮廓）：
          </p>
          <div class="flex flex-wrap gap-3">
            <a href="#" class="link">普通链接</a>
            <BaseButton variant="ghost">透明按钮</BaseButton>
            <BaseTag removable>可移除标签</BaseTag>
          </div>
        </BaseCard>

        <BaseCard>
          <h2 class="heading-4 mb-4">颜色对比度</h2>
          <p class="body-base mb-4">
            所有文本和背景色组合都符合 WCAG 2.1 AA 标准（对比度至少 4.5:1）：
          </p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="p-4 bg-primary-600 text-white rounded-lg">
              <p class="font-medium">主要色</p>
              <p class="text-sm">白色文字</p>
            </div>
            <div class="p-4 bg-success-600 text-white rounded-lg">
              <p class="font-medium">成功色</p>
              <p class="text-sm">白色文字</p>
            </div>
            <div class="p-4 bg-warning-600 text-white rounded-lg">
              <p class="font-medium">警告色</p>
              <p class="text-sm">白色文字</p>
            </div>
            <div class="p-4 bg-error-600 text-white rounded-lg">
              <p class="font-medium">错误色</p>
              <p class="text-sm">白色文字</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <h2 class="heading-4 mb-4">减少动画</h2>
          <p class="body-base mb-4">
            系统会检测用户的 <code class="code-inline">prefers-reduced-motion</code> 设置。
            如果用户启用了减少动画，所有动画将被禁用或大幅缩短。
          </p>
          <div v-motion-pop-bottom class="p-4 bg-primary-50 rounded-lg">
            <p class="text-neutral-700">
              此元素通常会有弹出动画效果。
              如果您启用了系统的"减少动画"设置，动画将被最小化。
            </p>
          </div>
        </BaseCard>

        <BaseCard>
          <h2 class="heading-4 mb-4">Skip Links（跳转链接）</h2>
          <p class="body-base mb-4">
            页面顶部包含隐藏的跳转链接，键盘用户可以使用 Tab 键快速跳转到主内容区域，
            跳过导航菜单。
          </p>
          <p class="body-base">
            <strong>试试看：</strong> 刷新页面，然后按 Tab 键，您会看到"跳转到主内容"链接出现。
          </p>
        </BaseCard>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppShell from '~/components/layout/AppShell.vue'
import SectionHeader from '~/components/base/SectionHeader.vue'
import BaseCard from '~/components/base/BaseCard.vue'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseTag from '~/components/base/BaseTag.vue'

const lastClicked = ref('')
const lastCardClicked = ref('')

const handleClick = (label: string) => {
  lastClicked.value = label
}

const handleCardClick = (label: string) => {
  lastCardClicked.value = label
}
</script>
