<template>
  <div
    v-if="attachments && attachments.length > 0"
    class="attachments-list"
  >
    <h3 class="attachments-title">
      Downloadable Resources
    </h3>
    <div class="attachments-grid">
      <a
        v-for="(attachment, index) in attachments"
        :key="index"
        :href="attachment.url"
        class="attachment-item"
        :download="attachment.filename"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="attachment-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line
              x1="12"
              y1="18"
              x2="12"
              y2="12"
            />
            <line
              x1="9"
              y1="15"
              x2="15"
              y2="15"
            />
          </svg>
        </div>
        <div class="attachment-info">
          <div class="attachment-name">{{ attachment.title }}</div>
          <div class="attachment-meta">
            <span class="attachment-filename">{{ attachment.filename }}</span>
            <span class="attachment-size">{{ attachment.size }}</span>
          </div>
        </div>
        <div class="attachment-download">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line
              x1="12"
              y1="15"
              x2="12"
              y2="3"
            />
          </svg>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  attachments: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.attachments-list {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.attachments-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.attachments-grid {
  display: grid;
  gap: 1rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.attachment-item:hover {
  background-color: var(--color-surface);
  border-color: var(--color-loop-1);
  transform: translateX(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.attachment-item:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
}

.attachment-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-loop-1);
  color: white;
  border-radius: 8px;
}

.attachment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.attachment-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9375rem;
}

.attachment-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.attachment-download {
  flex-shrink: 0;
  color: var(--color-loop-1);
  transition: transform 0.2s ease;
}

.attachment-item:hover .attachment-download {
  transform: translateY(2px);
}

@media (max-width: 640px) {
  .attachment-item {
    flex-wrap: wrap;
  }
  
  .attachment-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media print {
  .attachments-list {
    page-break-inside: avoid;
    border: 1px solid #000;
  }
  
  .attachment-item {
    page-break-inside: avoid;
  }
  
  .attachment-download {
    display: none;
  }
}
</style>
