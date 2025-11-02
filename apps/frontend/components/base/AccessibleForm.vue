<!--
  Accessible Form Component
  Demonstrates WCAG 2.1 AA compliant form implementation
  This is a reference implementation for developers
-->

<template>
  <form
    @submit.prevent="handleSubmit"
    novalidate
    aria-labelledby="form-title"
  >
    <h2 id="form-title" class="mb-6 text-2xl font-bold">
      <slot name="title">表单标题</slot>
    </h2>

    <!-- Error Summary -->
    <div
      v-if="hasErrors && submitted"
      role="alert"
      aria-live="assertive"
      class="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
    >
      <div class="flex items-start gap-2">
        <Icon name="i-heroicons-exclamation-circle" class="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
        <div>
          <h3 class="font-semibold text-red-800 dark:text-red-200">
            表单验证失败
          </h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">
            请修复以下 {{ errorCount }} 个错误：
          </p>
          <ul class="mt-2 list-inside list-disc text-sm text-red-700 dark:text-red-300">
            <li v-for="(error, field) in errors" :key="field">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Form Fields Slot -->
    <div class="space-y-6">
      <slot :get-field-props="getFieldProps" :get-error-props="getErrorProps" :errors="errors" />
    </div>

    <!-- Form Actions -->
    <div class="mt-8 flex items-center justify-end gap-3">
      <button
        v-if="showCancel"
        type="button"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        @click="$emit('cancel')"
      >
        取消
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        :aria-busy="isSubmitting"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSubmitting" role="status" aria-label="加载中">
          <Icon name="i-heroicons-arrow-path" class="h-4 w-4 animate-spin" aria-hidden="true" />
        </span>
        <span>{{ isSubmitting ? '提交中...' : submitText }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFormAccessibility, type FormField } from '~/composables/useFormAccessibility'

const props = withDefaults(
  defineProps<{
    fields: Record<string, FormField>
    submitText?: string
    showCancel?: boolean
  }>(),
  {
    submitText: '提交',
    showCancel: false,
  }
)

const emit = defineEmits<{
  (e: 'submit', data: Record<string, any>): void
  (e: 'cancel'): void
}>()

const {
  errors,
  hasErrors,
  errorCount,
  validateAll,
  getFieldProps,
  getErrorProps,
} = useFormAccessibility(props.fields)

const isSubmitting = ref(false)
const submitted = ref(false)

const handleSubmit = async () => {
  submitted.value = true
  
  if (!validateAll()) {
    return
  }

  isSubmitting.value = true

  try {
    // Collect form data
    const data: Record<string, any> = {}
    for (const [key, field] of Object.entries(props.fields)) {
      data[key] = field.value.value
    }

    emit('submit', data)
  } finally {
    isSubmitting.value = false
  }
}
</script>
