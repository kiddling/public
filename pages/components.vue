<template>
  <AppShell>
    <div class="content-container py-8">
      <SectionHeader
        title="设计系统组件库"
        subtitle="查看所有可用的 UI 组件和使用示例"
        :heading-level="1"
      />

      <div class="mt-8 space-y-12">
        <section id="buttons" class="component-section">
          <h2 class="heading-3 mb-6 pb-3 border-b border-neutral-200">按钮 (BaseButton)</h2>
          
          <div class="space-y-6">
            <div>
              <h3 class="heading-5 mb-4">变体 (Variants)</h3>
              <div class="flex flex-wrap gap-3">
                <BaseButton variant="primary">Primary</BaseButton>
                <BaseButton variant="secondary">Secondary</BaseButton>
                <BaseButton variant="outline">Outline</BaseButton>
                <BaseButton variant="ghost">Ghost</BaseButton>
                <BaseButton variant="danger">Danger</BaseButton>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">尺寸 (Sizes)</h3>
              <div class="flex flex-wrap items-center gap-3">
                <BaseButton size="sm">Small</BaseButton>
                <BaseButton size="md">Medium</BaseButton>
                <BaseButton size="lg">Large</BaseButton>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">状态 (States)</h3>
              <div class="flex flex-wrap gap-3">
                <BaseButton :disabled="true">Disabled</BaseButton>
                <BaseButton :loading="true">Loading</BaseButton>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">带图标 (With Icons)</h3>
              <div class="flex flex-wrap gap-3">
                <BaseButton icon-left="heroicons:arrow-left">返回</BaseButton>
                <BaseButton icon-right="heroicons:arrow-right">下一步</BaseButton>
                <BaseButton icon-left="heroicons:star" variant="outline">收藏</BaseButton>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">全宽 (Full Width)</h3>
              <BaseButton :full-width="true" variant="primary">全宽按钮</BaseButton>
            </div>
          </div>
        </section>

        <section id="cards" class="component-section">
          <h2 class="heading-3 mb-6 pb-3 border-b border-neutral-200">卡片 (BaseCard)</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BaseCard>
              <h3 class="heading-5 mb-2">默认卡片</h3>
              <p class="body-small">这是一个默认样式的卡片组件。</p>
            </BaseCard>

            <BaseCard variant="bordered">
              <h3 class="heading-5 mb-2">边框卡片</h3>
              <p class="body-small">这是一个带边框的卡片组件。</p>
            </BaseCard>

            <BaseCard variant="elevated">
              <h3 class="heading-5 mb-2">浮起卡片</h3>
              <p class="body-small">这是一个有阴影效果的卡片组件。</p>
            </BaseCard>

            <BaseCard interactive part-color="foundation">
              <h3 class="heading-5 mb-2">基础课程卡片</h3>
              <p class="body-small">可交互的卡片，带有课程部分颜色标识。</p>
            </BaseCard>

            <BaseCard interactive part-color="intermediate">
              <h3 class="heading-5 mb-2">中级课程卡片</h3>
              <p class="body-small">中级课程的颜色标识。</p>
            </BaseCard>

            <BaseCard interactive part-color="advanced">
              <h3 class="heading-5 mb-2">高级课程卡片</h3>
              <p class="body-small">高级课程的颜色标识。</p>
            </BaseCard>

            <BaseCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <span>带头部的卡片</span>
                  <Icon name="heroicons:information-circle" class="w-5 h-5" />
                </div>
              </template>
              <p class="body-small">卡片主体内容区域。</p>
              <template #footer>
                <BaseButton size="sm" variant="ghost" :full-width="true">查看详情</BaseButton>
              </template>
            </BaseCard>

            <BaseCard
              image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"
              image-alt="示例图片"
              interactive
            >
              <h3 class="heading-5 mb-2">图片卡片</h3>
              <p class="body-small">带有图片的卡片组件。</p>
            </BaseCard>
          </div>
        </section>

        <section id="tags" class="component-section">
          <h2 class="heading-3 mb-6 pb-3 border-b border-neutral-200">标签 (BaseTag)</h2>
          
          <div class="space-y-6">
            <div>
              <h3 class="heading-5 mb-4">课程标签</h3>
              <div class="flex flex-wrap gap-2">
                <BaseTag variant="foundation">基础课程</BaseTag>
                <BaseTag variant="intermediate">中级课程</BaseTag>
                <BaseTag variant="advanced">高级课程</BaseTag>
                <BaseTag variant="expert">专家课程</BaseTag>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">状态标签</h3>
              <div class="flex flex-wrap gap-2">
                <BaseTag variant="success">成功</BaseTag>
                <BaseTag variant="warning">警告</BaseTag>
                <BaseTag variant="error">错误</BaseTag>
                <BaseTag variant="info">信息</BaseTag>
                <BaseTag variant="default">默认</BaseTag>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">带图标的标签</h3>
              <div class="flex flex-wrap gap-2">
                <BaseTag variant="foundation" icon="heroicons:academic-cap">基础</BaseTag>
                <BaseTag variant="intermediate" icon="heroicons:beaker">中级</BaseTag>
                <BaseTag variant="advanced" icon="heroicons:rocket-launch">高级</BaseTag>
                <BaseTag variant="expert" icon="heroicons:star">专家</BaseTag>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">可移除的标签</h3>
              <div class="flex flex-wrap gap-2">
                <BaseTag removable>JavaScript</BaseTag>
                <BaseTag removable>TypeScript</BaseTag>
                <BaseTag removable>Vue.js</BaseTag>
                <BaseTag removable>Nuxt</BaseTag>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">尺寸</h3>
              <div class="flex flex-wrap items-center gap-2">
                <BaseTag size="sm">小号</BaseTag>
                <BaseTag size="md">中号</BaseTag>
                <BaseTag size="lg">大号</BaseTag>
              </div>
            </div>
          </div>
        </section>

        <section id="section-headers" class="component-section">
          <h2 class="heading-3 mb-6 pb-3 border-b border-neutral-200">章节标题 (SectionHeader)</h2>
          
          <div class="space-y-8">
            <SectionHeader
              title="默认章节标题"
              subtitle="这是一个默认的章节标题组件"
            />

            <SectionHeader
              title="基础课程章节"
              subtitle="带有课程部分标识的标题"
              part-color="foundation"
              part-label="基础"
            />

            <SectionHeader
              title="带操作按钮的标题"
              subtitle="标题右侧可以添加操作按钮"
              part-color="intermediate"
              part-label="中级"
            >
              <template #actions>
                <BaseButton variant="outline" size="sm">编辑</BaseButton>
                <BaseButton variant="primary" size="sm">保存</BaseButton>
              </template>
            </SectionHeader>

            <SectionHeader
              title="居中的标题"
              subtitle="标题和副标题都会居中显示"
              :centered="true"
              part-color="advanced"
              part-label="高级"
            />
          </div>
        </section>

        <section id="typography" class="component-section">
          <h2 class="heading-3 mb-6 pb-3 border-b border-neutral-200">排版 (Typography)</h2>
          
          <div class="space-y-8">
            <div>
              <h3 class="heading-5 mb-4">标题 (Headings)</h3>
              <div class="space-y-3">
                <h1 class="heading-1">标题 1 - Heading 1</h1>
                <h2 class="heading-2">标题 2 - Heading 2</h2>
                <h3 class="heading-3">标题 3 - Heading 3</h3>
                <h4 class="heading-4">标题 4 - Heading 4</h4>
                <h5 class="heading-5">标题 5 - Heading 5</h5>
                <h6 class="heading-6">标题 6 - Heading 6</h6>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">正文 (Body Text)</h3>
              <div class="space-y-3">
                <p class="body-large">大号正文 - 这是大号的正文文本，适合重要内容的展示。</p>
                <p class="body-base">普通正文 - 这是标准的正文文本，最常用的文本样式。</p>
                <p class="body-small">小号正文 - 这是小号的正文文本，适合次要信息。</p>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">说明文字 (Caption)</h3>
              <div class="space-y-2">
                <p class="caption">普通说明文字 - 用于图片说明或元数据</p>
                <p class="caption-small">小号说明文字 - 用于更细小的信息</p>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">代码 (Code)</h3>
              <p class="body-base mb-4">
                行内代码示例：<code class="code-inline">const greeting = "你好，世界！"</code>
              </p>
              <pre class="code-block">// 代码块示例
function greet(name: string): string {
  return `你好，${name}！`;
}

const message = greet("世界");
console.log(message);</pre>
            </div>

            <div>
              <h3 class="heading-5 mb-4">链接 (Links)</h3>
              <p class="body-base">
                这是一段包含<a href="#" class="link">链接文字</a>的文本内容。
              </p>
            </div>
          </div>
        </section>

        <section id="colors" class="component-section">
          <h2 class="heading-3 mb-6 pb-3 border-b border-neutral-200">颜色系统 (Color System)</h2>
          
          <div class="space-y-8">
            <div>
              <h3 class="heading-5 mb-4">课程部分颜色</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="space-y-2">
                  <div class="h-20 rounded-lg bg-part-foundation"></div>
                  <p class="body-small font-medium">Foundation</p>
                </div>
                <div class="space-y-2">
                  <div class="h-20 rounded-lg bg-part-intermediate"></div>
                  <p class="body-small font-medium">Intermediate</p>
                </div>
                <div class="space-y-2">
                  <div class="h-20 rounded-lg bg-part-advanced"></div>
                  <p class="body-small font-medium">Advanced</p>
                </div>
                <div class="space-y-2">
                  <div class="h-20 rounded-lg bg-part-expert"></div>
                  <p class="body-small font-medium">Expert</p>
                </div>
              </div>
            </div>

            <div>
              <h3 class="heading-5 mb-4">语义颜色</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="space-y-2">
                  <div class="h-20 rounded-lg bg-success-500"></div>
                  <p class="body-small font-medium">Success</p>
                </div>
                <div class="space-y-2">
                  <div class="h-20 rounded-lg bg-warning-500"></div>
                  <p class="body-small font-medium">Warning</p>
                </div>
                <div class="space-y-2">
                  <div class="h-20 rounded-lg bg-error-500"></div>
                  <p class="body-small font-medium">Error</p>
                </div>
                <div class="space-y-2">
                  <div class="h-20 rounded-lg bg-info-500"></div>
                  <p class="body-small font-medium">Info</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'
import SectionHeader from '~/components/base/SectionHeader.vue'
import BaseCard from '~/components/base/BaseCard.vue'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseTag from '~/components/base/BaseTag.vue'
</script>

<style scoped>
.component-section {
  @apply scroll-mt-20;
}
</style>
