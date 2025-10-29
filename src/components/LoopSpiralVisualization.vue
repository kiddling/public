<template>
  <div class="spiral-visualization">
    <h3 class="spiral-title">
      Course Structure
    </h3>
    <svg
      class="spiral-svg"
      :viewBox="`0 0 ${width} ${height}`"
      role="img"
      aria-label="Three-loop spiral course visualization"
    >
      <defs>
        <linearGradient
          id="loop1Gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            style="stop-color:var(--color-loop-1);stop-opacity:0.3"
          />
          <stop
            offset="100%"
            style="stop-color:var(--color-loop-1);stop-opacity:1"
          />
        </linearGradient>
        <linearGradient
          id="loop2Gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            style="stop-color:var(--color-loop-2);stop-opacity:0.3"
          />
          <stop
            offset="100%"
            style="stop-color:var(--color-loop-2);stop-opacity:1"
          />
        </linearGradient>
        <linearGradient
          id="loop3Gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            style="stop-color:var(--color-loop-3);stop-opacity:0.3"
          />
          <stop
            offset="100%"
            style="stop-color:var(--color-loop-3);stop-opacity:1"
          />
        </linearGradient>
      </defs>

      <g
        v-for="(loop, loopIndex) in spiralLoops"
        :key="loopIndex"
      >
        <path
          :d="loop.path"
          :stroke="loop.gradient"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
        
        <g
          v-for="lesson in loop.lessons"
          :key="lesson.id"
        >
          <circle
            :cx="lesson.x"
            :cy="lesson.y"
            :r="getLessonRadius(lesson)"
            :fill="getLessonFill(lesson)"
            :stroke="loop.color"
            :stroke-width="isCurrentLesson(lesson) ? 3 : 2"
            :class="{ 
              'lesson-node': true,
              'current': isCurrentLesson(lesson),
              'completed': isLessonCompleted(lesson)
            }"
            role="button"
            :aria-label="`${lesson.title} - ${isLessonCompleted(lesson) ? 'Completed' : 'Not completed'}`"
            tabindex="0"
            @click="handleLessonClick(lesson)"
            @keydown.enter="handleLessonClick(lesson)"
          />
          
          <text
            v-if="isCurrentLesson(lesson) || isLessonCompleted(lesson)"
            :x="lesson.x"
            :y="lesson.y"
            text-anchor="middle"
            dominant-baseline="middle"
            class="lesson-icon"
            :fill="loop.color"
          >
            {{ isLessonCompleted(lesson) ? '✓' : '●' }}
          </text>
        </g>
      </g>

      <text
        :x="centerX"
        :y="centerY"
        text-anchor="middle"
        dominant-baseline="middle"
        class="center-text"
      >
        {{ progressStore.completionPercentage }}%
      </text>
    </svg>

    <div class="spiral-legend">
      <div class="legend-item">
        <div
          class="legend-color"
          :style="{ backgroundColor: 'var(--color-loop-1)' }"
        />
        <span>Loop 1</span>
      </div>
      <div class="legend-item">
        <div
          class="legend-color"
          :style="{ backgroundColor: 'var(--color-loop-2)' }"
        />
        <span>Loop 2</span>
      </div>
      <div class="legend-item">
        <div
          class="legend-color"
          :style="{ backgroundColor: 'var(--color-loop-3)' }"
        />
        <span>Loop 3</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAllLessons } from '@/services/strapiService'
import { useProgressStore } from '@/stores/progressStore'

const router = useRouter()
const route = useRoute()
const progressStore = useProgressStore()

const width = 400
const height = 400
const centerX = width / 2
const centerY = height / 2

const allLessons = getAllLessons()

const spiralLoops = computed(() => {
  const loops = [
    { id: 1, color: 'var(--color-loop-1)', gradient: 'url(#loop1Gradient)', lessons: [] },
    { id: 2, color: 'var(--color-loop-2)', gradient: 'url(#loop2Gradient)', lessons: [] },
    { id: 3, color: 'var(--color-loop-3)', gradient: 'url(#loop3Gradient)', lessons: [] }
  ]

  allLessons.forEach(lesson => {
    const loopIndex = lesson.loopId - 1
    if (loopIndex >= 0 && loopIndex < 3) {
      loops[loopIndex].lessons.push(lesson)
    }
  })

  loops.forEach((loop, loopIndex) => {
    const radius = 60 + (loopIndex * 50)
    const angleOffset = loopIndex * Math.PI / 6
    const lessonCount = loop.lessons.length
    
    const pathPoints = []
    loop.lessons.forEach((lesson, index) => {
      const angle = angleOffset + (index / lessonCount) * Math.PI * 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      lesson.x = x
      lesson.y = y
      pathPoints.push({ x, y })
    })

    if (pathPoints.length > 0) {
      let pathData = `M ${pathPoints[0].x} ${pathPoints[0].y}`
      for (let i = 1; i < pathPoints.length; i++) {
        pathData += ` L ${pathPoints[i].x} ${pathPoints[i].y}`
      }
      pathData += ` L ${pathPoints[0].x} ${pathPoints[0].y}`
      loop.path = pathData
    }
  })

  return loops
})

function isCurrentLesson(lesson) {
  return route.params.slug === lesson.slug
}

function isLessonCompleted(lesson) {
  return progressStore.isLessonComplete(lesson.id)
}

function getLessonRadius(lesson) {
  if (isCurrentLesson(lesson)) return 12
  if (isLessonCompleted(lesson)) return 10
  return 8
}

function getLessonFill(lesson) {
  if (isLessonCompleted(lesson)) return 'var(--color-success)'
  if (isCurrentLesson(lesson)) return 'var(--color-background)'
  return 'var(--color-background)'
}

function handleLessonClick(lesson) {
  router.push(`/lesson/${lesson.slug}`)
}
</script>

<style scoped>
.spiral-visualization {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.spiral-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.spiral-svg {
  width: 100%;
  height: auto;
  max-width: 400px;
  margin: 0 auto;
  display: block;
}

.lesson-node {
  cursor: pointer;
  transition: all 0.2s ease;
}

.lesson-node:hover {
  filter: brightness(1.1);
  transform: scale(1.1);
}

.lesson-node:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
}

.lesson-node.current {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.lesson-icon {
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
}

.center-text {
  font-size: 24px;
  font-weight: 700;
  fill: var(--color-text);
  pointer-events: none;
}

.spiral-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}
</style>
