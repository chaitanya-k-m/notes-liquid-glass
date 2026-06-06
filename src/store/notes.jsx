import React, { createContext, useContext, useReducer, useEffect } from 'react';

const Ctx = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [action.note, ...state];
    case 'UPDATE': return state.map(n => n.id === action.id ? { ...n, ...action.updates } : n);
    case 'DELETE': return state.filter(n => n.id !== action.id);
    default: return state;
  }
}

function makeTitle(transcript) {
  if (!transcript?.trim()) {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  const first = transcript.trim().split(/[.!?\n]/)[0].trim();
  if (first.length <= 52) return first;
  return first.split(' ').slice(0, 7).join(' ') + '…';
}

export function NotesProvider({ children }) {
  const [notes, dispatch] = useReducer(reducer, [], () => {
    try { return JSON.parse(localStorage.getItem('notes_v1') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('notes_v1', JSON.stringify(notes));
  }, [notes]);

  const addNote = (fields) => {
    const note = {
      id: crypto.randomUUID(),
      title: makeTitle(fields.transcript),
      transcript: fields.transcript || '',
      duration: fields.duration || 0,
      tags: fields.tags || [],
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD', note });
    return note;
  };

  const updateNote = (id, updates) => dispatch({ type: 'UPDATE', id, updates });
  const deleteNote = (id) => dispatch({ type: 'DELETE', id });

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
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}
