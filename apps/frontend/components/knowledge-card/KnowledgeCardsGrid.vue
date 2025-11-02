<template>
  <div class="knowledge-cards-grid">
    <!-- Loading State -->
    <div v-if="loading && !cards.length" :class="gridClass">
      <KnowledgeCardSkeleton v-for="i in skeletonCount" :key="i" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!cards.length" class="empty-state px-4 py-16 text-center">
      <div class="mx-auto max-w-md">
        <svg
          class="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
          />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ emptyTitle }}
        </h3>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {{ emptyMessage }}
        </p>
        <div v-if="$slots['empty-action']" class="mt-6">
          <slot name="empty-action" />
        </div>
      </div>
    </div>

    <!-- Cards Grid -->
    <div v-else :class="gridClass">
      <TransitionGroup name="grid">
        <KnowledgeCard
          v-for="card in cards"
          :key="card.id"
          :card="card"
          :clickable="clickable"
          :show-media="showMedia"
          :show-footer="showFooter"
          @click="handleCardClick"
          @show-qr="handleShowQr(card)"
          @share="handleShare(card)"
        />
      </TransitionGroup>
    </div>

    <!-- Load More / Pagination -->
    <div v-if="hasMore && !loading" class="mt-8 text-center">
      <button
        class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-lg px-6 py-2 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
        @click="$emit('load-more')"
      >
        Load More
      </button>
    </div>

    <!-- Loading More State -->
    <div v-if="loading && cards.length" class="mt-8">
      <div class="flex justify-center">
        <div class="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KnowledgeCard as KnowledgeCardType } from '~/types/cms'

const props = withDefaults(
  defineProps<{
    cards: KnowledgeCardType[]
    loading?: boolean
    clickable?: boolean
    showMedia?: boolean
    showFooter?: boolean
    hasMore?: boolean
    skeletonCount?: number
    columns?: 1 | 2 | 3 | 4
    emptyTitle?: string
    emptyMessage?: string
  }>(),
  {
    loading: false,
    clickable: true,
    showMedia: true,
    showFooter: true,
    hasMore: false,
    skeletonCount: 6,
    columns: 3,
    emptyTitle: 'No knowledge cards found',
    emptyMessage: "Try adjusting your filters or search query to find what you're looking for.",
  }
)

const emit = defineEmits<{
  (e: 'card-click', card: KnowledgeCardType): void
  (e: 'show-qr', card: KnowledgeCardType): void
  (e: 'share', card: KnowledgeCardType): void
  (e: 'load-more'): void
}>()

const gridClass = computed(() => {
  const baseClass = 'grid gap-6'
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }
  return `${baseClass} ${columnClasses[props.columns]}`
})

function handleCardClick(card: KnowledgeCardType) {
  emit('card-click', card)
}

function handleShowQr(card: KnowledgeCardType) {
  emit('show-qr', card)
}

function handleShare(card: KnowledgeCardType) {
  emit('share', card)
}
</script>

<style scoped>
.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s ease;
}

.grid-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.grid-move {
  transition: transform 0.3s ease;
}

@media print {
  .knowledge-cards-grid {
    @apply grid-cols-2 gap-4;
  }
}
</style>
