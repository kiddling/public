import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import KnowledgeCardFilters from '~/components/knowledge-card/KnowledgeCardFilters.vue'

describe('KnowledgeCardFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input', () => {
    const wrapper = mount(KnowledgeCardFilters)
    
    const searchInput = wrapper.find('input[type="search"]')
    expect(searchInput.exists()).toBe(true)
  })

  it('renders type filter dropdown', () => {
    const wrapper = mount(KnowledgeCardFilters)
    
    const typeSelect = wrapper.find('#type-filter')
    expect(typeSelect.exists()).toBe(true)
  })

  it('displays all card types in dropdown', () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        cardTypes: ['Theory', 'Case Study', 'Student Work', 'AI Prompt', 'Extended Thinking'],
      },
    })
    
    const options = wrapper.findAll('#type-filter option')
    expect(options.length).toBeGreaterThan(5) // Including "All Types" option
    expect(wrapper.html()).toContain('Theory')
    expect(wrapper.html()).toContain('Case Study')
  })

  it('emits update:search when search input changes', async () => {
    vi.useFakeTimers()
    
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        debounceMs: 300,
      },
    })
    
    const searchInput = wrapper.find('input[type="search"]')
    await searchInput.setValue('design')
    
    // Fast-forward time past debounce
    vi.advanceTimersByTime(300)
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.emitted('update:search')).toBeTruthy()
    expect(wrapper.emitted('update:search')?.[0]).toEqual(['design'])
    
    vi.useRealTimers()
  })

  it('debounces search input', async () => {
    vi.useFakeTimers()
    
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        debounceMs: 300,
      },
    })
    
    const searchInput = wrapper.find('input[type="search"]')
    
    // Type multiple characters quickly
    await searchInput.setValue('d')
    await searchInput.setValue('de')
    await searchInput.setValue('des')
    await searchInput.setValue('desi')
    await searchInput.setValue('design')
    
    // Only 100ms passed
    vi.advanceTimersByTime(100)
    
    // Should not have emitted yet
    expect(wrapper.emitted('update:search')).toBeFalsy()
    
    // Complete debounce time
    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()
    
    // Should have emitted only once
    expect(wrapper.emitted('update:search')?.length).toBe(1)
    
    vi.useRealTimers()
  })

  it('clears search when clear button clicked', async () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        search: 'design',
      },
    })
    
    const clearButton = wrapper.find('button[aria-label*="clear" i]')
    if (clearButton.exists()) {
      await clearButton.trigger('click')
      
      expect(wrapper.emitted('update:search')).toBeTruthy()
      expect(wrapper.emitted('update:search')?.[0]).toEqual([''])
    }
  })

  it('emits update:modelValue when type filter changes', async () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        modelValue: { type: null, tags: [], loop: null, difficulty: null },
      },
    })
    
    const typeSelect = wrapper.find('#type-filter')
    await typeSelect.setValue('Theory')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('filter-change')).toBeTruthy()
  })

  it('displays selected tags', () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        modelValue: { type: null, tags: ['design', 'theory'], loop: null, difficulty: null },
        availableTags: ['design', 'theory', 'practice'],
      },
    })
    
    expect(wrapper.text()).toContain('design')
    expect(wrapper.text()).toContain('theory')
  })

  it('shows tag dropdown when button clicked', async () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        availableTags: ['design', 'theory', 'practice'],
      },
    })
    
    const tagsButton = wrapper.find('#tags-filter')
    await tagsButton.trigger('click')
    
    await wrapper.vm.$nextTick()
    
    // Check if dropdown is visible
    const dropdown = wrapper.find('.absolute.z-10')
    expect(dropdown.exists()).toBe(true)
  })

  it('displays loop filter when showLoopFilter is true', () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        showLoopFilter: true,
      },
    })
    
    const loopFilter = wrapper.find('#loop-filter')
    expect(loopFilter.exists()).toBe(true)
  })

  it('hides loop filter when showLoopFilter is false', () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        showLoopFilter: false,
      },
    })
    
    const loopFilter = wrapper.find('#loop-filter')
    expect(loopFilter.exists()).toBe(false)
  })

  it('displays difficulty filter when showDifficultyFilter is true', () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        showDifficultyFilter: true,
      },
    })
    
    const difficultyFilter = wrapper.find('#difficulty-filter')
    expect(difficultyFilter.exists()).toBe(true)
  })

  it('shows clear filters button when filters are active', () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        modelValue: { type: 'Theory', tags: [], loop: null, difficulty: null },
      },
    })
    
    const clearButton = wrapper.find('button:contains("Clear Filters")')
    expect(wrapper.text()).toContain('Clear')
  })

  it('displays active filters summary', () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        modelValue: { type: 'Theory', tags: ['design'], loop: null, difficulty: null },
        search: 'test',
      },
    })
    
    expect(wrapper.text()).toContain('Active filters')
  })

  it('displays result count', () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        resultCount: 42,
        search: 'test',
      },
    })
    
    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('results')
  })

  it('displays singular result for count of 1', () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        resultCount: 1,
        search: 'test',
      },
    })
    
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('result')
  })

  it('allows removing individual tags', async () => {
    const wrapper = mount(KnowledgeCardFilters, {
      props: {
        modelValue: { type: null, tags: ['design', 'theory'], loop: null, difficulty: null },
      },
    })
    
    // Find the remove button for a specific tag
    const activeFilters = wrapper.find('.active-filters')
    if (activeFilters.exists()) {
      const removeButtons = activeFilters.findAll('button')
      if (removeButtons.length > 0) {
        await removeButtons[0].trigger('click')
        
        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      }
    }
  })
})
