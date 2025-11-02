<template>
  <div class="lesson-completion">
    <button
      class="completion-toggle"
      :class="{ completed: isCompleted }"
      :aria-label="isCompleted ? 'Mark lesson as incomplete' : 'Mark lesson as complete'"
      :aria-pressed="isCompleted"
      @click="toggleCompletion"
    >
      <svg
        class="check-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span class="completion-text">
        {{ isCompleted ? 'Completed' : 'Mark as complete' }}
      </span>
    </button>
    <p class="completion-note">
      <span class="note-icon">ℹ️</span>
      Progress is saved locally. For sync across devices, user accounts will be available in the future.
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progressStore'

const props = defineProps({
  lessonId: {
    type: Number,
    required: true
  }
})

const progressStore = useProgressStore()

const isCompleted = computed(() => {
  return progressStore.isLessonComplete(props.lessonId)
})

function toggleCompletion() {
  progressStore.toggleLessonCompletion(props.lessonId)
}
</script>

<style scoped>
.lesson-completion {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.completion-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background-color: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  transition: all 0.2s;
}

.completion-toggle:hover {
  border-color: var(--color-loop-1);
  background-color: var(--color-surface);
}

.completion-toggle:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
}

.completion-toggle.completed {
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.completion-toggle.completed:hover {
  opacity: 0.9;
}

.check-icon {
  flex-shrink: 0;
}

.completion-toggle.completed .check-icon {
  animation: checkmark 0.3s ease;
}

@keyframes checkmark {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.completion-text {
  flex: 1;
  text-align: left;
}

.completion-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  background-color: var(--color-background);
  border-radius: 6px;
}

.note-icon {
  flex-shrink: 0;
  font-size: 1rem;
}
</style>
