<template>
  <nav
    class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
    :aria-label="ariaLabel"
  >
    <NuxtLink
      v-if="showHome"
      to="/"
      class="inline-flex items-center gap-1 font-medium text-gray-600 transition hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-300"
    >
      <Icon name="i-heroicons-home" class="h-4 w-4" aria-hidden="true" />
      <span class="sr-only">Home</span>
    </NuxtLink>

    <span v-if="showHome" class="text-gray-300 dark:text-gray-600">/</span>

    <ol class="flex items-center flex-wrap gap-2" role="list">
      <li
        v-for="(item, index) in resolvedItems"
        :key="item.id"
        class="inline-flex items-center gap-2"
      >
        <NuxtLink
          v-if="item.to && index < resolvedItems.length - 1"
          :to="item.to"
          class="inline-flex items-center gap-1 font-medium text-gray-600 transition hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-300"
          :aria-label="item.ariaLabel || item.label"
        >
          <span>{{ item.label }}</span>
        </NuxtLink>
        <span
          v-else
          class="font-semibold text-gray-700 dark:text-gray-100"
          :aria-current="index === resolvedItems.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>

        <span
          v-if="index < resolvedItems.length - 1"
          class="text-gray-300 dark:text-gray-600"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCourseNavigationStore } from '~/stores/courseNavigation'
import type { CourseBreadcrumbItem } from '~/types/navigation'

const props = withDefaults(
  defineProps<{
    items?: CourseBreadcrumbItem[]
    showHome?: boolean
    ariaLabel?: string
  }>(),
  {
    items: undefined,
    showHome: true,
    ariaLabel: 'Breadcrumb',
  }
)

const navigationStore = useCourseNavigationStore()

const resolvedItems = computed(() => {
  if (props.items && props.items.length) {
    return props.items
  }

  return navigationStore.breadcrumbs.value
})

const showHome = computed(() => props.showHome && resolvedItems.value.length > 0)

const ariaLabel = computed(() => props.ariaLabel)
</script>
