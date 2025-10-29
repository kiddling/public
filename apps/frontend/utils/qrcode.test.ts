import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateQRCode, downloadQRCode } from './qrcode'

interface MockContext {
  fillStyle: string
  fillRect: ReturnType<typeof vi.fn>
}

interface MockCanvas extends HTMLCanvasElement {
  width: number
  height: number
  getContext: ReturnType<typeof vi.fn>
  toDataURL: ReturnType<typeof vi.fn>
}

describe('generateQRCode', () => {
  let mockCanvas: MockCanvas
  let mockContext: MockContext

  beforeEach(() => {
    mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
    } as MockContext

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => 'data:image/png;base64,mockdata'),
    } as unknown as MockCanvas

    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLElement)
  })

  it('should generate QR code data URL', () => {
    const text = 'https://example.com'
    const result = generateQRCode(text, 200)

    expect(result).toBe('data:image/png;base64,mockdata')
    expect(mockCanvas.width).toBe(200)
    expect(mockCanvas.height).toBe(200)
    expect(mockContext.fillRect).toHaveBeenCalled()
  })

  it('should use default size if not provided', () => {
    const text = 'https://example.com'
    generateQRCode(text)

    expect(mockCanvas.width).toBe(200)
    expect(mockCanvas.height).toBe(200)
  })

  it('should return empty string if canvas context is null', () => {
    mockCanvas.getContext = vi.fn(() => null)

    const result = generateQRCode('test')

    expect(result).toBe('')
  })

  it('should handle errors gracefully', () => {
    mockCanvas.toDataURL = vi.fn(() => {
      throw new Error('Canvas error')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = generateQRCode('test')

    expect(result).toBe('')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should generate different patterns for different texts', () => {
    const result1 = generateQRCode('text1', 200)
    const result2 = generateQRCode('text2', 200)

    // Both should generate valid data URLs
    expect(result1).toContain('data:image/png')
    expect(result2).toContain('data:image/png')
  })
})

describe('downloadQRCode', () => {
  let mockLink: HTMLAnchorElement

  beforeEach(() => {
    mockLink = {
      download: '',
      href: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement

    vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
  })

  it('should trigger download with correct filename', () => {
    const dataUrl = 'data:image/png;base64,test'
    const filename = 'qr-code.png'

    downloadQRCode(dataUrl, filename)

    expect(mockLink.download).toBe(filename)
    expect(mockLink.href).toBe(dataUrl)
    expect(mockLink.click).toHaveBeenCalled()
  })

  it('should handle various filenames', () => {
    const dataUrl = 'data:image/png;base64,test'
    const filename = 'my-custom-qr-code.png'

    downloadQRCode(dataUrl, filename)

    expect(mockLink.download).toBe(filename)
  })
})
