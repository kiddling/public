import { beforeEach, describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { nextTick } from 'vue'
import QuickLessonSearch from '~/components/navigation/QuickLessonSearch.vue'
import { useNavigationStore } from '~/stores/navigation'
import { useProgressStore } from '~/stores/progress'
import { mockNavigationResponse } from './fixtures/navigation'

function createTestingRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/lessons/:code', name: 'lessons-code', component: { template: '<div />' } },
    ],
  })
}

let pinia: Pinia

describe('QuickLessonSearch', () => {
  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  async function mountComponent() {
    const router = createTestingRouter()
    await router.push('/')
    await router.isReady()

    const navigationStore = useNavigationStore()
    await navigationStore.loadStructure({ data: mockNavigationResponse })

    const progressStore = useProgressStore()
    progressStore.markLessonViewed('P-00')

    const wrapper = mount(QuickLessonSearch, {
      global: {
        plugins: [pinia, router],
        stubs: {
          Teleport: false,
          Icon: { template: '<span />' },
        },
      },
    })

    return { wrapper, router, progressStore }
  }

  it('opens the palette and lists lessons', async () => {
    const { wrapper } = await mountComponent()

    await wrapper.get('button').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Quick Navigation')

    const options = wrapper.findAll('[role="option"]')
    expect(options.length).toBeGreaterThan(0)
  })

  it('filters lessons based on the search query and emits navigation', async () => {
    const { wrapper, router } = await mountComponent()

    await wrapper.get('button').trigger('click')
    const input = wrapper.get('input[type="search"]')

    await input.setValue('PA-01')
    await nextTick()

    const options = wrapper.findAll('[role="option"]')
    expect(options.length).toBeGreaterThan(0)
    expect(options[0].text()).toContain('PA-01')

    await input.trigger('keydown.enter')
    await nextTick()
    await flushPromises()

    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['PA-01'])
    expect(router.currentRoute.value.params.code).toBe('PA-01')
  })
})
