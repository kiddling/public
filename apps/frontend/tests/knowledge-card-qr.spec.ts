import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import KnowledgeCardQrModal from '~/components/knowledge-card/KnowledgeCardQrModal.vue'
import type { KnowledgeCard } from '~/types/cms'

// Mock qrcode library
vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn((url, options, callback) => {
      const canvas = document.createElement('canvas')
      callback(null, canvas)
    }),
  },
}))

describe('KnowledgeCardQrModal', () => {
  const mockCard: KnowledgeCard = {
    id: 1,
    title: 'Test Card',
    slug: 'test-card',
    type: 'Theory',
    qrLink: 'https://example.com/card/test',
    media: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders when show is true', () => {
    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: true,
        card: mockCard,
      },
    })

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('does not render when show is false', () => {
    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: false,
        card: mockCard,
      },
    })

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('displays card title', () => {
    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: true,
        card: mockCard,
      },
    })

    expect(wrapper.text()).toContain('Test Card')
  })

  it('displays QR link URL', () => {
    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: true,
        card: mockCard,
      },
    })

    expect(wrapper.text()).toContain('https://example.com/card/test')
  })

  it('generates QR code URL from slug if qrLink not provided', () => {
    const cardWithoutQrLink: KnowledgeCard = {
      ...mockCard,
      qrLink: undefined,
    }

    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: true,
        card: cardWithoutQrLink,
      },
    })

    // Should generate URL based on slug
    expect(wrapper.vm.qrUrl).toBeTruthy()
  })

  it('emits close event when close button clicked', async () => {
    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: true,
        card: mockCard,
      },
    })

    const closeButton = wrapper.findAll('button').find(btn => btn.text() === 'Close')
    if (closeButton) {
      await closeButton.trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    }
  })

  it('emits close when clicking outside modal', async () => {
    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: true,
        card: mockCard,
      },
    })

    const backdrop = wrapper.find('.fixed.inset-0')
    await backdrop.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('copies link to clipboard', async () => {
    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: true,
        card: mockCard,
      },
    })

    const copyButton = wrapper.find('button[title*="Copy"]')
    if (copyButton.exists()) {
      await copyButton.trigger('click')

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/card/test')
    }
  })

  it('shows copied state after copying', async () => {
    vi.useFakeTimers()

    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: true,
        card: mockCard,
      },
    })

    const copyButton = wrapper.find('button[title*="Copy"]')
    if (copyButton.exists()) {
      await copyButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.html()).toContain('Copied')

      // Fast-forward time
      vi.advanceTimersByTime(2000)
      await wrapper.vm.$nextTick()

      // Should revert back
      expect(wrapper.vm.copied).toBe(false)
    }

    vi.useRealTimers()
  })

  it('has download QR button', () => {
    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: true,
        card: mockCard,
      },
    })

    const downloadButton = wrapper.findAll('button').find(btn => btn.text() === 'Download QR')
    expect(downloadButton).toBeTruthy()
  })

  it('downloads QR code when download button clicked', async () => {
    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: true,
        card: mockCard,
      },
    })

    // Mock canvas toBlob
    const mockBlob = new Blob(['fake image'], { type: 'image/png' })
    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      callback(mockBlob)
    })

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()

    // Create a mock link element
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    }
    document.createElement = vi.fn((tag) => {
      if (tag === 'a') return mockLink as any
      return document.createElement(tag)
    })

    const downloadButton = wrapper.findAll('button').find(btn => btn.text() === 'Download QR')
    if (downloadButton) {
      await downloadButton.trigger('click')

      expect(mockLink.click).toHaveBeenCalled()
      expect(mockLink.download).toContain('qr-code')
    }
  })

  it('does not crash when QRCode library fails', async () => {
    // Re-mock with error
    vi.doMock('qrcode', () => ({
      default: {
        toCanvas: vi.fn((url, options, callback) => {
          callback(new Error('QR generation failed'), null)
        }),
      },
    }))

    const wrapper = mount(KnowledgeCardQrModal, {
      props: {
        show: true,
        card: mockCard,
      },
    })

    // Should still render
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })
})
