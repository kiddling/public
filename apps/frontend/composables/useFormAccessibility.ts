/**
 * Form Accessibility Composable
 * Provides accessible form validation and error handling
 * Complies with WCAG 2.1 AA standards
 */

import { ref, computed, type Ref } from 'vue'
import { useAriaLive } from './useAriaLive'

export interface ValidationRule {
  validate: (value: any) => boolean
  message: string
}

export interface FormField {
  value: Ref<any>
  rules?: ValidationRule[]
  label: string
  required?: boolean
}

export function useFormAccessibility(fields: Record<string, FormField>) {
  const { announceAssertive } = useAriaLive()

  const errors = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})

  const validateField = (fieldName: string): boolean => {
    const field = fields[fieldName]
    if (!field) return true

    // Check required
    if (field.required && !field.value.value) {
      errors.value[fieldName] = `${field.label}是必填项`
      return false
    }

    // Check custom rules
    if (field.rules) {
      for (const rule of field.rules) {
        if (!rule.validate(field.value.value)) {
          errors.value[fieldName] = rule.message
          return false
        }
      }
    }

    // Clear error if valid
    delete errors.value[fieldName]
    return true
  }

  const validateAll = (): boolean => {
    let isValid = true
    const errorMessages: string[] = []

    for (const fieldName in fields) {
      if (!validateField(fieldName)) {
        isValid = false
        errorMessages.push(errors.value[fieldName])
      }
    }

    // Announce errors to screen readers
    if (!isValid) {
      const summary = `表单验证失败，发现 ${errorMessages.length} 个错误`
      announceAssertive(summary)
    }

    return isValid
  }

  const markTouched = (fieldName: string) => {
    touched.value[fieldName] = true
  }

  const resetForm = () => {
    errors.value = {}
    touched.value = {}
  }

  const getFieldProps = (fieldName: string) => {
    const field = fields[fieldName]
    const hasError = !!errors.value[fieldName]
    const isTouched = touched.value[fieldName]

    return {
      'aria-required': field.required ? 'true' : undefined,
      'aria-invalid': hasError ? 'true' : 'false',
      'aria-describedby': hasError ? `${fieldName}-error` : undefined,
    }
  }

  const getErrorProps = (fieldName: string) => {
    const hasError = !!errors.value[fieldName]

    return {
      id: `${fieldName}-error`,
      role: 'alert',
      'aria-live': 'assertive' as const,
    }
  }

  const hasErrors = computed(() => Object.keys(errors.value).length > 0)

  const errorCount = computed(() => Object.keys(errors.value).length)

  return {
    errors,
    touched,
    hasErrors,
    errorCount,
    validateField,
    validateAll,
    markTouched,
    resetForm,
    getFieldProps,
    getErrorProps,
  }
}

/**
 * Common validation rules
 */
export const validationRules = {
  email: {
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return !value || emailRegex.test(value)
    },
    message: '请输入有效的邮箱地址',
  },

  minLength: (min: number) => ({
    validate: (value: string) => !value || value.length >= min,
    message: `至少需要 ${min} 个字符`,
  }),

  maxLength: (max: number) => ({
    validate: (value: string) => !value || value.length <= max,
    message: `最多 ${max} 个字符`,
  }),

  phone: {
    validate: (value: string) => {
      const phoneRegex = /^1[3-9]\d{9}$/
      return !value || phoneRegex.test(value)
    },
    message: '请输入有效的手机号码',
  },

  url: {
    validate: (value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message: '请输入有效的 URL',
  },

  number: {
    validate: (value: any) => !value || !isNaN(Number(value)),
    message: '请输入数字',
  },

  integer: {
    validate: (value: any) => !value || Number.isInteger(Number(value)),
    message: '请输入整数',
  },
}
