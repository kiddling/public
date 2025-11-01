import { openDB, type IDBPDatabase } from 'idb';

interface DesignLog {
  id?: number;
  projectName: string;
  projectType: string;
  date: string;
  objective: string;
  inspiration: string;
  process: string;
  challenges: string;
  outcome: string;
  reflection: string;
  nextSteps: string;
  tags: string;
  tools: string;
  createdAt: string;
  updatedAt: string;
}

const DB_NAME = 'DesignLogDB';
const STORE_NAME = 'designLogs';
const DRAFT_STORE_NAME = 'designDrafts';
const DB_VERSION = 1;

export const useDesignLogStorage = () => {
  const initDB = async (): Promise<IDBPDatabase> => {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create design logs store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const logStore = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          logStore.createIndex('date', 'date');
          logStore.createIndex('projectType', 'projectType');
          logStore.createIndex('createdAt', 'createdAt');
        }

        // Create drafts store
        if (!db.objectStoreNames.contains(DRAFT_STORE_NAME)) {
          const draftStore = db.createObjectStore(DRAFT_STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          draftStore.createIndex('updatedAt', 'updatedAt');
        }
      },
    });
  };

  const saveDesignLog = async (data: Omit<DesignLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    const db = await initDB();
    const now = new Date().toISOString();
    
    const log: Omit<DesignLog, 'id'> = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add(STORE_NAME, log);
    return id;
  };

  const updateDesignLog = async (id: number, data: Partial<DesignLog>) => {
    const db = await initDB();
    const existing = await db.get(STORE_NAME, id);
    
    if (!existing) {
      throw new Error('Design log not found');
    }

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await db.put(STORE_NAME, updated);
    return updated;
  };

  const getDesignLog = async (id: number) => {
    const db = await initDB();
    return await db.get(STORE_NAME, id);
  };

  const getAllDesignLogs = async (): Promise<DesignLog[]> => {
    const db = await initDB();
    const logs = await db.getAll(STORE_NAME);
    return logs.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const deleteDesignLog = async (id: number) => {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
  };

  const searchDesignLogs = async (query: string): Promise<DesignLog[]> => {
    const allLogs = await getAllDesignLogs();
    const lowerQuery = query.toLowerCase();
    
    return allLogs.filter(log => {
      return (
        log.projectName.toLowerCase().includes(lowerQuery) ||
        log.projectType.toLowerCase().includes(lowerQuery) ||
        log.objective.toLowerCase().includes(lowerQuery) ||
        log.tags.toLowerCase().includes(lowerQuery) ||
        log.tools.toLowerCase().includes(lowerQuery)
      );
    });
  };

  const filterByDate = async (startDate: string, endDate: string): Promise<DesignLog[]> => {
    const allLogs = await getAllDesignLogs();
    
    return allLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= new Date(startDate) && logDate <= new Date(endDate);
    });
  };

  const filterByType = async (type: string): Promise<DesignLog[]> => {
    const db = await initDB();
    const index = db.transaction(STORE_NAME).store.index('projectType');
    return await index.getAll(type);
  };

  const saveDraft = async (data: Partial<DesignLog>) => {
    const db = await initDB();
    const now = new Date().toISOString();
    
    const draft = {
      ...data,
      updatedAt: now,
    };

    const id = await db.put(DRAFT_STORE_NAME, draft);
    return id;
  };

  const getAllDrafts = async () => {
    const db = await initDB();
    const drafts = await db.getAll(DRAFT_STORE_NAME);
    return drafts.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  };

  const deleteDraft = async (id: number) => {
    const db = await initDB();
    await db.delete(DRAFT_STORE_NAME, id);
  };

  const exportAllLogs = async (): Promise<string> => {
    const logs = await getAllDesignLogs();
    return JSON.stringify(logs, null, 2);
  };

  const importLogs = async (jsonData: string) => {
    const logs: DesignLog[] = JSON.parse(jsonData);
    const db = await initDB();
    
    for (const log of logs) {
      const { id, ...logData } = log;
      await db.add(STORE_NAME, logData);
    }
  };

  return {
    saveDesignLog,
    updateDesignLog,
    getDesignLog,
    getAllDesignLogs,
    deleteDesignLog,
    searchDesignLogs,
    filterByDate,
    filterByType,
    saveDraft,
    getAllDrafts,
    deleteDraft,
    exportAllLogs,
    importLogs,
  };
};
