<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    class="markdown-content"
    v-html="renderedHtml"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

// Simple markdown parser (for demo purposes - in production use a library like marked or markdown-it)
const renderedHtml = computed(() => {
  let html = props.content
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
  // Lists
  html = html.replace(/^- (.+)$/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  // Paragraphs
  html = html.split('\n\n').map(paragraph => {
    if (!paragraph.trim()) return ''
    if (paragraph.startsWith('<h') || paragraph.startsWith('<ul')) return paragraph
    return `<p>${paragraph}</p>`
  }).join('\n')
  
  return html
})
</script>

<style scoped>
.markdown-content {
  line-height: 1.8;
  color: var(--color-text);
}

.markdown-content :deep(h1) {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  margin-top: 2rem;
  line-height: 1.2;
  color: var(--color-text);
}

.markdown-content :deep(h1:first-child) {
  margin-top: 0;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  margin-top: 2rem;
  line-height: 1.3;
  color: var(--color-text);
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
  line-height: 1.4;
  color: var(--color-text);
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.8;
}

.markdown-content :deep(ul) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
  list-style-type: disc;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: var(--color-text);
}

@media print {
  .markdown-content {
    font-size: 11pt;
    line-height: 1.6;
  }
  
  .markdown-content :deep(h1) {
    font-size: 18pt;
    page-break-after: avoid;
  }
  
  .markdown-content :deep(h2) {
    font-size: 14pt;
    page-break-after: avoid;
  }
  
  .markdown-content :deep(h3) {
    font-size: 12pt;
    page-break-after: avoid;
  }
}
</style>
