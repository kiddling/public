<template>
  <section
    class="relative flex flex-col items-center gap-6 rounded-3xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/60"
    aria-label="Spiral course progress"
  >
    <div class="flex w-full items-center justify-between">
      <div>
        <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">Three-loop spiral</p>
        <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Learning progression</h2>
      </div>
      <span class="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-200">
        {{ progressSummary.completed }}/{{ progressSummary.total }} complete
      </span>
    </div>

    <div class="relative w-full max-w-[360px]">
      <svg
        class="h-auto w-full"
        viewBox="0 0 360 360"
        role="presentation"
        aria-hidden="true"
      >
        <g v-for="loop in loops" :key="loop.index">
          <circle
            :cx="center"
            :cy="center"
            :r="loop.radius"
            :stroke="loop.stroke"
            fill="none"
            stroke-width="1.5"
            stroke-dasharray="6 6"
            class="transition-colors"
          />
        </g>

        <g v-for="node in lessonNodes" :key="node.lesson.code" class="transition-transform">
          <circle
            :cx="node.x"
            :cy="node.y"
            :r="node.isActive ? 16 : 12"
            :class="node.circleClass"
            class="transition-all duration-300 ease-out"
          />
          <circle
            v-if="node.isActive"
            :cx="node.x"
            :cy="node.y"
            r="22"
            class="fill-primary-500/10 stroke-primary-500/40"
            stroke-width="2"
          />
        </g>
      </svg>

      <ul class="pointer-events-none absolute inset-0">
        <li
          v-for="node in lessonNodes"
          :key="node.lesson.code"
          class="group absolute"
          :style="{ left: `${node.x}px`, top: `${node.y}px` }"
        >
          <button
            type="button"
            class="pointer-events-auto flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-gray-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-200"
            :class="node.buttonClass"
            :aria-current="node.isActive ? 'true' : undefined"
            :aria-label="`Lesson ${node.lesson.code}: ${node.lesson.title}`"
            @click="() => handleSelect(node.lesson)"
            @keydown.enter.prevent="handleSelect(node.lesson)"
            @keydown.space.prevent="handleSelect(node.lesson)"
          >
            <span>{{ node.lesson.code }}</span>
            <span class="text-[11px] font-normal opacity-80">{{ node.lesson.title }}</span>
          </button>
        </li>
      </ul>
    </div>

    <p class="text-center text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
      {{ statusMessage }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCourseNavigationStore } from '~/stores/courseNavigation'
import { useCourseProgressStore } from '~/stores/courseProgress'
import type { CourseNavigationLesson } from '~/types/navigation'

const navigationStore = useCourseNavigationStore()
const progressStore = useCourseProgressStore()
const router = useRouter()

const loopsCount = 3
const baseRadius = 70
const radiusStep = 45
const center = 180

const lessons = computed(() => navigationStore.flattenedLessons.value)
const activeLessonCode = computed(() => navigationStore.state.activeLessonCode)
const progressSummary = computed(() => progressStore.progressSummary.value)

const completedCodes = computed(() =>
  new Set(
    lessons.value
      .map((lesson) => (progressStore.getRecord(lesson.code)?.completed ? lesson.code : null))
      .filter(Boolean) as string[]
  )
)

const loops = computed(() =>
  Array.from({ length: loopsCount }, (_, index) => ({
    index,
    radius: baseRadius + index * radiusStep,
    stroke: index === 0 ? '#dbeafe' : index === 1 ? '#e0f2f1' : '#fce7f3',
  }))
)

const lessonNodes = computed(() => {
  const total = lessons.value.length
  if (!total) {
    return [] as Array<{
      lesson: CourseNavigationLesson
      x: number
      y: number
      isActive: boolean
      circleClass: string
      buttonClass: string
    }>
  }

  const perLoop = Math.max(1, Math.ceil(total / loopsCount))
  const step = (2 * Math.PI) / perLoop

  return lessons.value.map((lesson, index) => {
    const loopIndex = Math.min(loopsCount - 1, Math.floor(index / perLoop))
    const position = index % perLoop
    const radius = baseRadius + loopIndex * radiusStep
    const angle = step * position - Math.PI / 2
    const x = center + radius * Math.cos(angle)
    const y = center + radius * Math.sin(angle)

    const isActive = activeLessonCode.value === lesson.code
    const isCompleted = completedCodes.value.has(lesson.code)

    const circleClass = [
      'fill-white stroke-2',
      isCompleted ? 'stroke-emerald-400 dark:stroke-emerald-500' : 'stroke-gray-300 dark:stroke-gray-600',
      isActive ? 'fill-primary-500/80' : 'fill-white',
    ].join(' ')

    const buttonClass = [
      isActive
        ? 'bg-primary-500/10 text-primary-700 dark:bg-primary-500/20 dark:text-primary-100'
        : 'bg-white/80 text-gray-600 dark:bg-gray-900/80 dark:text-gray-200',
      isCompleted ? 'ring-1 ring-emerald-300 dark:ring-emerald-500/60' : '',
    ].join(' ')

    return {
      lesson,
      x,
      y,
      isActive,
      circleClass,
      buttonClass,
    }
  })
})

const statusMessage = computed(() => {
  if (!lessons.value.length) {
    return 'Spiral navigation available when lessons are loaded.'
  }
  const active = lessons.value.find((lesson) => lesson.code === activeLessonCode.value)
  if (!active) {
    return 'Select a lesson to focus within the spiral.'
  }
  const record = progressStore.getRecord(active.code)
  const status = record?.completed ? 'completed' : record?.viewed ? 'in progress' : 'not started'
  return `${active.code} · ${active.title} is ${status}.`
})

const handleSelect = async (lesson: CourseNavigationLesson) => {
  await router.push({ path: `/lessons/${lesson.code}` }).catch(() => {})
}
</script>
