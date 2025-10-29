import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DifficultyToggle from '@/components/DifficultyToggle.vue'

describe('DifficultyToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders all three difficulty levels', () => {
    const wrapper = mount(DifficultyToggle)
    
    const buttons = wrapper.findAll('.toggle-button')
    expect(buttons).toHaveLength(3)
    
    expect(buttons[0].text()).toContain('Base')
    expect(buttons[1].text()).toContain('Advance')
    expect(buttons[2].text()).toContain('Stretch')
  })

  it('defaults to Base difficulty', () => {
    const wrapper = mount(DifficultyToggle)
    
    const activeButton = wrapper.find('.toggle-button.active')
    expect(activeButton.text()).toContain('Base')
  })

  it('emits difficulty-changed event when selecting a level', async () => {
    const wrapper = mount(DifficultyToggle)
    
    const advanceButton = wrapper.findAll('.toggle-button')[1]
    await advanceButton.trigger('click')
    
    expect(wrapper.emitted('difficulty-changed')).toBeTruthy()
    expect(wrapper.emitted('difficulty-changed')[1]).toEqual(['advance'])
  })

  it('persists selected difficulty to localStorage', async () => {
    const wrapper = mount(DifficultyToggle)
    
    const stretchButton = wrapper.findAll('.toggle-button')[2]
    await stretchButton.trigger('click')
    
    expect(localStorage.getItem('preferred_difficulty_level')).toBe('stretch')
  })

  it('loads preferred difficulty from localStorage', () => {
    localStorage.setItem('preferred_difficulty_level', 'advance')
    
    const wrapper = mount(DifficultyToggle)
    
    const activeButton = wrapper.find('.toggle-button.active')
    expect(activeButton.text()).toContain('Advance')
  })

  it('updates active class when switching difficulties', async () => {
    const wrapper = mount(DifficultyToggle)
    
    const advanceButton = wrapper.findAll('.toggle-button')[1]
    await advanceButton.trigger('click')
    
    expect(advanceButton.classes()).toContain('active')
    
    const baseButton = wrapper.findAll('.toggle-button')[0]
    expect(baseButton.classes()).not.toContain('active')
  })

  it('displays description for current difficulty level', async () => {
    const wrapper = mount(DifficultyToggle)
    
    expect(wrapper.text()).toContain('Essential concepts and foundational knowledge')
    
    const advanceButton = wrapper.findAll('.toggle-button')[1]
    await advanceButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Deeper exploration with practical applications')
  })
})
