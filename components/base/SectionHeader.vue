<template>
  <header :class="headerClasses">
    <div class="section-header-content">
      <BaseTag
        v-if="partColor"
        :variant="partColor"
        :icon="partIcon"
        class="section-header-tag"
      >
        {{ partLabel }}
      </BaseTag>
      
      <component :is="headingTag" :class="headingClasses">
        {{ title }}
      </component>
      
      <p v-if="subtitle" class="section-header-subtitle">
        {{ subtitle }}
      </p>
    </div>

    <div v-if="$slots.actions" class="section-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseTag from './BaseTag.vue'

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  partColor?: 'foundation' | 'intermediate' | 'advanced' | 'expert'
  partLabel?: string
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  centered?: boolean
}

const props = withDefaults(defineProps<SectionHeaderProps>(), {
  headingLevel: 2,
  centered: false
})

const headingTag = computed(() => `h${props.headingLevel}`)

const headerClasses = computed(() => [
  'section-header',
  props.centered ? 'text-center items-center' : 'items-start',
  'mb-6 space-y-3'
])

const headingClasses = computed(() => {
  const level = props.headingLevel
  if (level === 1) return 'heading-1'
  if (level === 2) return 'heading-2'
  if (level === 3) return 'heading-3'
  if (level === 4) return 'heading-4'
  if (level === 5) return 'heading-5'
  return 'heading-6'
})

const partIcon = computed(() => {
  if (!props.partColor) return undefined
  
  const icons = {
    foundation: 'heroicons:academic-cap',
    intermediate: 'heroicons:beaker',
    advanced: 'heroicons:rocket-launch',
    expert: 'heroicons:star'
  }
  
  return icons[props.partColor]
})
</script>

<style scoped>
.section-header {
  @apply flex flex-col;
}

.section-header-content {
  @apply flex-1;
}

.section-header-tag {
  @apply mb-2;
}

.section-header-subtitle {
  @apply text-lg text-neutral-600 mt-2;
}

.section-header-actions {
  @apply flex items-center gap-2 mt-4;
}

@media (min-width: 768px) {
  .section-header {
    @apply flex-row justify-between;
  }

  .section-header-actions {
    @apply mt-0;
  }
}
</style>
