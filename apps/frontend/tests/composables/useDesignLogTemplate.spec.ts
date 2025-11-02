import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

vi.mock('~/utils/data-layer', () => ({
  fetchWithDataLayer: vi.fn(),
  buildStrapiQuery: vi.fn((params) => params),
  invalidateCache: vi.fn(),
}))

const mockUseAsyncData = vi.fn((key, fetcher, options) => ({
  data: ref(null),
  pending: ref(false),
  error: ref(null),
  refresh: vi.fn(),
}))

vi.mock('#app', () => ({
  useAsyncData: mockUseAsyncData,
}))

describe('useDesignLogTemplate composables', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  describe('useDesignLogTemplates', () => {
    it('should fetch all templates', async () => {
      const { useDesignLogTemplates } = await import('~/composables/useDesignLogTemplate')

      useDesignLogTemplates()

      expect(mockUseAsyncData).toHaveBeenCalledWith(
        'design-log-templates',
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should accept custom options', async () => {
      const { useDesignLogTemplates } = await import('~/composables/useDesignLogTemplate')

      useDesignLogTemplates({
        key: 'custom-templates',
        immediate: false,
      })

      expect(mockUseAsyncData).toHaveBeenCalledWith(
        'custom-templates',
        expect.any(Function),
        expect.objectContaining({
          immediate: false,
        })
      )
    })
  })

  describe('useDesignLogTemplate', () => {
    it('should fetch a single template by id', async () => {
      const { useDesignLogTemplate } = await import('~/composables/useDesignLogTemplate')

      useDesignLogTemplate(1)

      expect(mockUseAsyncData).toHaveBeenCalledWith(
        'design-log-template-1',
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should accept string id', async () => {
      const { useDesignLogTemplate } = await import('~/composables/useDesignLogTemplate')

      useDesignLogTemplate('abc123')

      expect(mockUseAsyncData).toHaveBeenCalledWith(
        'design-log-template-abc123',
        expect.any(Function),
        expect.any(Object)
      )
    })
  })

  describe('useDefaultDesignLogTemplate', () => {
    it('should fetch templates and return first one', async () => {
      const mockData = ref({
        data: [
          {
            id: 1,
            name: 'Default Template',
            description: 'Default template description',
          },
        ],
      })

      mockUseAsyncData.mockReturnValueOnce({
        data: mockData,
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
      })

      const { useDefaultDesignLogTemplate } = await import('~/composables/useDesignLogTemplate')
      const { data } = useDefaultDesignLogTemplate()

      expect(data.value).toEqual(mockData.value.data[0])
    })

    it('should return fallback template if no data', async () => {
      const mockData = ref(null)

      mockUseAsyncData.mockReturnValueOnce({
        data: mockData,
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
      })

      const { useDefaultDesignLogTemplate } = await import('~/composables/useDesignLogTemplate')
      const { data } = useDefaultDesignLogTemplate()

      expect(data.value).toBeDefined()
      expect(data.value.name).toBe('Default Template')
      expect(data.value.tooltips).toBeDefined()
    })

    it('should return fallback template if data is empty array', async () => {
      const mockData = ref({ data: [] })

      mockUseAsyncData.mockReturnValueOnce({
        data: mockData,
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
      })

      const { useDefaultDesignLogTemplate } = await import('~/composables/useDesignLogTemplate')
      const { data } = useDefaultDesignLogTemplate()

      expect(data.value).toBeDefined()
      expect(data.value.name).toBe('Default Template')
    })

    it('should include tooltips in fallback template', async () => {
      const mockData = ref(null)

      mockUseAsyncData.mockReturnValueOnce({
        data: mockData,
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
      })

      const { useDefaultDesignLogTemplate } = await import('~/composables/useDesignLogTemplate')
      const { data } = useDefaultDesignLogTemplate()

      expect(data.value.tooltips).toBeDefined()
      expect(data.value.tooltips?.projectName).toBeDefined()
      expect(data.value.tooltips?.designProblem).toBeDefined()
      expect(data.value.tooltips?.decisions).toBeDefined()
    })

    it('should include guidance in fallback template', async () => {
      const mockData = ref(null)

      mockUseAsyncData.mockReturnValueOnce({
        data: mockData,
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
      })

      const { useDefaultDesignLogTemplate } = await import('~/composables/useDesignLogTemplate')
      const { data } = useDefaultDesignLogTemplate()

      expect(data.value.guidance).toBeDefined()
      expect(typeof data.value.guidance).toBe('string')
    })

    it('should include example decisions in fallback template', async () => {
      const mockData = ref(null)

      mockUseAsyncData.mockReturnValueOnce({
        data: mockData,
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
      })

      const { useDefaultDesignLogTemplate } = await import('~/composables/useDesignLogTemplate')
      const { data } = useDefaultDesignLogTemplate()

      expect(data.value.exampleDecisions).toBeDefined()
      expect(Array.isArray(data.value.exampleDecisions)).toBe(true)
      expect(data.value.exampleDecisions?.length).toBeGreaterThan(0)
    })

    it('should include example iterations in fallback template', async () => {
      const mockData = ref(null)

      mockUseAsyncData.mockReturnValueOnce({
        data: mockData,
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
      })

      const { useDefaultDesignLogTemplate } = await import('~/composables/useDesignLogTemplate')
      const { data } = useDefaultDesignLogTemplate()

      expect(data.value.exampleIterations).toBeDefined()
      expect(Array.isArray(data.value.exampleIterations)).toBe(true)
      expect(data.value.exampleIterations?.length).toBeGreaterThan(0)
    })
  })
})
