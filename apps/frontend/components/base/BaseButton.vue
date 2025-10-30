<template>
  <NuxtLink
    v-if="isLink"
    :to="to"
    role="button"
    :aria-disabled="isDisabled || undefined"
    :tabindex="isDisabled ? -1 : undefined"
    @click="handleClick"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    type: 'button',
    disabled: false,
    loading: false,
  }
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const { to, type, disabled, loading } = toRefs(props)

const isLink = computed(
  () => to.value !== undefined && to.value !== null && to.value !== ''
)
const isDisabled = computed(() => Boolean(disabled.value || loading.value))

const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>
