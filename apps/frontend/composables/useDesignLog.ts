import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import {
  type DesignLogData,
  type DesignLogVersion,
  saveDesignLog,
  getDesignLog,
  saveVersion,
  getVersionsByLogId,
  getVersion,
  generateId,
  exportToJSON,
  importFromJSON,
  mergeImportedData,
} from '~/utils/design-log-storage'

export interface SaveState {
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  error: string | null
}

const AUTOSAVE_INTERVAL = 30000

export function useDesignLog(logId?: string) {
  const currentLog = ref<DesignLogData | null>(null)
  const versions = ref<DesignLogVersion[]>([])
  const saveState = ref<SaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
  })

  let autosaveTimer: NodeJS.Timeout | null = null
  let isInitialLoad = true

  const saveLog = async (createVersion = false) => {
    if (!currentLog.value) return

    saveState.value.isSaving = true
    saveState.value.error = null

    try {
      const now = Date.now()
      currentLog.value.updatedAt = now

      if (createVersion) {
        const version: DesignLogVersion = {
          id: generateId(),
          logId: currentLog.value.id,
          data: { ...currentLog.value },
          timestamp: now,
          description: 'Manual save',
        }
        await saveVersion(version)
        await loadVersions(currentLog.value.id)
      }

      await saveDesignLog(currentLog.value)
      saveState.value.lastSaved = new Date()
      saveState.value.hasUnsavedChanges = false
    } catch (error) {
      saveState.value.error = error instanceof Error ? error.message : 'Failed to save'
      throw error
    } finally {
      saveState.value.isSaving = false
    }
  }

  const debouncedSave = useDebounceFn(async () => {
    if (saveState.value.hasUnsavedChanges && !isInitialLoad) {
      await saveLog()
    }
  }, 1000)

  const manualSave = async () => {
    await saveLog(true)
  }

  const loadLog = async (id: string) => {
    try {
      const log = await getDesignLog(id)
      if (log) {
        currentLog.value = log
        saveState.value.lastSaved = new Date(log.updatedAt)
        await loadVersions(id)
      }
    } catch (error) {
      saveState.value.error = error instanceof Error ? error.message : 'Failed to load'
      throw error
    }
  }

  const loadVersions = async (id: string) => {
    try {
      const loadedVersions = await getVersionsByLogId(id)
      versions.value = loadedVersions.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error('Failed to load versions:', error)
    }
  }

  const revertToVersion = async (versionId: string) => {
    try {
      const version = await getVersion(versionId)
      if (version) {
        currentLog.value = { ...version.data }
        await manualSave()
      }
    } catch (error) {
      saveState.value.error = error instanceof Error ? error.message : 'Failed to revert'
      throw error
    }
  }

  const createNewLog = () => {
    const now = Date.now()
    currentLog.value = {
      id: generateId(),
      title: '',
      updatedAt: now,
      createdAt: now,
    }
    saveState.value.hasUnsavedChanges = true
  }

  const exportLog = async () => {
    if (!currentLog.value) {
      throw new Error('No log to export')
    }
    return await exportToJSON(currentLog.value.id)
  }

  const importLog = async (json: string) => {
    const data = await importFromJSON(json)
    currentLog.value = data
    saveState.value.hasUnsavedChanges = false
    saveState.value.lastSaved = new Date()
    await loadVersions(data.id)
  }

  const mergeImport = async (json: string) => {
    if (!currentLog.value) {
      throw new Error('No current log to merge into')
    }
    const data = await mergeImportedData(json, currentLog.value.id)
    currentLog.value = data
    saveState.value.hasUnsavedChanges = false
    saveState.value.lastSaved = new Date()
    await loadVersions(data.id)
  }

  const startAutosave = () => {
    if (autosaveTimer) {
      clearInterval(autosaveTimer)
    }
    autosaveTimer = setInterval(async () => {
      if (saveState.value.hasUnsavedChanges && !saveState.value.isSaving) {
        await saveLog()
      }
    }, AUTOSAVE_INTERVAL)
  }

  const stopAutosave = () => {
    if (autosaveTimer) {
      clearInterval(autosaveTimer)
      autosaveTimer = null
    }
  }

  watch(
    currentLog,
    () => {
      if (!isInitialLoad && currentLog.value) {
        saveState.value.hasUnsavedChanges = true
        debouncedSave()
      }
    },
    { deep: true }
  )

  onMounted(async () => {
    if (logId) {
      await loadLog(logId)
    } else {
      createNewLog()
    }
    isInitialLoad = false
    startAutosave()
  })

  onUnmounted(() => {
    stopAutosave()
  })

  return {
    currentLog,
    versions,
    saveState,
    manualSave,
    revertToVersion,
    createNewLog,
    loadLog,
    exportLog,
    importLog,
    mergeImport,
  }
}
