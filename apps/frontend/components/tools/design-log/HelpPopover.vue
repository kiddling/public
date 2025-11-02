<template>
  <button
    type="button"
    class="ml-1 inline-flex items-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:text-gray-300"
    :aria-label="ariaLabel"
    @click="isOpen = !isOpen"
    @blur="handleBlur"
  >
    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fill-rule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
        clip-rule="evenodd"
      />
    </svg>
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute z-10 mt-8 w-64 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        role="tooltip"
      >
        {{ content }}
      </div>
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  content: string
  ariaLabel?: string
}>()

const isOpen = ref(false)

function handleBlur(event: FocusEvent) {
  setTimeout(() => {
    isOpen.value = false
  }, 200)
}
</script>
