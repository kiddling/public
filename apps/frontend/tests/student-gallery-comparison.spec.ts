import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentGalleryComparison from '~/components/student-gallery/StudentGalleryComparison.vue'
import type { StrapiMedia } from '~/types/cms'

describe('StudentGalleryComparison', () => {
  const mockBefore: StrapiMedia = {
    url: '/uploads/before.jpg',
    mime: 'image/jpeg',
    alternativeText: 'Before Image',
    width: 800,
    height: 600,
  }

  const mockAfter: StrapiMedia = {
    url: '/uploads/after.jpg',
    mime: 'image/jpeg',
    alternativeText: 'After Image',
    width: 800,
    height: 600,
  }

  it('renders both before and after images', () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
      },
    })

    const images = wrapper.findAll('img')
    expect(images.length).toBe(2)
  })

  it('displays before label', () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
      },
    })

    expect(wrapper.text()).toContain('之前')
  })

  it('displays after label', () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
      },
    })

    expect(wrapper.text()).toContain('之后')
  })

  it('renders slider handle', () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
      },
    })

    const handle = wrapper.find('.cursor-ew-resize')
    expect(handle.exists()).toBe(true)
  })

  it('initializes at 50% position by default', () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
      },
    })

    const slider = wrapper.find('.cursor-ew-resize')
    expect(slider.attributes('style')).toContain('50%')
  })

  it('initializes at custom position', () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
        initialPosition: 75,
      },
    })

    const slider = wrapper.find('.cursor-ew-resize')
    expect(slider.attributes('style')).toContain('75%')
  })

  it('updates slider position on mouse down', async () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
      },
      attachTo: document.body,
    })

    const container = wrapper.find('.relative')
    
    // Mock getBoundingClientRect
    const mockRect = {
      left: 0,
      right: 100,
      width: 100,
      top: 0,
      bottom: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    }
    container.element.getBoundingClientRect = () => mockRect

    await container.trigger('mousedown', { clientX: 25 })
    
    const slider = wrapper.find('.cursor-ew-resize')
    expect(slider.attributes('style')).toContain('25%')
    
    wrapper.unmount()
  })

  it('applies clip-path to before image container', () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
      },
    })

    const beforeContainer = wrapper.find('.absolute.inset-0')
    expect(beforeContainer.attributes('style')).toContain('clip-path')
    expect(beforeContainer.attributes('style')).toContain('inset')
  })

  it('renders with correct image alt text', () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
      },
    })

    const images = wrapper.findAll('img')
    expect(images[0].attributes('alt')).toBe('After Image')
    expect(images[1].attributes('alt')).toBe('Before Image')
  })

  it('has draggable false on images', () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
      },
    })

    const images = wrapper.findAll('img')
    images.forEach(img => {
      expect(img.attributes('draggable')).toBe('false')
    })
  })

  it('has touch-none class on container', () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
      },
    })

    const container = wrapper.find('.relative')
    expect(container.classes()).toContain('touch-none')
  })

  it('has select-none class on container', () => {
    const wrapper = mount(StudentGalleryComparison, {
      props: {
        before: mockBefore,
        after: mockAfter,
      },
    })

    const container = wrapper.find('.relative')
    expect(container.classes()).toContain('select-none')
  })
})
