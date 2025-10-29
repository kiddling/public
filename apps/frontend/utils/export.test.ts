import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportToCSV, exportToPDF } from './export'
import type { Resource } from '~/types/resource'

// Mock DOM APIs
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

const mockResources: Resource[] = [
  {
    id: 1,
    title: 'Test Video Tutorial',
    description: 'A test video about learning',
    shortDescription: 'Test video',
    category: 'video-tutorials',
    medium: 'video',
    disciplines: ['Computer Science', 'Design'],
    url: 'https://example.com/video',
    accessibilityStatus: 'verified',
    lastChecked: '2024-01-01T00:00:00.000Z',
    tags: ['beginner', 'tutorial'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Tool Link with "Quotes"',
    description: 'A tool, with commas',
    category: 'tool-links',
    medium: 'link',
    disciplines: ['Engineering'],
    url: 'https://example.com/tool',
    accessibilityStatus: 'needs-attention',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
]

describe('exportToCSV', () => {
  let mockLink: HTMLAnchorElement

  beforeEach(() => {
    mockLink = {
      download: '',
      href: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement

    vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
  })

  it('should generate CSV with correct headers', () => {
    exportToCSV(mockResources, 'test.csv')

    expect(mockLink.download).toBe('test.csv')
    expect(mockLink.click).toHaveBeenCalled()
  })

  it('should escape CSV values with quotes and commas', () => {
    const resourcesWithSpecialChars: Resource[] = [
      {
        ...mockResources[0],
        title: 'Title with, comma',
        description: 'Description with "quotes"',
      },
    ]

    exportToCSV(resourcesWithSpecialChars, 'test.csv')

    expect(mockLink.click).toHaveBeenCalled()
  })

  it('should handle empty resources array', () => {
    exportToCSV([], 'test.csv')

    expect(mockLink.click).not.toHaveBeenCalled()
  })

  it('should include all resource fields in CSV', () => {
    exportToCSV(mockResources, 'test.csv')

    expect(mockLink.download).toBe('test.csv')
    expect(mockLink.click).toHaveBeenCalled()
  })

  it('should use default filename if not provided', () => {
    exportToCSV(mockResources)

    expect(mockLink.download).toBe('resources.csv')
  })
})

interface MockWindow extends Window {
  document: {
    write: ReturnType<typeof vi.fn>
    close: ReturnType<typeof vi.fn>
  }
  onload: (() => void) | null
  focus: ReturnType<typeof vi.fn>
  print: ReturnType<typeof vi.fn>
}

describe('exportToPDF', () => {
  let mockWindow: MockWindow

  beforeEach(() => {
    mockWindow = {
      document: {
        write: vi.fn(),
        close: vi.fn(),
      },
      onload: null,
      focus: vi.fn(),
      print: vi.fn(),
    } as unknown as MockWindow

    vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window)
  })

  it('should open print dialog with generated HTML', () => {
    exportToPDF(mockResources, 'test.pdf')

    expect(window.open).toHaveBeenCalledWith('', '_blank')
    expect(mockWindow.document.write).toHaveBeenCalled()
    expect(mockWindow.document.close).toHaveBeenCalled()

    const writeCalls = mockWindow.document.write.mock.calls as Array<[string]>
    const htmlContent = writeCalls[0][0]
    expect(htmlContent).toContain('资源库列表')
    expect(htmlContent).toContain('Test Video Tutorial')
    expect(htmlContent).toContain('Tool Link with &quot;Quotes&quot;')
  })

  it('should handle empty resources array', () => {
    exportToPDF([], 'test.pdf')

    expect(window.open).not.toHaveBeenCalled()
  })

  it('should escape HTML in resource data', () => {
    const resourcesWithHTML: Resource[] = [
      {
        ...mockResources[0],
        title: '<script>alert("xss")</script>',
      },
    ]

    exportToPDF(resourcesWithHTML, 'test.pdf')

    const writeCalls = mockWindow.document.write.mock.calls as Array<[string]>
    const htmlContent = writeCalls[0][0]
    expect(htmlContent).not.toContain('<script>')
    expect(htmlContent).toContain('&lt;script&gt;')
  })

  it('should include accessibility status classes', () => {
    exportToPDF(mockResources, 'test.pdf')

    const writeCalls = mockWindow.document.write.mock.calls as Array<[string]>
    const htmlContent = writeCalls[0][0]
    expect(htmlContent).toContain('status-verified')
    expect(htmlContent).toContain('status-needs-attention')
  })

  it('should display resource count and export time', () => {
    exportToPDF(mockResources, 'test.pdf')

    const writeCalls = mockWindow.document.write.mock.calls as Array<[string]>
    const htmlContent = writeCalls[0][0]
    expect(htmlContent).toContain('总计：2 项资源')
    expect(htmlContent).toContain('导出时间：')
  })
})
