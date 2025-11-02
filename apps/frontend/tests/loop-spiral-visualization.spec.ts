import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoopSpiralVisualization from '~/components/navigation/LoopSpiralVisualization.vue'
import { useNavigationStore } from '~/stores/navigation'
import { mockNavigationResponse } from './fixtures/navigation'

async function getLessons() {
  const store = useNavigationStore()
  await store.loadStructure({ data: mockNavigationResponse })
  return store.courseStructure?.lessons ?? []
}

describe('LoopSpiralVisualization', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders a node for each lesson and reflects state', async () => {
    const lessons = await getLessons()
    const wrapper = mount(LoopSpiralVisualization, {
      props: {
        lessons,
        completedCodes: ['P-00', 'PA-01'],
        currentCode: 'P-00',
      },
      global: {
        stubs: {
          transition: false,
        },
      },
    })

    const nodes = wrapper.findAll('.spiral-node')
    expect(nodes.length).toBe(lessons.length)

    const currentNode = wrapper.get('.spiral-node[data-state="current"]')
    expect(currentNode.text()).toContain('P-00')

    const completedNodes = wrapper.findAll('.spiral-node[data-state="completed"]')
    expect(completedNodes.length).toBeGreaterThan(0)

    await nodes[0].trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual([lessons[0].code])
  })
})
