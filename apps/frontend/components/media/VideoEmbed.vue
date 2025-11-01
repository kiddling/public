<template>
  <div
    ref="containerRef"
    class="video-embed"
    :data-provider="embed.provider"
    :data-loaded="isLoaded"
  >
    <div class="video-embed__wrapper">
      <div v-if="!isActivated" class="video-embed__placeholder" @click="handleActivate">
        <div v-if="coverImageUrl" class="video-embed__cover">
          <img :src="coverImageUrl" :alt="embed.title || 'Video thumbnail'" loading="lazy" />
        </div>
        <div v-else class="video-embed__cover video-embed__cover--default">
          <svg class="video-embed__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
          </svg>
        </div>
        <div class="video-embed__overlay">
          <button type="button" class="video-embed__play-button" :aria-label="`Load and play ${providerName} video`">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span class="video-embed__play-text">Load {{ providerName }} video</span>
          </button>
          <p v-if="hasResumeTime" class="video-embed__resume-hint">
            Resume from {{ formatTime(resumeTime) }}
          </p>
        </div>
      </div>

      <div v-else-if="!loadError" class="video-embed__iframe-container">
        <iframe
          ref="iframeRef"
          :src="embedUrl"
          :title="embed.title || `${providerName} video player`"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
          @load="handleIframeLoad"
          @error="handleIframeError"
        />
      </div>

      <div v-else class="video-embed__error">
        <div class="video-embed__error-icon">⚠️</div>
        <p class="video-embed__error-message">
          Unable to load video from {{ providerName }}.
          <template v-if="embed.fallbackNotes">
            {{ embed.fallbackNotes }}
          </template>
        </p>
        <a
          v-if="directUrl"
          :href="directUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="video-embed__error-link"
        >
          Watch on {{ providerName }} →
        </a>
      </div>
    </div>

    <div v-if="embed.title || embed.description" class="video-embed__info">
      <h3 v-if="embed.title" class="video-embed__title">{{ embed.title }}</h3>
      <p v-if="embed.description" class="video-embed__description">{{ embed.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import type { VideoEmbed } from '~/utils/video-providers'
import {
  generateEmbedUrl,
  generateDirectUrl,
  getProviderName,
  normalizeVideoId,
} from '~/utils/video-providers'

interface Props {
  embed: VideoEmbed
  privacyMode?: boolean
  lazyLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  privacyMode: true,
  lazyLoad: true,
})

const containerRef = ref<HTMLElement | null>(null)
const iframeRef = ref<HTMLIFrameElement | null>(null)
const isActivated = ref(false)
const isLoaded = ref(false)
const loadError = ref(false)
const isVisible = ref(false)
const resumeTime = ref(0)

const normalizedVideoId = computed(() =>
  normalizeVideoId(props.embed.provider, props.embed.videoId, props.embed.videoUrl)
)

const embedUrl = computed(() => {
  const startTime = hasResumeTime.value && resumeTime.value >= 10 
    ? resumeTime.value 
    : (props.embed.startTime || 0)
  return generateEmbedUrl(props.embed.provider, normalizedVideoId.value, startTime)
})

const directUrl = computed(() =>
  generateDirectUrl(props.embed.provider, normalizedVideoId.value)
)

const providerName = computed(() => getProviderName(props.embed.provider))

const coverImageUrl = computed(() => props.embed.coverImage?.url || null)

const storageKey = computed(
  () => `video-progress:${props.embed.provider}:${normalizedVideoId.value}`
)

const hasResumeTime = computed(() => resumeTime.value >= 10)

if (props.lazyLoad) {
  useIntersectionObserver(
    containerRef,
    ([{ isIntersecting }]) => {
      if (isIntersecting && !isVisible.value) {
        isVisible.value = true
      }
    },
    { threshold: 0.1 }
  )
} else {
  isVisible.value = true
}

onMounted(() => {
  loadResumeTime()
  if (!props.privacyMode) {
    isActivated.value = true
  }
})

onBeforeUnmount(() => {
  stopProgressTracking()
})

function loadResumeTime() {
  try {
    const stored = localStorage.getItem(storageKey.value)
    if (stored) {
      const data = JSON.parse(stored)
      if (data.time && data.time >= 10) {
        resumeTime.value = Math.floor(data.time)
      }
    }
  } catch (err) {
    console.warn('Failed to load video resume time:', err)
  }
}

function saveProgressTime(time: number) {
  if (time < 10) return
  try {
    localStorage.setItem(
      storageKey.value,
      JSON.stringify({
        time: Math.floor(time),
        updatedAt: Date.now(),
      })
    )
  } catch (err) {
    console.warn('Failed to save video progress:', err)
  }
}

let progressInterval: ReturnType<typeof setInterval> | null = null

function startProgressTracking() {
  if (progressInterval) return
  progressInterval = setInterval(() => {
    if (iframeRef.value) {
      try {
        const currentTime = extractCurrentTime()
        if (currentTime !== null) {
          saveProgressTime(currentTime)
        }
      } catch (err) {
        // Cross-origin restrictions prevent direct access
      }
    }
  }, 5000)
}

function stopProgressTracking() {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

function extractCurrentTime(): number | null {
  return null
}

function handleActivate() {
  if (!isVisible.value && props.lazyLoad) return
  isActivated.value = true
}

function handleIframeLoad() {
  isLoaded.value = true
  loadError.value = false
  startProgressTracking()
}

function handleIframeError() {
  loadError.value = true
  isLoaded.value = false
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

watch(isActivated, (activated) => {
  if (!activated) {
    stopProgressTracking()
  }
})
</script>

<style scoped>
.video-embed {
  width: 100%;
  max-width: 100%;
}

.video-embed__wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-embed__placeholder {
  position: absolute;
  inset: 0;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.video-embed__placeholder:hover {
  opacity: 0.95;
}

.video-embed__cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.video-embed__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-embed__cover--default {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.video-embed__icon {
  width: 80px;
  height: 80px;
  color: rgba(255, 255, 255, 0.6);
}

.video-embed__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  gap: 12px;
}

.video-embed__play-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
  color: #1a1a1a;
}

.video-embed__play-button:hover {
  background: #fff;
  transform: scale(1.05);
}

.video-embed__play-button svg {
  width: 32px;
  height: 32px;
}

.video-embed__play-text {
  font-size: 14px;
  font-weight: 600;
}

.video-embed__resume-hint {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 4px;
  font-size: 13px;
  margin: 0;
}

.video-embed__iframe-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.video-embed__iframe-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.video-embed__error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  background: #1a1a1a;
  color: #fff;
  gap: 16px;
}

.video-embed__error-icon {
  font-size: 48px;
}

.video-embed__error-message {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.9;
}

.video-embed__error-link {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.video-embed__error-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.video-embed__info {
  margin-top: 12px;
}

.video-embed__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: inherit;
}

.video-embed__description {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.8;
}
</style>
