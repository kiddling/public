<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :aria-busy="loading"
    :aria-disabled="disabled"
    @click="handleClick"
  >
    <span v-if="loading" class="button-spinner" aria-hidden="true">
      <Icon name="line-md:loading-twotone-loop" class="w-5 h-5" />
    </span>
    <Icon v-if="iconLeft && !loading" :name="iconLeft" class="button-icon-left" />
    <span class="button-content">
      <slot />
    </span>
    <Icon v-if="iconRight && !loading" :name="iconRight" class="button-icon-right" />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  tag?: 'button' | 'a' | 'nuxt-link'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  iconLeft?: string
  iconRight?: string
  fullWidth?: boolean
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  size: 'md',
  tag: 'button',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const classes = [
    'inline-flex items-center justify-center',
    'font-medium rounded-lg',
    'transition-all duration-200',
    'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'relative'
  ]

  // Size variants
  if (props.size === 'sm') {
    classes.push('px-3 py-1.5 text-sm gap-1.5')
  } else if (props.size === 'lg') {
    classes.push('px-6 py-3 text-lg gap-2.5')
  } else {
    classes.push('px-4 py-2 text-base gap-2')
  }

  // Variant styles
  if (props.variant === 'primary') {
    classes.push(
      'bg-primary-600 text-white',
      'hover:bg-primary-700 active:bg-primary-800',
      'focus-visible:outline-primary-500',
      'shadow-sm hover:shadow-md'
    )
  } else if (props.variant === 'secondary') {
    classes.push(
      'bg-neutral-600 text-white',
      'hover:bg-neutral-700 active:bg-neutral-800',
      'focus-visible:outline-neutral-500',
      'shadow-sm hover:shadow-md'
    )
  } else if (props.variant === 'outline') {
    classes.push(
      'bg-white text-neutral-700 border-2 border-neutral-300',
      'hover:bg-neutral-50 hover:border-neutral-400',
      'active:bg-neutral-100',
      'focus-visible:outline-primary-500'
    )
  } else if (props.variant === 'ghost') {
    classes.push(
      'bg-transparent text-neutral-700',
      'hover:bg-neutral-100 active:bg-neutral-200',
      'focus-visible:outline-primary-500'
    )
  } else if (props.variant === 'danger') {
    classes.push(
      'bg-error-600 text-white',
      'hover:bg-error-700 active:bg-error-800',
      'focus-visible:outline-error-500',
      'shadow-sm hover:shadow-md'
    )
  }

  if (props.fullWidth) {
    classes.push('w-full')
  }

  if (props.loading) {
    classes.push('cursor-wait')
  }

  return classes
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.button-spinner {
  @apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2;
}

.button-content {
  @apply inline-flex items-center;
}

button[aria-busy="true"] .button-content {
  @apply invisible;
}

.button-icon-left {
  @apply w-5 h-5 -ml-1;
}

.button-icon-right {
  @apply w-5 h-5 -mr-1;
}
</style>
