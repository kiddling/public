<template>
  <div class="masonry-grid">
    <div
      v-for="(work, index) in works"
      :key="work.id"
      class="masonry-item group cursor-pointer"
      @click="$emit('open', index)"
    >
      <div class="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <!-- Image -->
        <img
          v-if="work.assets && work.assets.length > 0"
          :src="getImageUrl(work.assets[0].url)"
          :alt="work.studentName"
          loading="lazy"
          class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
          :style="{ aspectRatio: getAspectRatio(work.assets[0]) }"
        />
        
        <!-- Placeholder if no image -->
        <div
          v-else
          class="w-full h-64 flex items-center justify-center bg-gray-200 dark:bg-gray-700"
        >
          <Icon name="mdi:image" class="text-6xl text-gray-400" />
        </div>

        <!-- Overlay with info -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 class="font-semibold text-lg mb-1">{{ work.studentName }}</h3>
            <div class="flex items-center gap-2 text-sm">
              <span v-if="work.discipline" class="px-2 py-0.5 bg-white/20 rounded">
                {{ work.discipline }}
              </span>
              <span v-if="work.loop" class="px-2 py-0.5 bg-white/20 rounded">
                {{ work.loop }}
              </span>
              <span v-if="work.grade" class="px-2 py-0.5 bg-white/20 rounded">
                {{ work.grade }}
              </span>
            </div>
            <p v-if="work.description" class="text-sm mt-2 line-clamp-2">
              {{ work.description }}
            </p>
          </div>
        </div>

        <!-- Before/After Badge -->
        <div
          v-if="work.beforeAfterMedia && work.beforeAfterMedia.length > 0"
          class="absolute top-2 right-2 px-2 py-1 bg-primary-500 text-white text-xs font-semibold rounded"
        >
          对比
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentWork } from '~/types/cms'

interface Props {
  works: StudentWork[]
}

defineProps<Props>()

defineEmits<{
  open: [index: number]
}>()

function getImageUrl(url: string): string {
  // If the URL is already absolute, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Otherwise, prepend the CMS URL from runtime config
  const config = useRuntimeConfig()
  const cmsUrl = config.public.cmsUrl || 'http://localhost:1337'
  return `${cmsUrl}${url}`
}

function getAspectRatio(media: any): string {
  if (media.width && media.height) {
    return `${media.width} / ${media.height}`
  }
  return 'auto'
}
</script>

<style scoped>
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  grid-auto-flow: dense;
}

@media (min-width: 640px) {
  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (min-width: 1024px) {
  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

.masonry-item {
  break-inside: avoid;
}
</style>
