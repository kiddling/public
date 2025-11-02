<template>
  <div class="home-view">
    <header class="hero">
      <h1 class="hero-title">
        Welcome to the Course
      </h1>
      <p class="hero-description">
        Explore our unique three-loop spiral curriculum designed for non-linear learning.
        Navigate freely through 12 lessons organized across 3 interconnected loops.
      </p>
    </header>

    <div class="content-grid">
      <section class="section">
        <LoopSpiralVisualization />
      </section>

      <section class="section">
        <h2 class="section-title">
          Course Overview
        </h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">
              {{ progressStore.totalLessons }}
            </div>
            <div class="stat-label">
              Total Lessons
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              {{ progressStore.completedCount }}
            </div>
            <div class="stat-label">
              Completed
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              {{ progressStore.completionPercentage }}%
            </div>
            <div class="stat-label">
              Progress
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">
          Getting Started
        </h2>
        <div class="features">
          <div class="feature">
            <div class="feature-icon">
              📚
            </div>
            <h3 class="feature-title">
              Non-Linear Learning
            </h3>
            <p class="feature-description">
              Access any lesson at any time. Our course structure supports your learning journey, not restricts it.
            </p>
          </div>
          <div class="feature">
            <div class="feature-icon">
              🔄
            </div>
            <h3 class="feature-title">
              Three-Loop System
            </h3>
            <p class="feature-description">
              Lessons are organized in loops that build on each other while allowing flexible progression.
            </p>
          </div>
          <div class="feature">
            <div class="feature-icon">
              ✅
            </div>
            <h3 class="feature-title">
              Track Progress
            </h3>
            <p class="feature-description">
              Mark lessons as complete and track your progress. All data is saved locally on your device.
            </p>
          </div>
          <div class="feature">
            <div class="feature-icon">
              🔍
            </div>
            <h3 class="feature-title">
              Quick Search
            </h3>
            <p class="feature-description">
              Use the sidebar search to quickly find and jump to any lesson in the course.
            </p>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">
          Quick Start
        </h2>
        <div class="quick-links">
          <RouterLink
            v-for="lesson in firstLessons"
            :key="lesson.id"
            :to="`/lesson/${lesson.slug}`"
            class="quick-link"
            :style="{ borderLeftColor: lesson.color }"
          >
            <span class="quick-link-code">{{ lesson.code }}</span>
            <span class="quick-link-title">{{ lesson.title }}</span>
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
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getAllLessons } from '@/services/strapiService'
import { useProgressStore } from '@/stores/progressStore'
import LoopSpiralVisualization from '@/components/LoopSpiralVisualization.vue'

const progressStore = useProgressStore()
const allLessons = getAllLessons()

const firstLessons = computed(() => {
  return allLessons.slice(0, 3)
})
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, var(--color-loop-1), var(--color-loop-2), var(--color-loop-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

.content-grid {
  display: grid;
  gap: 2rem;
}

.section {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
  background-color: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-loop-1);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature {
  padding: 1.5rem;
  background-color: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-description {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-left: 4px solid;
  border-radius: 8px;
  transition: all 0.2s;
}

.quick-link:hover {
  background-color: var(--color-surface);
  transform: translateX(4px);
}

.quick-link:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
}

.quick-link-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 3rem;
}

.quick-link-title {
  flex: 1;
  font-weight: 500;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .section {
    padding: 1.5rem;
  }
}
</style>
