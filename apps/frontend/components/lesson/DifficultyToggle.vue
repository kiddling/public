<template>
  <div class="flex flex-wrap items-center gap-3" role="group" aria-label="Select lesson difficulty">
    <button
      v-for="option in options"
      :key="option.value"
      :title="option.description"
      type="button"
      class="flex min-w-[96px] flex-1 items-center justify-between rounded-lg border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      :class="buttonClasses(option.value)"
      :aria-pressed="modelValue === option.value"
      @click="handleSelect(option.value)"
    >
      <span class="flex flex-col text-left">
        <span>{{ option.label }}</span>
        <span class="text-xs opacity-80">{{ option.subtitle }}</span>
      </span>
      <span
        class="ml-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
        :class="badgeClasses(option.value)"
      >
        {{ option.shortLabel }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { DifficultyLevel } from '~/types/lesson'

type Option = {
  value: DifficultyLevel
  label: string
  shortLabel: string
  subtitle: string
  description: string
}

const props = defineProps<{
  modelValue: DifficultyLevel
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: DifficultyLevel): void
}>()

const options: Option[] = [
  {
    value: 'base',
    label: 'Base',
    shortLabel: 'B',
    subtitle: '核心课程 Core lesson',
    description: '专注于核心学习环节的基本活动。Essential activities focused on the core learning loop.',
  },
  {
    value: 'advance',
    label: 'Advance',
    shortLabel: 'A',
    subtitle: '深入学习 Dig deeper',
    description: '增加挑战和深度的扩展任务。Extended tasks that add challenge and depth to the lesson.',
  },
  {
    value: 'stretch',
    label: 'Stretch',
    shortLabel: 'S',
    subtitle: '拓展探索 Push further',
    description: '为丰富和精通而设计的可选探索。Optional explorations designed for enrichment and mastery.',
  },
]

const levelColor = {
  base: {
    idle: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300',
    active: 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200',
    badge: 'bg-white text-blue-600',
    badgeActive: 'bg-blue-500 text-white shadow-inner',
    ring: 'focus-visible:ring-blue-500 focus-visible:ring-offset-blue-50',
  },
  advance: {
    idle: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300',
    active: 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-200',
    badge: 'bg-white text-emerald-600',
    badgeActive: 'bg-emerald-500 text-white shadow-inner',
    ring: 'focus-visible:ring-emerald-500 focus-visible:ring-offset-emerald-50',
  },
  stretch: {
    idle: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300',
    active: 'border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-200',
    badge: 'bg-white text-purple-600',
    badgeActive: 'bg-purple-500 text-white shadow-inner',
    ring: 'focus-visible:ring-purple-500 focus-visible:ring-offset-purple-50',
  },
} satisfies Record<DifficultyLevel, Record<string, string>>

const buttonClasses = (level: DifficultyLevel) => {
  const color = levelColor[level]
  const isActive = modelValue === level
  const baseClasses = isActive ? color.active : color.idle
  const ring = color.ring

  return [baseClasses, ring, props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'].join(' ')
}

const badgeClasses = (level: DifficultyLevel) => {
  const color = levelColor[level]
  return modelValue === level ? color.badgeActive : color.badge
}

const handleSelect = (value: DifficultyLevel) => {
  if (props.disabled || modelValue === value) {
    return
  }

  emit('update:modelValue', value)
}
</script>
