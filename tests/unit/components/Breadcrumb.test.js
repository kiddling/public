import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Breadcrumb from '@/components/Breadcrumb.vue'

describe('Breadcrumb', () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { 
        path: '/', 
        name: 'home',
        meta: { breadcrumb: [{ label: 'Home', to: '/' }] }
      },
      { 
        path: '/test',
        name: 'test',
        meta: { 
          breadcrumb: [
            { label: 'Home', to: '/' },
            { label: 'Test', to: null }
          ]
        }
      }
    ]
  })

  it('renders breadcrumb items from route meta', async () => {
    await router.push('/test')
    await router.isReady()

    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router]
      }
    })

    const items = wrapper.findAll('.breadcrumb-item')
    expect(items.length).toBe(2)
  })

  it('renders links for clickable breadcrumb items', async () => {
    await router.push('/test')
    await router.isReady()

    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router]
      }
    })

    const link = wrapper.find('.breadcrumb-link')
    expect(link.exists()).toBe(true)
  })

  it('renders separators between items', async () => {
    await router.push('/test')
    await router.isReady()

    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router]
      }
    })

    const separators = wrapper.findAll('.breadcrumb-separator')
    expect(separators.length).toBe(1)
  })

  it('has proper ARIA attributes', async () => {
    await router.push('/test')
    await router.isReady()

    const wrapper = mount(Breadcrumb, {
      global: {
        plugins: [router]
      }
    })

    const nav = wrapper.find('nav')
    expect(nav.attributes('aria-label')).toBe('Breadcrumb')
  })
})
