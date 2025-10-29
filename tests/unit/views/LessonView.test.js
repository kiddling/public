import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import LessonView from '@/views/LessonView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/lesson/:slug',
      component: LessonView
    }
  ]
})

describe('LessonView', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    localStorage.clear()
  })

  it('renders lesson content from Strapi service', async () => {
    router.push('/lesson/introduction')
    await router.isReady()

    const wrapper = mount(LessonView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LoopSpiralVisualization: true,
          LessonCompletion: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Introduction to the Course')
  })

  it('displays difficulty toggle component', async () => {
    router.push('/lesson/introduction')
    await router.isReady()

    const wrapper = mount(LessonView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LoopSpiralVisualization: true,
          LessonCompletion: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent({ name: 'DifficultyToggle' }).exists()).toBe(true)
  })

  it('switches difficulty content when difficulty changes', async () => {
    router.push('/lesson/introduction')
    await router.isReady()

    const wrapper = mount(LessonView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LoopSpiralVisualization: true,
          LessonCompletion: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Initial state - should show base content
    expect(wrapper.text()).toContain('Introduction to Core Concepts')

    // Change difficulty
    await wrapper.vm.handleDifficultyChange('advance')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Deep Dive into Course Methodology')
  })

  it('displays media when available', async () => {
    router.push('/lesson/introduction')
    await router.isReady()

    const wrapper = mount(LessonView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LoopSpiralVisualization: true,
          LessonCompletion: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent({ name: 'MediaDisplay' }).exists()).toBe(true)
  })

  it('displays attachments when available', async () => {
    router.push('/lesson/introduction')
    await router.isReady()

    const wrapper = mount(LessonView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LoopSpiralVisualization: true,
          LessonCompletion: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent({ name: 'AttachmentsList' }).exists()).toBe(true)
  })

  it('displays related resources when available', async () => {
    router.push('/lesson/introduction')
    await router.isReady()

    const wrapper = mount(LessonView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LoopSpiralVisualization: true,
          LessonCompletion: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent({ name: 'RelatedResources' }).exists()).toBe(true)
  })

  it('handles missing lesson gracefully', async () => {
    router.push('/lesson/introduction')
    await router.isReady()

    const wrapper = mount(LessonView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LoopSpiralVisualization: true,
          LessonCompletion: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Should render valid lesson
    expect(wrapper.find('.lesson-view').exists()).toBe(true)
  })

  it('auto-marks lesson as complete when scrolled to end', async () => {
    router.push('/lesson/introduction')
    await router.isReady()

    const wrapper = mount(LessonView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LoopSpiralVisualization: true,
          LessonCompletion: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Simulate scroll to end
    await wrapper.vm.markLessonAsReached()

    expect(wrapper.vm.hasReachedEnd).toBe(true)
    expect(wrapper.vm.showAutoCompleteNotification).toBe(true)
  })

  it('allows dismissing auto-complete notification', async () => {
    router.push('/lesson/introduction')
    await router.isReady()

    const wrapper = mount(LessonView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          LoopSpiralVisualization: true,
          LessonCompletion: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Show notification
    await wrapper.vm.markLessonAsReached()
    expect(wrapper.vm.showAutoCompleteNotification).toBe(true)

    // Dismiss
    await wrapper.vm.dismissAutoComplete()
    expect(wrapper.vm.showAutoCompleteNotification).toBe(false)
  })
})
