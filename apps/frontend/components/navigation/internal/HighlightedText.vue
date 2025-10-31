<template>
  <span>
    <template v-for="(segment, index) in segments" :key="`${index}-${segment.text}`">
      <mark v-if="segment.matched" class="highlight">{{ segment.text }}</mark>
      <span v-else>{{ segment.text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  segments: Array<{ text: string; matched: boolean }>
}>()
</script>

<style scoped>
.highlight {
  background-color: rgba(14, 165, 233, 0.25);
  color: inherit;
  border-radius: 0.25rem;
  padding-inline: 0.15rem;
}

:global(.dark) .highlight {
  background-color: rgba(56, 189, 248, 0.35);
}
</style>
