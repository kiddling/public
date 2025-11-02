<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <svg
          class="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        您当前处于离线状态
      </h1>

      <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
        无法连接到网络。请检查您的网络连接后重试。
      </p>

      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
          离线功能说明
        </h2>
        <ul class="text-left text-sm text-blue-800 dark:text-blue-400 space-y-2">
          <li class="flex items-start">
            <svg class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            您可以访问之前浏览过的页面
          </li>
          <li class="flex items-start">
            <svg class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            已缓存的学习资料可以离线查看
          </li>
          <li class="flex items-start">
            <svg class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            新内容和数据更新需要网络连接
          </li>
        </ul>
      </div>

      <div class="space-y-3">
        <button
          @click="reload"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          重新加载
        </button>
        
        <NuxtLink
          to="/"
          class="block w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          返回首页
        </NuxtLink>
      </div>

      <div class="mt-8">
        <div v-if="isOnline" class="inline-flex items-center text-green-600 dark:text-green-400">
          <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          网络已连接
        </div>
        <div v-else class="inline-flex items-center text-red-600 dark:text-red-400">
          <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          离线模式
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOnline } from '@vueuse/core'

const isOnline = useOnline()

const reload = () => {
  window.location.reload()
}

watch(isOnline, (online) => {
  if (online) {
    setTimeout(() => {
      navigateTo('/')
    }, 1000)
  }
})
</script>
