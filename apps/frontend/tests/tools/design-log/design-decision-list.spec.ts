import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DesignDecisionList from '~/components/tools/design-log/DesignDecisionList.vue'
import type { DesignDecision } from '~/stores/designLog'

describe('DesignDecisionList', () => {
  const mockDecisions: DesignDecision[] = [
    {
      id: 'decision-1',
      title: 'Decision 1',
      description: 'Description 1',
      rationale: 'Rationale 1',
      impact: 'Impact 1',
      timestamp: new Date(),
    },
    {
      id: 'decision-2',
      title: 'Decision 2',
      description: 'Description 2',
      rationale: 'Rationale 2',
      impact: 'Impact 2',
      timestamp: new Date(),
    },
  ]

  it('should render the component', () => {
    const wrapper = mount(DesignDecisionList, {
      props: {
        decisions: [],
      },
    })

    expect(wrapper.find('.design-decision-list').exists()).toBe(true)
  })

  it('should display empty state when no decisions', () => {
    const wrapper = mount(DesignDecisionList, {
      props: {
        decisions: [],
      },
    })

    expect(wrapper.text()).toContain('No design decisions yet')
  })

  it('should render decisions list', () => {
    const wrapper = mount(DesignDecisionList, {
      props: {
        decisions: mockDecisions,
      },
    })

    const decisionCards = wrapper.findAll('[class*="bg-white"]')
    expect(decisionCards.length).toBeGreaterThan(0)
  })

  it('should emit add event when add button is clicked', async () => {
    const wrapper = mount(DesignDecisionList, {
      props: {
        decisions: [],
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('add')).toBeTruthy()
    expect(wrapper.emitted('add')?.length).toBe(1)
  })

  it('should emit remove event when remove button is clicked', async () => {
    const wrapper = mount(DesignDecisionList, {
      props: {
        decisions: mockDecisions,
      },
    })

    const removeButtons = wrapper.findAll('button[aria-label*="Remove decision"]')
    await removeButtons[0].trigger('click')

    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')?.[0]).toEqual(['decision-1'])
  })

  it('should emit update event when input changes', async () => {
    const wrapper = mount(DesignDecisionList, {
      props: {
        decisions: mockDecisions,
      },
    })

    const titleInput = wrapper.find('input[id="decision-title-decision-1"]')
    await titleInput.setValue('Updated Title')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')?.[0][0]).toBe('decision-1')
  })

  it('should display validation error', () => {
    const wrapper = mount(DesignDecisionList, {
      props: {
        decisions: [],
        error: 'At least one decision is required',
      },
    })

    expect(wrapper.text()).toContain('At least one decision is required')
  })

  it('should display tooltip help icon when tooltip provided', () => {
    const wrapper = mount(DesignDecisionList, {
      props: {
        decisions: [],
        tooltip: 'Help text',
      },
    })

    expect(wrapper.findComponent({ name: 'HelpPopover' }).exists()).toBe(true)
  })

  it('should render all decision fields', () => {
    const wrapper = mount(DesignDecisionList, {
      props: {
        decisions: mockDecisions,
      },
    })

    expect(wrapper.find('input[id="decision-title-decision-1"]').exists()).toBe(true)
    expect(wrapper.find('textarea[id="decision-description-decision-1"]').exists()).toBe(true)
    expect(wrapper.find('textarea[id="decision-rationale-decision-1"]').exists()).toBe(true)
    expect(wrapper.find('textarea[id="decision-impact-decision-1"]').exists()).toBe(true)
  })

  it('should display decision numbers correctly', () => {
    const wrapper = mount(DesignDecisionList, {
      props: {
        decisions: mockDecisions,
      },
    })

    expect(wrapper.text()).toContain('Decision 1')
    expect(wrapper.text()).toContain('Decision 2')
  })
})
