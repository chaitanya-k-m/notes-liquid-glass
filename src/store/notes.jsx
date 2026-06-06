import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { deleteAudio } from './audioDB.js';

const Ctx = createContext(null);
const STORAGE_KEY = 'notes_v2';

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [action.note, ...state];
    case 'UPDATE': return state.map(n => n.id === action.id ? { ...n, ...action.updates, updatedAt: new Date().toISOString() } : n);
    case 'DELETE': return state.filter(n => n.id !== action.id);
    default: return state;
  }
}

export function makeTitle(text) {
  if (!text?.trim()) {
    return 'Untitled note';
  }
  const first = text.trim().split(/[.!?\n]/)[0].trim();
  if (first.length <= 52) return first;
  return first.split(' ').slice(0, 8).join(' ') + '…';
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Load + migrate from any older shape (notes_v1 used `transcript`)
function loadInitial() {
  try {
    const v2 = localStorage.getItem(STORAGE_KEY);
    if (v2) return JSON.parse(v2);
  } catch { /* fall through */ }
  try {
    const v1 = JSON.parse(localStorage.getItem('notes_v1') || '[]');
    return v1.map(n => ({
      id: n.id || uuid(),
      kind: n.kind || (n.duration ? 'voice' : 'text'),
      title: n.title || makeTitle(n.text ?? n.transcript ?? ''),
      text: n.text ?? n.transcript ?? '',
      duration: n.duration || 0,
      hasAudio: false, // v1 never stored audio
      tags: n.tags || [],
      createdAt: n.createdAt || new Date().toISOString(),
      updatedAt: n.updatedAt || n.createdAt || new Date().toISOString(),
    }));
  } catch { return []; }
}

export function NotesProvider({ children }) {
  const [notes, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch { /* quota */ }
  }, [notes]);

  const addNote = (fields = {}) => {
    const now = new Date().toISOString();
    const note = {
      id: uuid(),
      kind: fields.kind || 'text',
      title: (fields.title && fields.title.trim()) || makeTitle(fields.text),
      text: fields.text || '',
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
    deleteAudio(id);          // clean up any stored audio
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
