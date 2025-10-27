<template>
  <span :class="tagClasses">
    <Icon v-if="icon" :name="icon" class="w-3.5 h-3.5" />
    <slot />
    <button
      v-if="removable"
      type="button"
      :aria-label="removeLabel"
      class="tag-remove"
      @click="handleRemove"
    >
      <Icon name="heroicons:x-mark-solid" class="w-3 h-3" />
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface BaseTagProps {
  variant?: 'default' | 'foundation' | 'intermediate' | 'advanced' | 'expert' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  removable?: boolean
  removeLabel?: string
}

const props = withDefaults(defineProps<BaseTagProps>(), {
  variant: 'default',
  size: 'md',
  removable: false,
  removeLabel: '移除'
})

const emit = defineEmits<{
  remove: []
}>()

const tagClasses = computed(() => {
  const classes = ['badge inline-flex items-center gap-1 font-medium']

  // Size variants
  if (props.size === 'sm') {
    classes.push('text-xs px-2 py-0.5')
  } else if (props.size === 'lg') {
    classes.push('text-sm px-3 py-1')
  } else {
    classes.push('text-xs px-2.5 py-0.5')
  }

  // Color variants
  if (props.variant === 'foundation') {
    classes.push('badge-foundation')
  } else if (props.variant === 'intermediate') {
    classes.push('badge-intermediate')
  } else if (props.variant === 'advanced') {
    classes.push('badge-advanced')
  } else if (props.variant === 'expert') {
    classes.push('badge-expert')
  } else if (props.variant === 'success') {
    classes.push('bg-success-100 text-success-700')
  } else if (props.variant === 'warning') {
    classes.push('bg-warning-100 text-warning-700')
  } else if (props.variant === 'error') {
    classes.push('bg-error-100 text-error-700')
  } else if (props.variant === 'info') {
    classes.push('bg-info-100 text-info-700')
  } else {
    classes.push('bg-neutral-100 text-neutral-700')
  }

  return classes
})

const handleRemove = () => {
  emit('remove')
}
</script>

<style scoped>
.tag-remove {
  @apply ml-0.5 -mr-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5;
  @apply transition-colors duration-150;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1;
}
</style>
