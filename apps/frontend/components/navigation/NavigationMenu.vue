<template>
  <div class="flex flex-1 flex-col gap-4">
    <div v-if="isLoading" class="space-y-3" aria-live="polite">
      <div class="h-3 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-3 w-3/4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div class="h-3 w-1/2 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
    </div>

    <p
      v-else-if="!parts.length"
      class="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
      role="status"
    >
      Course navigation will appear here once lessons are available.
    </p>

    <ul v-else role="list" class="space-y-4">
      <li v-for="(part, index) in parts" :key="part.id" :data-test="`nav-part-${part.id}`">
        <div
          class="rounded-xl border border-gray-200 bg-white/70 shadow-sm backdrop-blur transition dark:border-gray-800 dark:bg-gray-900/70"
          :data-active-part="part.type === activePartType ? 'true' : undefined"
          :style="{ '--part-accent': part.color || defaultAccentColor }"
        >
          <button
            type="button"
            class="focus-visible:ring-primary-500 flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
            :aria-expanded="String(isPartExpanded(part.id))"
            :aria-controls="sectionContentId(part.id)"
            @click="togglePart(part.id)"
          >
            <span
              class="flex items-center gap-3 text-sm font-semibold text-gray-900 dark:text-gray-50"
            >
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                :style="{ backgroundColor: part.color || defaultAccentColor }"
              >
                {{ index + 1 }}
              </span>
              <span class="flex flex-col">
                <span>{{ part.title }}</span>
                <span
                  v-if="part.description"
                  class="text-xs font-normal text-gray-500 dark:text-gray-400"
                >
                  {{ part.description }}
                </span>
              </span>
            </span>
            <Icon
              name="i-heroicons-chevron-down-16-solid"
              class="h-5 w-5 text-gray-500 transition-transform duration-200 dark:text-gray-400"
              :class="{ 'rotate-180': isPartExpanded(part.id) }"
            />
          </button>

          <Transition name="nav-collapse">
            <div
              v-show="isPartExpanded(part.id)"
              :id="sectionContentId(part.id)"
              class="nav-collapse-container border-t border-gray-100 px-4 py-3 dark:border-gray-800"
              role="group"
              :aria-label="`${part.title} lessons`"
            >
              <div class="space-y-4">
                <div
                  v-for="loop in part.loops"
                  :key="loop.id"
                  class="space-y-2"
                  :data-test="`nav-loop-${loop.id}`"
                >
                  <p
                    class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {{ loop.title }}
                  </p>
                  <ul role="list" class="space-y-1.5">
                    <li
                      v-for="lesson in loop.lessons"
                      :key="lesson.code"
                      :data-test="`nav-lesson-${lesson.code}`"
                    >
                      <NuxtLink
                        :to="lessonRoute(lesson)"
                        class="lesson-link focus-visible:ring-primary-500 group flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                        :data-active="isActiveLesson(lesson) ? 'true' : undefined"
                        :aria-current="isActiveLesson(lesson) ? 'page' : undefined"
                        :style="isActiveLesson(lesson) ? activeLessonStyle(part.color) : undefined"
                        @click="handleLessonClick(lesson)"
                      >
                        <div class="flex min-w-0 flex-col gap-0.5">
                          <span
                            class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 transition group-data-[active=true]:text-[color:var(--lesson-active-color)] dark:text-gray-400"
                          >
                            {{ lesson.code }}
                          </span>
                          <span
                            class="truncate text-sm font-medium text-gray-900 transition group-data-[active=true]:text-[color:var(--lesson-active-color)] dark:text-gray-100"
                          >
                            {{ lesson.title }}
                          </span>
                        </div>
                        <Icon
                          name="i-heroicons-arrow-right-16-solid"
                          class="h-4 w-4 text-gray-400 opacity-0 transition group-hover:opacity-100 group-data-[active=true]:text-[color:var(--lesson-active-color)] group-data-[active=true]:opacity-100 dark:text-gray-500"
                          aria-hidden="true"
                        />
                      </NuxtLink>
                    </li>
                  </ul>
                </div>

                <div v-if="getStandaloneLessons(part).length" class="space-y-2">
                  <p
                    class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Additional Lessons
                  </p>
                  <ul role="list" class="space-y-1.5">
                    <li
                      v-for="lesson in getStandaloneLessons(part)"
                      :key="lesson.code"
                      :data-test="`nav-lesson-${lesson.code}`"
                    >
                      <NuxtLink
                        :to="lessonRoute(lesson)"
                        class="lesson-link focus-visible:ring-primary-500 group flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                        :data-active="isActiveLesson(lesson) ? 'true' : undefined"
                        :aria-current="isActiveLesson(lesson) ? 'page' : undefined"
                        :style="isActiveLesson(lesson) ? activeLessonStyle(part.color) : undefined"
                        @click="handleLessonClick(lesson)"
                      >
                        <div class="flex min-w-0 flex-col gap-0.5">
                          <span
                            class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 transition group-data-[active=true]:text-[color:var(--lesson-active-color)] dark:text-gray-400"
                          >
                            {{ lesson.code }}
                          </span>
                          <span
                            class="truncate text-sm font-medium text-gray-900 transition group-data-[active=true]:text-[color:var(--lesson-active-color)] dark:text-gray-100"
                          >
                            {{ lesson.title }}
                          </span>
                        </div>
                        <Icon
                          name="i-heroicons-arrow-right-16-solid"
                          class="h-4 w-4 text-gray-400 opacity-0 transition group-hover:opacity-100 group-data-[active=true]:text-[color:var(--lesson-active-color)] group-data-[active=true]:opacity-100 dark:text-gray-500"
                          aria-hidden="true"
                        />
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNavigationStore } from '~/stores/navigation'
import type { NavigationLesson, NavigationPart } from '~/types/navigation'

const emit = defineEmits<{
  (e: 'navigate', code: string): void
}>()

const defaultAccentColor = '#0ea5e9'

const navigationStore = useNavigationStore()

const parts = computed(() => navigationStore.courseStructure?.parts ?? [])
const isLoading = computed(() => navigationStore.isLoading)
const activeLessonCode = computed(() => navigationStore.currentLesson?.code ?? null)
const activePartType = computed(() => navigationStore.activePart ?? null)

const expandedParts = ref<Set<string>>(new Set())

const standaloneLessonsByPart = computed(() => {
  const map = new Map<string, NavigationLesson[]>()

  parts.value.forEach((part) => {
    map.set(
      part.id,
      part.lessons.filter((lesson) => !lesson.loopId)
    )
  })

  return map
})

watch(
  () => parts.value.map((part) => part.id),
  (ids) => {
    const current = expandedParts.value
    const next = new Set(current)
    let changed = false

    for (const id of ids) {
      if (!next.has(id)) {
        next.add(id)
        changed = true
      }
    }

    for (const existing of Array.from(next)) {
      if (!ids.includes(existing)) {
        next.delete(existing)
        changed = true
      }
    }

    if (changed || next.size !== current.size) {
      expandedParts.value = next
    }
  },
  { immediate: true }
)

watch(
  () => activePartType.value,
  (type) => {
    if (!type) {
      return
    }
    const part = parts.value.find((item) => item.type === type)
    if (part && !expandedParts.value.has(part.id)) {
      const next = new Set(expandedParts.value)
      next.add(part.id)
      expandedParts.value = next
    }
  }
)

function sectionContentId(partId: string): string {
  return `navigation-part-${partId}`
}

function isPartExpanded(partId: string): boolean {
  return expandedParts.value.has(partId)
}

function togglePart(partId: string): void {
  const next = new Set(expandedParts.value)
  if (next.has(partId)) {
    next.delete(partId)
  } else {
    next.add(partId)
  }
  expandedParts.value = next
}

function getStandaloneLessons(part: NavigationPart): NavigationLesson[] {
  return standaloneLessonsByPart.value.get(part.id) ?? []
}

function isActiveLesson(lesson: NavigationLesson): boolean {
  return activeLessonCode.value === lesson.code
}

function lessonRoute(lesson: NavigationLesson) {
  return {
    name: 'lessons-code',
    params: { code: lesson.code },
  }
}

function handleLessonClick(lesson: NavigationLesson) {
  emit('navigate', lesson.code)
}

function hexToRgba(hex: string, alpha: number): string | null {
  const match = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!match) {
    return null
  }
  let value = match[1]
  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('')
  }
  const numeric = Number.parseInt(value, 16)
  const r = (numeric >> 16) & 255
  const g = (numeric >> 8) & 255
  const b = numeric & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function activeLessonStyle(color?: string | null) {
  const base = color && typeof color === 'string' ? color : defaultAccentColor
  return {
    '--lesson-active-color': base,
    '--lesson-active-bg':
      hexToRgba(base, 0.12) ?? hexToRgba(defaultAccentColor, 0.12) ?? 'rgba(14, 165, 233, 0.12)',
    '--lesson-active-border':
      hexToRgba(base, 0.4) ?? hexToRgba(defaultAccentColor, 0.4) ?? 'rgba(14, 165, 233, 0.4)',
  }
}
</script>

<style scoped>
.nav-collapse-enter-active,
.nav-collapse-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
}

.nav-collapse-enter-from,
.nav-collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.nav-collapse-enter-to,
.nav-collapse-leave-from {
  max-height: 1000px;
  opacity: 1;
}

.nav-collapse-container {
  overflow: hidden;
}

.lesson-link[data-active='true'] {
  background-color: var(--lesson-active-bg);
  border-color: var(--lesson-active-border);
  color: var(--lesson-active-color);
}

.lesson-link[data-active='true'] .truncate {
  color: var(--lesson-active-color);
}

.lesson-link[data-active='true'] span {
  color: var(--lesson-active-color);
}
</style>
