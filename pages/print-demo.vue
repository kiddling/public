<template>
  <AppShell>
    <div class="content-container py-8">
      <SectionHeader
        title="打印预览示例"
        subtitle="此页面已针对打印进行优化"
        :heading-level="1"
      >
        <template #actions>
          <BaseButton variant="outline" class="no-print" @click="handlePrint">
            <Icon name="heroicons:printer" class="w-5 h-5" />
            打印此页
          </BaseButton>
        </template>
      </SectionHeader>

      <div class="mt-8 space-y-8">
        <BaseCard class="print-break-avoid">
          <h2 class="heading-3 mb-4">打印友好设计</h2>
          <div class="prose-content">
            <p>
              本设计系统包含完整的打印样式优化，确保内容在纸张上清晰可读。
            </p>
            <h3>打印时的变化：</h3>
            <ul>
              <li>导航栏、侧边栏等交互元素会自动隐藏</li>
              <li>背景色和阴影被移除以节省墨水</li>
              <li>链接的 URL 会自动显示在文字后</li>
              <li>颜色对比度优化以适应黑白打印</li>
              <li>分页控制确保内容不会被截断</li>
            </ul>
          </div>
        </BaseCard>

        <BaseCard class="print-break-avoid" part-color="foundation">
          <h2 class="heading-4 mb-3">课程部分：基础</h2>
          <div class="space-y-3">
            <BaseTag variant="foundation">基础课程</BaseTag>
            <p class="body-base">
              此卡片带有基础课程的颜色标识。在打印时，左侧的蓝色边框会被保留，
              帮助区分不同的课程部分。
            </p>
          </div>
        </BaseCard>

        <BaseCard class="print-break-avoid" part-color="intermediate">
          <h2 class="heading-4 mb-3">课程部分：中级</h2>
          <div class="space-y-3">
            <BaseTag variant="intermediate">中级课程</BaseTag>
            <p class="body-base">
              中级课程使用绿色标识，帮助学生快速识别课程难度级别。
            </p>
          </div>
        </BaseCard>

        <div class="print-break-before">
          <BaseCard class="print-break-avoid">
            <h2 class="heading-3 mb-4">代码示例</h2>
            <p class="body-base mb-4">
              代码块在打印时也会保持良好的可读性：
            </p>
            <pre class="code-block">// TypeScript 示例
interface Course {
  id: string;
  title: string;
  level: 'foundation' | 'intermediate' | 'advanced' | 'expert';
}

function getCoursesByLevel(level: Course['level']): Course[] {
  return courses.filter(course => course.level === level);
}</pre>
          </BaseCard>
        </div>

        <BaseCard class="print-break-avoid">
          <h2 class="heading-3 mb-4">表格和数据</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-200">
              <thead class="bg-neutral-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-neutral-900">课程</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-neutral-900">级别</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-neutral-900">时长</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-200 bg-white">
                <tr>
                  <td class="px-4 py-3 text-sm text-neutral-700">Vue.js 基础</td>
                  <td class="px-4 py-3 text-sm text-neutral-700">基础</td>
                  <td class="px-4 py-3 text-sm text-neutral-700">8 小时</td>
                </tr>
                <tr>
                  <td class="px-4 py-3 text-sm text-neutral-700">TypeScript 进阶</td>
                  <td class="px-4 py-3 text-sm text-neutral-700">中级</td>
                  <td class="px-4 py-3 text-sm text-neutral-700">12 小时</td>
                </tr>
                <tr>
                  <td class="px-4 py-3 text-sm text-neutral-700">系统架构设计</td>
                  <td class="px-4 py-3 text-sm text-neutral-700">高级</td>
                  <td class="px-4 py-3 text-sm text-neutral-700">16 小时</td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>

        <BaseCard class="print-break-avoid">
          <h2 class="heading-3 mb-4">引用和提示</h2>
          <blockquote class="border-l-4 border-primary-300 pl-4 italic text-neutral-600 my-4">
            "学习永无止境。教育是点燃火焰，而非填满容器。"
          </blockquote>
          <p class="body-base">
            重要的引用和提示文字在打印时会保持其视觉层级和格式。
          </p>
        </BaseCard>

        <div class="no-print mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h3 class="heading-5 mb-3 text-blue-900">打印提示</h3>
          <ul class="list-disc list-inside space-y-2 text-blue-800">
            <li>此提示框在打印时会被隐藏（使用 <code class="code-inline">no-print</code> 类）</li>
            <li>使用浏览器的"打印预览"功能查看打印效果</li>
            <li>建议使用 A4 纸张尺寸</li>
            <li>可以选择"保存为 PDF"来生成电子文档</li>
          </ul>
        </div>

        <div class="mt-8 p-6 bg-neutral-100 rounded-lg">
          <h3 class="heading-5 mb-3">打印工具类说明</h3>
          <div class="space-y-2 body-base">
            <p><code class="code-inline">.no-print</code> - 打印时隐藏元素</p>
            <p><code class="code-inline">.print-break-before</code> - 在元素前分页</p>
            <p><code class="code-inline">.print-break-after</code> - 在元素后分页</p>
            <p><code class="code-inline">.print-break-avoid</code> - 避免在元素内分页</p>
          </div>
        </div>
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

const handlePrint = () => {
  window.print()
}
</script>
