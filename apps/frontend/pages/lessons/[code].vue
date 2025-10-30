<template>
  <div
    class="lesson-page min-h-screen bg-gray-50 pb-16 pt-8 dark:bg-gray-950"
    :data-print-mode="printMode"
    :data-visible-level="difficulty"
  >
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div v-if="pending" class="space-y-6">
        <div class="animate-pulse space-y-4 rounded-2xl bg-white/80 p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900/80 dark:ring-gray-800">
          <div class="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-10 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="mt-6 grid gap-4 sm:grid-cols-3">
            <div class="h-16 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
            <div class="h-16 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
            <div class="h-16 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div class="animate-pulse space-y-4 rounded-2xl bg-white/80 p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900/80 dark:ring-gray-800">
            <div class="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div class="h-52 rounded-lg bg-gray-100 dark:bg-gray-800"></div>
            <div class="h-4 w-48 rounded bg-gray-200 dark:bg-gray-800"></div>
          </div>
          <div class="animate-pulse space-y-4 rounded-2xl bg-white/80 p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900/80 dark:ring-gray-800">
            <div class="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div class="h-40 rounded-lg bg-gray-100 dark:bg-gray-800"></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="error || !lesson"
        class="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800"
      >
        <p class="text-lg font-medium">
          {{ error ? 'We could not load this lesson right now.' : 'Lesson not found.' }}
        </p>
        <p v-if="error && error.message" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {{ error.message }}
        </p>
        <div class="mt-6 flex justify-center gap-3 no-print">
          <NuxtLink
            to="/"
            class="inline-flex items-center rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Back to home
          </NuxtLink>
          <button
            type="button"
            class="inline-flex items-center rounded-lg bg-primary-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
            @click="refresh"
          >
            Try again
          </button>
        </div>
      </div>

      <div v-else class="space-y-10">
        <header class="rounded-2xl bg-white/90 p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="max-w-3xl space-y-3">
              <p class="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
                Lesson {{ lesson.code }}
              </p>
              <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
                {{ lesson.title }}
              </h1>
              <p v-if="lesson.summary" class="text-base text-gray-600 dark:text-gray-300">
                {{ lesson.summary }}
              </p>
            </div>

            <div class="no-print flex flex-col items-end gap-3">
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                :class="progressBadgeClasses"
              >
                {{ progressLabel }}
              </span>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-300"
                @click="toggleCompletion"
              >
                <span v-if="progress.completed">Mark as incomplete</span>
                <span v-else>Mark as complete</span>
              </button>
              <p v-if="progress.updatedAt" class="text-xs text-gray-500 dark:text-gray-400">
                Updated {{ formatTimestamp(progress.updatedAt) }}
              </p>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
            <LessonDifficultyToggle v-model="difficulty" class="flex-1" />

            <div class="no-print flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-300"
                @click="handlePrint('current')"
              >
                Print selected level
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-300"
                @click="handlePrint('all')"
              >
                Print all levels
              </button>
            </div>
          </div>

          <div v-if="loop" class="mt-6 grid gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40 sm:grid-cols-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Loop Title</p>
              <p class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{{ loop.title ?? 'Loop' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Sequence</p>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {{ loop.order != null ? `Step ${loop.order}` : 'Not specified' }}
              </p>
            </div>
            <div v-if="loop.summary || loop.description">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Overview</p>
              <p class="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {{ loop.summary ?? loop.description }}
              </p>
            </div>
          </div>
        </header>

        <main class="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article class="space-y-10 rounded-2xl bg-white/95 p-8 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
            <section v-if="lesson.body" class="space-y-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Overview</h2>
              <div class="prose max-w-none text-gray-700 dark:prose-invert" v-html="lesson.body"></div>
            </section>

            <section
              v-for="(block, index) in visibleDifficultyBlocks"
              :key="`${block.level}-${index}`"
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

              <div v-if="blockContentHtml(block)" class="prose max-w-none text-gray-700 dark:prose-invert" v-html="blockContentHtml(block)"></div>

              <div v-if="block.media.length" class="grid gap-6 md:grid-cols-2">
                <figure v-for="media in block.media" :key="media.id ?? media.url" class="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-800/60">
                  <video
                    v-if="isVideo(media)"
                    :src="media.url"
                    controls
                    class="h-64 w-full object-cover"
                  ></video>
                  <img
                    v-else
                    :src="media.url"
                    :alt="media.alternativeText ?? media.caption ?? ''"
                    class="h-64 w-full object-cover"
                    loading="lazy"
                  />
                  <figcaption v-if="media.caption || media.alternativeText" class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                    {{ media.caption ?? media.alternativeText }}
                  </figcaption>
                </figure>
              </div>

              <div v-if="block.attachments.length" class="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Downloads</h3>
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

              <div v-if="block.prompts.length" class="rounded-xl border border-dashed border-primary-200 bg-primary-50 p-4 dark:border-primary-400/60 dark:bg-primary-500/10">
                <h3 class="text-sm font-semibold text-primary-700 dark:text-primary-200">
                  Extended Thinking
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

              <div v-if="renderAllBlocks && index < visibleDifficultyBlocks.length - 1" class="print-page-break"></div>
            </section>
          </article>

          <aside class="space-y-8">
            <section v-if="knowledgeCards.length" class="rounded-2xl bg-white/95 p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Knowledge Cards</h2>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <article
                  v-for="card in knowledgeCards"
                  :key="card.id"
                  class="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:border-primary-200 dark:border-gray-800 dark:bg-gray-900/70 dark:hover:border-primary-400/50"
                >
                  <img
                    v-if="card.image?.url"
                    :src="card.image.url"
                    :alt="card.image.alternativeText ?? card.title"
                    class="h-32 w-full object-cover"
                    loading="lazy"
                  />
                  <div class="flex flex-1 flex-col gap-2 p-4">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ card.title }}</h3>
                    <p v-if="card.summary || card.description" class="text-xs text-gray-600 dark:text-gray-300">
                      {{ card.summary ?? card.description }}
                    </p>
                    <div class="mt-auto pt-2">
                      <a
                        v-if="card.url"
                        :href="card.url"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
                      >
                        Explore
                        <Icon name="i-heroicons-arrow-top-right-on-square" class="h-3 w-3" />
                      </a>
                      <span v-else class="text-xs text-gray-400 dark:text-gray-500">No external link</span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <section v-if="resources.length" class="rounded-2xl bg-white/95 p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Resources</h2>
              <ul class="mt-4 space-y-4">
                <li
                  v-for="resource in resources"
                  :key="resource.id"
                  class="flex items-start gap-4 rounded-xl border border-gray-100 p-4 transition hover:border-primary-200 dark:border-gray-800 dark:hover:border-primary-400/50"
                >
                  <img
                    v-if="resource.qrCodeUrl"
                    :src="resource.qrCodeUrl"
                    alt="QR code"
                    class="mt-1 h-16 w-16 rounded-lg border border-gray-200 object-contain dark:border-gray-700"
                    loading="lazy"
                  />
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ resource.title }}</p>
                    <p v-if="resource.description" class="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      {{ resource.description }}
                    </p>
                    <div class="mt-3 flex flex-wrap items-center gap-2">
                      <a
                        :href="resource.url"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
                      >
                        Open resource
                        <Icon name="i-heroicons-arrow-top-right-on-square" class="h-3 w-3" />
                      </a>
                      <span v-if="resource.type" class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {{ resource.type }}
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
            </section>
          </aside>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useLessons } from '~/composables/useLessons'
import { buildDeepPopulate } from '~/utils/strapi-query'
import type { DifficultyLevel, Lesson, LessonDifficultyBlock, StrapiMedia } from '~/types/lesson'

type LessonProgressState = {
  viewed: boolean
  completed: boolean
  updatedAt: string
}

const orderedLevels: DifficultyLevel[] = ['base', 'advance', 'stretch']

const route = useRoute()
const config = useRuntimeConfig()

const rawCode = computed(() => String(route.params.code ?? ''))
const normalizedCode = computed(() => rawCode.value.toUpperCase())

const assetBase = computed(() => {
  const base = config.public.cdnUrl || config.public.strapiUrl || ''
  return base.endsWith('/') ? base.slice(0, -1) : base
})

const difficultyKey = computed(() => `lesson:${normalizedCode.value}:difficulty`)
const progressKey = computed(() => `lesson:${normalizedCode.value}:progress`)

const difficulty = useLocalStorage<DifficultyLevel>(difficultyKey, 'base')
const progress = useLocalStorage<LessonProgressState>(
  progressKey,
  {
    viewed: false,
    completed: false,
    updatedAt: '',
  },
  { deep: true }
)

const printMode = ref<'current' | 'all'>('current')
const renderAllBlocks = ref(false)

const { data: lessonState, pending, error, refresh } = await useLessons({
  code: normalizedCode,
  pagination: computed(() => ({ page: 1, pageSize: 1 })),
  populate: buildDeepPopulate(4),
  key: computed(() => `lesson:${normalizedCode.value}`),
  immediate: true,
})

const lesson = computed<Lesson | null>(() => lessonState.value?.items[0] ?? null)

const availableLevels = computed(() =>
  orderedLevels.filter((level) => (lesson.value?.difficultyBlocks[level] ?? null) !== null)
)

const visibleDifficultyBlocks = computed<LessonDifficultyBlock[]>(() => {
  if (!lesson.value) {
    return []
  }

  const blocks = orderedLevels
    .map((level) => lesson.value?.difficultyBlocks[level] ?? null)
    .filter((block): block is LessonDifficultyBlock => block !== null)

  if (renderAllBlocks.value) {
    return blocks
  }

  const current = lesson.value.difficultyBlocks[difficulty.value]
  if (current) {
    return [current]
  }

  return blocks.slice(0, 1)
})

const knowledgeCards = computed(() => lesson.value?.knowledgeCards ?? [])
const resources = computed(() => lesson.value?.resources ?? [])
const loop = computed(() => lesson.value?.loop ?? null)

const difficultyLabels: Record<DifficultyLevel, string> = {
  base: 'Base',
  advance: 'Advance',
  stretch: 'Stretch',
}

const progressLabel = computed(() => {
  if (progress.value.completed) {
    return 'Completed'
  }
  if (progress.value.viewed) {
    return 'In progress'
  }
  return 'Not started'
})

const progressBadgeClasses = computed(() => {
  if (progress.value.completed) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
  }
  if (progress.value.viewed) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
  }
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
})

watch(
  () => [lesson.value, difficulty.value] as const,
  ([lessonValue, currentLevel]) => {
    if (!lessonValue) {
      return
    }

    if (!lessonValue.difficultyBlocks[currentLevel]) {
      const fallback = availableLevels.value[0]
      if (fallback) {
        difficulty.value = fallback
      }
    }
  },
  { immediate: true }
)

watch(
  () => normalizedCode.value,
  () => {
    printMode.value = 'current'
    renderAllBlocks.value = false
  }
)

watchEffect(() => {
  if (!process.client) {
    return
  }

  if (!lesson.value) {
    return
  }

  if (!progress.value.viewed) {
    progress.value.viewed = true
    progress.value.updatedAt = new Date().toISOString()
  }
})

const blockContentHtml = (block: LessonDifficultyBlock) => {
  return block.body ?? renderRichTextToHtml(block.richBody)
}

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

const toggleCompletion = () => {
  progress.value.completed = !progress.value.completed
  progress.value.updatedAt = new Date().toISOString()
}

const handlePrint = async (mode: 'current' | 'all') => {
  if (!process.client) {
    return
  }

  printMode.value = mode
  renderAllBlocks.value = mode === 'all'
  await nextTick()
  window.print()
}

const resetPrintState = () => {
  printMode.value = 'current'
  renderAllBlocks.value = false
}

onMounted(() => {
  if (!process.client) {
    return
  }

  window.addEventListener('afterprint', resetPrintState)
})

onBeforeUnmount(() => {
  if (!process.client) {
    return
  }

  window.removeEventListener('afterprint', resetPrintState)
})

useHead(() => {
  if (!lesson.value) {
    return {
      title: `Lesson ${normalizedCode.value}`,
    }
  }

  return {
    title: `${lesson.value.code} · ${lesson.value.title}`,
    meta: [
      {
        name: 'description',
        content: lesson.value.summary ?? lesson.value.title,
      },
    ],
  }
})

function formatTimestamp(value: string) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
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

function resolveUrl(url?: string | null) {
  if (!url) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(url)) {
    return url
  }

  if (!assetBase.value) {
    return url
  }

  const normalised = url.startsWith('/') ? url : `/${url}`
  return `${assetBase.value}${normalised}`
}

function renderRichTextToHtml(value: unknown): string | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(renderRichTextNode).join('')
  }

  if (typeof value === 'object') {
    return renderRichTextNode(value)
  }

  return null
}

function renderRichTextNode(node: any): string {
  if (!node) {
    return ''
  }

  if (typeof node === 'string') {
    return escapeHtml(node)
  }

  if (typeof node.text === 'string') {
    let text = escapeHtml(node.text)
    if (node.bold) {
      text = `<strong>${text}</strong>`
    }
    if (node.italic) {
      text = `<em>${text}</em>`
    }
    if (node.underline) {
      text = `<u>${text}</u>`
    }
    if (node.code) {
      text = `<code>${text}</code>`
    }
    return text
  }

  const children = Array.isArray(node.children)
    ? node.children.map((child: any) => renderRichTextNode(child)).join('')
    : ''

  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`
    case 'heading':
    case 'heading-one':
    case 'heading-1':
      return `<h1>${children}</h1>`
    case 'heading-two':
    case 'heading-2':
      return `<h2>${children}</h2>`
    case 'heading-three':
    case 'heading-3':
      return `<h3>${children}</h3>`
    case 'heading-four':
    case 'heading-4':
      return `<h4>${children}</h4>`
    case 'heading-five':
    case 'heading-5':
      return `<h5>${children}</h5>`
    case 'heading-six':
    case 'heading-6':
      return `<h6>${children}</h6>`
    case 'quote':
      return `<blockquote>${children}</blockquote>`
    case 'code':
      return `<pre><code>${children}</code></pre>`
    case 'list':
    case 'list-unordered':
    case 'bulleted-list':
      return `<ul>${children}</ul>`
    case 'list-ordered':
    case 'numbered-list':
    case 'ordered-list':
      return `<ol>${children}</ol>`
    case 'list-item':
      return `<li>${children}</li>`
    case 'link': {
      const href = resolveUrl(node.url ?? node.href ?? '#')
      return `<a href="${href}" target="_blank" rel="noopener">${children}</a>`
    }
    case 'image': {
      const src = resolveUrl(node?.image?.url ?? node?.url ?? node?.src)
      const alt = escapeHtml(node?.image?.alternativeText ?? node?.alt ?? '')
      return src ? `<img src="${src}" alt="${alt}" />` : ''
    }
    default:
      return children
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  .lesson-page {
    background: #fff !important;
    padding: 0 !important;
  }

  .lesson-page > div {
    max-width: 100% !important;
    padding: 0 !important;
  }

  [data-print-mode='current'] [data-difficulty-block] {
    display: none !important;
  }

  [data-print-mode='current'][data-visible-level='base'] [data-difficulty-block][data-level='base'],
  [data-print-mode='current'][data-visible-level='advance'] [data-difficulty-block][data-level='advance'],
  [data-print-mode='current'][data-visible-level='stretch'] [data-difficulty-block][data-level='stretch'],
  [data-print-mode='all'] [data-difficulty-block] {
    display: block !important;
  }

  .difficulty-section {
    page-break-inside: avoid;
  }

  .difficulty-section + .difficulty-section {
    page-break-before: always;
  }

  .print-page-break {
    page-break-before: always;
  }
}
</style>
