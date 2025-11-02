<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 dark:from-gray-900 dark:to-gray-800"
  >
    <div class="w-full max-w-2xl text-center">
      <!-- Animated 404 -->
      <div class="mb-8">
        <h1 class="animate-pulse text-9xl font-bold text-indigo-600 dark:text-indigo-400">404</h1>
      </div>

      <!-- Main Content -->
      <div class="rounded-2xl bg-white p-8 shadow-2xl md:p-12 dark:bg-gray-800">
        <div class="mb-6 flex justify-center">
          <Icon
            name="mdi:map-marker-question"
            class="h-24 w-24 text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">页面走丢了</h2>

        <p class="mb-8 text-lg text-gray-600 dark:text-gray-300">
          您访问的页面似乎不存在，可能是地址输入错误或页面已被移除
        </p>

        <!-- Search Suggestion -->
        <div class="mb-8">
          <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">您可以尝试以下操作：</p>
          <ul class="mx-auto max-w-md space-y-2 text-left text-sm text-gray-600 dark:text-gray-300">
            <li class="flex items-start">
              <Icon
                name="mdi:check-circle"
                class="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
              />
              <span>检查网址是否输入正确</span>
            </li>
            <li class="flex items-start">
              <Icon
                name="mdi:check-circle"
                class="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
              />
              <span>返回首页重新导航</span>
            </li>
            <li class="flex items-start">
              <Icon
                name="mdi:check-circle"
                class="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
              />
              <span>使用搜索功能查找内容</span>
            </li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <NuxtLink
            to="/"
            class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-indigo-700 hover:shadow-xl"
          >
            <Icon name="mdi:home" class="mr-2 h-5 w-5" />
            返回首页
          </NuxtLink>

          <button
            @click="goBack"
            class="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <Icon name="mdi:arrow-left" class="mr-2 h-5 w-5" />
            返回上一页
          </button>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <NuxtLink
          to="/lessons"
          class="rounded-lg bg-white p-4 transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800"
        >
          <Icon
            name="mdi:book-open-page-variant"
            class="mx-auto mb-2 h-8 w-8 text-indigo-600 dark:text-indigo-400"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">课程</span>
        </NuxtLink>

        <NuxtLink
          to="/resources"
          class="rounded-lg bg-white p-4 transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800"
        >
          <Icon
            name="mdi:folder-multiple"
            class="mx-auto mb-2 h-8 w-8 text-indigo-600 dark:text-indigo-400"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">资源</span>
        </NuxtLink>

        <NuxtLink
          to="/students"
          class="rounded-lg bg-white p-4 transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800"
        >
          <Icon
            name="mdi:account-group"
            class="mx-auto mb-2 h-8 w-8 text-indigo-600 dark:text-indigo-400"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">学生作品</span>
        </NuxtLink>

        <NuxtLink
          to="/knowledge-cards"
          class="rounded-lg bg-white p-4 transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800"
        >
          <Icon
            name="mdi:card-text"
            class="mx-auto mb-2 h-8 w-8 text-indigo-600 dark:text-indigo-400"
          />
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
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>
