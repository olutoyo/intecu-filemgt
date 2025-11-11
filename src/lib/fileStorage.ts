import { FileItem } from "@/components/FileManagement/FileCard";

const DB_NAME = "INTECU_FileStorage";
const STORE_NAME = "files";
const FOLDERS_STORE = "folders";
const DB_VERSION = 2;

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dateModified: string;
  folderId: string;
  blob: Blob;
}

function getFileType(mimeType: string): FileItem["type"] {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return "archive";
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return "document";
  return "other";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

function formatDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(FOLDERS_STORE)) {
        db.createObjectStore(FOLDERS_STORE, { keyPath: "id" });
      }
    };
  });
}

export async function saveFile(file: File, folderId: string = "all"): Promise<FileItem> {
  const db = await openDB();
  const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const dateModified = new Date().toISOString();
  
  const storedFile: StoredFile = {
    id,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    dateModified,
    folderId,
    blob: file,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(storedFile);

    request.onsuccess = () => {
      const fileItem: FileItem = {
        id,
        name: file.name,
        type: getFileType(file.type),
        size: formatFileSize(file.size),
        modified: formatDate(dateModified),
      };
      resolve(fileItem);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAllFiles(folderId?: string): Promise<FileItem[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      let files = request.result as StoredFile[];
      
      // Filter by folder if specified
      if (folderId && folderId !== "all") {
        files = files.filter((f: StoredFile) => f.folderId === folderId);
      }
      
      const fileItems = files.map((storedFile: StoredFile) => {
        const fileItem: FileItem = {
          id: storedFile.id,
          name: storedFile.name,
          type: getFileType(storedFile.type),
          size: formatFileSize(storedFile.size),
          modified: formatDate(storedFile.dateModified),
        };
        return fileItem;
      });
      resolve(fileItems);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFile(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function downloadFile(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const storedFile: StoredFile = request.result;
      if (!storedFile) {
        reject(new Error("File not found"));
        return;
      }

      const url = URL.createObjectURL(storedFile.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = storedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}
