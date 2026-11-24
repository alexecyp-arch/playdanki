const files = new Map();
const key = 'danki-book-library-v1';
export function books() {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); }
  catch { return {}; }
}
export function saveBook(id, value) {
  const library = books();
  if (value) library[id] = value;
  else delete library[id];
  localStorage.setItem(key, JSON.stringify(library));
}
async function handleStore(mode, action) {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(key, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('references');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('references', mode);
      const request = action(transaction.objectStore('references'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { db.close(); }
}
export async function fileId(file) {
  const hash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('');
}
export async function rememberFile(id, file, handle) {
  files.set(id, file);
  if (handle) await handleStore('readwrite', store => store.put(handle, id)).catch(() => {});
}
export async function reopenFile(id) {
  if (files.has(id)) return files.get(id);
  const handle = await handleStore('readonly', store => store.get(id)).catch(() => null);
  if (!handle) return null;
  try {
    if (await handle.queryPermission({mode:'read'}) !== 'granted' &&
        await handle.requestPermission({mode:'read'}) !== 'granted') return null;
    return await handle.getFile();
  } catch { return null; }
}
export function forgetFile(id) {
  files.delete(id);
  return handleStore('readwrite', store => store.delete(id)).catch(() => {});
}
