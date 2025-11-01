<template>
  <section
    :data-difficulty-block="true"
    :data-level="block.level"
    class="difficulty-section space-y-6"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {{ difficultyLabels[block.level] }} Level
        </h2>
        <p v-if="block.summary" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {{ block.summary }}
        </p>
      </div>
      <span
        class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
        :class="badgeClassByLevel(block.level)"
      >
        {{ block.level }}
      </span>
    </div>

    <div v-if="blockContentHtml" class="prose max-w-none text-gray-700 dark:prose-invert" v-html="blockContentHtml"></div>

    <div v-if="block.media.length" class="grid gap-6 md:grid-cols-2">
      <figure 
        v-for="media in block.media" 
        :key="media.id ?? media.url" 
        class="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-800/60"
      >
        <video
          v-if="isVideo(media)"
          :src="media.url"
          controls
          class="h-64 w-full object-cover"
          :aria-label="media.alternativeText ?? media.caption ?? '视频 Video'"
        ></video>
        <img
          v-else
          :src="media.url"
          :alt="media.alternativeText ?? media.caption ?? '图片 Image'"
          class="h-64 w-full object-cover"
          loading="lazy"
        />
        <figcaption v-if="media.caption || media.alternativeText" class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
          {{ media.caption ?? media.alternativeText }}
        </figcaption>
      </figure>
    </div>

    <div v-if="block.attachments.length" class="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">下载 Downloads</h3>
      <ul class="mt-3 space-y-2">
        <li v-for="attachment in block.attachments" :key="attachment.id">
          <a
            :href="attachment.url"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
          >
            <Icon name="i-heroicons-arrow-down-tray" class="h-4 w-4" />
            {{ attachment.name }}
          </a>
          <span v-if="attachment.size" class="ml-2 text-xs text-gray-500 dark:text-gray-400">
            ({{ formatFileSize(attachment.size) }})
          </span>
        </li>
      </ul>
    </div>

    <div v-if="block.videoEmbeds && block.videoEmbeds.length" class="space-y-6">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">视频资源 Video Resources</h3>
      <div class="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <MediaVideoEmbed
          v-for="videoEmbed in block.videoEmbeds"
          :key="videoEmbed.id"
          :embed="videoEmbed"
          :privacy-mode="true"
          :lazy-load="true"
        />
      </div>
    </div>

    <div v-if="block.prompts.length" class="rounded-xl border border-dashed border-primary-200 bg-primary-50 p-4 dark:border-primary-400/60 dark:bg-primary-500/10">
      <h3 class="text-sm font-semibold text-primary-700 dark:text-primary-200">
        拓展思考 Extended Thinking
      </h3>
      <ul class="mt-3 space-y-3">
        <li
          v-for="prompt in block.prompts"
          :key="prompt.id"
          class="rounded-lg bg-white/80 p-3 text-sm text-gray-700 shadow-sm ring-1 ring-primary-100 backdrop-blur dark:bg-gray-900/70 dark:text-gray-200 dark:ring-primary-400/40"
        >
          <p class="font-medium text-gray-900 dark:text-gray-100">{{ prompt.title ?? 'Reflection' }}</p>
          <p v-if="prompt.description" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {{ prompt.description }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LessonDifficultyBlock, DifficultyLevel, StrapiMedia } from '~/types/lesson'
import { useMarkdown } from '~/composables/useMarkdown'

const props = defineProps<{
  block: LessonDifficultyBlock
}>()

const difficultyLabels: Record<DifficultyLevel, string> = {
  base: 'Base',
  advance: 'Advance',
  stretch: 'Stretch',
}

const blockContentHtml = computed(() => {
  return props.block.body ?? renderRichTextToHtml(props.block.richBody)
})

const badgeClassByLevel = (level: DifficultyLevel) => {
  if (level === 'base') {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200'
  }
  if (level === 'advance') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
  }
  return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200'
}

const isVideo = (media: StrapiMedia) => Boolean(media.mime && media.mime.startsWith('video'))

function renderRichTextToHtml(value: unknown): string | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return useMarkdown(value)
  }

  // For Strapi rich text format, we'd need to parse it
  // For now, return null and rely on body field
  return null
}

function formatFileSize(sizeInBytes: number | null | undefined) {
  if (!sizeInBytes || sizeInBytes <= 0) {
    return '0 KB'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let size = sizeInBytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}
</script>
