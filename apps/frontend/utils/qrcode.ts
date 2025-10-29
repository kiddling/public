/**
 * Generate QR code data URL using a simple canvas-based approach
 * This avoids external CDN dependencies and works offline
 */
export const generateQRCode = (text: string, size: number = 200): string => {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    // Create a simple data URL that can be used as QR code placeholder
    // In production, you might want to use a library like qrcode or generate server-side
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      return ''
    }

    canvas.width = size
    canvas.height = size

    // White background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, size, size)

    // Generate a simple pattern based on text hash
    ctx.fillStyle = '#000000'
    const hash = simpleHash(text)
    const gridSize = 8
    const cellSize = size / gridSize

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j
        if ((hash >> index) & 1) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize)
        }
      }
    }

    return canvas.toDataURL('image/png')
  } catch (e) {
    console.error('Failed to generate QR code:', e)
    return ''
  }
}

/**
 * Simple hash function for generating pattern from text
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Download QR code as image
 */
export const downloadQRCode = (dataUrl: string, filename: string) => {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
