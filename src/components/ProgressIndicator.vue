<template>
  <div
    class="progress-indicator"
    aria-label="Course progress"
  >
    <div class="progress-stats">
      <span class="progress-text">
        {{ progressStore.completedCount }}/{{ progressStore.totalLessons }}
      </span>
      <span class="progress-percentage">
        {{ progressStore.completionPercentage }}%
      </span>
    </div>
    <div
      class="progress-bar-container"
      role="progressbar"
      :aria-valuenow="progressStore.completionPercentage"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="progress-bar"
        :style="{ width: progressStore.completionPercentage + '%' }"
      />
    </div>
  </div>
</template>

<script setup>
import { useProgressStore } from '@/stores/progressStore'

const progressStore = useProgressStore()
</script>

<style scoped>
.progress-indicator {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 120px;
}

.progress-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.progress-text {
  color: var(--color-text-muted);
}

.progress-percentage {
  font-weight: 600;
  color: var(--color-text);
}

.progress-bar-container {
  height: 6px;
  background-color: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-loop-1), var(--color-loop-2), var(--color-loop-3));
  border-radius: 3px;
  transition: width 0.3s ease;
}

@media (max-width: 640px) {
  .progress-indicator {
    display: none;
  }
}
</style>
