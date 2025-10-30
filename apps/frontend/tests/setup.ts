import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { afterEach, beforeEach, vi } from 'vitest'

config.global.stubs = {
  NuxtLink: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  },
  Icon: {
    props: ['name'],
    template: '<i :data-icon="name"></i>',
  },
}

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.clearAllMocks()
})

vi.mock('#imports', () => {
  const stateMap = new Map<string, any>()

  return {
    useRouter: () => ({
      push: vi.fn(() => Promise.resolve()),
      replace: vi.fn(() => Promise.resolve()),
    }),
    useRoute: () => ({
      params: {},
      hash: '',
      fullPath: '/',
      query: {},
    }),
    useRuntimeConfig: () => ({
      public: {
        strapiUrl: 'http://localhost:1337',
        apiBaseUrl: 'http://localhost:1337',
      },
      strapiApiToken: '',
    }),
    useNuxtApp: () => ({
      $fetch: vi.fn(() => Promise.resolve({ data: [] })),
    }),
    useState: <T>(key: string, init: () => T) => {
      if (!stateMap.has(key)) {
        stateMap.set(key, ref(init()))
      }
      return stateMap.get(key)
    },
  }
})
