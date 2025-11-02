import { describe, it, expect } from 'vitest'
import { generateQRCodeDataURI, generateQRCodeBuffer } from '~/server/utils/qr'

describe('QR Code Server Utility', () => {
  describe('generateQRCodeDataURI', () => {
    it('should generate a data URI for a simple URL', async () => {
      const url = 'https://example.com'
      const dataURI = await generateQRCodeDataURI(url)

      expect(dataURI).toMatch(/^data:image\/png;base64,/)
      expect(dataURI.length).toBeGreaterThan(100)
    })

    it('should generate QR codes with custom width', async () => {
      const url = 'https://example.com'
      const smallQR = await generateQRCodeDataURI(url, { width: 100 })
      const largeQR = await generateQRCodeDataURI(url, { width: 400 })

      expect(smallQR).toMatch(/^data:image\/png;base64,/)
      expect(largeQR).toMatch(/^data:image\/png;base64,/)

      // Larger QR codes should have more data
      expect(largeQR.length).toBeGreaterThan(smallQR.length)
    })

    it('should handle long URLs', async () => {
      const longUrl = 'https://example.com/very/long/path?with=many&query=parameters&more=data'
      const dataURI = await generateQRCodeDataURI(longUrl)

      expect(dataURI).toMatch(/^data:image\/png;base64,/)
      expect(dataURI.length).toBeGreaterThan(100)
    })

    it('should handle Chinese characters in URLs', async () => {
      const urlWithChinese = 'https://example.com/课程/资源'
      const dataURI = await generateQRCodeDataURI(urlWithChinese)

      expect(dataURI).toMatch(/^data:image\/png;base64,/)
      expect(dataURI.length).toBeGreaterThan(100)
    })

    it('should use different error correction levels', async () => {
      const url = 'https://example.com'
      const lowEC = await generateQRCodeDataURI(url, { errorCorrectionLevel: 'L' })
      const highEC = await generateQRCodeDataURI(url, { errorCorrectionLevel: 'H' })

      expect(lowEC).toMatch(/^data:image\/png;base64,/)
      expect(highEC).toMatch(/^data:image\/png;base64,/)

      // Both should generate valid QR codes
      expect(lowEC.length).toBeGreaterThan(100)
      expect(highEC.length).toBeGreaterThan(100)
    })
  })

  describe('generateQRCodeBuffer', () => {
    it('should generate a buffer for a URL', async () => {
      const url = 'https://example.com'
      const buffer = await generateQRCodeBuffer(url)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(100)
    })

    it('should generate buffers with custom width', async () => {
      const url = 'https://example.com'
      const smallBuffer = await generateQRCodeBuffer(url, { width: 100 })
      const largeBuffer = await generateQRCodeBuffer(url, { width: 400 })

      expect(smallBuffer).toBeInstanceOf(Buffer)
      expect(largeBuffer).toBeInstanceOf(Buffer)

      // Larger QR codes should have more data
      expect(largeBuffer.length).toBeGreaterThan(smallBuffer.length)
    })
  })
})
