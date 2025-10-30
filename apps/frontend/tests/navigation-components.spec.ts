import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router'
import NavigationSidebar from '~/components/navigation/NavigationSidebar.vue'
import NavigationDrawer from '~/components/navigation/NavigationDrawer.vue'
import NavigationBreadcrumb from '~/components/navigation/NavigationBreadcrumb.vue'
import { useNavigationStore } from '~/stores/navigation'
import { mockNavigationResponse } from './fixtures/navigation'

let pinia: Pinia

async function prepareStore() {
  const store = useNavigationStore()
  await store.loadStructure({ data: mockNavigationResponse })
  return store
}

function createTestingRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      {
        path: '/lessons/:code',
        name: 'lessons-code',
        component: { template: '<div />' },
      },
    ],
  })
}

describe('NavigationSidebar', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders course outline and highlights the active lesson', async () => {
    const store = await prepareStore()
    store.setCurrentLesson('PA-01')

    const wrapper = mount(NavigationSidebar, {
      global: {
        plugins: [pinia],
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          Icon: { template: '<span />' },
        },
      },
    })

    expect(wrapper.text()).toContain('Course Outline')
    expect(wrapper.text()).toContain('Core Blocks')

    const activeLesson = wrapper.get('[data-test="nav-lesson-PA-01"] .lesson-link')
    expect(activeLesson.attributes('aria-current')).toBe('page')

    const navigateTarget = wrapper.get('[data-test="nav-lesson-P-01"] .lesson-link')
    await navigateTarget.trigger('click')

    const navigateEvents = wrapper.emitted('navigate') ?? []
    expect(navigateEvents[0]).toEqual(['P-01'])
  })

  it('toggles part visibility when the header is clicked', async () => {
    await prepareStore()

    const wrapper = mount(NavigationSidebar, {
      global: {
        plugins: [pinia],
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          Icon: { template: '<span />' },
        },
      },
    })

    const partToggle = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Core Blocks'))
    expect(partToggle).toBeDefined()
    expect(partToggle?.attributes('aria-expanded')).toBe('true')

    await partToggle?.trigger('click')
    await nextTick()

    expect(partToggle?.attributes('aria-expanded')).toBe('false')
  })
})

describe('NavigationDrawer', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('emits close events and forwards navigation events', async () => {
    await prepareStore()

    const wrapper = mount(NavigationDrawer, {
      props: {
        open: true,
      },
      global: {
        plugins: [pinia],
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          Icon: { template: '<span />' },
          Teleport: { template: '<div><slot /></div>' },
        },
      },
      attachTo: document.body,
    })

    await nextTick()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    const closeButton = wrapper.get('button[aria-label="Close course navigation"]')
    await closeButton.trigger('click')
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])

    const lessonLink = wrapper.get('[data-test="nav-lesson-P-00"] .lesson-link')
    await lessonLink.trigger('click')

    const emitted = wrapper.emitted()
    expect(emitted['update:open']?.at(-1)).toEqual([false])
    expect(emitted.navigate?.[0]).toEqual(['P-00'])

    wrapper.unmount()
  })
})

describe('NavigationBreadcrumb', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders breadcrumb trail for the current lesson', async () => {
    const store = await prepareStore()
    const router = createTestingRouter()

    await router.push({ name: 'lessons-code', params: { code: 'PA-01' } })
    await router.isReady()

    const lesson = store.setCurrentLesson('PA-01')
    router.currentRoute.value.meta.breadcrumb = lesson ? [...lesson.navigation.breadcrumb] : undefined
    router.currentRoute.value.meta.breadcrumbHomeLabel = 'Home'

    const wrapper = mount(NavigationBreadcrumb, {
      global: {
        plugins: [pinia, router],
        stubs: {
          Icon: { template: '<span />' },
          NuxtLink: RouterLink,
        },
      },
    })

    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Core Blocks')
    expect(wrapper.text()).toContain('Core Block A')

    const currentCrumb = wrapper.find('[aria-current="page"]')
    expect(currentCrumb.exists()).toBe(true)
    expect(currentCrumb.text()).toContain('Core Block A')
  })
})
