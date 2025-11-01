import type { UseCmsDataOptions } from './useCmsData'
import { useCmsData } from './useCmsData'

export interface DesignLogTemplate {
  id: number
  documentId?: string
  name: string
  description?: string
  projectName?: string
  projectDescription?: string
  designProblem?: string
  exampleDecisions?: Array<{
    title: string
    description: string
    rationale: string
    impact: string
  }>
  exampleIterations?: Array<{
    version: string
    changes: string
  }>
  reflection?: string
  tooltips?: Record<string, string>
  guidance?: string
}

const DESIGN_LOG_TEMPLATES_ENDPOINT = '/api/cms/design-log-templates'

export function useDesignLogTemplates(options: UseCmsDataOptions = {}) {
  const key = options.key ?? 'design-log-templates'
  
  return useCmsData<{ data: DesignLogTemplate[] }>(
    DESIGN_LOG_TEMPLATES_ENDPOINT,
    {},
    { ...options, key }
  )
}

export function useDesignLogTemplate(id: string | number, options: UseCmsDataOptions = {}) {
  const endpoint = `${DESIGN_LOG_TEMPLATES_ENDPOINT}/${id}`
  const key = options.key ?? `design-log-template-${id}`
  
  return useCmsData<{ data: DesignLogTemplate }>(
    endpoint,
    {},
    { ...options, key }
  )
}

export function useDefaultDesignLogTemplate(options: UseCmsDataOptions = {}) {
  const { data, pending, error, refresh } = useDesignLogTemplates({
    ...options,
    immediate: options.immediate !== false,
  })

  const defaultTemplate = computed(() => {
    if (!data.value?.data || data.value.data.length === 0) {
      return createFallbackTemplate()
    }
    return data.value.data[0]
  })

  return {
    data: defaultTemplate,
    pending,
    error,
    refresh,
  }
}

function createFallbackTemplate(): DesignLogTemplate {
  return {
    id: 0,
    name: 'Default Template',
    description: 'Default design log template',
    projectName: '',
    projectDescription: '',
    designProblem: '',
    exampleDecisions: [
      {
        title: 'Example Decision',
        description: 'Describe what you decided',
        rationale: 'Explain why you made this decision',
        impact: 'What effect did this have on your design?',
      },
    ],
    exampleIterations: [
      {
        version: 'v1.0',
        changes: 'Initial design',
      },
    ],
    reflection: '',
    tooltips: {
      projectName: 'Give your project a clear, descriptive name',
      projectDescription: 'Provide context about what you are designing',
      designProblem: 'Describe the problem you are trying to solve with this design',
      decisions: 'Document each significant design decision and its reasoning',
      iterations: 'Track how your design evolved through different versions',
      reflection: 'Reflect on what you learned and what you would do differently',
      attachments: 'Upload images, sketches, or other files related to your design',
    },
    guidance: 'Use this design log to document your design process. Be thorough and thoughtful in your responses.',
  }
}
