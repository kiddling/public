<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          欢迎使用 Nuxt + Strapi
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
          一个现代化的全栈 Web 应用，使用 Nuxt 3 和 Strapi CMS 构建
        </p>

        <div class="flex gap-4 justify-center mb-8">
          <button
            class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            @click="exampleStore.increment"
          >
            点击计数: {{ exampleStore.count }}
          </button>
          <button
            class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            @click="toggleDark"
          >
            切换主题
          </button>
        </div>

        <div class="prose dark:prose-invert mx-auto">
          <h2>特性</h2>
          <ul class="text-left">
            <li>✅ Nuxt 3 with Server-Side Rendering</li>
            <li>✅ TypeScript 支持</li>
            <li>✅ Tailwind CSS 中文字体优化</li>
            <li>✅ Pinia 状态管理</li>
            <li>✅ VueUse 工具库</li>
            <li>✅ 深色模式</li>
            <li>✅ Strapi CMS 集成</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  breadcrumbHomeLabel: 'Home',
})

const exampleStore = useExampleStore()
const colorMode = useColorMode()

const toggleDark = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
