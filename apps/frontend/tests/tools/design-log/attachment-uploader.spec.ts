import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AttachmentUploader from '~/components/tools/design-log/AttachmentUploader.vue'
import type { AttachmentFile } from '~/stores/designLog'

describe('AttachmentUploader', () => {
  const mockAttachments: AttachmentFile[] = [
    {
      id: 'file-1',
      name: 'design.jpg',
      size: 1024 * 500,
      type: 'image/jpeg',
    },
    {
      id: 'file-2',
      name: 'document.pdf',
      size: 1024 * 1024 * 2,
      type: 'application/pdf',
    },
  ]

  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.alert = vi.fn()
  })

  it('should render the component', () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: [],
      },
    })

    expect(wrapper.find('.attachment-uploader').exists()).toBe(true)
  })

  it('should display upload area', () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: [],
      },
    })

    expect(wrapper.text()).toContain('Click to upload')
    expect(wrapper.text()).toContain('drag and drop')
  })

  it('should render attachment list', () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: mockAttachments,
      },
    })

    expect(wrapper.text()).toContain('design.jpg')
    expect(wrapper.text()).toContain('document.pdf')
  })

  it('should format file sizes correctly', () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: mockAttachments,
      },
    })

    expect(wrapper.text()).toContain('KB')
    expect(wrapper.text()).toContain('MB')
  })

  it('should emit remove event when remove button is clicked', async () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: mockAttachments,
      },
    })

    const removeButtons = wrapper.findAll('button[aria-label="Remove attachment"]')
    await removeButtons[0].trigger('click')

    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')?.[0]).toEqual(['file-1'])
  })

  it('should display different icons for different file types', () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: mockAttachments,
      },
    })

    const svgs = wrapper.findAll('svg')
    expect(svgs.length).toBeGreaterThan(2)
  })

  it('should display tooltip help icon when tooltip provided', () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: [],
        tooltip: 'Help text',
      },
    })

    expect(wrapper.findComponent({ name: 'HelpPopover' }).exists()).toBe(true)
  })

  it('should have file input with correct attributes', () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: [],
      },
    })

    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.exists()).toBe(true)
    expect(fileInput.attributes('multiple')).toBeDefined()
    expect(fileInput.attributes('accept')).toContain('image')
  })

  it('should handle file selection', async () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: [],
      },
    })

    const fileInput = wrapper.find('input[type="file"]')
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    })

    await fileInput.trigger('change')

    expect(wrapper.emitted('add')).toBeTruthy()
  })

  it('should validate file size', async () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: [],
      },
    })

    const fileInput = wrapper.find('input[type="file"]')
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [largeFile],
      writable: false,
    })

    await fileInput.trigger('change')

    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('too large'))
    expect(wrapper.emitted('add')).toBeFalsy()
  })

  it('should handle drag and drop events', async () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: [],
      },
    })

    const dropArea = wrapper.find('[class*="border-dashed"]')
    
    await dropArea.trigger('dragover')
    expect(wrapper.vm.isDragging).toBe(true)

    await dropArea.trigger('dragleave')
    expect(wrapper.vm.isDragging).toBe(false)
  })

  it('should process dropped files', async () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: [],
      },
    })

    const dropArea = wrapper.find('[class*="border-dashed"]')
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    
    const dataTransfer = {
      files: [file],
    }

    await dropArea.trigger('drop', { dataTransfer })

    expect(wrapper.emitted('add')).toBeTruthy()
  })

  it('should show visual feedback during drag', async () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: [],
      },
    })

    const dropArea = wrapper.find('[class*="border-dashed"]')
    
    await dropArea.trigger('dragover')
    
    expect(dropArea.classes()).toContain('border-blue-500')
  })

  it('should create preview URLs for images', async () => {
    const wrapper = mount(AttachmentUploader, {
      props: {
        attachments: [],
      },
    })

    const fileInput = wrapper.find('input[type="file"]')
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    })

    await fileInput.trigger('change')

    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})
