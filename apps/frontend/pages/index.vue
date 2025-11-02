<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <div class="container mx-auto px-4 py-16">
      <div class="mx-auto max-w-3xl text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          欢迎使用 Nuxt + Strapi
        </h1>
        <p class="mb-8 text-lg text-gray-600 dark:text-gray-300">
          一个现代化的全栈 Web 应用，使用 Nuxt 3 和 Strapi CMS 构建
        </p>

        <div class="mb-8 flex justify-center gap-4">
          <button
            class="bg-primary-500 hover:bg-primary-600 rounded-lg px-6 py-3 text-white transition-colors"
            @click="exampleStore.increment"
          >
            点击计数: {{ exampleStore.count }}
          </button>
          <button
            class="rounded-lg bg-gray-200 px-6 py-3 text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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

          <h2>页面</h2>
          <ul class="text-left">
            <li>
              <NuxtLink
                to="/resources"
                class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
              >
                资源库 (Resources Hub)
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/knowledge-cards"
                class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
              >
                知识卡片 (Knowledge Cards)
              </NuxtLink>
            </li>
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
