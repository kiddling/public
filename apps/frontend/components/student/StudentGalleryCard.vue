<template>
  <article
    class="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl focus-within:ring-2 focus-within:ring-primary-500"
    tabindex="0"
    role="button"
    :aria-label="`View ${work.projectTitle || work.studentName}'s work`"
    @click="emit('click')"
    @keydown.enter="emit('click')"
    @keydown.space.prevent="emit('click')"
  >
    <div class="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700 overflow-hidden">
      <NuxtImg
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="thumbnailAlt"
        class="w-full h-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
        preset="card"
        sizes="xs:280px sm:300px md:320px lg:400px"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500"
      >
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <div
        v-if="work.discipline"
        class="absolute top-2 left-2 px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded text-xs font-medium text-gray-900 dark:text-gray-100"
      >
        {{ work.discipline }}
      </div>

      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    </div>

    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
        {{ work.projectTitle || work.studentName }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {{ work.studentName }}
      </p>

      <div class="flex flex-wrap gap-2 mb-3">
        <span
          v-if="work.loop"
          class="inline-flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-xs font-medium rounded"
        >
          {{ work.loop }}
        </span>
        <span
          v-if="work.grade"
          class="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded"
        >
          {{ work.grade }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="work.shareEnabled"
          class="flex-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          aria-label="Share work"
          @click.stop="handleShare"
        >
          <span class="flex items-center justify-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </span>
        </button>

        <button
          v-if="work.downloadUrl"
          class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          aria-label="Download work"
          @click.stop="handleDownload"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      </div>
    </div>
  </article>

  <Teleport to="body">
    <StudentQrModal
      v-if="showQrModal"
      :work="work"
      :show="showQrModal"
      @close="showQrModal = false"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { StudentWork } from '~/types/cms'

const props = defineProps<{
  work: StudentWork
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const showQrModal = ref(false)

const thumbnailUrl = computed(() => {
  if (props.work.assets.length > 0) {
    return props.work.assets[0].url
  }
  if (props.work.beforeAfterMedia.length > 0) {
    return props.work.beforeAfterMedia[0].beforeMedia.url
  }
  return null
})

const thumbnailAlt = computed(() => {
  if (props.work.assets.length > 0 && props.work.assets[0].alternativeText) {
    return props.work.assets[0].alternativeText
  }
  return `${props.work.projectTitle || props.work.studentName}'s work`
})

function handleShare() {
  showQrModal.value = true
}

function handleDownload() {
  if (props.work.downloadUrl) {
    window.open(props.work.downloadUrl, '_blank')
  }
}
</script>
