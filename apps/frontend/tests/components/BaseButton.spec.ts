import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { RouterLink } from 'vue-router'
import BaseButton from '~/components/base/BaseButton.vue'

describe('BaseButton', () => {
  describe('rendering', () => {
    it('renders a button element by default', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: 'Click me',
        },
      })

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toBe('Click me')
    })

    it('renders a NuxtLink when "to" prop is provided', () => {
      const wrapper = mount(BaseButton, {
        props: {
          to: '/test-path',
        },
        slots: {
          default: 'Navigate',
        },
        global: {
          stubs: {
            NuxtLink: RouterLink,
          },
        },
      })

      expect(wrapper.findComponent(RouterLink).exists()).toBe(true)
      expect(wrapper.text()).toBe('Navigate')
    })

    it('renders with correct button type', () => {
      const wrapper = mount(BaseButton, {
        props: {
          type: 'submit',
        },
      })

      expect(wrapper.find('button').attributes('type')).toBe('submit')
    })
  })

  describe('disabled state', () => {
    it('disables button element when disabled prop is true', () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true,
        },
      })

      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })

    it('disables button element when loading prop is true', () => {
      const wrapper = mount(BaseButton, {
        props: {
          loading: true,
        },
      })

      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })

    it('sets aria-disabled on link when disabled', () => {
      const wrapper = mount(BaseButton, {
        props: {
          to: '/test-path',
          disabled: true,
        },
        global: {
          stubs: {
            NuxtLink: RouterLink,
          },
        },
      })

      const link = wrapper.findComponent(RouterLink)
      expect(link.attributes('aria-disabled')).toBe('true')
    })

    it('sets tabindex to -1 on link when disabled', () => {
      const wrapper = mount(BaseButton, {
        props: {
          to: '/test-path',
          disabled: true,
        },
        global: {
          stubs: {
            NuxtLink: RouterLink,
          },
        },
      })

      const link = wrapper.findComponent(RouterLink)
      expect(link.attributes('tabindex')).toBe('-1')
    })
  })

  describe('click handling', () => {
    it('emits click event when button is clicked and not disabled', async () => {
      const wrapper = mount(BaseButton)

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('does not emit click event when button is disabled', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true,
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('does not emit click event when button is loading', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          loading: true,
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('preventing navigation when disabled', () => {
    it('prevents default behavior when disabled and rendered as link', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          to: '/test-path',
          disabled: true,
        },
        global: {
          stubs: {
            NuxtLink: RouterLink,
          },
        },
      })

      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')

      await wrapper.element.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(stopPropagationSpy).toHaveBeenCalled()
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('prevents default behavior when loading and rendered as link', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          to: '/test-path',
          loading: true,
        },
        global: {
          stubs: {
            NuxtLink: RouterLink,
          },
        },
      })

      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')

      await wrapper.element.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(stopPropagationSpy).toHaveBeenCalled()
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('allows navigation when not disabled and rendered as link', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          to: '/test-path',
        },
        global: {
          stubs: {
            NuxtLink: RouterLink,
          },
        },
      })

      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      await wrapper.element.dispatchEvent(event)

      // preventDefault should not be called when the button is enabled
      expect(preventDefaultSpy).not.toHaveBeenCalled()
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('prevents default when disabled on regular button', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true,
        },
      })

      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')

      await wrapper.element.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(stopPropagationSpy).toHaveBeenCalled()
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('combined disabled and loading states', () => {
    it('prevents clicks when both disabled and loading are true', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true,
          loading: true,
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('prevents navigation when both disabled and loading with link', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          to: '/test-path',
          disabled: true,
          loading: true,
        },
        global: {
          stubs: {
            NuxtLink: RouterLink,
          },
        },
      })

      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      await wrapper.element.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })
})
