import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentGalleryPagination from '~/components/student-gallery/StudentGalleryPagination.vue'

describe('StudentGalleryPagination', () => {
  it('renders pagination controls', () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 1,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    expect(wrapper.text()).toContain('上一页')
    expect(wrapper.text()).toContain('下一页')
  })

  it('displays correct item range', () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 1,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    expect(wrapper.text()).toContain('显示 1-20 / 共 100 个作品')
  })

  it('displays correct item range for last page', () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 5,
        totalPages: 5,
        total: 97,
        pageSize: 20,
      },
    })

    expect(wrapper.text()).toContain('显示 81-97 / 共 97 个作品')
  })

  it('disables previous button on first page', () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 1,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    const prevButton = wrapper.findAll('button').find((b) => b.text().includes('上一页'))
    expect(prevButton?.attributes('disabled')).toBeDefined()
  })

  it('enables previous button on second page', () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 2,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    const prevButton = wrapper.findAll('button').find((b) => b.text().includes('上一页'))
    expect(prevButton?.attributes('disabled')).toBeUndefined()
  })

  it('disables next button on last page', () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 5,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    const nextButton = wrapper.findAll('button').find((b) => b.text().includes('下一页'))
    expect(nextButton?.attributes('disabled')).toBeDefined()
  })

  it('enables next button when not on last page', () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 1,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    const nextButton = wrapper.findAll('button').find((b) => b.text().includes('下一页'))
    expect(nextButton?.attributes('disabled')).toBeUndefined()
  })

  it('emits update when previous button is clicked', async () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 2,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    const prevButton = wrapper.findAll('button').find((b) => b.text().includes('上一页'))
    await prevButton?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
  })

  it('emits update when next button is clicked', async () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 1,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    const nextButton = wrapper.findAll('button').find((b) => b.text().includes('下一页'))
    await nextButton?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
  })

  it('shows page numbers on desktop', () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 1,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    // Should show page number buttons
    const pageButtons = wrapper
      .findAll('button')
      .filter((b) => !b.text().includes('上一页') && !b.text().includes('下一页'))
    expect(pageButtons.length).toBeGreaterThan(0)
  })

  it('highlights current page', () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 3,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    const pageButtons = wrapper
      .findAll('button')
      .filter((b) => !b.text().includes('上一页') && !b.text().includes('下一页'))

    const currentButton = pageButtons.find((b) => b.text() === '3')
    expect(currentButton?.classes()).toContain('bg-primary-500')
  })

  it('emits update when page number is clicked', async () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 1,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    const pageButtons = wrapper
      .findAll('button')
      .filter((b) => !b.text().includes('上一页') && !b.text().includes('下一页'))

    const page3Button = pageButtons.find((b) => b.text() === '3')
    await page3Button?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
  })

  it('shows limited page numbers when total pages exceeds max visible', () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 1,
        totalPages: 20,
        total: 400,
        pageSize: 20,
      },
    })

    const pageButtons = wrapper
      .findAll('button')
      .filter((b) => !b.text().includes('上一页') && !b.text().includes('下一页'))

    // Should show max 5 page numbers
    expect(pageButtons.length).toBeLessThanOrEqual(5)
  })

  it('does not emit when clicking disabled previous button', async () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 1,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    const prevButton = wrapper.findAll('button').find((b) => b.text().includes('上一页'))
    await prevButton?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('does not emit when clicking disabled next button', async () => {
    const wrapper = mount(StudentGalleryPagination, {
      props: {
        modelValue: 5,
        totalPages: 5,
        total: 100,
        pageSize: 20,
      },
    })

    const nextButton = wrapper.findAll('button').find((b) => b.text().includes('下一页'))
    await nextButton?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })
})
