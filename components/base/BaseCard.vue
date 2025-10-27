<template>
  <component
    :is="tag"
    :class="cardClasses"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive ? 0 : undefined"
    @click="handleClick"
    @keydown.enter="handleKeydown"
    @keydown.space="handleKeydown"
  >
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    
    <div v-if="image" class="card-image">
      <img :src="image" :alt="imageAlt" class="w-full h-full object-cover" />
    </div>

    <div class="card-body" :class="paddingClasses">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer" :class="paddingClasses">
      <slot name="footer" />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface BaseCardProps {
  tag?: 'div' | 'article' | 'section'
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  image?: string
  imageAlt?: string
  partColor?: 'foundation' | 'intermediate' | 'advanced' | 'expert'
}

const props = withDefaults(defineProps<BaseCardProps>(), {
  tag: 'div',
  variant: 'default',
  padding: 'md',
  interactive: false,
  imageAlt: ''
})

const emit = defineEmits<{
  click: [event: MouseEvent | KeyboardEvent]
}>()

const cardClasses = computed(() => {
  const classes = ['card']

  if (props.variant === 'default') {
    classes.push('bg-white shadow-card')
  } else if (props.variant === 'bordered') {
    classes.push('bg-white border-2 border-neutral-200')
  } else if (props.variant === 'elevated') {
    classes.push('bg-white shadow-lg')
  }

  if (props.interactive) {
    classes.push('card-interactive')
  }

  if (props.partColor) {
    classes.push(`section-${props.partColor}`)
  }

  return classes
})

const paddingClasses = computed(() => {
  if (props.padding === 'none') return ''
  if (props.padding === 'sm') return 'p-3'
  if (props.padding === 'lg') return 'p-6'
  return 'p-4'
})

const handleClick = (event: MouseEvent) => {
  if (props.interactive) {
    emit('click', event)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.interactive) {
    event.preventDefault()
    emit('click', event)
  }
}
</script>

<style scoped>
.card-header {
  @apply border-b border-neutral-200 p-4 font-semibold;
}

.card-image {
  @apply w-full overflow-hidden;
}

.card-image img {
  @apply transition-transform duration-300;
}

.card-interactive:hover .card-image img {
  @apply scale-105;
}

.card-body {
  @apply flex-1;
}

.card-footer {
  @apply border-t border-neutral-200 bg-neutral-50;
}
</style>
