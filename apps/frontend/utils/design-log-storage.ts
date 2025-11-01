import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'design-log-db'
const DB_VERSION = 1
const STORE_NAME = 'design-logs'
const VERSION_STORE_NAME = 'design-log-versions'

export interface DesignLogData {
  id: string
  title: string
  schoolName?: string
  courseName?: string
  teacherName?: string
  date?: string
  objective?: string
  content?: string
  reflection?: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    size: number
    dataUrl?: string
  }>
  updatedAt: number
  createdAt: number
}

export interface DesignLogVersion {
  id: string
  logId: string
  data: DesignLogData
  timestamp: number
  description?: string
}

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
            store.createIndex('updatedAt', 'updatedAt', { unique: false })
            store.createIndex('createdAt', 'createdAt', { unique: false })
          }

          if (!db.objectStoreNames.contains(VERSION_STORE_NAME)) {
            const versionStore = db.createObjectStore(VERSION_STORE_NAME, { keyPath: 'id' })
            versionStore.createIndex('logId', 'logId', { unique: false })
            versionStore.createIndex('timestamp', 'timestamp', { unique: false })
          }
        }
      },
    })
  }
  return dbPromise
}

export async function saveDesignLog(data: DesignLogData): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, data)
}

export async function getDesignLog(id: string): Promise<DesignLogData | undefined> {
  const db = await getDB()
  return await db.get(STORE_NAME, id)
}

export async function getAllDesignLogs(): Promise<DesignLogData[]> {
  const db = await getDB()
  return await db.getAll(STORE_NAME)
}

export async function deleteDesignLog(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function saveVersion(version: DesignLogVersion): Promise<void> {
  const db = await getDB()
  await db.put(VERSION_STORE_NAME, version)
}

export async function getVersionsByLogId(logId: string): Promise<DesignLogVersion[]> {
  const db = await getDB()
  const tx = db.transaction(VERSION_STORE_NAME, 'readonly')
  const index = tx.store.index('logId')
  return await index.getAll(logId)
}

export async function getVersion(id: string): Promise<DesignLogVersion | undefined> {
  const db = await getDB()
  return await db.get(VERSION_STORE_NAME, id)
}

export async function deleteVersion(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(VERSION_STORE_NAME, id)
}

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction([STORE_NAME, VERSION_STORE_NAME], 'readwrite')
  await tx.objectStore(STORE_NAME).clear()
  await tx.objectStore(VERSION_STORE_NAME).clear()
  await tx.done
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function validateDesignLogData(data: unknown): data is DesignLogData {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const log = data as Record<string, unknown>

  if (typeof log.id !== 'string' || !log.id) {
    return false
  }

  if (typeof log.title !== 'string') {
    return false
  }

  if (log.schoolName !== undefined && typeof log.schoolName !== 'string') {
    return false
  }

  if (log.courseName !== undefined && typeof log.courseName !== 'string') {
    return false
  }

  if (log.teacherName !== undefined && typeof log.teacherName !== 'string') {
    return false
  }

  if (log.date !== undefined && typeof log.date !== 'string') {
    return false
  }

  if (log.objective !== undefined && typeof log.objective !== 'string') {
    return false
  }

  if (log.content !== undefined && typeof log.content !== 'string') {
    return false
  }

  if (log.reflection !== undefined && typeof log.reflection !== 'string') {
    return false
  }

  if (typeof log.updatedAt !== 'number') {
    return false
  }

  if (typeof log.createdAt !== 'number') {
    return false
  }

  if (log.attachments !== undefined) {
    if (!Array.isArray(log.attachments)) {
      return false
    }
    for (const attachment of log.attachments) {
      if (typeof attachment !== 'object' || attachment === null) {
        return false
      }
      if (
        typeof attachment.id !== 'string'
        || typeof attachment.name !== 'string'
        || typeof attachment.type !== 'string'
        || typeof attachment.size !== 'number'
      ) {
        return false
      }
      if (attachment.dataUrl !== undefined && typeof attachment.dataUrl !== 'string') {
        return false
      }
    }
  }

  return true
}

export async function exportToJSON(id: string): Promise<string> {
  const log = await getDesignLog(id)
  if (!log) {
    throw new Error('Design log not found')
  }
  return JSON.stringify(log, null, 2)
}

export async function importFromJSON(json: string): Promise<DesignLogData> {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch (error) {
    throw new Error('Invalid JSON format')
  }

  if (!validateDesignLogData(data)) {
    throw new Error('Invalid design log data structure')
  }

  await saveDesignLog(data)
  return data
}

export async function mergeImportedData(json: string, currentId?: string): Promise<DesignLogData> {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch (error) {
    throw new Error('Invalid JSON format')
  }

  if (!validateDesignLogData(data)) {
    throw new Error('Invalid design log data structure')
  }

  const now = Date.now()
  const mergedData: DesignLogData = {
    ...data,
    id: currentId || generateId(),
    updatedAt: now,
  }

  await saveDesignLog(mergedData)
  return mergedData
}
