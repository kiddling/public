<template>
  <div class="spiral-visualization" role="group" aria-label="Loop spiral visualization">
    <svg
      :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`"
      class="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="false"
    >
      <defs>
        <radialGradient :id="gradientId" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="rgba(59,130,246,0.08)" />
          <stop offset="100%" stop-color="rgba(59,130,246,0)" />
        </radialGradient>
      </defs>

      <circle :cx="center" :cy="center" :r="viewBoxSize / 2 - 8" fill="url(#gradientId)" />

      <path
        v-if="spiralPath"
        :d="spiralPath"
        class="spiral-path"
        fill="none"
        stroke="rgba(14,165,233,0.4)"
        stroke-width="1.4"
        stroke-dasharray="6 4"
      />

      <g v-for="loop in loopMeta" :key="`loop-${loop.index}`">
        <circle
          :cx="center"
          :cy="center"
          :r="loop.radius"
          class="loop-ring"
          :style="{ stroke: loop.color }"
        />
      </g>

      <g
        v-for="node in nodes"
        :key="node.lesson.code"
        class="spiral-node"
        role="button"
        tabindex="0"
        :aria-label="`${node.lesson.code} · ${node.lesson.title}`"
        :aria-current="node.state === 'current' ? 'true' : undefined"
        :data-state="node.state"
        :data-part="node.lesson.part"
        :transform="`translate(${node.x}, ${node.y})`"
        :style="{ '--node-color': node.color }"
        @click="emitSelect(node.lesson.code)"
        @keydown.enter.prevent="emitSelect(node.lesson.code)"
        @keydown.space.prevent="emitSelect(node.lesson.code)"
      >
        <title>{{ node.lesson.code }} · {{ node.lesson.title }}</title>
        <circle :r="nodeRadius" stroke-width="2" />
        <text
          v-if="showLessonCode"
          x="0"
          :y="compact ? 3 : 4"
          text-anchor="middle"
          class="lesson-code"
        >
          {{ node.lesson.code }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NavigationLesson, NavigationPartType } from '~/types/navigation'
import { NAVIGATION_PART_COLORS } from '~/types/navigation'

const props = defineProps<{
  lessons: NavigationLesson[]
  completedCodes?: string[] | Set<string>
  currentCode?: string | null
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', code: string): void
}>()

const fallbackColors = ['#2563EB', '#16A34A', '#F97316']

const gradientId = `spiral-gradient-${Math.random().toString(36).slice(2, 9)}`

const viewBoxSize = computed(() => (props.compact ? 240 : 320))
const center = computed(() => viewBoxSize.value / 2)

const radii = computed(() => {
  const outer = viewBoxSize.value / 2 - (props.compact ? 24 : 28)
  const gap = props.compact ? 28 : 32
  return [outer, outer - gap, outer - gap * 2].map((value) => Math.max(16, value))
})

const completedSet = computed(() => {
  if (props.completedCodes instanceof Set) {
    return new Set(Array.from(props.completedCodes).map((code) => code.toUpperCase()))
  }
  if (Array.isArray(props.completedCodes)) {
    return new Set(props.completedCodes.map((code) => code.toUpperCase()))
  }
  return new Set<string>()
})

const currentCode = computed(() => props.currentCode?.toUpperCase() ?? null)

const displayLessons = computed(() => props.lessons.slice(0, 12))

const loopIndexForPart: Record<NavigationPartType, number> = {
  foundation: 0,
  'core-blocks': 1,
  'extended-thinking': 2,
  appendices: 2,
}

const buckets = computed(() => {
  const groups: NavigationLesson[][] = [[], [], []]

  displayLessons.value.forEach((lesson) => {
    const mapped = loopIndexForPart[lesson.part]
    if (mapped != null) {
      groups[mapped].push(lesson)
      return
    }

    const smallestIndex = groups.reduce(
      (acc, group, index) => (group.length < groups[acc].length ? index : acc),
      0
    )
    groups[smallestIndex].push(lesson)
  })

  return groups
})

const loopMeta = computed(() =>
  buckets.value.map((lessons, index) => {
    const fallbackColor = fallbackColors[index] ?? fallbackColors[0]
    const firstLesson = lessons[0] ?? null
    const color = firstLesson
      ? (NAVIGATION_PART_COLORS[firstLesson.part] ?? fallbackColor)
      : fallbackColor
    const partType = firstLesson?.part ?? null
    return {
      index,
      lessons,
      color,
      partType,
      radius: radii.value[index] ?? radii.value[radii.value.length - 1] ?? 32,
    }
  })
)

const nodes = computed(() => {
  const all: Array<{
    lesson: NavigationLesson
    x: number
    y: number
    loopIndex: number
    color: string
    state: 'completed' | 'current' | 'upcoming'
  }> = []

  const centerValue = center.value

  loopMeta.value.forEach((loop, loopIndex) => {
    if (!loop.lessons.length) {
      return
    }

    const radius = loop.radius
    const step = (Math.PI * 2) / loop.lessons.length
    const offset = loopIndex * (Math.PI / 6)

    loop.lessons.forEach((lesson, index) => {
      const angle = offset + index * step
      const x = centerValue + radius * Math.cos(angle)
      const y = centerValue + radius * Math.sin(angle)
      const code = lesson.code.toUpperCase()

      let state: 'completed' | 'current' | 'upcoming' = 'upcoming'
      if (currentCode.value === code) {
        state = 'current'
      } else if (completedSet.value.has(code)) {
        state = 'completed'
      }

      all.push({
        lesson,
        x,
        y,
        loopIndex,
        color: NAVIGATION_PART_COLORS[lesson.part] ?? loop.color,
        state,
      })
    })
  })

  return all
})

const compact = computed(() => props.compact === true)
const nodeRadius = computed(() => (compact.value ? 11 : 13))
const showLessonCode = computed(() => !compact.value || viewBoxSize.value >= 280)

const spiralPath = computed(() => {
  if (!displayLessons.value.length) {
    return ''
  }

  const [outer, , inner] = radii.value
  const startRadius = outer
  const endRadius = Math.max(inner * 0.4, 16)
  const turns = 2.75
  const samples = 140
  const cx = center.value
  const cy = center.value

  let path = ''
  for (let index = 0; index <= samples; index += 1) {
    const progress = index / samples
    const angle = progress * turns * Math.PI * 2 - Math.PI / 2
    const radius = startRadius - (startRadius - endRadius) * progress
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    path += `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `
  }

  return path.trim()
})

function emitSelect(code: string) {
  emit('select', code)
}
</script>

<style scoped>
.spiral-visualization {
  width: 100%;
  max-width: 26rem;
  margin-inline: auto;
}

.spiral-path {
  stroke-linecap: round;
}

.loop-ring {
  fill: none;
  opacity: 0.18;
  stroke-width: 1.3;
}

.spiral-node {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.spiral-node:focus-visible {
  outline: none;
  filter: drop-shadow(0 0 6px rgba(14, 165, 233, 0.45));
}

.spiral-node:hover {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.45));
}

.spiral-node circle {
  fill: #fff;
  stroke: var(--node-color, #0ea5e9);
  transition:
    fill 0.2s ease,
    stroke-width 0.2s ease,
    stroke 0.2s ease;
}

.spiral-node[data-state='completed'] circle {
  fill: var(--node-color, #0ea5e9);
  stroke: var(--node-color, #0ea5e9);
}

.spiral-node[data-state='current'] circle {
  fill: #fff;
  stroke-width: 3;
}

.spiral-node[data-state='upcoming'] circle {
  stroke-dasharray: 4 3;
  stroke-width: 2;
  fill: rgba(255, 255, 255, 0.85);
}

.lesson-code {
  font-size: 7px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  fill: #1f2937;
  pointer-events: none;
}

:global(.dark) .lesson-code {
  fill: #e5e7eb;
}
</style>
