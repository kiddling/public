<!--
  Accessible Input Component
  WCAG 2.1 AA compliant input field with proper labeling and error handling
-->

<template>
  <div class="space-y-2">
    <!-- Label -->
    <label :for="inputId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-600" aria-label="必填">*</span>
    </label>

    <!-- Help Text -->
    <p v-if="helpText" :id="`${inputId}-help`" class="text-sm text-gray-600 dark:text-gray-400">
      {{ helpText }}
    </p>

    <!-- Input Field -->
    <input
      :id="inputId"
      :type="type"
      :name="name"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-required="required ? 'true' : undefined"
      :aria-invalid="hasError ? 'true' : 'false'"
      :aria-describedby="describedBy"
      class="focus:ring-primary-500 block w-full rounded-lg border px-4 py-2 text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100"
      :class="[
        hasError
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
          : 'focus:border-primary-500 border-gray-300 dark:border-gray-600',
      ]"
      @input="handleInput"
      @blur="handleBlur"
    />

    <!-- Error Message -->
    <div
      v-if="hasError && error"
      :id="`${inputId}-error`"
      role="alert"
      aria-live="assertive"
      class="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
    >
      <Icon name="i-heroicons-exclamation-circle" class="mt-0.5 h-4 w-4" aria-hidden="true" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    label: string
    type?: string
    name?: string
    required?: boolean
    disabled?: boolean
    placeholder?: string
    autocomplete?: string
    helpText?: string
    error?: string
  }>(),
  {
    type: 'text',
    required: false,
    disabled: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur'): void
}>()

// Generate unique ID for accessibility
const inputId = computed(() => {
  return props.name || `input-${Math.random().toString(36).substr(2, 9)}`
})

const hasError = computed(() => !!props.error)

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.helpText) ids.push(`${inputId.value}-help`)
  if (hasError.value) ids.push(`${inputId.value}-error`)
  return ids.length > 0 ? ids.join(' ') : undefined
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

const handleBlur = () => {
  emit('blur')
}
</script>
