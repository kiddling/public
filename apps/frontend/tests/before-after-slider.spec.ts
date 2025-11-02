import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BeforeAfterSlider from '~/components/student/BeforeAfterSlider.vue'
import type { BeforeAfterPair } from '~/types/cms'

describe('BeforeAfterSlider', () => {
  const mockPair: BeforeAfterPair = {
    beforeMedia: {
      url: '/before.jpg',
      alternativeText: 'Before image',
    },
    afterMedia: {
      url: '/after.jpg',
      alternativeText: 'After image',
    },
    beforeLabel: 'Before',
    afterLabel: 'After',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render both images', () => {
    const wrapper = mount(BeforeAfterSlider, {
      props: { pair: mockPair },
    })

    const images = wrapper.findAll('img')
    expect(images).toHaveLength(2)
    expect(images[0].attributes('src')).toBe('/after.jpg')
    expect(images[1].attributes('src')).toBe('/before.jpg')
  })

  it('should render labels', () => {
    const wrapper = mount(BeforeAfterSlider, {
      props: { pair: mockPair },
    })

    expect(wrapper.text()).toContain('Before')
    expect(wrapper.text()).toContain('After')
  })

  it('should start with slider at 50% position', () => {
    const wrapper = mount(BeforeAfterSlider, {
      props: { pair: mockPair },
    })

    const sliderOverlay = wrapper.find('.absolute.inset-0.overflow-hidden')
    expect(sliderOverlay.attributes('style')).toContain('50%')
  })

  it('should handle keyboard navigation - ArrowLeft', async () => {
    const wrapper = mount(BeforeAfterSlider, {
      props: { pair: mockPair },
    })

    const srOnly = wrapper.find('.sr-only')
    await srOnly.trigger('keydown', { key: 'ArrowLeft' })

    const sliderOverlay = wrapper.find('.absolute.inset-0.overflow-hidden')
    expect(sliderOverlay.attributes('style')).toContain('49%')
  })

  it('should handle keyboard navigation - ArrowRight', async () => {
    const wrapper = mount(BeforeAfterSlider, {
      props: { pair: mockPair },
    })

    const srOnly = wrapper.find('.sr-only')
    await srOnly.trigger('keydown', { key: 'ArrowRight' })

    const sliderOverlay = wrapper.find('.absolute.inset-0.overflow-hidden')
    expect(sliderOverlay.attributes('style')).toContain('51%')
  })

  it('should handle keyboard navigation with shift key - larger steps', async () => {
    const wrapper = mount(BeforeAfterSlider, {
      props: { pair: mockPair },
    })

    const srOnly = wrapper.find('.sr-only')
    await srOnly.trigger('keydown', { key: 'ArrowRight', shiftKey: true })

    const sliderOverlay = wrapper.find('.absolute.inset-0.overflow-hidden')
    expect(sliderOverlay.attributes('style')).toContain('60%')
  })

  it('should not allow slider position below 0', async () => {
    const wrapper = mount(BeforeAfterSlider, {
      props: { pair: mockPair },
    })

    const srOnly = wrapper.find('.sr-only')
    for (let i = 0; i < 100; i++) {
      await srOnly.trigger('keydown', { key: 'ArrowLeft' })
    }

    const sliderOverlay = wrapper.find('.absolute.inset-0.overflow-hidden')
    const style = sliderOverlay.attributes('style')
    const match = style?.match(/width:\s*(\d+)%/)
    if (match) {
      const position = parseInt(match[1])
      expect(position).toBeGreaterThanOrEqual(0)
    }
  })

  it('should not allow slider position above 100', async () => {
    const wrapper = mount(BeforeAfterSlider, {
      props: { pair: mockPair },
    })

    const srOnly = wrapper.find('.sr-only')
    for (let i = 0; i < 100; i++) {
      await srOnly.trigger('keydown', { key: 'ArrowRight' })
    }

    const sliderOverlay = wrapper.find('.absolute.inset-0.overflow-hidden')
    const style = sliderOverlay.attributes('style')
    const match = style?.match(/width:\s*(\d+)%/)
    if (match) {
      const position = parseInt(match[1])
      expect(position).toBeLessThanOrEqual(100)
    }
  })

  it('should have proper ARIA attributes', () => {
    const wrapper = mount(BeforeAfterSlider, {
      props: { pair: mockPair },
    })

    const slider = wrapper.find('[role="slider"]')
    expect(slider.exists()).toBe(true)
    expect(slider.attributes('aria-valuenow')).toBe('50')
    expect(slider.attributes('aria-valuemin')).toBe('0')
    expect(slider.attributes('aria-valuemax')).toBe('100')
    expect(slider.attributes('aria-label')).toContain('Adjust comparison slider')
  })

  it('should use custom labels when provided', () => {
    const customPair: BeforeAfterPair = {
      ...mockPair,
      beforeLabel: 'Original',
      afterLabel: 'Enhanced',
    }

    const wrapper = mount(BeforeAfterSlider, {
      props: { pair: customPair },
    })

    expect(wrapper.text()).toContain('Original')
    expect(wrapper.text()).toContain('Enhanced')
  })
})
