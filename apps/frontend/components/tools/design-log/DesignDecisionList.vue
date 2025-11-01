<template>
  <div class="design-decision-list">
    <div class="flex justify-between items-center mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Design Decisions
        <HelpPopover v-if="tooltip" :content="tooltip" />
      </label>
      <button
        type="button"
        class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        @click="addNewDecision"
      >
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Decision
      </button>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </div>

    <div v-if="decisions.length === 0" class="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <svg class="mx-auto w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-600 dark:text-gray-400">No design decisions yet. Click "Add Decision" to get started.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(decision, index) in decisions"
        :key="decision.id"
        class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <div class="flex justify-between items-start mb-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            Decision {{ index + 1 }}
          </span>
          <button
            type="button"
            class="text-red-500 hover:text-red-700 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            :aria-label="`Remove decision ${index + 1}`"
            @click="removeDecision(decision.id)"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label :for="`decision-title-${decision.id}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              :id="`decision-title-${decision.id}`"
              v-model="decision.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Brief title for this decision"
              @input="handleUpdate(decision.id, 'title', decision.title)"
            />
          </div>

          <div>
            <label :for="`decision-description-${decision.id}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              :id="`decision-description-${decision.id}`"
              v-model="decision.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="What did you decide?"
              @input="handleUpdate(decision.id, 'description', decision.description)"
            />
          </div>

          <div>
            <label :for="`decision-rationale-${decision.id}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rationale
            </label>
            <textarea
              :id="`decision-rationale-${decision.id}`"
              v-model="decision.rationale"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Why did you make this decision?"
              @input="handleUpdate(decision.id, 'rationale', decision.rationale)"
            />
          </div>

          <div>
            <label :for="`decision-impact-${decision.id}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Impact
            </label>
            <textarea
              :id="`decision-impact-${decision.id}`"
              v-model="decision.impact"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="What effect did this have on your design?"
              @input="handleUpdate(decision.id, 'impact', decision.impact)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DesignDecision } from '~/stores/designLog'

const props = defineProps<{
  decisions: DesignDecision[]
  tooltip?: string
  error?: string
}>()

const emit = defineEmits<{
  add: []
  update: [id: string, updates: Partial<DesignDecision>]
  remove: [id: string]
}>()

function addNewDecision() {
  emit('add')
}

function handleUpdate(id: string, field: keyof DesignDecision, value: any) {
  emit('update', id, { [field]: value })
}

function removeDecision(id: string) {
  emit('remove', id)
}
</script>
