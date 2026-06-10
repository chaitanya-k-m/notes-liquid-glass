// Full backup: notes (localStorage) + all media blobs (IndexedDB, base64) + theme.
// Export delivers a .json file via the native share sheet (or a download on web);
// import merges by note id (re-importing the same file never duplicates).
import { Capacitor } from '@capacitor/core';
import { allBlobs, saveBlob } from './audioDB.js';

const NOTES_KEY = 'notes_v3';
const THEME_KEY = 'theme_v1';

const isNative = (() => { try { return Capacitor.isNativePlatform(); } catch { return false; } })();

const blobToDataURL = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(blob);
});

function dataURLToBlob(durl) {
  const [meta, b64] = String(durl).split(',');
  const mime = (meta.match(/:(.*?);/) || [])[1] || 'application/octet-stream';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// Build the backup JSON string. `notes` is the current notes array.
export async function buildBackup(notes) {
  const media = {};
  for (const { key, blob } of await allBlobs()) {
    if (!blob) continue;
    try { media[key] = await blobToDataURL(blob); } catch { /* skip unreadable blob */ }
  }
  let theme = null;
  try { theme = JSON.parse(localStorage.getItem(THEME_KEY) || 'null'); } catch { /* ignore */ }
  return JSON.stringify({
    app: 'notes-liquid-glass',
    format: 1,
    exportedAt: new Date().toISOString(),
    counts: { notes: notes.length, media: Object.keys(media).length },
    theme,
    notes,
    media,
  });
}

// Export → share/download. Returns the note count.
export async function exportBackup(notes) {
  const text = await buildBackup(notes);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `notes-backup-${stamp}.json`;
  if (isNative) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const res = await Filesystem.writeFile({ path: filename, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: 'Notes backup', text: `Notes backup · ${notes.length} notes`, url: res.uri });
  } else {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  return notes.length;
}

// Import: validate, restore media + theme, merge notes by id into localStorage.
// Returns { added, total }. Caller should reload so the merged state is applied.
export async function importBackup(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('That file isn’t valid JSON.'); }
  if (!data || data.app !== 'notes-liquid-glass' || !Array.isArray(data.notes)) {
    throw new Error('That doesn’t look like a Notes backup file.');
  }

  // Restore media blobs.
  if (data.media && typeof data.media === 'object') {
    for (const [key, durl] of Object.entries(data.media)) {
      try { await saveBlob(key, dataURLToBlob(durl)); } catch { /* skip bad blob */ }
    }
  }

  // Merge notes by id (imported wins), keep newest first.
  let existing = [];
  try { existing = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); } catch { /* ignore */ }
  const byId = new Map(existing.map(n => [n.id, n]));
  let added = 0;
  for (const n of data.notes) {
    if (!n || !n.id) continue;
    if (!byId.has(n.id)) added++;
    byId.set(n.id, n);
  }
  const merged = [...byId.values()].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(merged)); } catch (e) { throw new Error('Could not save restored notes (storage full?).'); }

  // Restore theme (applied on reload).
  if (data.theme) { try { localStorage.setItem(THEME_KEY, JSON.stringify(data.theme)); } catch { /* ignore */ } }

  return { added, total: data.notes.length };
}
