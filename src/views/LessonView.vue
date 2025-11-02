<template>
  <div
    v-if="lesson"
    class="lesson-view"
  >
    <article class="lesson-content">
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
      </header>

      <div class="lesson-body">
        <p class="lesson-intro">
          This is lesson {{ lesson.order }} of {{ totalLessons }} in the course.
          You are in {{ lesson.loopName }}, {{ lesson.partName }}.
        </p>

        <div class="content-section">
          <h2>Lesson Content</h2>
          <p>
            This is a placeholder for the lesson content. In a real application, 
            this would be fetched from Strapi CMS and rendered here.
          </p>
          <p>
            The course uses a non-linear structure, allowing you to navigate freely
            between lessons. Use the sidebar to jump to any lesson, or use the
            navigation buttons below to move sequentially.
          </p>
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getAllLessons, getLessonBySlug } from '@/services/strapiService'
import LessonCompletion from '@/components/LessonCompletion.vue'
import LoopSpiralVisualization from '@/components/LoopSpiralVisualization.vue'

const route = useRoute()
const allLessons = getAllLessons()

const lesson = computed(() => {
  return getLessonBySlug(route.params.slug)
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

.lesson-aside {
  position: sticky;
  top: calc(var(--header-height) + 2rem);
  height: fit-content;
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
}
</style>
