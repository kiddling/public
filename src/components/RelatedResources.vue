<template>
  <div
    v-if="resources && resources.length > 0"
    class="related-resources"
  >
    <h3 class="resources-title">
      Related Resources
    </h3>
    <div class="resources-grid">
      <div
        v-for="resource in resources"
        :key="resource.id"
        class="resource-card"
      >
        <div class="resource-content">
          <div class="resource-type-badge">
            {{ resource.type === 'external' ? 'External' : 'Knowledge Card' }}
          </div>
          <h4 class="resource-name">
            {{ resource.title }}
          </h4>
          <p class="resource-description">
            {{ resource.description }}
          </p>
          <div class="resource-actions">
            <a
              :href="resource.url"
              class="resource-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>View Resource</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line
                  x1="10"
                  y1="14"
                  x2="21"
                  y2="3"
                />
              </svg>
            </a>
            <button
              class="qr-button"
              :aria-label="`Show QR code for ${resource.title}`"
              @click="toggleQRCode(resource.id)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                />
                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                />
                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                />
                <rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                />
              </svg>
              <span>QR Code</span>
            </button>
          </div>
        </div>
        <div
          v-if="showQR[resource.id]"
          class="qr-code-container"
        >
          <div class="qr-code-placeholder">
            <svg
              viewBox="0 0 100 100"
              class="qr-code-svg"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Simplified QR code representation -->
              <rect
                width="100"
                height="100"
                fill="white"
              />
              <rect
                x="10"
                y="10"
                width="15"
                height="15"
                fill="black"
              />
              <rect
                x="75"
                y="10"
                width="15"
                height="15"
                fill="black"
              />
              <rect
                x="10"
                y="75"
                width="15"
                height="15"
                fill="black"
              />
              <rect
                x="30"
                y="30"
                width="5"
                height="5"
                fill="black"
              />
              <rect
                x="40"
                y="30"
                width="5"
                height="5"
                fill="black"
              />
              <rect
                x="50"
                y="30"
                width="5"
                height="5"
                fill="black"
              />
              <rect
                x="35"
                y="40"
                width="5"
                height="5"
                fill="black"
              />
              <rect
                x="45"
                y="40"
                width="5"
                height="5"
                fill="black"
              />
              <rect
                x="55"
                y="40"
                width="5"
                height="5"
                fill="black"
              />
            </svg>
            <p class="qr-code-label">
              Scan to access on mobile
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  resources: {
    type: Array,
    default: () => []
  }
})

const showQR = ref({})

const toggleQRCode = (resourceId) => {
  showQR.value[resourceId] = !showQR.value[resourceId]
}
</script>

<style scoped>
.related-resources {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.resources-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.resources-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.resource-card {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.resource-card:hover {
  border-color: var(--color-loop-1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.resource-content {
  padding: 1.25rem;
}

.resource-type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-loop-1);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
}

.resource-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  line-height: 1.4;
}

.resource-description {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.resource-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.resource-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-loop-1);
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.resource-link:hover {
  background-color: var(--color-loop-2);
  transform: translateX(2px);
}

.resource-link:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
}

.qr-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.qr-button:hover {
  background-color: var(--color-surface);
  border-color: var(--color-loop-1);
  color: var(--color-loop-1);
}

.qr-button:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
}

.qr-code-container {
  padding: 1.25rem;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.qr-code-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.qr-code-svg {
  width: 120px;
  height: 120px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
}

.qr-code-label {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  text-align: center;
}

@media print {
  .related-resources {
    page-break-inside: avoid;
    border: 1px solid #000;
  }
  
  .qr-button {
    display: none;
  }
  
  .qr-code-container {
    display: block !important;
  }
  
  .resources-grid {
    display: block;
  }
  
  .resource-card {
    page-break-inside: avoid;
    margin-bottom: 1rem;
  }
}
</style>
