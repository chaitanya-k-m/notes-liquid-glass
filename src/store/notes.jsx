import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { deleteBlob } from './audioDB.js';

const Ctx = createContext(null);
const STORAGE_KEY = 'notes_v3';

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [action.note, ...state];
    case 'UPDATE': return state.map(n => n.id === action.id ? { ...n, ...action.updates, updatedAt: new Date().toISOString() } : n);
    case 'DELETE': return state.filter(n => n.id !== action.id);
    default: return state;
  }
}

export function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function makeTitle(text) {
  if (!text?.trim()) return '';
  const first = text.trim().split(/[.!?\n]/)[0].trim();
  if (first.length <= 52) return first;
  return first.split(' ').slice(0, 8).join(' ') + '…';
}

function defaultTitle(kind, text) {
  const t = makeTitle(text);
  if (t) return t;
  return { todo: 'Checklist', photo: 'Photos', voice: 'Voice note', text: 'Untitled note' }[kind] || 'Untitled note';
}

// Load + migrate older shapes (v2 used `transcript`/no kind richness; v1 even older)
function loadInitial() {
  for (const key of [STORAGE_KEY, 'notes_v2', 'notes_v1']) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const arr = JSON.parse(raw);
      return arr.map(n => ({
        id: n.id || uuid(),
        kind: n.kind || (n.duration ? 'voice' : 'text'),
        title: n.title || '',
        text: n.text ?? n.transcript ?? '',
        items: Array.isArray(n.items) ? n.items : [],
        photos: Array.isArray(n.photos) ? n.photos : [],
        duration: n.duration || 0,
        hasAudio: !!n.hasAudio,
        tags: n.tags || [],
        createdAt: n.createdAt || new Date().toISOString(),
        updatedAt: n.updatedAt || n.createdAt || new Date().toISOString(),
      }));
    } catch { /* try next */ }
  }
  return [];
}

export function NotesProvider({ children }) {
  const [notes, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch { /* quota */ }
  }, [notes]);

  const addNote = (fields = {}) => {
    const now = new Date().toISOString();
    const kind = fields.kind || 'text';
    const note = {
      id: uuid(),
      kind,
      title: (fields.title && fields.title.trim()) || defaultTitle(kind, fields.text),
      text: fields.text || '',
      items: fields.items || [],
      photos: fields.photos || [],
      duration: fields.duration || 0,
      hasAudio: !!fields.hasAudio,
      tags: fields.tags || [],
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD', note });
    return note;
  };

  const updateNote = (id, updates) => dispatch({ type: 'UPDATE', id, updates });

  const deleteNote = (id) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      if (note.hasAudio) deleteBlob(id);
      (note.photos || []).forEach(pid => deleteBlob(pid));
    }
    dispatch({ type: 'DELETE', id });
  };

  return (
    <Ctx.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </Ctx.Provider>
  );
}

export const useNotes = () => useContext(Ctx);

export function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return 'yesterday';
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function fmtDuration(s) {
  if (!s) return '';
  const m = Math.floor(s / 60), sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `0:${String(sec).padStart(2, '0')}`;
}
