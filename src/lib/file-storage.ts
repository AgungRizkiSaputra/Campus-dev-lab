/**
 * IndexedDB storage utility for large user-uploaded files (Word, PowerPoint, PDF, ZIP, Excel).
 * Prevents localStorage 5MB QuotaExceededError and ensures uploaded files persist across sessions
 * with their exact original filename, binary data, and MIME type.
 */

import { DownloadFileMeta, downloadFileSafely } from './utils';

const DB_NAME = 'jokiskripsiku_file_db';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_files';

export interface StoredFile {
  id: string; // unique key, e.g. "milestone_submission_mile-1" or "milestone_turnitin_mile-1"
  name: string; // original filename with extension e.g. "Presentasi_Sidang.pptx"
  type: string; // mime type e.g. "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  size: number; // size in bytes
  sizeFormatted: string; // e.g. "2.4 MB"
  dataUrl: string; // base64 data url
  updatedAt: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung pada lingkungan ini'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveUploadedFile(
  key: string,
  fileData: { name: string; type: string; size: number; dataUrl: string }
): Promise<StoredFile | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await openDB();
    const formattedSize = formatBytes(fileData.size);
    const item: StoredFile = {
      id: key,
      name: fileData.name,
      type: fileData.type || 'application/octet-stream',
      size: fileData.size,
      sizeFormatted: formattedSize,
      dataUrl: fileData.dataUrl,
      updatedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Gagal menyimpan file ke IndexedDB:', err);
    return null;
  }
}

export async function getUploadedFile(key: string): Promise<StoredFile | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteUploadedFile(key: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Unduh dokumen tugas / turnitin secara aman dengan memprioritaskan berkas asli di IndexedDB.
 * Menjamin nama berkas dan ekstensi asli (.docx, .pptx, .pdf, .zip, dll) tidak berubah.
 */
export async function downloadMilestoneDocument(
  milestoneId: string,
  docType: 'submission' | 'turnitin',
  options?: {
    fallbackUrl?: string | null;
    fallbackName?: string | null;
    fallbackMeta?: DownloadFileMeta;
  }
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const storageKey = `milestone_${docType}_${milestoneId}`;

  try {
    // 1. Cek penyimpanan IndexedDB terlebih dahulu (berkas asli dari Penjoki)
    const stored = await getUploadedFile(storageKey);
    if (stored && stored.dataUrl && stored.dataUrl.startsWith('data:')) {
      const fileName = options?.fallbackName || stored.name;
      downloadFileSafely(stored.dataUrl, fileName, options?.fallbackMeta);
      return true;
    }

    // 2. Jika di IndexedDB tidak ada, cek fallbackUrl dari database / props
    if (options?.fallbackUrl) {
      const defaultFileName =
        options?.fallbackName ||
        (docType === 'turnitin'
          ? `Laporan_Turnitin_${milestoneId}.pdf`
          : `Dokumen_Tugas_${milestoneId}.docx`);

      downloadFileSafely(options.fallbackUrl, defaultFileName, options?.fallbackMeta);
      return true;
    }

    // 3. Jika tidak ada sama sekali, buat dokumen draf fallback berformat resmi
    const defaultFallbackName =
      options?.fallbackName ||
      (docType === 'turnitin'
        ? `Laporan_Turnitin_${milestoneId}.pdf`
        : `Draf_Pengerjaan_${milestoneId}.docx`);

    downloadFileSafely(null, defaultFallbackName, options?.fallbackMeta);
    return true;
  } catch (err) {
    console.error('Gagal mengunduh dokumen milestone:', err);
    return false;
  }
}
