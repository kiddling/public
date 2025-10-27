<template>
  <header class="app-header no-print" role="banner">
    <div class="header-container">
      <div class="header-left">
        <button
          type="button"
          class="menu-toggle md:hidden"
          :aria-label="$t('navigation.menu')"
          aria-expanded="false"
          @click="handleToggleSidebar"
        >
          <Icon name="heroicons:bars-3" class="w-6 h-6" />
        </button>

        <NuxtLink to="/" class="header-logo" :aria-label="$t('app.title')">
          <Icon name="heroicons:academic-cap-solid" class="w-8 h-8 text-primary-600" />
          <span class="header-logo-text">{{ $t('app.title') }}</span>
        </NuxtLink>
      </div>

      <nav class="header-nav hidden md:flex" role="navigation" aria-label="主导航">
        <slot name="nav">
          <NuxtLink to="/" class="nav-link">
            {{ $t('navigation.home') }}
          </NuxtLink>
          <NuxtLink to="/courses" class="nav-link">
            {{ $t('navigation.courses') }}
          </NuxtLink>
          <NuxtLink to="/about" class="nav-link">
            {{ $t('navigation.about') }}
          </NuxtLink>
        </slot>
      </nav>

      <div class="header-right">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const handleToggleSidebar = () => {
  emit('toggle-sidebar')
}
</script>

<style scoped>
.app-header {
  @apply sticky top-0 z-50;
  @apply bg-white border-b border-neutral-200;
  @apply shadow-sm;
}

.header-container {
  @apply content-container;
  @apply flex items-center justify-between;
  @apply h-16 gap-4;
}

.header-left {
  @apply flex items-center gap-3;
}

.menu-toggle {
  @apply p-2 -ml-2 rounded-lg;
  @apply text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100;
  @apply transition-colors duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
}

.header-logo {
  @apply flex items-center gap-2;
  @apply text-neutral-900 hover:text-primary-600;
  @apply transition-colors duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded;
}

.header-logo-text {
  @apply text-xl font-bold;
}

.header-nav {
  @apply flex items-center gap-1;
}

.nav-link {
  @apply px-3 py-2 rounded-lg;
  @apply text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100;
  @apply font-medium transition-colors duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
}

.nav-link.router-link-active {
  @apply text-primary-600 bg-primary-50;
}

.header-right {
  @apply flex items-center gap-2;
}
</style>
