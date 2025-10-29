<template>
  <div v-if="showBanner" class="cookie-consent">
    <div class="consent-content">
      <p>
        我们使用分析工具来改善您的体验。继续使用本站即表示您同意我们使用分析工具。
      </p>
      <div class="consent-actions">
        <button @click="accept" class="btn-accept">接受</button>
        <button @click="decline" class="btn-decline">拒绝</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { consentGiven, giveConsent, revokeConsent } = useBaiduAnalytics()

const showBanner = ref(false)

onMounted(() => {
  if (process.client) {
    const hasResponded = localStorage.getItem('analytics-consent')
    showBanner.value = hasResponded === null
  }
})

const accept = () => {
  giveConsent()
  showBanner.value = false
}

const decline = () => {
  revokeConsent()
  showBanner.value = false
}
</script>

<style scoped>
.cookie-consent {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  z-index: 10000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.consent-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.consent-content p {
  margin: 0;
  color: #4a5568;
  flex: 1;
}

.consent-actions {
  display: flex;
  gap: 1rem;
}

.btn-accept,
.btn-decline {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-accept {
  background: #667eea;
  color: white;
}

.btn-accept:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.btn-decline {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-decline:hover {
  background: #cbd5e0;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .consent-content {
    flex-direction: column;
    text-align: center;
  }
  
  .consent-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .btn-accept,
  .btn-decline {
    width: 100%;
  }
}
</style>
