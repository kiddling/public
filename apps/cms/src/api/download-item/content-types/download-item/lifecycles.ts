import crypto from 'crypto'
import { Readable } from 'stream'

async function calculateChecksum(fileBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = Readable.from(fileBuffer)

    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

async function getFileBuffer(fileId: number, strapi: any): Promise<Buffer> {
  const file = await strapi.plugin('upload').service('upload').findOne(fileId)

  if (!file) {
    throw new Error(`File with ID ${fileId} not found`)
  }

  const filePath = file.url.startsWith('http')
    ? file.url
    : `${strapi.dirs.static.public}${file.url}`

  if (file.url.startsWith('http')) {
    const response = await fetch(filePath)
    return Buffer.from(await response.arrayBuffer())
  } else {
    const fs = await import('fs/promises')
    return await fs.readFile(filePath)
  }
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params

    if (data.file) {
      try {
        const fileId = typeof data.file === 'object' ? data.file.id : data.file
        const file = await event.state.strapi.plugin('upload').service('upload').findOne(fileId)

        if (file) {
          const fileBuffer = await getFileBuffer(fileId, event.state.strapi)
          const checksum = await calculateChecksum(fileBuffer)

          data.checksum = checksum
          data.fileSize = file.size
          data.mimeType = file.mime
        }
      } catch (error) {
        event.state.strapi.log.error('Error calculating checksum:', error)
      }
    }
  },

  async beforeUpdate(event: any) {
    const { data } = event.params

    if (data.file !== undefined) {
      try {
        const fileId = typeof data.file === 'object' ? data.file.id : data.file

        if (fileId) {
          const file = await event.state.strapi.plugin('upload').service('upload').findOne(fileId)

          if (file) {
            const fileBuffer = await getFileBuffer(fileId, event.state.strapi)
            const checksum = await calculateChecksum(fileBuffer)

            data.checksum = checksum
            data.fileSize = file.size
            data.mimeType = file.mime
          }
        }
      } catch (error) {
        event.state.strapi.log.error('Error calculating checksum:', error)
      }
    }
  },
}
