<template>
  <div class="iteration-timeline">
    <div class="flex justify-between items-center mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Iteration Timeline
        <HelpPopover v-if="tooltip" :content="tooltip" />
      </label>
      <button
        type="button"
        class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        @click="addNewIteration"
      >
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Iteration
      </button>
    </div>

    <div v-if="iterations.length === 0" class="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <svg class="mx-auto w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-600 dark:text-gray-400">No iterations yet. Click "Add Iteration" to track your design evolution.</p>
    </div>

    <draggable
      v-else
      v-model="localIterations"
      item-key="id"
      handle=".drag-handle"
      class="space-y-3"
      @end="handleReorder"
    >
      <template #item="{ element: iteration, index }">
        <div
          class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          :class="{ 'ring-2 ring-blue-500': isDragging }"
          role="listitem"
          :aria-label="`Iteration ${index + 1}: ${iteration.version}`"
        >
          <div class="flex items-start space-x-3">
            <button
              type="button"
              class="drag-handle cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded mt-1"
              :aria-label="`Drag to reorder iteration ${index + 1}`"
              @keydown="handleKeyboardDrag($event, index)"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            <div class="flex-1 min-w-0 space-y-3">
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Iteration {{ index + 1 }}
                </span>
                <button
                  type="button"
                  class="text-red-500 hover:text-red-700 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  :aria-label="`Remove iteration ${index + 1}`"
                  @click="removeIteration(iteration.id)"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label :for="`iteration-version-${iteration.id}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Version
                  </label>
                  <input
                    :id="`iteration-version-${iteration.id}`"
                    v-model="iteration.version"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="v1.0"
                    @input="handleUpdate(iteration.id, 'version', iteration.version)"
                  />
                </div>

                <div>
                  <label :for="`iteration-date-${iteration.id}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    :id="`iteration-date-${iteration.id}`"
                    :value="formatDate(iteration.date)"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    @change="handleDateChange(iteration.id, $event)"
                  />
                </div>
              </div>

              <div>
                <label :for="`iteration-changes-${iteration.id}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Changes
                </label>
                <textarea
                  :id="`iteration-changes-${iteration.id}`"
                  v-model="iteration.changes"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="What changed in this iteration?"
                  @input="handleUpdate(iteration.id, 'changes', iteration.changes)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import type { IterationItem } from '~/stores/designLog'

const props = defineProps<{
  iterations: IterationItem[]
  tooltip?: string
}>()

const emit = defineEmits<{
  add: []
  update: [id: string, updates: Partial<IterationItem>]
  remove: [id: string]
  reorder: [items: IterationItem[]]
}>()

const localIterations = ref<IterationItem[]>([...props.iterations])
const isDragging = ref(false)

watch(() => props.iterations, (newIterations) => {
  localIterations.value = [...newIterations]
}, { deep: true })

function addNewIteration() {
  emit('add')
}

function handleUpdate(id: string, field: keyof IterationItem, value: any) {
  emit('update', id, { [field]: value })
}

function removeIteration(id: string) {
  emit('remove', id)
}

function handleReorder() {
  isDragging.value = false
  emit('reorder', localIterations.value)
}

function handleDateChange(id: string, event: Event) {
  const target = event.target as HTMLInputElement
  const date = new Date(target.value)
  handleUpdate(id, 'date', date)
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function handleKeyboardDrag(event: KeyboardEvent, index: number) {
  if (event.key === 'ArrowUp' && index > 0) {
    event.preventDefault()
    const items = [...localIterations.value]
    ;[items[index - 1], items[index]] = [items[index], items[index - 1]]
    localIterations.value = items
    emit('reorder', localIterations.value)
  } else if (event.key === 'ArrowDown' && index < localIterations.value.length - 1) {
    event.preventDefault()
    const items = [...localIterations.value]
    ;[items[index], items[index + 1]] = [items[index + 1], items[index]]
    localIterations.value = items
    emit('reorder', localIterations.value)
  }
}
</script>
