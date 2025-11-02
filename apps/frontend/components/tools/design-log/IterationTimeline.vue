<template>
  <div class="iteration-timeline">
    <div class="mb-4 flex items-center justify-between">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Iteration Timeline
        <HelpPopover v-if="tooltip" :content="tooltip" />
      </label>
      <button
        type="button"
        class="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20"
        @click="addNewIteration"
      >
        <svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Iteration
      </button>
    </div>

    <div
      v-if="iterations.length === 0"
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-gray-600 dark:text-gray-400">
        No iterations yet. Click "Add Iteration" to track your design evolution.
      </p>
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
          class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          :class="{ 'ring-2 ring-blue-500': isDragging }"
          role="listitem"
          :aria-label="`Iteration ${index + 1}: ${iteration.version}`"
        >
          <div class="flex items-start space-x-3">
            <button
              type="button"
              class="drag-handle mt-1 cursor-move rounded text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:text-gray-300"
              :aria-label="`Drag to reorder iteration ${index + 1}`"
              @keydown="handleKeyboardDrag($event, index)"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                />
              </svg>
            </button>

            <div class="min-w-0 flex-1 space-y-3">
              <div class="flex items-center justify-between">
                <span
                  class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  Iteration {{ index + 1 }}
                </span>
                <button
                  type="button"
                  class="rounded text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:text-red-400"
                  :aria-label="`Remove iteration ${index + 1}`"
                  @click="removeIteration(iteration.id)"
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

              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label
                    :for="`iteration-version-${iteration.id}`"
                    class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Version
                  </label>
                  <input
                    :id="`iteration-version-${iteration.id}`"
                    v-model="iteration.version"
                    type="text"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="v1.0"
                    @input="handleUpdate(iteration.id, 'version', iteration.version)"
                  />
                </div>

                <div>
                  <label
                    :for="`iteration-date-${iteration.id}`"
                    class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Date
                  </label>
                  <input
                    :id="`iteration-date-${iteration.id}`"
                    :value="formatDate(iteration.date)"
                    type="date"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    @change="handleDateChange(iteration.id, $event)"
                  />
                </div>
              </div>

              <div>
                <label
                  :for="`iteration-changes-${iteration.id}`"
                  class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Changes
                </label>
                <textarea
                  :id="`iteration-changes-${iteration.id}`"
                  v-model="iteration.changes"
                  rows="3"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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

watch(
  () => props.iterations,
  (newIterations) => {
    localIterations.value = [...newIterations]
  },
  { deep: true }
)

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
