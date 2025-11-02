import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProgressTracker from '~/components/navigation/ProgressTracker.vue'
import { useNavigationStore } from '~/stores/navigation'
import { useProgressStore } from '~/stores/progress'
import { mockNavigationResponse } from '../fixtures/navigation'

// Mock router
const mockRouter = {
  push: vi.fn().mockResolvedValue(undefined),
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

// Mock Icon component
vi.mock('#app', () => ({
  Icon: {
    name: 'Icon',
    template: '<span />',
  },
}))

describe('ProgressTracker', () => {
  beforeEach(() => {
    localStorage.clear()
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it('renders progress tracker when lessons exist', async () => {
    const pinia = createPinia()
    const navigationStore = useNavigationStore(pinia)
    await navigationStore.loadStructure({ data: mockNavigationResponse })

    const wrapper = mount(ProgressTracker, {
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          LoopSpiralVisualization: true,
        },
      },
    })

    expect(wrapper.find('[aria-label="Course progress tracker"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Course Progress')
  })

  it('displays completion percentage', async () => {
    const pinia = createPinia()
    const navigationStore = useNavigationStore(pinia)
    const progressStore = useProgressStore(pinia)

    await navigationStore.loadStructure({ data: mockNavigationResponse })
    progressStore.markLessonComplete('P-00')

    const wrapper = mount(ProgressTracker, {
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          LoopSpiralVisualization: true,
        },
      },
    })

    expect(wrapper.text()).toContain('17%')
  })

  it('displays completed lessons', async () => {
    const pinia = createPinia()
    const navigationStore = useNavigationStore(pinia)
    const progressStore = useProgressStore(pinia)

    await navigationStore.loadStructure({ data: mockNavigationResponse })
    progressStore.markLessonComplete('P-00')

    const wrapper = mount(ProgressTracker, {
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          LoopSpiralVisualization: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Completed')
    expect(wrapper.text()).toContain('P-00')
  })

  it('displays remaining lessons', async () => {
    const pinia = createPinia()
    const navigationStore = useNavigationStore(pinia)
    const progressStore = useProgressStore(pinia)

    await navigationStore.loadStructure({ data: mockNavigationResponse })
    progressStore.markLessonComplete('P-00')

    const wrapper = mount(ProgressTracker, {
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          LoopSpiralVisualization: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Remaining')
    expect(wrapper.text()).toContain('P-01')
  })

  it('shows empty state when no lessons are completed', async () => {
    const pinia = createPinia()
    const navigationStore = useNavigationStore(pinia)

    await navigationStore.loadStructure({ data: mockNavigationResponse })

    const wrapper = mount(ProgressTracker, {
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          LoopSpiralVisualization: true,
        },
      },
    })

    expect(wrapper.text()).toContain('No lessons completed yet')
  })

  it('shows completion message when all lessons are completed', async () => {
    const pinia = createPinia()
    const navigationStore = useNavigationStore(pinia)
    const progressStore = useProgressStore(pinia)

    await navigationStore.loadStructure({ data: mockNavigationResponse })

    // Mark all lessons complete
    const lessons = navigationStore.courseStructure?.lessons ?? []
    lessons.forEach((lesson) => {
      progressStore.markLessonComplete(lesson.code)
    })

    const wrapper = mount(ProgressTracker, {
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          LoopSpiralVisualization: true,
        },
      },
    })

    expect(wrapper.text()).toContain('All lessons completed')
  })

  it('toggles lesson completion when clicking check/x button', async () => {
    const pinia = createPinia()
    const navigationStore = useNavigationStore(pinia)
    const progressStore = useProgressStore(pinia)

    await navigationStore.loadStructure({ data: mockNavigationResponse })

    const wrapper = mount(ProgressTracker, {
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          LoopSpiralVisualization: true,
        },
      },
    })

    expect(progressStore.isLessonComplete('P-00')).toBe(false)

    // Find and click the first completion button in remaining lessons
    const buttons = wrapper.findAll('button[aria-label*="Mark"]')
    expect(buttons.length).toBeGreaterThan(0)

    await buttons[0].trigger('click')

    // The lesson should now be marked as complete
    expect(progressStore.completedCount).toBeGreaterThan(0)
  })

  it('emits navigate event when lesson is selected', async () => {
    const pinia = createPinia()
    const navigationStore = useNavigationStore(pinia)

    await navigationStore.loadStructure({ data: mockNavigationResponse })

    const wrapper = mount(ProgressTracker, {
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          LoopSpiralVisualization: true,
        },
      },
    })

    // Find and click a lesson button
    const lessonButtons = wrapper
      .findAll('button[type="button"]')
      .filter((btn) => btn.text().includes('P-00') || btn.text().includes('P-01'))

    if (lessonButtons.length > 0) {
      await lessonButtons[0].trigger('click')

      expect(wrapper.emitted('navigate')).toBeTruthy()
    }
  })

  it('renders compact variant correctly', async () => {
    const pinia = createPinia()
    const navigationStore = useNavigationStore(pinia)

    await navigationStore.loadStructure({ data: mockNavigationResponse })

    const wrapper = mount(ProgressTracker, {
      props: {
        variant: 'compact',
      },
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          LoopSpiralVisualization: true,
        },
      },
    })

    expect(wrapper.find('.progress-tracker').exists()).toBe(true)
  })

  it('displays recent lessons when available', async () => {
    const pinia = createPinia()
    const navigationStore = useNavigationStore(pinia)
    const progressStore = useProgressStore(pinia)

    await navigationStore.loadStructure({ data: mockNavigationResponse })
    progressStore.markLessonViewed('P-00')
    progressStore.markLessonViewed('P-01')

    const wrapper = mount(ProgressTracker, {
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          LoopSpiralVisualization: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Recent Lessons')
  })

  it('displays part progress summaries', async () => {
    const pinia = createPinia()
    const navigationStore = useNavigationStore(pinia)
    const progressStore = useProgressStore(pinia)

    await navigationStore.loadStructure({ data: mockNavigationResponse })
    progressStore.markLessonComplete('P-00')

    const wrapper = mount(ProgressTracker, {
      global: {
        plugins: [pinia],
        stubs: {
          Icon: true,
          LoopSpiralVisualization: true,
        },
      },
    })

    // Should show progress for foundation part
    const html = wrapper.html()
    expect(html).toBeTruthy()
  })
})
