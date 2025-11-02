<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-[-100%] opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-[-100%] opacity-0"
  >
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white py-3 px-4 shadow-lg"
    >
      <div class="container mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <svg
            class="h-6 w-6 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span class="font-medium">
            您当前处于离线模式 - 部分功能可能不可用
          </span>
        </div>
        <button
          @click="viewOfflinePage"
          class="text-sm underline hover:no-underline focus:outline-none"
        >
          了解更多
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useOnline } from '@vueuse/core'

const isOnline = useOnline()

const viewOfflinePage = () => {
  navigateTo('/offline')
}
</script>
