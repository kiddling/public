import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentGalleryFilters from '~/components/student-gallery/StudentGalleryFilters.vue'

describe('StudentGalleryFilters', () => {
  it('renders search input', () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: '',
        total: 0,
      },
    })

    const input = wrapper.find('input[type="text"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toContain('搜索')
  })

  it('displays total count', () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: '',
        total: 42,
      },
    })

    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('个作品')
  })

  it('emits search update when typing', async () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: '',
        total: 0,
      },
    })

    const input = wrapper.find('input[type="text"]')
    await input.setValue('test search')

    expect(wrapper.emitted('update:search')).toBeTruthy()
    expect(wrapper.emitted('update:search')?.[0]).toEqual(['test search'])
  })

  it('renders discipline filter with all options', () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: '',
        total: 0,
      },
    })

    const select = wrapper.findAll('select')[0]
    const options = select.findAll('option')
    
    expect(options.length).toBe(6) // 1 "全部" + 5 disciplines
    expect(options[0].text()).toBe('全部专业')
    expect(options[1].text()).toBe('环艺')
    expect(options[2].text()).toBe('产品')
    expect(options[3].text()).toBe('视传')
    expect(options[4].text()).toBe('数媒')
    expect(options[5].text()).toBe('公艺')
  })

  it('renders loop filter with all options', () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: '',
        total: 0,
      },
    })

    const select = wrapper.findAll('select')[1]
    const options = select.findAll('option')
    
    expect(options.length).toBe(4) // 1 "全部" + 3 loops
    expect(options[0].text()).toBe('全部循环')
    expect(options[1].text()).toBe('Loop 1')
    expect(options[2].text()).toBe('Loop 2')
    expect(options[3].text()).toBe('Loop 3')
  })

  it('emits discipline update when changed', async () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: '',
        total: 0,
      },
    })

    const select = wrapper.findAll('select')[0]
    await select.setValue('环艺')

    expect(wrapper.emitted('update:discipline')).toBeTruthy()
    expect(wrapper.emitted('update:discipline')?.[0]).toEqual(['环艺'])
  })

  it('emits loop update when changed', async () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: '',
        total: 0,
      },
    })

    const select = wrapper.findAll('select')[1]
    await select.setValue('Loop 2')

    expect(wrapper.emitted('update:loop')).toBeTruthy()
    expect(wrapper.emitted('update:loop')?.[0]).toEqual(['Loop 2'])
  })

  it('emits grade update when changed', async () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: '',
        total: 0,
      },
    })

    const gradeInput = wrapper.findAll('input[type="text"]')[1]
    await gradeInput.setValue('2023')

    expect(wrapper.emitted('update:grade')).toBeTruthy()
    expect(wrapper.emitted('update:grade')?.[0]).toEqual(['2023'])
  })

  it('shows clear button when filters are active', async () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: 'test',
        discipline: '环艺',
        total: 10,
      },
    })

    const clearButton = wrapper.find('button[title]')
    expect(clearButton.exists()).toBe(true)
    expect(clearButton.text()).toContain('清除')
  })

  it('hides clear button when no filters are active', () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: '',
        total: 10,
      },
    })

    const buttons = wrapper.findAll('button')
    const clearButton = buttons.find(b => b.text().includes('清除'))
    expect(clearButton).toBeUndefined()
  })

  it('clears all filters when clear button is clicked', async () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: 'test',
        discipline: '环艺',
        loop: 'Loop 1',
        grade: '2023',
        total: 10,
      },
    })

    const clearButton = wrapper.findAll('button').find(b => b.text().includes('清除'))
    await clearButton?.trigger('click')

    expect(wrapper.emitted('update:search')).toBeTruthy()
    expect(wrapper.emitted('update:discipline')).toBeTruthy()
    expect(wrapper.emitted('update:loop')).toBeTruthy()
    expect(wrapper.emitted('update:grade')).toBeTruthy()
  })

  it('shows search clear button when search has value', () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: 'test',
        total: 10,
      },
    })

    const searchClearButtons = wrapper.findAll('button').filter(b => 
      b.classes().includes('absolute')
    )
    expect(searchClearButtons.length).toBeGreaterThan(0)
  })

  it('clears search when search clear button is clicked', async () => {
    const wrapper = mount(StudentGalleryFilters, {
      props: {
        search: 'test',
        total: 10,
      },
    })

    const searchClearButton = wrapper.findAll('button').find(b => 
      b.classes().includes('absolute')
    )
    await searchClearButton?.trigger('click')

    expect(wrapper.emitted('update:search')?.[0]).toEqual([''])
  })
})
