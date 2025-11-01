import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import type { DesignLogData } from './design-log-storage'

export interface PDFExportOptions {
  includeCoverPage?: boolean
  schoolName?: string
  courseName?: string
  teacherName?: string
  branding?: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
  }
}

export function createDesignLogPDF(
  log: DesignLogData,
  options: PDFExportOptions = {}
): TDocumentDefinitions {
  const content: Content[] = []

  if (options.includeCoverPage) {
    content.push(
      {
        text: '教学设计日志',
        style: 'coverTitle',
        alignment: 'center',
        margin: [0, 100, 0, 20],
      },
      {
        text: log.title || '未命名',
        style: 'coverSubtitle',
        alignment: 'center',
        margin: [0, 0, 0, 40],
      }
    )

    if (log.schoolName || options.schoolName) {
      content.push({
        text: log.schoolName || options.schoolName || '',
        style: 'coverInfo',
        alignment: 'center',
        margin: [0, 0, 0, 10],
      })
    }

    if (log.courseName || options.courseName) {
      content.push({
        text: log.courseName || options.courseName || '',
        style: 'coverInfo',
        alignment: 'center',
        margin: [0, 0, 0, 10],
      })
    }

    if (log.teacherName || options.teacherName) {
      content.push({
        text: `教师：${log.teacherName || options.teacherName || ''}`,
        style: 'coverInfo',
        alignment: 'center',
        margin: [0, 0, 0, 10],
      })
    }

    if (log.date) {
      content.push({
        text: `日期：${log.date}`,
        style: 'coverInfo',
        alignment: 'center',
        margin: [0, 0, 0, 10],
      })
    }

    content.push({ text: '', pageBreak: 'after' })
  }

  content.push(
    {
      text: log.title || '未命名',
      style: 'header',
      margin: [0, 0, 0, 20],
    }
  )

  const infoTable: Content = {
    table: {
      widths: ['auto', '*'],
      body: [],
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 20],
  }

  const tableBody: Array<[Content, Content]> = []

  if (log.schoolName) {
    tableBody.push([
      { text: '学校：', style: 'label' },
      { text: log.schoolName, style: 'value' },
    ])
  }

  if (log.courseName) {
    tableBody.push([
      { text: '课程：', style: 'label' },
      { text: log.courseName, style: 'value' },
    ])
  }

  if (log.teacherName) {
    tableBody.push([
      { text: '教师：', style: 'label' },
      { text: log.teacherName, style: 'value' },
    ])
  }

  if (log.date) {
    tableBody.push([
      { text: '日期：', style: 'label' },
      { text: log.date, style: 'value' },
    ])
  }

  if (tableBody.length > 0) {
    ;(infoTable as any).table.body = tableBody
    content.push(infoTable)
  }

  if (log.objective) {
    content.push(
      {
        text: '教学目标',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10],
      },
      {
        text: log.objective,
        style: 'content',
        margin: [0, 0, 0, 20],
      }
    )
  }

  if (log.content) {
    content.push(
      {
        text: '教学内容',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10],
      },
      {
        text: log.content,
        style: 'content',
        margin: [0, 0, 0, 20],
      }
    )
  }

  if (log.reflection) {
    content.push(
      {
        text: '教学反思',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10],
      },
      {
        text: log.reflection,
        style: 'content',
        margin: [0, 0, 0, 20],
      }
    )
  }

  if (log.attachments && log.attachments.length > 0) {
    content.push(
      {
        text: '附件',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10],
      },
      {
        ul: log.attachments.map(att => `${att.name} (${formatBytes(att.size)})`),
        style: 'content',
        margin: [0, 0, 0, 20],
      }
    )
  }

  content.push({
    text: `生成日期：${new Date().toLocaleDateString('zh-CN')}`,
    style: 'footer',
    alignment: 'right',
    margin: [0, 30, 0, 0],
  })

  const primaryColor = options.branding?.primaryColor || '#2563eb'

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [60, 60, 60, 60],
    content,
    styles: {
      coverTitle: {
        fontSize: 32,
        bold: true,
        color: primaryColor,
      },
      coverSubtitle: {
        fontSize: 24,
        bold: true,
      },
      coverInfo: {
        fontSize: 14,
      },
      header: {
        fontSize: 24,
        bold: true,
        color: primaryColor,
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        color: primaryColor,
      },
      label: {
        fontSize: 12,
        bold: true,
        margin: [0, 2, 10, 2],
      },
      value: {
        fontSize: 12,
        margin: [0, 2, 0, 2],
      },
      content: {
        fontSize: 12,
        lineHeight: 1.5,
      },
      footer: {
        fontSize: 10,
        color: '#666666',
      },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  }

  return docDefinition
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export async function generatePDF(log: DesignLogData, options: PDFExportOptions = {}): Promise<Blob> {
  const pdfMake = await import('pdfmake/build/pdfmake')
  const pdfFonts = await import('pdfmake/build/vfs_fonts')
  
  pdfMake.vfs = pdfFonts.default?.pdfMake?.vfs || {}

  const docDefinition = createDesignLogPDF(log, options)

  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.default.createPdf(docDefinition)
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob)
      })
    } catch (error) {
      reject(error)
    }
  })
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
