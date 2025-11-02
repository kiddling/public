<template>
  <aside class="space-y-8">
    <ProgressTracker class="no-print" :current-lesson-code="lessonCode" />

    <section
      v-if="knowledgeCards.length"
      class="rounded-2xl bg-white/95 p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        知识卡片 Knowledge Cards
      </h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <article
          v-for="card in knowledgeCards"
          :key="card.id"
          class="hover:border-primary-200 dark:hover:border-primary-400/50 flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition dark:border-gray-800 dark:bg-gray-900/70"
        >
          <NuxtImg
            v-if="card.image?.url"
            :src="card.image.url"
            :alt="card.image.alternativeText ?? card.title ?? '知识卡片图片 Knowledge card image'"
            class="h-32 w-full object-cover"
            loading="lazy"
            preset="thumbnail"
            sizes="sm:200px md:200px"
          />
          <div class="flex flex-1 flex-col gap-2 p-4">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ card.title }}</h3>
            <p
              v-if="card.summary || card.description"
              class="text-xs text-gray-600 dark:text-gray-300"
            >
              {{ card.summary ?? card.description }}
            </p>
            <div class="mt-auto pt-2">
              <a
                v-if="card.url"
                :href="card.url"
                target="_blank"
                rel="noopener"
                class="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 inline-flex items-center gap-1 text-xs font-semibold"
              >
                探索 Explore
                <Icon name="i-heroicons-arrow-top-right-on-square" class="h-3 w-3" />
              </a>
              <span v-else class="text-xs text-gray-400 dark:text-gray-500">No external link</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section
      v-if="resources.length"
      class="rounded-2xl bg-white/95 p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">资源 Resources</h2>
      <ul class="mt-4 space-y-4">
        <li
          v-for="resource in resources"
          :key="resource.id"
          class="hover:border-primary-200 dark:hover:border-primary-400/50 flex items-start gap-4 rounded-xl border border-gray-100 p-4 transition dark:border-gray-800"
        >
          <NuxtImg
            v-if="resource.qrCodeUrl"
            :src="resource.qrCodeUrl"
            alt="二维码 QR code"
            class="mt-1 h-16 w-16 rounded-lg border border-gray-200 object-contain dark:border-gray-700"
            loading="lazy"
            width="64"
            height="64"
          />
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {{ resource.title }}
            </p>
            <p v-if="resource.description" class="mt-1 text-xs text-gray-600 dark:text-gray-300">
              {{ resource.description }}
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <a
                :href="resource.url"
                target="_blank"
                rel="noopener"
                class="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 inline-flex items-center gap-1 text-xs font-semibold"
              >
                打开资源 Open resource
                <Icon name="i-heroicons-arrow-top-right-on-square" class="h-3 w-3" />
              </a>
              <span
                v-if="resource.type"
                class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {{ resource.type }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { LessonKnowledgeCard, LessonResource } from '~/types/lesson'
import ProgressTracker from '~/components/navigation/ProgressTracker.vue'

defineProps<{
  lessonCode: string
  knowledgeCards: LessonKnowledgeCard[]
  resources: LessonResource[]
}>()
</script>
