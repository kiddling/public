<template>
  <div class="difficulty-toggle">
    <div
      class="toggle-header"
      role="group"
      aria-label="Difficulty level selector"
    >
      <button
        v-for="level in difficultyLevels"
        :key="level.value"
        :class="[
          'toggle-button',
          { active: currentDifficulty === level.value }
        ]"
        :aria-pressed="currentDifficulty === level.value"
        :aria-label="`${level.label} difficulty level: ${level.description}`"
        :title="level.tooltip"
        @click="selectDifficulty(level.value)"
      >
        <span
          class="toggle-icon"
          :aria-hidden="true"
        >
          {{ level.icon }}
        </span>
        <span class="toggle-label">{{ level.label }}</span>
      </button>
    </div>
    <div class="toggle-description">
      <p>{{ currentLevelDescription }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'preferred_difficulty_level'

const difficultyLevels = [
  {
    value: 'base',
    label: 'Base',
    icon: '●',
    description: 'Essential concepts and foundational knowledge',
    tooltip: 'Base: Start with core concepts (15-20 min)'
  },
  {
    value: 'advance',
    label: 'Advance',
    icon: '●●',
    description: 'Deeper exploration with practical applications',
    tooltip: 'Advance: Detailed exploration and practice (30-35 min)'
  },
  {
    value: 'stretch',
    label: 'Stretch',
    icon: '●●●',
    description: 'Independent research and advanced challenges',
    tooltip: 'Stretch: Extended challenges and research (45-60 min)'
  }
]

const emit = defineEmits(['difficulty-changed'])

// Load preferred difficulty from localStorage or default to 'base'
const loadPreferredDifficulty = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && ['base', 'advance', 'stretch'].includes(stored)) {
      return stored
    }
  } catch (error) {
    console.error('Error loading difficulty preference:', error)
  }
  return 'base'
}

const currentDifficulty = ref(loadPreferredDifficulty())

const currentLevelDescription = computed(() => {
  const level = difficultyLevels.find(l => l.value === currentDifficulty.value)
  return level ? level.description : ''
})

const selectDifficulty = (level) => {
  if (currentDifficulty.value !== level) {
    currentDifficulty.value = level
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, level)
    } catch (error) {
      console.error('Error saving difficulty preference:', error)
    }
    
    // Emit change event
    emit('difficulty-changed', level)
  }
}

// Watch for changes and emit
watch(currentDifficulty, (newValue) => {
  emit('difficulty-changed', newValue)
}, { immediate: true })
</script>

<style scoped>
.difficulty-toggle {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.toggle-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.toggle-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.toggle-button:hover {
  border-color: var(--color-loop-1);
  background-color: var(--color-surface);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.toggle-button:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
}

.toggle-button.active {
  background-color: var(--color-loop-1);
  border-color: var(--color-loop-1);
  color: white;
  font-weight: 600;
}

.toggle-button.active .toggle-icon {
  color: white;
}

.toggle-icon {
  font-size: 1.25rem;
  color: var(--color-loop-1);
  transition: color 0.2s ease;
}

.toggle-label {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.75rem;
}

.toggle-description {
  padding: 0.75rem 1rem;
  background-color: var(--color-background);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 640px) {
  .toggle-header {
    flex-direction: column;
  }
  
  .toggle-button {
    flex-direction: row;
    justify-content: center;
  }
}

@media print {
  .difficulty-toggle {
    display: none;
  }
}
</style>
