<template>
  <div class="design-decision-list">
    <div class="mb-4 flex items-center justify-between">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Design Decisions
        <HelpPopover v-if="tooltip" :content="tooltip" />
      </label>
      <button
        type="button"
        class="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20"
        @click="addNewDecision"
      >
        <svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Decision
      </button>
    </div>

    <div
      v-if="error"
      class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
    >
      {{ error }}
    </div>

    <div
      v-if="decisions.length === 0"
      class="rounded-lg bg-gray-50 py-8 text-center dark:bg-gray-800"
    >
      <svg
        class="mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p class="text-gray-600 dark:text-gray-400">
        No design decisions yet. Click "Add Decision" to get started.
      </p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(decision, index) in decisions"
        :key="decision.id"
        class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="mb-3 flex items-start justify-between">
          <span
            class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            Decision {{ index + 1 }}
          </span>
          <button
            type="button"
            class="rounded text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:text-red-400"
            :aria-label="`Remove decision ${index + 1}`"
            @click="removeDecision(decision.id)"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label
              :for="`decision-title-${decision.id}`"
              class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title
            </label>
            <input
              :id="`decision-title-${decision.id}`"
              v-model="decision.title"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Brief title for this decision"
              @input="handleUpdate(decision.id, 'title', decision.title)"
            />
          </div>

          <div>
            <label
              :for="`decision-description-${decision.id}`"
              class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              :id="`decision-description-${decision.id}`"
              v-model="decision.description"
              rows="2"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder="What did you decide?"
              @input="handleUpdate(decision.id, 'description', decision.description)"
            />
          </div>

          <div>
            <label
              :for="`decision-rationale-${decision.id}`"
              class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Rationale
            </label>
            <textarea
              :id="`decision-rationale-${decision.id}`"
              v-model="decision.rationale"
              rows="2"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Why did you make this decision?"
              @input="handleUpdate(decision.id, 'rationale', decision.rationale)"
            />
          </div>

          <div>
            <label
              :for="`decision-impact-${decision.id}`"
              class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Impact
            </label>
            <textarea
              :id="`decision-impact-${decision.id}`"
              v-model="decision.impact"
              rows="2"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
