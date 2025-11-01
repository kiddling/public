<template>
  <span>
    <template v-for="(segment, index) in segments" :key="index">
      <mark
        v-if="segment.highlighted"
        class="bg-yellow-200 px-1 font-semibold text-gray-900 dark:bg-yellow-700/50 dark:text-yellow-100"
      >{{ segment.text }}</mark>
      <span v-else>{{ segment.text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface HighlightRange {
  start: number
  end: number
}

const props = defineProps<{
  text: string
  ranges: HighlightRange[]
}>()

interface Segment {
  text: string
  highlighted: boolean
}

const segments = computed<Segment[]>(() => {
  if (!props.text || !props.ranges || props.ranges.length === 0) {
    return [{ text: props.text, highlighted: false }]
  }

  const result: Segment[] = []
  let lastIndex = 0

  // Sort ranges by start position
  const sortedRanges = [...props.ranges].sort((a, b) => a.start - b.start)

  for (const range of sortedRanges) {
    // Add non-highlighted text before this range
    if (range.start > lastIndex) {
      result.push({
        text: props.text.slice(lastIndex, range.start),
        highlighted: false,
      })
    }

    // Add highlighted text
    result.push({
      text: props.text.slice(range.start, range.end),
      highlighted: true,
    })

    lastIndex = range.end
  }

  // Add remaining non-highlighted text
  if (lastIndex < props.text.length) {
    result.push({
      text: props.text.slice(lastIndex),
      highlighted: false,
    })
  }

  return result
})
</script>
