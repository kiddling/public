<template>
  <div>
    <Transition name="backdrop">
      <div
        v-if="open"
        class="sidebar-backdrop md:hidden"
        @click="handleClose"
      />
    </Transition>

    <Transition name="slide">
      <aside
        v-if="open || !isMobile"
        class="app-sidebar no-print"
        role="complementary"
        aria-label="侧边栏导航"
      >
        <div class="sidebar-header md:hidden">
          <h2 class="sidebar-title">{{ $t('navigation.menu') }}</h2>
          <button
            type="button"
            class="sidebar-close"
            :aria-label="$t('navigation.close')"
            @click="handleClose"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <nav class="sidebar-nav" role="navigation" aria-label="次要导航">
          <slot>
            <div class="sidebar-section">
              <h3 class="sidebar-section-title">{{ $t('course.foundation') }}</h3>
              <NuxtLink to="/foundation" class="sidebar-link section-foundation">
                <Icon name="heroicons:academic-cap" class="w-5 h-5" />
                <span>{{ $t('course.foundation') }}</span>
              </NuxtLink>
            </div>

            <div class="sidebar-section">
              <h3 class="sidebar-section-title">{{ $t('course.intermediate') }}</h3>
              <NuxtLink to="/intermediate" class="sidebar-link section-intermediate">
                <Icon name="heroicons:beaker" class="w-5 h-5" />
                <span>{{ $t('course.intermediate') }}</span>
              </NuxtLink>
            </div>

            <div class="sidebar-section">
              <h3 class="sidebar-section-title">{{ $t('course.advanced') }}</h3>
              <NuxtLink to="/advanced" class="sidebar-link section-advanced">
                <Icon name="heroicons:rocket-launch" class="w-5 h-5" />
                <span>{{ $t('course.advanced') }}</span>
              </NuxtLink>
            </div>

            <div class="sidebar-section">
              <h3 class="sidebar-section-title">{{ $t('course.expert') }}</h3>
              <NuxtLink to="/expert" class="sidebar-link section-expert">
                <Icon name="heroicons:star" class="w-5 h-5" />
                <span>{{ $t('course.expert') }}</span>
              </NuxtLink>
            </div>
          </slot>
        </nav>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

interface AppSidebarProps {
  open: boolean
}

defineProps<AppSidebarProps>()

const emit = defineEmits<{
  close: []
}>()

const isMobile = useMediaQuery('(max-width: 767px)')

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.sidebar-backdrop {
  @apply fixed inset-0 bg-black bg-opacity-50 z-40;
}

.app-sidebar {
  @apply fixed md:sticky top-0 left-0 bottom-0 z-50 md:z-0;
  @apply w-64 md:w-72 h-screen md:h-auto;
  @apply bg-white border-r border-neutral-200;
  @apply overflow-y-auto;
  @apply flex flex-col;
}

.sidebar-header {
  @apply flex items-center justify-between;
  @apply p-4 border-b border-neutral-200;
}

.sidebar-title {
  @apply text-lg font-semibold text-neutral-900;
}

.sidebar-close {
  @apply p-1 rounded-lg;
  @apply text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100;
  @apply transition-colors duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
}

.sidebar-nav {
  @apply flex-1 p-4 space-y-6;
}

.sidebar-section {
  @apply space-y-1;
}

.sidebar-section-title {
  @apply px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider;
}

.sidebar-link {
  @apply flex items-center gap-3 px-3 py-2 rounded-lg;
  @apply text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100;
  @apply transition-colors duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
}

.sidebar-link.router-link-active {
  @apply bg-primary-50 text-primary-700 font-medium;
}

.backdrop-enter-active,
.backdrop-leave-active {
  @apply transition-opacity duration-300;
}

.backdrop-enter-from,
.backdrop-leave-to {
  @apply opacity-0;
}

.slide-enter-active,
.slide-leave-active {
  @apply transition-transform duration-300;
}

.slide-enter-from,
.slide-leave-to {
  @apply -translate-x-full;
}

@media (min-width: 768px) {
  .app-sidebar {
    @apply translate-x-0;
  }
}
</style>
