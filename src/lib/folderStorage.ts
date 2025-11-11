import { Folder } from "@/lib/fileStorage";

const DB_NAME = "INTECU_FileStorage";
const FOLDERS_STORE = "folders";
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(FOLDERS_STORE)) {
        db.createObjectStore(FOLDERS_STORE, { keyPath: "id" });
      }
    };
  });
}

export async function createFolder(name: string): Promise<Folder> {
  const db = await openDB();
  const id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const folder: Folder = {
    id,
    name,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FOLDERS_STORE], "readwrite");
    const store = transaction.objectStore(FOLDERS_STORE);
    const request = store.add(folder);

    request.onsuccess = () => resolve(folder);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllFolders(): Promise<Folder[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FOLDERS_STORE], "readonly");
    const store = transaction.objectStore(FOLDERS_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FOLDERS_STORE], "readwrite");
    const store = transaction.objectStore(FOLDERS_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function renameFolder(id: string, newName: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FOLDERS_STORE], "readwrite");
    const store = transaction.objectStore(FOLDERS_STORE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const folder = getRequest.result as Folder;
      if (folder) {
        folder.name = newName;
        const updateRequest = store.put(folder);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error("Folder not found"));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}
