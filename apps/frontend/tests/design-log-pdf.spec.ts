import { describe, it, expect } from 'vitest'
import { createDesignLogPDF } from '../utils/design-log-pdf'
import type { DesignLogData } from '../utils/design-log-storage'

describe('design-log-pdf', () => {
  describe('createDesignLogPDF', () => {
    it('should create PDF document definition with basic data', () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const docDef = createDesignLogPDF(log)

      expect(docDef).toBeDefined()
      expect(docDef.content).toBeDefined()
      expect(Array.isArray(docDef.content)).toBe(true)
      expect(docDef.pageSize).toBe('A4')
    })

    it('should include cover page when option is set', () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        schoolName: 'Test School',
        courseName: 'Test Course',
        teacherName: 'Test Teacher',
        date: '2025-01-01',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const docDef = createDesignLogPDF(log, { includeCoverPage: true })

      expect(docDef.content).toBeDefined()
      const content = docDef.content as any[]
      expect(content.length).toBeGreaterThan(0)

      const coverTitle = content.find((item: any) => item.text === '教学设计日志')
      expect(coverTitle).toBeDefined()
    })

    it('should include all sections when data is provided', () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        objective: 'Test Objective',
        content: 'Test Content',
        reflection: 'Test Reflection',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const docDef = createDesignLogPDF(log)
      const content = JSON.stringify(docDef.content)

      expect(content).toContain('教学目标')
      expect(content).toContain('Test Objective')
      expect(content).toContain('教学内容')
      expect(content).toContain('Test Content')
      expect(content).toContain('教学反思')
      expect(content).toContain('Test Reflection')
    })

    it('should include attachments section when attachments exist', () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        attachments: [
          {
            id: 'att-1',
            name: 'test.pdf',
            type: 'application/pdf',
            size: 1024,
          },
          {
            id: 'att-2',
            name: 'image.jpg',
            type: 'image/jpeg',
            size: 2048,
          },
        ],
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const docDef = createDesignLogPDF(log)
      const content = JSON.stringify(docDef.content)

      expect(content).toContain('附件')
      expect(content).toContain('test.pdf')
      expect(content).toContain('image.jpg')
    })

    it('should apply custom branding colors', () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const docDef = createDesignLogPDF(log, {
        branding: {
          primaryColor: '#ff0000',
        },
      })

      expect(docDef.styles).toBeDefined()
      expect(docDef.styles?.header).toBeDefined()
      expect((docDef.styles?.header as any).color).toBe('#ff0000')
    })

    it('should include school information from options', () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const docDef = createDesignLogPDF(log, {
        includeCoverPage: true,
        schoolName: 'Option School',
        courseName: 'Option Course',
        teacherName: 'Option Teacher',
      })

      const content = JSON.stringify(docDef.content)

      expect(content).toContain('Option School')
      expect(content).toContain('Option Course')
      expect(content).toContain('Option Teacher')
    })

    it('should prefer log data over options for school information', () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        schoolName: 'Log School',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const docDef = createDesignLogPDF(log, {
        includeCoverPage: true,
        schoolName: 'Option School',
      })

      const content = JSON.stringify(docDef.content)

      expect(content).toContain('Log School')
      expect(content).not.toContain('Option School')
    })

    it('should include generation date in footer', () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const docDef = createDesignLogPDF(log)
      const content = JSON.stringify(docDef.content)

      expect(content).toContain('生成日期')
    })

    it('should handle empty optional fields gracefully', () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const docDef = createDesignLogPDF(log)

      expect(docDef).toBeDefined()
      expect(docDef.content).toBeDefined()
    })

    it('should format document with proper page margins', () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const docDef = createDesignLogPDF(log)

      expect(docDef.pageMargins).toBeDefined()
      expect(docDef.pageMargins).toEqual([60, 60, 60, 60])
    })

    it('should define all required styles', () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const docDef = createDesignLogPDF(log)

      expect(docDef.styles).toBeDefined()
      expect(docDef.styles?.header).toBeDefined()
      expect(docDef.styles?.sectionHeader).toBeDefined()
      expect(docDef.styles?.content).toBeDefined()
      expect(docDef.styles?.label).toBeDefined()
      expect(docDef.styles?.value).toBeDefined()
      expect(docDef.styles?.footer).toBeDefined()
    })
  })
})
