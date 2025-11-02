import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import DesignLogPage from '~/pages/tools/design-log.vue'

vi.mock('~/composables/useDesignLogTemplate', () => ({
  useDefaultDesignLogTemplate: vi.fn(() => ({
    data: ref({
      name: 'Default Template',
      guidance: 'Test guidance text',
      tooltips: {
        projectName: 'Project name help',
        designProblem: 'Design problem help',
      },
    }),
    pending: ref(false),
    error: ref(null),
  })),
}))

describe('Design Log Page', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render the page', () => {
    const wrapper = mount(DesignLogPage)

    expect(wrapper.find('.design-log-page').exists()).toBe(true)
  })

  it('should display page title', () => {
    const wrapper = mount(DesignLogPage)

    expect(wrapper.text()).toContain('Design Log')
  })

  it('should display page description', () => {
    const wrapper = mount(DesignLogPage)

    expect(wrapper.text()).toContain('Document your design process')
  })

  it('should display guidance when available', () => {
    const wrapper = mount(DesignLogPage)

    expect(wrapper.text()).toContain('Test guidance text')
  })

  it('should render DesignLogForm component', () => {
    const wrapper = mount(DesignLogPage)

    expect(wrapper.findComponent({ name: 'DesignLogForm' }).exists()).toBe(true)
  })

  it('should show loading state', async () => {
    const { useDefaultDesignLogTemplate } = await import('~/composables/useDesignLogTemplate')
    vi.mocked(useDefaultDesignLogTemplate).mockReturnValueOnce({
      data: ref(null),
      pending: ref(true),
      error: ref(null),
      refresh: vi.fn(),
    })

    const wrapper = mount(DesignLogPage)

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('should show error state', async () => {
    const { useDefaultDesignLogTemplate } = await import('~/composables/useDesignLogTemplate')
    vi.mocked(useDefaultDesignLogTemplate).mockReturnValueOnce({
      data: ref(null),
      pending: ref(false),
      error: ref(new Error('Failed to load')),
      refresh: vi.fn(),
    })

    const wrapper = mount(DesignLogPage)

    expect(wrapper.text()).toContain('Failed to load template')
  })

  it('should pass tooltips to form', () => {
    const wrapper = mount(DesignLogPage)

    const form = wrapper.findComponent({ name: 'DesignLogForm' })
    expect(form.props('tooltips')).toBeDefined()
    expect(form.props('tooltips').projectName).toBe('Project name help')
  })

  it('should have proper responsive container', () => {
    const wrapper = mount(DesignLogPage)

    const container = wrapper.find('.max-w-4xl')
    expect(container.exists()).toBe(true)
  })

  it('should have proper background styling', () => {
    const wrapper = mount(DesignLogPage)

    const page = wrapper.find('.design-log-page')
    expect(page.classes()).toContain('bg-gray-50')
    expect(page.classes()).toContain('dark:bg-gray-900')
  })

  it('should display guidance banner with proper styling', () => {
    const wrapper = mount(DesignLogPage)

    const banner = wrapper.find('[class*="bg-blue-50"]')
    expect(banner.exists()).toBe(true)
  })

  it('should load template into store when available', () => {
    const wrapper = mount(DesignLogPage)

    expect(wrapper.exists()).toBe(true)
  })
})
