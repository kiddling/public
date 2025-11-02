import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StudentLightbox from '~/components/student/StudentLightbox.vue'
import type { StudentWork } from '~/types/cms'

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn((data, options, callback) => {
      const canvas = document.createElement('canvas')
      callback(null, canvas)
    }),
  },
}))

describe('StudentLightbox', () => {
  const mockWork: StudentWork = {
    id: 1,
    studentName: 'John Doe',
    projectTitle: 'Design Project',
    slug: 'design-project',
    discipline: '产品',
    grade: '2023',
    loop: 'Loop 1',
    description: 'A great design project',
    assets: [
      {
        id: 1,
        url: '/image1.jpg',
        alternativeText: 'Image 1',
      },
      {
        id: 2,
        url: '/image2.jpg',
        alternativeText: 'Image 2',
      },
    ],
    beforeAfterMedia: [],
    downloadUrl: 'https://example.com/download',
    shareEnabled: true,
    displayOrder: 0,
  }

  const mockWorks: StudentWork[] = [
    mockWork,
    {
      ...mockWork,
      id: 2,
      studentName: 'Jane Smith',
      projectTitle: 'Another Project',
      slug: 'another-project',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when show is true', () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWork,
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('should not render when show is false', () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWork,
        works: mockWorks,
        show: false,
      },
    })

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('should display work metadata', () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWork,
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    expect(wrapper.text()).toContain('Design Project')
    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('产品')
    expect(wrapper.text()).toContain('Loop 1')
    expect(wrapper.text()).toContain('2023')
  })

  it('should emit close event when close button is clicked', async () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWork,
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    await wrapper.find('[aria-label="Close lightbox"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit close event when Escape key is pressed', async () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWork,
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    const container = wrapper.find('[tabindex="-1"]')
    await container.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit navigate event when ArrowLeft key is pressed', async () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWorks[1],
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    const container = wrapper.find('[tabindex="-1"]')
    await container.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')?.[0]).toEqual([mockWorks[0]])
  })

  it('should emit navigate event when ArrowRight key is pressed', async () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWorks[0],
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    const container = wrapper.find('[tabindex="-1"]')
    await container.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')?.[0]).toEqual([mockWorks[1]])
  })

  it('should show previous button when not first work', () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWorks[1],
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    expect(wrapper.find('[aria-label="Previous work"]').exists()).toBe(true)
  })

  it('should not show previous button when first work', () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWorks[0],
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    const prevButtons = wrapper.findAll('[aria-label="Previous work"]')
    expect(prevButtons.length).toBe(0)
  })

  it('should show next button when not last work', () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWorks[0],
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    expect(wrapper.find('[aria-label="Next work"]').exists()).toBe(true)
  })

  it('should not show next button when last work', () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWorks[1],
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    const nextButtons = wrapper.findAll('[aria-label="Next work"]')
    expect(nextButtons.length).toBe(0)
  })

  it('should show share button when shareEnabled is true', () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWork,
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    const shareButton = wrapper.findAll('button').find((btn) => btn.text().includes('Share'))
    expect(shareButton).toBeTruthy()
  })

  it('should not show share button when shareEnabled is false', () => {
    const workWithoutShare = { ...mockWork, shareEnabled: false }
    const wrapper = mount(StudentLightbox, {
      props: {
        work: workWithoutShare,
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    const shareButton = wrapper.findAll('button').find((btn) => btn.text().includes('Share'))
    expect(shareButton).toBeFalsy()
  })

  it('should show download button when downloadUrl is provided', () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWork,
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    const downloadButton = wrapper.findAll('button').find((btn) => btn.text().includes('Download'))
    expect(downloadButton).toBeTruthy()
  })

  it('should not show download button when downloadUrl is not provided', () => {
    const workWithoutDownload = { ...mockWork, downloadUrl: null }
    const wrapper = mount(StudentLightbox, {
      props: {
        work: workWithoutDownload,
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    const downloadButton = wrapper.findAll('button').find((btn) => btn.text().includes('Download'))
    expect(downloadButton).toBeFalsy()
  })

  it('should render thumbnails when multiple media items exist', () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWork,
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    const thumbnails = wrapper.findAll('[aria-label^="View"]')
    expect(thumbnails.length).toBe(mockWork.assets.length)
  })

  it('should have proper ARIA attributes', () => {
    const wrapper = mount(StudentLightbox, {
      props: {
        work: mockWork,
        works: mockWorks,
        show: true,
      },
      attachTo: document.body,
    })

    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toContain('lightbox-title-')
  })
})
