import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentGalleryGrid from '~/components/student-gallery/StudentGalleryGrid.vue'
import type { StudentWork } from '~/types/cms'

describe('StudentGalleryGrid', () => {
  const mockWorks: StudentWork[] = [
    {
      id: 1,
      studentName: 'Test Student 1',
      discipline: '环艺',
      loop: 'Loop 1',
      grade: '2023',
      description: 'Test description 1',
      assets: [
        {
          url: '/uploads/test1.jpg',
          mime: 'image/jpeg',
          alternativeText: 'Test 1',
          width: 800,
          height: 600,
        },
      ],
      beforeAfterMedia: [],
    },
    {
      id: 2,
      studentName: 'Test Student 2',
      discipline: '产品',
      loop: 'Loop 2',
      grade: '2024',
      description: 'Test description 2',
      assets: [
        {
          url: '/uploads/test2.jpg',
          mime: 'image/jpeg',
          alternativeText: 'Test 2',
          width: 1000,
          height: 800,
        },
      ],
      beforeAfterMedia: [
        {
          url: '/uploads/test2-after.jpg',
          mime: 'image/jpeg',
        },
      ],
    },
  ]

  it('renders all works', () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: mockWorks,
      },
    })

    const items = wrapper.findAll('.masonry-item')
    expect(items.length).toBe(2)
  })

  it('displays student name for each work', () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: mockWorks,
      },
    })

    expect(wrapper.text()).toContain('Test Student 1')
    expect(wrapper.text()).toContain('Test Student 2')
  })

  it('displays discipline badge', () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: mockWorks,
      },
    })

    expect(wrapper.text()).toContain('环艺')
    expect(wrapper.text()).toContain('产品')
  })

  it('displays loop badge', () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: mockWorks,
      },
    })

    expect(wrapper.text()).toContain('Loop 1')
    expect(wrapper.text()).toContain('Loop 2')
  })

  it('displays grade badge', () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: mockWorks,
      },
    })

    expect(wrapper.text()).toContain('2023')
    expect(wrapper.text()).toContain('2024')
  })

  it('displays description', () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: mockWorks,
      },
    })

    expect(wrapper.text()).toContain('Test description 1')
    expect(wrapper.text()).toContain('Test description 2')
  })

  it('renders images with correct attributes', () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: mockWorks,
      },
    })

    const images = wrapper.findAll('img')
    expect(images.length).toBe(2)
    expect(images[0].attributes('alt')).toBe('Test Student 1')
    expect(images[0].attributes('loading')).toBe('lazy')
  })

  it('shows comparison badge when beforeAfterMedia exists', () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: mockWorks,
      },
    })

    const badges = wrapper.findAll('.absolute.top-2.right-2')
    expect(badges.length).toBe(1)
    expect(badges[0].text()).toContain('对比')
  })

  it('does not show comparison badge when no beforeAfterMedia', () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: [mockWorks[0]],
      },
    })

    const badges = wrapper.findAll('.absolute.top-2.right-2')
    expect(badges.length).toBe(0)
  })

  it('emits open event when item is clicked', async () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: mockWorks,
      },
    })

    const firstItem = wrapper.find('.masonry-item')
    await firstItem.trigger('click')

    expect(wrapper.emitted('open')).toBeTruthy()
    expect(wrapper.emitted('open')?.[0]).toEqual([0])
  })

  it('emits correct index when different items are clicked', async () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: mockWorks,
      },
    })

    const items = wrapper.findAll('.masonry-item')
    await items[1].trigger('click')

    expect(wrapper.emitted('open')?.[0]).toEqual([1])
  })

  it('shows placeholder when work has no assets', () => {
    const workWithoutAssets: StudentWork = {
      id: 3,
      studentName: 'Student No Image',
      assets: [],
      beforeAfterMedia: [],
    }

    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: [workWithoutAssets],
      },
    })

    const placeholder = wrapper.find('.bg-gray-200')
    expect(placeholder.exists()).toBe(true)
  })

  it('applies aspect ratio to images', () => {
    const wrapper = mount(StudentGalleryGrid, {
      props: {
        works: mockWorks,
      },
    })

    const firstImg = wrapper.find('img')
    const style = firstImg.attributes('style')
    expect(style).toContain('aspect-ratio')
  })
})
