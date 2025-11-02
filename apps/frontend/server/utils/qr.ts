/**
 * Server utility for generating QR codes as data URIs
 * Uses the qrcode package to generate QR codes locally without external API calls
 */

import QRCode from 'qrcode'

export interface QRCodeOptions {
  width?: number
  margin?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

/**
 * Generate a QR code as a data URI
 * @param data - The data to encode in the QR code
 * @param options - QR code generation options
 * @returns Data URI string (e.g., "data:image/png;base64,...")
 */
export async function generateQRCodeDataURI(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const { width = 200, margin = 1, errorCorrectionLevel = 'M' } = options

  try {
    const dataURI = await QRCode.toDataURL(data, {
      width,
      margin,
      errorCorrectionLevel,
    })

    return dataURI
  } catch (error) {
    console.error('Failed to generate QR code:', error)
    throw new Error(
      `QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Generate a QR code as a buffer
 * @param data - The data to encode in the QR code
 * @param options - QR code generation options
 * @returns Buffer containing the QR code image
 */
export async function generateQRCodeBuffer(
  data: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  const { width = 200, margin = 1, errorCorrectionLevel = 'M' } = options

  try {
    const buffer = await QRCode.toBuffer(data, {
      width,
      margin,
      errorCorrectionLevel,
    })

    return buffer
  } catch (error) {
    console.error('Failed to generate QR code buffer:', error)
    throw new Error(
      `QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
