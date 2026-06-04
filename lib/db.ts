const DB_NAME = 'zenith_db'
const STORE_NAME = 'custom_audio'

export interface CustomAudioFile {
  id: string
  name: string
  blob: Blob
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in the browser'))
      return
    }
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export const saveCustomAudio = async (name: string, blob: Blob): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put({ id: 'custom', name, blob })
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export const getCustomAudio = async (): Promise<CustomAudioFile | null> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get('custom')
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  } catch (e) {
    console.error('IndexedDB is not supported or accessible', e)
    return null
  }
}

export const deleteCustomAudio = async (): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete('custom')
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
