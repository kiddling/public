import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  saveDesignLog,
  getDesignLog,
  getAllDesignLogs,
  deleteDesignLog,
  saveVersion,
  getVersionsByLogId,
  getVersion,
  deleteVersion,
  clearAllData,
  generateId,
  validateDesignLogData,
  exportToJSON,
  importFromJSON,
  mergeImportedData,
  type DesignLogData,
  type DesignLogVersion,
} from '../utils/design-log-storage'

describe('design-log-storage', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  afterEach(async () => {
    await clearAllData()
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
    })
  })

  describe('saveDesignLog and getDesignLog', () => {
    it('should save and retrieve a design log', async () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        schoolName: 'Test School',
        courseName: 'Test Course',
        teacherName: 'Test Teacher',
        date: '2025-01-01',
        objective: 'Test Objective',
        content: 'Test Content',
        reflection: 'Test Reflection',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      await saveDesignLog(log)
      const retrieved = await getDesignLog('test-1')

      expect(retrieved).toBeDefined()
      expect(retrieved?.title).toBe('Test Log')
      expect(retrieved?.schoolName).toBe('Test School')
      expect(retrieved?.courseName).toBe('Test Course')
    })

    it('should update an existing log', async () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Original Title',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      await saveDesignLog(log)

      const updatedLog: DesignLogData = {
        ...log,
        title: 'Updated Title',
        updatedAt: Date.now(),
      }

      await saveDesignLog(updatedLog)
      const retrieved = await getDesignLog('test-1')

      expect(retrieved?.title).toBe('Updated Title')
    })
  })

  describe('getAllDesignLogs', () => {
    it('should return all saved logs', async () => {
      const log1: DesignLogData = {
        id: 'test-1',
        title: 'Log 1',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const log2: DesignLogData = {
        id: 'test-2',
        title: 'Log 2',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      await saveDesignLog(log1)
      await saveDesignLog(log2)

      const allLogs = await getAllDesignLogs()
      expect(allLogs).toHaveLength(2)
      expect(allLogs.some(log => log.id === 'test-1')).toBe(true)
      expect(allLogs.some(log => log.id === 'test-2')).toBe(true)
    })

    it('should return empty array when no logs exist', async () => {
      const allLogs = await getAllDesignLogs()
      expect(allLogs).toHaveLength(0)
    })
  })

  describe('deleteDesignLog', () => {
    it('should delete a log', async () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      await saveDesignLog(log)
      await deleteDesignLog('test-1')

      const retrieved = await getDesignLog('test-1')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('version management', () => {
    it('should save and retrieve versions', async () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const version: DesignLogVersion = {
        id: 'version-1',
        logId: 'test-1',
        data: log,
        timestamp: Date.now(),
        description: 'Test version',
      }

      await saveVersion(version)
      const retrieved = await getVersion('version-1')

      expect(retrieved).toBeDefined()
      expect(retrieved?.logId).toBe('test-1')
      expect(retrieved?.description).toBe('Test version')
    })

    it('should get all versions for a log', async () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const version1: DesignLogVersion = {
        id: 'version-1',
        logId: 'test-1',
        data: log,
        timestamp: Date.now(),
      }

      const version2: DesignLogVersion = {
        id: 'version-2',
        logId: 'test-1',
        data: { ...log, title: 'Updated Log' },
        timestamp: Date.now() + 1000,
      }

      await saveVersion(version1)
      await saveVersion(version2)

      const versions = await getVersionsByLogId('test-1')
      expect(versions).toHaveLength(2)
    })

    it('should delete a version', async () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const version: DesignLogVersion = {
        id: 'version-1',
        logId: 'test-1',
        data: log,
        timestamp: Date.now(),
      }

      await saveVersion(version)
      await deleteVersion('version-1')

      const retrieved = await getVersion('version-1')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('validateDesignLogData', () => {
    it('should validate correct data', () => {
      const validData: DesignLogData = {
        id: 'test-1',
        title: 'Test',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      expect(validateDesignLogData(validData)).toBe(true)
    })

    it('should reject data without id', () => {
      const invalidData = {
        title: 'Test',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      expect(validateDesignLogData(invalidData)).toBe(false)
    })

    it('should reject data without title', () => {
      const invalidData = {
        id: 'test-1',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      expect(validateDesignLogData(invalidData)).toBe(false)
    })

    it('should reject data with invalid timestamps', () => {
      const invalidData = {
        id: 'test-1',
        title: 'Test',
        updatedAt: 'not a number',
        createdAt: Date.now(),
      }

      expect(validateDesignLogData(invalidData)).toBe(false)
    })

    it('should validate data with attachments', () => {
      const validData: DesignLogData = {
        id: 'test-1',
        title: 'Test',
        updatedAt: Date.now(),
        createdAt: Date.now(),
        attachments: [
          {
            id: 'att-1',
            name: 'test.pdf',
            type: 'application/pdf',
            size: 1024,
            dataUrl: 'data:application/pdf;base64,test',
          },
        ],
      }

      expect(validateDesignLogData(validData)).toBe(true)
    })
  })

  describe('exportToJSON and importFromJSON', () => {
    it('should export a log to JSON', async () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      await saveDesignLog(log)
      const json = await exportToJSON('test-1')

      expect(json).toBeTruthy()
      const parsed = JSON.parse(json)
      expect(parsed.id).toBe('test-1')
      expect(parsed.title).toBe('Test Log')
    })

    it('should throw error when exporting non-existent log', async () => {
      await expect(exportToJSON('non-existent')).rejects.toThrow('Design log not found')
    })

    it('should import a log from JSON', async () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const json = JSON.stringify(log)
      const imported = await importFromJSON(json)

      expect(imported.id).toBe('test-1')
      expect(imported.title).toBe('Test Log')

      const retrieved = await getDesignLog('test-1')
      expect(retrieved).toBeDefined()
    })

    it('should throw error when importing invalid JSON', async () => {
      await expect(importFromJSON('invalid json')).rejects.toThrow('Invalid JSON format')
    })

    it('should throw error when importing invalid data structure', async () => {
      const invalidData = {
        id: 'test-1',
      }

      await expect(importFromJSON(JSON.stringify(invalidData))).rejects.toThrow(
        'Invalid design log data structure'
      )
    })
  })

  describe('mergeImportedData', () => {
    it('should merge imported data with current id', async () => {
      const log: DesignLogData = {
        id: 'import-1',
        title: 'Imported Log',
        schoolName: 'Import School',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const json = JSON.stringify(log)
      const merged = await mergeImportedData(json, 'current-1')

      expect(merged.id).toBe('current-1')
      expect(merged.title).toBe('Imported Log')
      expect(merged.schoolName).toBe('Import School')

      const retrieved = await getDesignLog('current-1')
      expect(retrieved).toBeDefined()
    })

    it('should generate new id if not provided', async () => {
      const log: DesignLogData = {
        id: 'import-1',
        title: 'Imported Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const json = JSON.stringify(log)
      const merged = await mergeImportedData(json)

      expect(merged.id).toBeTruthy()
      expect(merged.id).not.toBe('import-1')
    })
  })

  describe('clearAllData', () => {
    it('should clear all logs and versions', async () => {
      const log: DesignLogData = {
        id: 'test-1',
        title: 'Test Log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }

      const version: DesignLogVersion = {
        id: 'version-1',
        logId: 'test-1',
        data: log,
        timestamp: Date.now(),
      }

      await saveDesignLog(log)
      await saveVersion(version)

      await clearAllData()

      const logs = await getAllDesignLogs()
      const versions = await getVersionsByLogId('test-1')

      expect(logs).toHaveLength(0)
      expect(versions).toHaveLength(0)
    })
  })
})
