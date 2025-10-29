<template>
  <div
    v-if="content"
    class="difficulty-content"
  >
    <div class="content-header">
      <h2 class="content-title">
        {{ content.title }}
      </h2>
      <div class="estimated-time">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{{ content.estimatedTime }}</span>
      </div>
    </div>

    <div class="content-intro">
      <p>{{ content.content }}</p>
    </div>

    <div class="content-main">
      <MarkdownRenderer :content="content.markdown" />
    </div>

    <div
      v-if="content.activities && content.activities.length > 0"
      class="content-activities"
    >
      <h3 class="activities-title">
        Activities
      </h3>
      <ul class="activities-list">
        <li
          v-for="(activity, index) in content.activities"
          :key="index"
          class="activity-item"
        >
          <span class="activity-icon">✓</span>
          <span>{{ activity }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import MarkdownRenderer from './MarkdownRenderer.vue'

defineProps({
  content: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.difficulty-content {
  margin: 2rem 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-border);
  flex-wrap: wrap;
  gap: 1rem;
}

.content-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
}

.estimated-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.estimated-time svg {
  color: var(--color-loop-1);
}

.content-intro {
  margin-bottom: 2rem;
  padding: 1.25rem;
  background-color: var(--color-surface);
  border-left: 4px solid var(--color-loop-1);
  border-radius: 6px;
}

.content-intro p {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--color-text);
  margin: 0;
}

.content-main {
  margin-bottom: 2rem;
}

.content-activities {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.activities-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--color-background);
  border-radius: 6px;
  line-height: 1.6;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background-color: var(--color-surface);
}

.activity-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background-color: var(--color-loop-1);
  color: white;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .content-title {
    font-size: 1.5rem;
  }
}

@media print {
  .difficulty-content {
    page-break-inside: avoid;
  }
  
  .content-header {
    border-bottom: 1px solid #000;
  }
  
  .content-title {
    font-size: 16pt;
  }
  
  .content-intro {
    border-left: 2pt solid #000;
    font-size: 10pt;
  }
  
  .content-activities {
    border: 1px solid #000;
  }
  
  .activity-item {
    page-break-inside: avoid;
  }
}
</style>
