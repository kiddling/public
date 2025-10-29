<template>
  <div
    v-if="media && media.length > 0"
    class="media-display"
  >
    <h3 class="media-title">
      Media Resources
    </h3>
    <div class="media-grid">
      <div
        v-for="(item, index) in media"
        :key="index"
        class="media-item"
      >
        <div
          v-if="item.type === 'video'"
          class="media-video"
        >
          <div class="video-placeholder">
            <img
              v-if="item.thumbnail"
              :src="item.thumbnail"
              :alt="item.title"
              class="video-thumbnail"
            >
            <div class="video-overlay">
              <svg
                class="play-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <p class="media-caption">
            {{ item.title }}
          </p>
        </div>

        <div
          v-else-if="item.type === 'diagram'"
          class="media-diagram"
        >
          <img
            :src="item.url"
            :alt="item.alt || item.title"
            class="diagram-image"
          >
          <p class="media-caption">
            {{ item.title }}
          </p>
        </div>

        <div
          v-else-if="item.type === 'image'"
          class="media-image"
        >
          <img
            :src="item.url"
            :alt="item.alt || item.title"
            class="content-image"
          >
          <p
            v-if="item.title"
            class="media-caption"
          >
            {{ item.title }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  media: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.media-display {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.media-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.media-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.media-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.media-video {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.video-placeholder {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: var(--color-background);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.video-placeholder:hover {
  transform: scale(1.02);
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  transition: background-color 0.2s ease;
}

.video-placeholder:hover .video-overlay {
  background-color: rgba(0, 0, 0, 0.4);
}

.play-icon {
  width: 4rem;
  height: 4rem;
  color: white;
  opacity: 0.9;
  transition: transform 0.2s ease;
}

.video-placeholder:hover .play-icon {
  transform: scale(1.1);
}

.media-diagram,
.media-image {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.diagram-image,
.content-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: white;
}

.media-caption {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-align: center;
  line-height: 1.4;
}

@media print {
  .media-display {
    page-break-inside: avoid;
    border: 1px solid #000;
  }
  
  .media-grid {
    display: block;
  }
  
  .media-item {
    page-break-inside: avoid;
    margin-bottom: 1rem;
  }
  
  .video-placeholder {
    display: none;
  }
  
  .diagram-image,
  .content-image {
    max-width: 100%;
    height: auto;
  }
}
</style>
