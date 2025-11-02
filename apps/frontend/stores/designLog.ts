import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'

export interface DesignDecision {
  id: string
  title: string
  description: string
  rationale: string
  impact: string
  timestamp: Date
}

export interface IterationItem {
  id: string
  version: string
  date: Date
  changes: string
  order: number
}

export interface AttachmentFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  preview?: string
}

export interface DesignLogState {
  projectName: string
  projectDescription: string
  designProblem: string
  decisions: DesignDecision[]
  iterations: IterationItem[]
  reflection: string
  attachments: AttachmentFile[]
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  errors: Record<string, string>
  isDirty: boolean
}

export const useDesignLogStore = defineStore('designLog', () => {
  const state = ref<DesignLogState>({
    projectName: '',
    projectDescription: '',
    designProblem: '',
    decisions: [],
    iterations: [],
    reflection: '',
    attachments: [],
    saveStatus: 'idle',
    errors: {},
    isDirty: false,
  })

  const wordCount = computed(() => {
    return state.value.designProblem
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  })

  const isValid = computed(() => {
    return (
      state.value.projectName.trim().length > 0 &&
      state.value.designProblem.trim().length > 0 &&
      state.value.decisions.length > 0
    )
  })

  function setProjectInfo(name: string, description: string) {
    state.value.projectName = name
    state.value.projectDescription = description
    state.value.isDirty = true
  }

  function setDesignProblem(problem: string) {
    state.value.designProblem = problem
    state.value.isDirty = true
  }

  function addDecision(decision: Omit<DesignDecision, 'id' | 'timestamp'>) {
    const newDecision: DesignDecision = {
      ...decision,
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }
    state.value.decisions.push(newDecision)
    state.value.isDirty = true
  }

  function updateDecision(id: string, updates: Partial<DesignDecision>) {
    const index = state.value.decisions.findIndex((d) => d.id === id)
    if (index !== -1) {
      state.value.decisions[index] = { ...state.value.decisions[index], ...updates }
      state.value.isDirty = true
    }
  }

  function removeDecision(id: string) {
    state.value.decisions = state.value.decisions.filter((d) => d.id !== id)
    state.value.isDirty = true
  }

  function addIteration(iteration: Omit<IterationItem, 'id'>) {
    const newIteration: IterationItem = {
      ...iteration,
      id: `iteration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    state.value.iterations.push(newIteration)
    state.value.isDirty = true
  }

  function updateIteration(id: string, updates: Partial<IterationItem>) {
    const index = state.value.iterations.findIndex((i) => i.id === id)
    if (index !== -1) {
      state.value.iterations[index] = { ...state.value.iterations[index], ...updates }
      state.value.isDirty = true
    }
  }

  function removeIteration(id: string) {
    state.value.iterations = state.value.iterations.filter((i) => i.id !== id)
    state.value.isDirty = true
  }

  function reorderIterations(newOrder: IterationItem[]) {
    state.value.iterations = newOrder.map((item, index) => ({
      ...item,
      order: index,
    }))
    state.value.isDirty = true
  }

  function setReflection(reflection: string) {
    state.value.reflection = reflection
    state.value.isDirty = true
  }

  function addAttachment(file: AttachmentFile) {
    state.value.attachments.push(file)
    state.value.isDirty = true
  }

  function removeAttachment(id: string) {
    state.value.attachments = state.value.attachments.filter((a) => a.id !== id)
    state.value.isDirty = true
  }

  function setValidationError(field: string, message: string) {
    state.value.errors[field] = message
  }

  function clearValidationError(field: string) {
    delete state.value.errors[field]
  }

  function clearAllErrors() {
    state.value.errors = {}
  }

  function validateForm(): boolean {
    clearAllErrors()
    let isFormValid = true

    if (!state.value.projectName.trim()) {
      setValidationError('projectName', 'Project name is required')
      isFormValid = false
    }

    if (!state.value.designProblem.trim()) {
      setValidationError('designProblem', 'Design problem description is required')
      isFormValid = false
    }

    if (state.value.decisions.length === 0) {
      setValidationError('decisions', 'At least one design decision is required')
      isFormValid = false
    }

    return isFormValid
  }

  async function saveDesignLog() {
    if (!validateForm()) {
      state.value.saveStatus = 'error'
      return false
    }

    state.value.saveStatus = 'saving'

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      state.value.saveStatus = 'saved'
      state.value.isDirty = false

      setTimeout(() => {
        if (state.value.saveStatus === 'saved') {
          state.value.saveStatus = 'idle'
        }
      }, 3000)

      return true
    } catch (error) {
      state.value.saveStatus = 'error'
      console.error('Failed to save design log:', error)
      return false
    }
  }

  function resetForm() {
    state.value = {
      projectName: '',
      projectDescription: '',
      designProblem: '',
      decisions: [],
      iterations: [],
      reflection: '',
      attachments: [],
      saveStatus: 'idle',
      errors: {},
      isDirty: false,
    }
  }

  function loadFromTemplate(template: any) {
    if (template.projectName) state.value.projectName = template.projectName
    if (template.projectDescription) state.value.projectDescription = template.projectDescription
    if (template.designProblem) state.value.designProblem = template.designProblem
    if (template.reflection) state.value.reflection = template.reflection
    state.value.isDirty = false
  }

  return {
    state: readonly(state),
    wordCount,
    isValid,
    setProjectInfo,
    setDesignProblem,
    addDecision,
    updateDecision,
    removeDecision,
    addIteration,
    updateIteration,
    removeIteration,
    reorderIterations,
    setReflection,
    addAttachment,
    removeAttachment,
    setValidationError,
    clearValidationError,
    clearAllErrors,
    validateForm,
    saveDesignLog,
    resetForm,
    loadFromTemplate,
  }
})
