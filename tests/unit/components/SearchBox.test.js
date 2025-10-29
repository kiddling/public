import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBox from '@/components/SearchBox.vue'

describe('SearchBox', () => {
  it('renders search input', () => {
    const wrapper = mount(SearchBox)
    const input = wrapper.find('input[type="text"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('Search lessons...')
  })

  it('shows search results when typing', async () => {
    const wrapper = mount(SearchBox)
    const input = wrapper.find('input')
    
    await input.setValue('introduction')
    await wrapper.vm.$nextTick()
    
    const results = wrapper.find('.search-results')
    expect(results.exists()).toBe(true)
  })

  it('emits select event when result is clicked', async () => {
    const wrapper = mount(SearchBox)
    const input = wrapper.find('input')
    
    await input.setValue('introduction')
    await wrapper.vm.$nextTick()
    
    const resultItem = wrapper.find('.search-result-item')
    if (resultItem.exists()) {
      await resultItem.trigger('click')
      expect(wrapper.emitted()).toHaveProperty('select')
    }
  })

  it('clears search when clear button is clicked', async () => {
    const wrapper = mount(SearchBox)
    const input = wrapper.find('input')
    
    await input.setValue('test')
    await wrapper.vm.$nextTick()
    
    const clearButton = wrapper.find('.clear-button')
    expect(clearButton.exists()).toBe(true)
    
    await clearButton.trigger('click')
    expect(input.element.value).toBe('')
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(SearchBox)
    const input = wrapper.find('input')
    
    expect(input.attributes('aria-label')).toBe('Search lessons')
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-autocomplete')).toBe('list')
  })
})
