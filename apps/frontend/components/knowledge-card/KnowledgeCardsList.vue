<template>
  <div class="knowledge-cards-list">
    <!-- Loading State -->
    <div v-if="loading && !cards.length" class="space-y-4">
      <KnowledgeCardSkeleton v-for="i in skeletonCount" :key="i" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!cards.length"
      class="empty-state text-center py-16 px-4"
    >
      <div class="max-w-md mx-auto">
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
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
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

    <!-- Cards List -->
    <div v-else class="space-y-4">
      <TransitionGroup name="list">
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
    <div v-if="hasMore && !loading" class="mt-6 text-center">
      <button
        class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="$emit('load-more')"
      >
        Load More
      </button>
    </div>

    <!-- Loading More State -->
    <div v-if="loading && cards.length" class="mt-6">
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KnowledgeCard as KnowledgeCardType } from '~/types/cms'

withDefaults(
  defineProps<{
    cards: KnowledgeCardType[]
    loading?: boolean
    clickable?: boolean
    showMedia?: boolean
    showFooter?: boolean
    hasMore?: boolean
    skeletonCount?: number
    emptyTitle?: string
    emptyMessage?: string
  }>(),
  {
    loading: false,
    clickable: true,
    showMedia: true,
    showFooter: true,
    hasMore: false,
    skeletonCount: 3,
    emptyTitle: 'No knowledge cards found',
    emptyMessage: 'Try adjusting your filters or search query to find what you\'re looking for.',
  }
)

const emit = defineEmits<{
  (e: 'card-click', card: KnowledgeCardType): void
  (e: 'show-qr', card: KnowledgeCardType): void
  (e: 'share', card: KnowledgeCardType): void
  (e: 'load-more'): void
}>()

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
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
