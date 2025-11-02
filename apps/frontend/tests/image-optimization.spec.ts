import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KnowledgeCard from '~/components/knowledge-card/KnowledgeCard.vue'
import StudentGalleryCard from '~/components/student/StudentGalleryCard.vue'
import type { KnowledgeCard as KnowledgeCardType } from '~/types/cms'
import type { StudentWork } from '~/types/cms'

describe('Image Optimization with NuxtImg', () => {
  describe('KnowledgeCard Image Rendering', () => {
    const mockCardWithImage: KnowledgeCardType = {
      id: 1,
      title: 'Test Card',
      slug: 'test-card',
      type: 'Theory',
      description: 'Test description',
      tags: [],
      media: [
        {
          id: 1,
          name: 'test-image.jpg',
          alternativeText: 'Test image alt text',
          caption: 'Test caption',
          url: '/uploads/test.jpg',
          mime: 'image/jpeg',
          width: 800,
          height: 600,
        },
      ],
      createdAt: '2024-01-01',
      publishedAt: '2024-01-01',
    }

    it('renders NuxtImg component with correct props', () => {
      const wrapper = mount(KnowledgeCard, {
        props: {
          card: mockCardWithImage,
          showMedia: true,
        },
        global: {
          stubs: {
            NuxtImg: {
              template: '<img :src="src" :alt="alt" :loading="loading" />',
              props: ['src', 'alt', 'loading', 'preset', 'sizes'],
            },
          },
        },
      })

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/uploads/test.jpg')
      expect(img.attributes('alt')).toBe('Test image alt text')
      expect(img.attributes('loading')).toBe('lazy')
    })

    it('provides descriptive alt text when alternativeText is missing', () => {
      const cardWithoutAlt = {
        ...mockCardWithImage,
        media: [
          {
            ...mockCardWithImage.media[0],
            alternativeText: undefined,
          },
        ],
      }

      const wrapper = mount(KnowledgeCard, {
        props: {
          card: cardWithoutAlt,
          showMedia: true,
        },
        global: {
          stubs: {
            NuxtImg: {
              template: '<img :alt="alt" />',
              props: ['alt'],
            },
          },
        },
      })

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toContain('Test Card')
    })

    it('does not render image when showMedia is false', () => {
      const wrapper = mount(KnowledgeCard, {
        props: {
          card: mockCardWithImage,
          showMedia: false,
        },
        global: {
          stubs: {
            NuxtImg: true,
          },
        },
      })

      expect(wrapper.find('img').exists()).toBe(false)
    })
  })

  describe('StudentGalleryCard Image Rendering', () => {
    const mockStudentWork: StudentWork = {
      id: 1,
      studentName: 'John Doe',
      projectTitle: 'Amazing Project',
      description: 'Project description',
      discipline: 'Design',
      loop: 'Loop 1',
      grade: 'A',
      tags: [],
      assets: [
        {
          id: 1,
          name: 'work.jpg',
          alternativeText: 'Student work',
          url: '/uploads/work.jpg',
          mime: 'image/jpeg',
          width: 1200,
          height: 1600,
        },
      ],
      beforeAfterMedia: [],
      shareEnabled: true,
      publishedAt: '2024-01-01',
      createdAt: '2024-01-01',
    }

    it('renders NuxtImg with appropriate preset for gallery', () => {
      const wrapper = mount(StudentGalleryCard, {
        props: {
          work: mockStudentWork,
        },
        global: {
          stubs: {
            NuxtImg: {
              template: '<img :src="src" :alt="alt" :preset="preset" :sizes="sizes" />',
              props: ['src', 'alt', 'preset', 'sizes', 'loading'],
            },
            Teleport: true,
          },
        },
      })

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('preset')).toBe('card')
    })

    it('generates descriptive alt text from student name', () => {
      const wrapper = mount(StudentGalleryCard, {
        props: {
          work: mockStudentWork,
        },
        global: {
          stubs: {
            NuxtImg: {
              template: '<img :alt="alt" />',
              props: ['alt'],
            },
            Teleport: true,
          },
        },
      })

      const img = wrapper.find('img')
      const altText = img.attributes('alt')
      expect(altText).toBeTruthy()
      expect(typeof altText).toBe('string')
    })

    it('shows placeholder when no assets are available', () => {
      const workWithoutAssets = {
        ...mockStudentWork,
        assets: [],
      }

      const wrapper = mount(StudentGalleryCard, {
        props: {
          work: workWithoutAssets,
        },
        global: {
          stubs: {
            NuxtImg: true,
            Teleport: true,
          },
        },
      })

      expect(wrapper.find('img').exists()).toBe(false)
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('Lazy Loading', () => {
    it('applies lazy loading attribute to images', () => {
      const mockCard: KnowledgeCardType = {
        id: 1,
        title: 'Lazy Card',
        slug: 'lazy-card',
        type: 'Theory',
        description: 'Test',
        tags: [],
        media: [
          {
            id: 1,
            name: 'lazy.jpg',
            url: '/uploads/lazy.jpg',
            mime: 'image/jpeg',
          },
        ],
        createdAt: '2024-01-01',
        publishedAt: '2024-01-01',
      }

      const wrapper = mount(KnowledgeCard, {
        props: {
          card: mockCard,
          showMedia: true,
        },
        global: {
          stubs: {
            NuxtImg: {
              template: '<img :loading="loading" />',
              props: ['loading'],
            },
          },
        },
      })

      const img = wrapper.find('img')
      expect(img.attributes('loading')).toBe('lazy')
    })
  })

  describe('Responsive Image Sizes', () => {
    it('includes sizes attribute for responsive delivery', () => {
      const mockCard: KnowledgeCardType = {
        id: 1,
        title: 'Responsive Card',
        slug: 'responsive-card',
        type: 'Theory',
        description: 'Test',
        tags: [],
        media: [
          {
            id: 1,
            name: 'responsive.jpg',
            url: '/uploads/responsive.jpg',
            mime: 'image/jpeg',
          },
        ],
        createdAt: '2024-01-01',
        publishedAt: '2024-01-01',
      }

      const wrapper = mount(KnowledgeCard, {
        props: {
          card: mockCard,
          showMedia: true,
        },
        global: {
          stubs: {
            NuxtImg: {
              template: '<img :sizes="sizes" />',
              props: ['sizes'],
            },
          },
        },
      })

      const img = wrapper.find('img')
      expect(img.attributes('sizes')).toBeTruthy()
    })
  })
})
