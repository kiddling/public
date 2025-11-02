<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
    <div class="max-w-2xl w-full text-center">
      <!-- Animated 404 -->
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
          404
        </h1>
      </div>

      <!-- Main Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
        <div class="flex justify-center mb-6">
          <Icon name="mdi:map-marker-question" class="w-24 h-24 text-indigo-600 dark:text-indigo-400" />
        </div>

        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          页面走丢了
        </h2>

        <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
          您访问的页面似乎不存在，可能是地址输入错误或页面已被移除
        </p>

        <!-- Search Suggestion -->
        <div class="mb-8">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            您可以尝试以下操作：
          </p>
          <ul class="text-left text-sm text-gray-600 dark:text-gray-300 space-y-2 max-w-md mx-auto">
            <li class="flex items-start">
              <Icon name="mdi:check-circle" class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>检查网址是否输入正确</span>
            </li>
            <li class="flex items-start">
              <Icon name="mdi:check-circle" class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>返回首页重新导航</span>
            </li>
            <li class="flex items-start">
              <Icon name="mdi:check-circle" class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>使用搜索功能查找内容</span>
            </li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
          >
            <Icon name="mdi:home" class="w-5 h-5 mr-2" />
            返回首页
          </NuxtLink>

          <button
            @click="goBack"
            class="px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
          >
            <Icon name="mdi:arrow-left" class="w-5 h-5 mr-2" />
            返回上一页
          </button>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink
          to="/lessons"
          class="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
        >
          <Icon name="mdi:book-open-page-variant" class="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
          <span class="text-sm text-gray-700 dark:text-gray-300">课程</span>
        </NuxtLink>

        <NuxtLink
          to="/resources"
          class="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
        >
          <Icon name="mdi:folder-multiple" class="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
          <span class="text-sm text-gray-700 dark:text-gray-300">资源</span>
        </NuxtLink>

        <NuxtLink
          to="/students"
          class="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
        >
          <Icon name="mdi:account-group" class="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
          <span class="text-sm text-gray-700 dark:text-gray-300">学生作品</span>
        </NuxtLink>

        <NuxtLink
          to="/knowledge-cards"
          class="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
        >
          <Icon name="mdi:card-text" class="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
          <span class="text-sm text-gray-700 dark:text-gray-300">知识卡</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogger } from '~/utils/logger'

const logger = useLogger()
const router = useRouter()

logger.warn('404 page accessed', { path: router.currentRoute.value.fullPath })

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

// SEO
useHead({
  title: '页面未找到 - 404',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>
