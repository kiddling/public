import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import {
  saveDesignLog,
  clearAllData,
  type DesignLogData,
} from '../utils/design-log-storage'

describe('design log integration', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  afterEach(async () => {
    await clearAllData()
  })

  it('should save and retrieve a design log', async () => {
    const log: DesignLogData = {
      id: 'test-1',
      title: 'Integration Test Log',
      schoolName: 'Test School',
      courseName: 'Test Course',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }

    await saveDesignLog(log)

    const { getDesignLog } = await import('../utils/design-log-storage')
    const retrieved = await getDesignLog('test-1')

    expect(retrieved).toBeDefined()
    expect(retrieved?.title).toBe('Integration Test Log')
    expect(retrieved?.schoolName).toBe('Test School')
  })

  it('should handle autosave behavior', async () => {
    const log: DesignLogData = {
      id: 'test-autosave',
      title: 'Autosave Test',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }

    await saveDesignLog(log)

    const updatedLog = {
      ...log,
      title: 'Updated Title',
      updatedAt: Date.now(),
    }

    await saveDesignLog(updatedLog)

    const { getDesignLog } = await import('../utils/design-log-storage')
    const retrieved = await getDesignLog('test-autosave')

    expect(retrieved?.title).toBe('Updated Title')
  })

  it('should handle version management workflow', async () => {
    const log: DesignLogData = {
      id: 'test-version',
      title: 'Version Test',
      content: 'Original content',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }

    await saveDesignLog(log)

    const { saveVersion, getVersionsByLogId } = await import('../utils/design-log-storage')

    const version1 = {
      id: 'v1',
      logId: 'test-version',
      data: { ...log },
      timestamp: Date.now(),
      description: 'Initial version',
    }

    await saveVersion(version1)

    const updatedLog = {
      ...log,
      content: 'Updated content',
      updatedAt: Date.now(),
    }

    await saveDesignLog(updatedLog)

    const version2 = {
      id: 'v2',
      logId: 'test-version',
      data: { ...updatedLog },
      timestamp: Date.now(),
      description: 'Second version',
    }

    await saveVersion(version2)

    const versions = await getVersionsByLogId('test-version')

    expect(versions).toHaveLength(2)
    expect(versions.some(v => v.description === 'Initial version')).toBe(true)
    expect(versions.some(v => v.description === 'Second version')).toBe(true)
  })

  it('should handle export and import workflow', async () => {
    const log: DesignLogData = {
      id: 'test-export',
      title: 'Export Test',
      schoolName: 'Export School',
      objective: 'Export objective',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }

    await saveDesignLog(log)

    const { exportToJSON, importFromJSON, getDesignLog } = await import('../utils/design-log-storage')

    const json = await exportToJSON('test-export')

    expect(json).toBeTruthy()

    await clearAllData()

    const logs = await import('../utils/design-log-storage').then(m => m.getAllDesignLogs())
    expect(logs).toHaveLength(0)

    await importFromJSON(json)

    const imported = await getDesignLog('test-export')
    expect(imported).toBeDefined()
    expect(imported?.title).toBe('Export Test')
    expect(imported?.schoolName).toBe('Export School')
    expect(imported?.objective).toBe('Export objective')
  })

  it('should handle attachment storage', async () => {
    const log: DesignLogData = {
      id: 'test-attachment',
      title: 'Attachment Test',
      attachments: [
        {
          id: 'att-1',
          name: 'document.pdf',
          type: 'application/pdf',
          size: 1024,
          dataUrl: 'data:application/pdf;base64,test',
        },
        {
          id: 'att-2',
          name: 'image.jpg',
          type: 'image/jpeg',
          size: 2048,
          dataUrl: 'data:image/jpeg;base64,test',
        },
      ],
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }

    await saveDesignLog(log)

    const { getDesignLog } = await import('../utils/design-log-storage')
    const retrieved = await getDesignLog('test-attachment')

    expect(retrieved?.attachments).toHaveLength(2)
    expect(retrieved?.attachments?.[0].name).toBe('document.pdf')
    expect(retrieved?.attachments?.[1].name).toBe('image.jpg')
  })
})
