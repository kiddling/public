import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import KnowledgeCard from '~/components/knowledge-card/KnowledgeCard.vue'
import type { KnowledgeCard as KnowledgeCardType } from '~/types/cms'

describe('KnowledgeCard', () => {
  const mockCard: KnowledgeCardType = {
    id: 1,
    title: 'Test Knowledge Card',
    slug: 'test-card',
    type: 'Theory',
    description: 'This is a test card description',
    tags: ['design', 'theory'],
    media: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    publishedAt: '2024-01-01T00:00:00.000Z',
  }

  it('renders card with title', () => {
    const wrapper = mount(KnowledgeCard, {
      props: { card: mockCard },
    })

    expect(wrapper.text()).toContain('Test Knowledge Card')
  })

  it('displays card type badge', () => {
    const wrapper = mount(KnowledgeCard, {
      props: { card: mockCard },
    })

    expect(wrapper.text()).toContain('Theory')
  })

  it('displays tags', () => {
    const wrapper = mount(KnowledgeCard, {
      props: { card: mockCard },
    })

    expect(wrapper.text()).toContain('design')
    expect(wrapper.text()).toContain('theory')
  })

  it('displays description', () => {
    const wrapper = mount(KnowledgeCard, {
      props: { card: mockCard },
    })

    expect(wrapper.text()).toContain('This is a test card description')
  })

  it('applies correct color class based on type', () => {
    const wrapper = mount(KnowledgeCard, {
      props: { card: mockCard },
    })

    expect(wrapper.html()).toContain('border-blue-500')
  })

  it('emits click event when card is clicked', async () => {
    const wrapper = mount(KnowledgeCard, {
      props: { card: mockCard, clickable: true },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual([mockCard])
  })

  it('does not emit click when clickable is false', async () => {
    const wrapper = mount(KnowledgeCard, {
      props: { card: mockCard, clickable: false },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeFalsy()
  })

  describe('AI Prompt type', () => {
    const aiPromptCard: KnowledgeCardType = {
      ...mockCard,
      type: 'AI Prompt',
      promptText: 'Create a detailed design for...',
    }

    it('displays prompt text', () => {
      const wrapper = mount(KnowledgeCard, {
        props: { card: aiPromptCard },
      })

      expect(wrapper.text()).toContain('Create a detailed design for...')
    })

    it('shows copy button for AI prompts', () => {
      const wrapper = mount(KnowledgeCard, {
        props: { card: aiPromptCard, showCopyButton: true },
      })

      const copyButton = wrapper.find('button[title*="Copy"]')
      expect(copyButton.exists()).toBe(true)
    })

    it('copies prompt text to clipboard', async () => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })

      const wrapper = mount(KnowledgeCard, {
        props: { card: aiPromptCard, showCopyButton: true },
      })

      const copyButton = wrapper.find('button[title*="Copy"]')
      await copyButton.trigger('click')

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Create a detailed design for...')
    })
  })

  describe('Case Study type', () => {
    const caseStudyCard: KnowledgeCardType = {
      ...mockCard,
      type: 'Case Study',
    }

    it('applies correct styling for case study', () => {
      const wrapper = mount(KnowledgeCard, {
        props: { card: caseStudyCard },
      })

      expect(wrapper.html()).toContain('border-green-500')
    })
  })

  describe('Student Work type', () => {
    const studentWorkCard: KnowledgeCardType = {
      ...mockCard,
      type: 'Student Work',
      media: [
        { url: 'image1.jpg', mime: 'image/jpeg' },
        { url: 'image2.jpg', mime: 'image/jpeg' },
      ],
    }

    it('displays media count', () => {
      const wrapper = mount(KnowledgeCard, {
        props: { card: studentWorkCard },
      })

      expect(wrapper.text()).toContain('2 images')
    })
  })

  describe('Extended Thinking type', () => {
    const extendedThinkingCard: KnowledgeCardType = {
      ...mockCard,
      type: 'Extended Thinking',
    }

    it('displays thinking icon', () => {
      const wrapper = mount(KnowledgeCard, {
        props: { card: extendedThinkingCard },
      })

      expect(wrapper.html()).toContain('border-pink-500')
    })
  })

  describe('Media display', () => {
    it('displays image media', () => {
      const cardWithImage: KnowledgeCardType = {
        ...mockCard,
        media: [{ url: 'test.jpg', mime: 'image/jpeg', alternativeText: 'Test image' }],
      }

      const wrapper = mount(KnowledgeCard, {
        props: { card: cardWithImage, showMedia: true },
      })

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('test.jpg')
      expect(img.attributes('alt')).toBe('Test image')
    })

    it('displays video placeholder', () => {
      const cardWithVideo: KnowledgeCardType = {
        ...mockCard,
        media: [{ url: 'test.mp4', mime: 'video/mp4' }],
      }

      const wrapper = mount(KnowledgeCard, {
        props: { card: cardWithVideo, showMedia: true },
      })

      expect(wrapper.html()).toContain('video')
    })

    it('displays PDF placeholder', () => {
      const cardWithPdf: KnowledgeCardType = {
        ...mockCard,
        media: [{ url: 'test.pdf', mime: 'application/pdf' }],
      }

      const wrapper = mount(KnowledgeCard, {
        props: { card: cardWithPdf, showMedia: true },
      })

      expect(wrapper.html()).toContain('pdf')
    })

    it('hides media when showMedia is false', () => {
      const cardWithImage: KnowledgeCardType = {
        ...mockCard,
        media: [{ url: 'test.jpg', mime: 'image/jpeg' }],
      }

      const wrapper = mount(KnowledgeCard, {
        props: { card: cardWithImage, showMedia: false },
      })

      expect(wrapper.find('.card-media').exists()).toBe(false)
    })
  })

  describe('Footer actions', () => {
    it('shows QR button when qrLink is provided', () => {
      const cardWithQr: KnowledgeCardType = {
        ...mockCard,
        qrLink: 'https://example.com/card',
      }

      const wrapper = mount(KnowledgeCard, {
        props: { card: cardWithQr, showQrButton: true },
      })

      const qrButton = wrapper.find('button[title*="QR"]')
      expect(qrButton.exists()).toBe(true)
    })

    it('emits show-qr event when QR button clicked', async () => {
      const cardWithQr: KnowledgeCardType = {
        ...mockCard,
        qrLink: 'https://example.com/card',
      }

      const wrapper = mount(KnowledgeCard, {
        props: { card: cardWithQr, showQrButton: true },
      })

      const qrButton = wrapper.find('button[title*="QR"]')
      await qrButton.trigger('click')

      expect(wrapper.emitted('show-qr')).toBeTruthy()
    })

    it('shows share button', () => {
      const wrapper = mount(KnowledgeCard, {
        props: { card: mockCard, showShareButton: true },
      })

      const shareButton = wrapper.find('button[title*="Share"]')
      expect(shareButton.exists()).toBe(true)
    })

    it('emits share event when share button clicked', async () => {
      const wrapper = mount(KnowledgeCard, {
        props: { card: mockCard, showShareButton: true },
      })

      const shareButton = wrapper.find('button[title*="Share"]')
      await shareButton.trigger('click')

      expect(wrapper.emitted('share')).toBeTruthy()
    })

    it('hides footer when showFooter is false', () => {
      const wrapper = mount(KnowledgeCard, {
        props: { card: mockCard, showFooter: false },
      })

      expect(wrapper.find('.card-footer').exists()).toBe(false)
    })
  })
})
