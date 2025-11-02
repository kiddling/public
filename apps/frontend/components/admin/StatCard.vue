<template>
  <div :class="[
    'bg-white rounded-lg shadow p-6 border-l-4',
    borderColorClass
  ]">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p :class="['text-2xl font-bold mt-2', textColorClass]">{{ value }}</p>
      </div>
      <div :class="['text-4xl', bgColorClass, 'w-16 h-16 rounded-full flex items-center justify-center']">
        {{ icon }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
})

const colorClasses = {
  blue: {
    border: 'border-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  green: {
    border: 'border-green-500',
    text: 'text-green-600',
    bg: 'bg-green-50',
  },
  purple: {
    border: 'border-purple-500',
    text: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  orange: {
    border: 'border-orange-500',
    text: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  red: {
    border: 'border-red-500',
    text: 'text-red-600',
    bg: 'bg-red-50',
  },
}

const borderColorClass = computed(() => colorClasses[props.color].border)
const textColorClass = computed(() => colorClasses[props.color].text)
const bgColorClass = computed(() => colorClasses[props.color].bg)
</script>
