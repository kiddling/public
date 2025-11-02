import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import IterationTimeline from '~/components/tools/design-log/IterationTimeline.vue'
import type { IterationItem } from '~/stores/designLog'

vi.mock('vue-draggable-next', () => ({
  VueDraggableNext: {
    name: 'draggable',
    template:
      '<div><slot v-for="(item, index) in modelValue" :element="item" :index="index" /></div>',
    props: ['modelValue', 'itemKey', 'handle'],
    emits: ['update:modelValue', 'end'],
  },
}))

describe('IterationTimeline', () => {
  const mockIterations: IterationItem[] = [
    {
      id: 'iteration-1',
      version: 'v1.0',
      date: new Date('2024-01-01'),
      changes: 'Initial design',
      order: 0,
    },
    {
      id: 'iteration-2',
      version: 'v2.0',
      date: new Date('2024-02-01'),
      changes: 'Updated design',
      order: 1,
    },
  ]

  it('should render the component', () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: [],
      },
    })

    expect(wrapper.find('.iteration-timeline').exists()).toBe(true)
  })

  it('should display empty state when no iterations', () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: [],
      },
    })

    expect(wrapper.text()).toContain('No iterations yet')
  })

  it('should render iterations list', () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: mockIterations,
      },
    })

    expect(wrapper.text()).toContain('v1.0')
    expect(wrapper.text()).toContain('v2.0')
  })

  it('should emit add event when add button is clicked', async () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: [],
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('add')).toBeTruthy()
    expect(wrapper.emitted('add')?.length).toBe(1)
  })

  it('should emit remove event when remove button is clicked', async () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: mockIterations,
      },
    })

    const removeButtons = wrapper.findAll('button[aria-label*="Remove iteration"]')
    await removeButtons[0].trigger('click')

    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')?.[0]).toEqual(['iteration-1'])
  })

  it('should emit update event when input changes', async () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: mockIterations,
      },
    })

    const versionInput = wrapper.find('input[id="iteration-version-iteration-1"]')
    await versionInput.setValue('v1.1')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')?.[0][0]).toBe('iteration-1')
  })

  it('should display tooltip help icon when tooltip provided', () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: [],
        tooltip: 'Help text',
      },
    })

    expect(wrapper.findComponent({ name: 'HelpPopover' }).exists()).toBe(true)
  })

  it('should render all iteration fields', () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: mockIterations,
      },
    })

    expect(wrapper.find('input[id="iteration-version-iteration-1"]').exists()).toBe(true)
    expect(wrapper.find('input[id="iteration-date-iteration-1"]').exists()).toBe(true)
    expect(wrapper.find('textarea[id="iteration-changes-iteration-1"]').exists()).toBe(true)
  })

  it('should format dates correctly', () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: mockIterations,
      },
    })

    const dateInput = wrapper.find('input[id="iteration-date-iteration-1"]')
    expect(dateInput.element.value).toBe('2024-01-01')
  })

  it('should display iteration numbers correctly', () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: mockIterations,
      },
    })

    expect(wrapper.text()).toContain('Iteration 1')
    expect(wrapper.text()).toContain('Iteration 2')
  })

  it('should have drag handles', () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: mockIterations,
      },
    })

    const dragHandles = wrapper.findAll('.drag-handle')
    expect(dragHandles.length).toBe(mockIterations.length)
  })

  it('should have keyboard navigation attributes', () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: mockIterations,
      },
    })

    const items = wrapper.findAll('[role="listitem"]')
    expect(items.length).toBe(mockIterations.length)
  })

  it('should handle date change event', async () => {
    const wrapper = mount(IterationTimeline, {
      props: {
        iterations: mockIterations,
      },
    })

    const dateInput = wrapper.find('input[id="iteration-date-iteration-1"]')
    await dateInput.setValue('2024-03-01')
    await dateInput.trigger('change')

    expect(wrapper.emitted('update')).toBeTruthy()
  })
})
