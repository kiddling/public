<template>
  <div
    v-if="lesson"
    class="lesson-view"
  >
    <article
      ref="lessonContentRef"
      class="lesson-content"
      @scroll="handleScroll"
    >
      <header class="lesson-header">
        <div class="lesson-meta">
          <span
            class="lesson-code"
            :style="{ color: lesson.color }"
          >
            {{ lesson.code }}
          </span>
          <span class="lesson-part">{{ lesson.partName }}</span>
        </div>
        <h1 class="lesson-title">
          {{ lesson.title }}
        </h1>
        <p
          v-if="lessonContent.description"
          class="lesson-description"
        >
          {{ lessonContent.description }}
        </p>
      </header>

      <div class="lesson-body">
        <p class="lesson-intro">
          Lesson {{ lesson.order }} of {{ totalLessons }} in {{ lesson.loopName }}, {{ lesson.partName }}
        </p>

        <DifficultyToggle @difficulty-changed="handleDifficultyChange" />

        <DifficultyContent
          v-if="currentDifficultyContent"
          :content="currentDifficultyContent"
        />

        <MediaDisplay
          v-if="lessonContent.media && lessonContent.media.length > 0"
          :media="lessonContent.media"
        />

        <AttachmentsList
          v-if="lessonContent.attachments && lessonContent.attachments.length > 0"
          :attachments="lessonContent.attachments"
        />

        <RelatedResources
          v-if="lessonContent.relatedResources && lessonContent.relatedResources.length > 0"
          :resources="lessonContent.relatedResources"
        />

        <div
          v-if="showAutoCompleteNotification"
          class="auto-complete-notification"
        >
          <div class="notification-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div class="notification-text">
              <strong>Great job!</strong> You've reached the end of this lesson.
            </div>
            <button
              class="notification-close"
              aria-label="Dismiss notification"
              @click="dismissAutoComplete"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <LessonCompletion :lesson-id="lesson.id" />

      <nav
        class="lesson-navigation"
        aria-label="Lesson navigation"
      >
        <RouterLink
          v-if="previousLesson"
          :to="`/lesson/${previousLesson.slug}`"
          class="nav-button prev"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <div class="nav-button-content">
            <span class="nav-button-label">Previous</span>
            <span class="nav-button-title">{{ previousLesson.title }}</span>
          </div>
        </RouterLink>

        <RouterLink
          v-if="nextLesson"
          :to="`/lesson/${nextLesson.slug}`"
          class="nav-button next"
        >
          <div class="nav-button-content">
            <span class="nav-button-label">Next</span>
            <span class="nav-button-title">{{ nextLesson.title }}</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </RouterLink>
      </nav>
    </article>

    <aside class="lesson-aside">
      <LoopSpiralVisualization />
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { getAllLessons, getLessonBySlug, getLessonContent } from '@/services/strapiService'
import { useProgressStore } from '@/stores/progressStore'
import LessonCompletion from '@/components/LessonCompletion.vue'
import LoopSpiralVisualization from '@/components/LoopSpiralVisualization.vue'
import DifficultyToggle from '@/components/DifficultyToggle.vue'
import DifficultyContent from '@/components/DifficultyContent.vue'
import MediaDisplay from '@/components/MediaDisplay.vue'
import AttachmentsList from '@/components/AttachmentsList.vue'
import RelatedResources from '@/components/RelatedResources.vue'

const route = useRoute()
const progressStore = useProgressStore()
const allLessons = getAllLessons()

const lessonContentRef = ref(null)
const currentDifficulty = ref('base')
const showAutoCompleteNotification = ref(false)
const hasReachedEnd = ref(false)

const lesson = computed(() => {
  return getLessonBySlug(route.params.slug)
})

const lessonContent = computed(() => {
  if (!lesson.value) return { difficultyBlocks: {} }
  return getLessonContent(lesson.value.id)
})

const currentDifficultyContent = computed(() => {
  return lessonContent.value.difficultyBlocks?.[currentDifficulty.value]
})

const totalLessons = computed(() => allLessons.length)

const currentLessonIndex = computed(() => {
  return allLessons.findIndex(l => l.slug === route.params.slug)
})

const previousLesson = computed(() => {
  if (currentLessonIndex.value > 0) {
    return allLessons[currentLessonIndex.value - 1]
  }
  return null
})

const nextLesson = computed(() => {
  if (currentLessonIndex.value < allLessons.length - 1) {
    return allLessons[currentLessonIndex.value + 1]
  }
  return null
})

const handleDifficultyChange = (level) => {
  currentDifficulty.value = level
}

const handleScroll = () => {
  if (!lessonContentRef.value || hasReachedEnd.value) return
  
  const element = lessonContentRef.value
  const scrollTop = element.scrollTop
  const scrollHeight = element.scrollHeight
  const clientHeight = element.clientHeight
  
  // Check if user has scrolled to near the end (within 100px)
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    markLessonAsReached()
  }
}

const markLessonAsReached = () => {
  if (!lesson.value || hasReachedEnd.value) return
  
  hasReachedEnd.value = true
  
  // Auto-mark as complete if not already complete
  if (!progressStore.isLessonComplete(lesson.value.id)) {
    progressStore.markLessonComplete(lesson.value.id)
    showAutoCompleteNotification.value = true
    
    // Auto-dismiss notification after 5 seconds
    setTimeout(() => {
      showAutoCompleteNotification.value = false
    }, 5000)
  }
}

const dismissAutoComplete = () => {
  showAutoCompleteNotification.value = false
}

// Reset scroll detection when lesson changes
watch(() => route.params.slug, () => {
  hasReachedEnd.value = false
  showAutoCompleteNotification.value = false
  
  // Scroll to top of content
  if (lessonContentRef.value) {
    lessonContentRef.value.scrollTop = 0
  }
})

// Set up scroll listener on mount
onMounted(() => {
  if (lessonContentRef.value) {
    lessonContentRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (lessonContentRef.value) {
    lessonContentRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.lesson-view {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .lesson-view {
    grid-template-columns: 2fr 1fr;
  }
}

.lesson-content {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
}

.lesson-header {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
}

.lesson-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.lesson-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-background);
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.lesson-part {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.lesson-title {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
}

.lesson-body {
  margin-bottom: 2rem;
}

.lesson-intro {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--color-background);
  border-left: 4px solid var(--color-loop-1);
  border-radius: 6px;
}

.content-section {
  margin-bottom: 2rem;
}

.content-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.content-section p {
  line-height: 1.8;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.lesson-navigation {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.nav-button {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-button:hover {
  background-color: var(--color-surface);
  border-color: var(--color-loop-1);
  transform: translateY(-2px);
}

.nav-button:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
}

.nav-button.prev {
  justify-content: flex-start;
}

.nav-button.next {
  justify-content: flex-end;
}

.nav-button-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-button.prev .nav-button-content {
  align-items: flex-start;
}

.nav-button.next .nav-button-content {
  align-items: flex-end;
}

.nav-button-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  font-weight: 600;
}

.nav-button-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.lesson-description {
  font-size: 1.0625rem;
  color: var(--color-text-muted);
  line-height: 1.8;
  margin-top: 1rem;
}

.lesson-aside {
  position: sticky;
  top: calc(var(--header-height) + 2rem);
  height: fit-content;
}

.auto-complete-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background-color: var(--color-success);
  color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 400px;
}

.notification-content svg {
  flex-shrink: 0;
}

.notification-text {
  flex: 1;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.notification-text strong {
  display: block;
  margin-bottom: 0.25rem;
}

.notification-close {
  flex-shrink: 0;
  color: white;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  padding: 0.25rem;
  margin: -0.25rem;
}

.notification-close:hover {
  opacity: 1;
}

@media (max-width: 1023px) {
  .lesson-aside {
    position: static;
  }

  .lesson-title {
    font-size: 1.5rem;
  }

  .lesson-navigation {
    flex-direction: column;
  }

  .auto-complete-notification {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}

@media print {
  .lesson-view {
    display: block;
    max-width: 100%;
  }

  .lesson-content {
    border: none;
    padding: 0;
    background: none;
  }

  .lesson-header {
    page-break-after: avoid;
  }

  .lesson-code {
    border: 1px solid #000;
    background: none;
  }

  .lesson-title {
    font-size: 20pt;
    margin-top: 0.5rem;
  }

  .lesson-description {
    font-size: 11pt;
  }

  .lesson-intro {
    font-size: 10pt;
    border-left: 2pt solid #000;
    background: none;
  }

  .lesson-aside {
    display: none;
  }

  .lesson-navigation {
    display: none;
  }

  .auto-complete-notification {
    display: none;
  }

  /* Print all difficulty levels or only selected one based on content */
  .difficulty-content {
    page-break-inside: avoid;
  }

  /* Ensure proper page breaks */
  h2, h3 {
    page-break-after: avoid;
  }

  .content-section {
    page-break-inside: avoid;
  }
}
</style>
