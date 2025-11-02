import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import DesignLogForm from '~/components/tools/design-log/DesignLogForm.vue'
import { useDesignLogStore } from '~/stores/designLog'

describe('DesignLogForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.confirm = vi.fn(() => true)
  })

  it('should render the form', () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })

    expect(wrapper.find('.design-log-form').exists()).toBe(true)
  })

  it('should render all form sections', () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })

    expect(wrapper.text()).toContain('Project Information')
    expect(wrapper.text()).toContain('Design Problem')
    expect(wrapper.text()).toContain('Reflection')
  })

  it('should bind project name to store', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    const projectNameInput = wrapper.find('#project-name')
    await projectNameInput.setValue('Test Project')

    expect(store.state.projectName).toBe('Test Project')
  })

  it('should bind design problem to store', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    const designProblemTextarea = wrapper.find('#design-problem')
    await designProblemTextarea.setValue('Test problem statement')

    expect(store.state.designProblem).toBe('Test problem statement')
  })

  it('should display word count', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    store.setDesignProblem('This is a test')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('4 words')
  })

  it('should display validation errors', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    store.setValidationError('projectName', 'Project name is required')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Project name is required')
  })

  it('should clear errors on input', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    store.setValidationError('projectName', 'Project name is required')
    await wrapper.vm.$nextTick()

    const projectNameInput = wrapper.find('#project-name')
    await projectNameInput.setValue('New Name')

    expect(store.state.errors.projectName).toBeUndefined()
  })

  it('should display save status', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    store.state.saveStatus = 'saving'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Saving')
  })

  it('should handle form submission', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    store.setProjectInfo('Test Project', 'Description')
    store.setDesignProblem('Test problem')
    store.addDecision({
      title: 'Decision',
      description: 'Description',
      rationale: 'Rationale',
      impact: 'Impact',
    })

    await wrapper.find('form').trigger('submit')

    expect(store.state.saveStatus).toBe('saved')
  })

  it('should handle reset button click', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    store.setProjectInfo('Test Project', 'Description')
    store.setDesignProblem('Test problem')

    const resetButton = wrapper.findAll('button').find((btn) => btn.text() === 'Reset')
    await resetButton?.trigger('click')

    expect(global.confirm).toHaveBeenCalled()
    expect(store.state.projectName).toBe('')
  })

  it('should render DesignDecisionList component', () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })

    expect(wrapper.findComponent({ name: 'DesignDecisionList' }).exists()).toBe(true)
  })

  it('should render IterationTimeline component', () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })

    expect(wrapper.findComponent({ name: 'IterationTimeline' }).exists()).toBe(true)
  })

  it('should render AttachmentUploader component', () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })

    expect(wrapper.findComponent({ name: 'AttachmentUploader' }).exists()).toBe(true)
  })

  it('should display tooltips when provided', () => {
    const tooltips = {
      projectName: 'Enter your project name',
      designProblem: 'Describe the problem',
    }

    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips,
      },
    })

    const helpPopovers = wrapper.findAllComponents({ name: 'HelpPopover' })
    expect(helpPopovers.length).toBeGreaterThan(0)
  })

  it('should mark required fields', () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })

    const requiredIndicators = wrapper.findAll('.text-red-500')
    expect(requiredIndicators.length).toBeGreaterThan(0)
  })

  it('should disable save button while saving', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    store.state.saveStatus = 'saving'
    await wrapper.vm.$nextTick()

    const saveButton = wrapper.findAll('button').find((btn) => btn.text() === 'Save Design Log')
    expect(saveButton?.attributes('disabled')).toBeDefined()
  })

  it('should show success icon when saved', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    store.state.saveStatus = 'saved'
    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toContain('Saved successfully')
  })

  it('should show error icon when save fails', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    store.state.saveStatus = 'error'
    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toContain('Error saving')
  })

  it('should bind reflection to store', async () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })
    const store = useDesignLogStore()

    const reflectionTextarea = wrapper.find('#reflection')
    await reflectionTextarea.setValue('My reflection')

    expect(store.state.reflection).toBe('My reflection')
  })

  it('should have proper form accessibility', () => {
    const wrapper = mount(DesignLogForm, {
      props: {
        tooltips: {},
      },
    })

    const projectNameInput = wrapper.find('#project-name')
    const label = wrapper.find('label[for="project-name"]')

    expect(projectNameInput.exists()).toBe(true)
    expect(label.exists()).toBe(true)
  })
})
