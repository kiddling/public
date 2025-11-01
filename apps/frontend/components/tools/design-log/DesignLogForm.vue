<template>
  <form class="design-log-form space-y-6" @submit.prevent="handleSubmit">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Project Information
      </h2>

      <div class="space-y-4">
        <div>
          <label for="project-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name
            <span class="text-red-500">*</span>
            <HelpPopover v-if="tooltips?.projectName" :content="tooltips.projectName" />
          </label>
          <input
            id="project-name"
            v-model="projectName"
            type="text"
            required
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            :class="errors.projectName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
            placeholder="Enter your project name"
            @input="clearError('projectName')"
          />
          <p v-if="errors.projectName" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.projectName }}
          </p>
        </div>

        <div>
          <label for="project-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Description
            <HelpPopover v-if="tooltips?.projectDescription" :content="tooltips.projectDescription" />
          </label>
          <textarea
            id="project-description"
            v-model="projectDescription"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Provide context about your project"
          />
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Design Problem
      </h2>

      <div>
        <label for="design-problem" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Problem Statement
          <span class="text-red-500">*</span>
          <HelpPopover v-if="tooltips?.designProblem" :content="tooltips.designProblem" />
        </label>
        <textarea
          id="design-problem"
          v-model="designProblem"
          rows="5"
          required
          class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          :class="errors.designProblem ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
          placeholder="Describe the design problem you are solving"
          @input="clearError('designProblem')"
        />
        <div class="mt-1 flex justify-between items-center">
          <p v-if="errors.designProblem" class="text-sm text-red-600 dark:text-red-400">
            {{ errors.designProblem }}
          </p>
          <span v-else class="text-sm text-gray-500 dark:text-gray-400">
            {{ wordCount }} words
          </span>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <DesignDecisionList
        :decisions="store.state.decisions"
        :tooltip="tooltips?.decisions"
        :error="errors.decisions"
        @add="handleAddDecision"
        @update="handleUpdateDecision"
        @remove="handleRemoveDecision"
      />
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <IterationTimeline
        :iterations="store.state.iterations"
        :tooltip="tooltips?.iterations"
        @add="handleAddIteration"
        @update="handleUpdateIteration"
        @remove="handleRemoveIteration"
        @reorder="handleReorderIterations"
      />
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Reflection
      </h2>

      <div>
        <label for="reflection" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Learning & Insights
          <HelpPopover v-if="tooltips?.reflection" :content="tooltips.reflection" />
        </label>
        <textarea
          id="reflection"
          v-model="reflection"
          rows="5"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          placeholder="What did you learn? What would you do differently next time?"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <AttachmentUploader
        :attachments="store.state.attachments"
        :tooltip="tooltips?.attachments"
        @add="handleAddAttachment"
        @remove="handleRemoveAttachment"
      />
    </div>

    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex items-center space-x-4">
        <div v-if="saveStatus !== 'idle'" class="flex items-center space-x-2">
          <svg
            v-if="saveStatus === 'saving'"
            class="animate-spin h-5 w-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <svg
            v-else-if="saveStatus === 'saved'"
            class="h-5 w-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg
            v-else-if="saveStatus === 'error'"
            class="h-5 w-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-medium" :class="{
            'text-blue-600 dark:text-blue-400': saveStatus === 'saving',
            'text-green-600 dark:text-green-400': saveStatus === 'saved',
            'text-red-600 dark:text-red-400': saveStatus === 'error',
          }">
            {{ saveStatusText }}
          </span>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @click="handleReset"
        >
          Reset
        </button>
        <button
          type="submit"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="saveStatus === 'saving'"
        >
          Save Design Log
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDesignLogStore } from '~/stores/designLog'
import type { DesignDecision, IterationItem, AttachmentFile } from '~/stores/designLog'

const props = defineProps<{
  tooltips?: Record<string, string>
}>()

const store = useDesignLogStore()

const projectName = computed({
  get: () => store.state.projectName,
  set: (value: string) => store.setProjectInfo(value, store.state.projectDescription),
})

const projectDescription = computed({
  get: () => store.state.projectDescription,
  set: (value: string) => store.setProjectInfo(store.state.projectName, value),
})

const designProblem = computed({
  get: () => store.state.designProblem,
  set: (value: string) => store.setDesignProblem(value),
})

const reflection = computed({
  get: () => store.state.reflection,
  set: (value: string) => store.setReflection(value),
})

const wordCount = computed(() => store.wordCount)
const errors = computed(() => store.state.errors)
const saveStatus = computed(() => store.state.saveStatus)

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saving':
      return 'Saving...'
    case 'saved':
      return 'Saved successfully'
    case 'error':
      return 'Error saving'
    default:
      return ''
  }
})

function clearError(field: string) {
  store.clearValidationError(field)
}

function handleAddDecision() {
  store.addDecision({
    title: '',
    description: '',
    rationale: '',
    impact: '',
  })
  store.clearValidationError('decisions')
}

function handleUpdateDecision(id: string, updates: Partial<DesignDecision>) {
  store.updateDecision(id, updates)
}

function handleRemoveDecision(id: string) {
  store.removeDecision(id)
}

function handleAddIteration() {
  store.addIteration({
    version: '',
    date: new Date(),
    changes: '',
    order: store.state.iterations.length,
  })
}

function handleUpdateIteration(id: string, updates: Partial<IterationItem>) {
  store.updateIteration(id, updates)
}

function handleRemoveIteration(id: string) {
  store.removeIteration(id)
}

function handleReorderIterations(items: IterationItem[]) {
  store.reorderIterations(items)
}

function handleAddAttachment(file: AttachmentFile) {
  store.addAttachment(file)
}

function handleRemoveAttachment(id: string) {
  store.removeAttachment(id)
}

async function handleSubmit() {
  await store.saveDesignLog()
}

function handleReset() {
  if (confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
    store.resetForm()
  }
}
</script>
