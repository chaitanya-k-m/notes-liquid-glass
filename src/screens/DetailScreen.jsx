import React from 'react';
import { TYPE, GlassCard } from '../design-system.jsx';
import { ScreenHeader } from '../components/ScreensCommon.jsx';
import { useNotes, relativeTime, fmtDuration } from '../store/notes.jsx';

export function DetailScreen({ go, dark = false, payload }) {
  const { notes, deleteNote, updateNote } = useNotes();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [editingTitle, setEditingTitle]   = React.useState(false);
  const [titleDraft, setTitleDraft]       = React.useState('');

  const note = payload?.noteId ? notes.find(n => n.id === payload.noteId) : null;

  const ink    = dark ? '#fff' : '#1a1322';
  const subInk = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.48)';

  // No note found — could be deleted or navigated directly
  if (!note) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <ScreenHeader dark={dark} back={() => go('home')} title="" eyebrow="Note not found" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
          <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 16, color: ink, marginBottom: 8 }}>No note selected</div>
          <div style={{ fontFamily: TYPE.ui, fontSize: 14, color: subInk, marginBottom: 24 }}>Tap a note from the home screen to open it here.</div>
          <button onClick={() => go('home')} style={{ padding: '12px 24px', borderRadius: 9999, border: 'none', cursor: 'pointer', background: dark ? 'rgba(255,255,255,0.9)' : 'rgba(30,20,50,0.88)', color: dark ? '#1a1322' : '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14 }}>
            Back to notes
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteNote(note.id);
    go('home');
  };

  const handleTitleSave = () => {
    if (titleDraft.trim()) updateNote(note.id, { title: titleDraft.trim() });
    setEditingTitle(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <ScreenHeader dark={dark} back={() => go('home')} eyebrow="Note" />

        <div style={{ padding: '8px 18px 24px' }}>
          {/* Title — tap to edit */}
          <div style={{ marginBottom: 10 }}>
            {editingTitle ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setEditingTitle(false); }}
                style={{
                  width: '100%', border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: TYPE.display, fontWeight: 700, fontSize: 28, lineHeight: 1.1,
                  letterSpacing: -0.8, color: ink,
                  borderBottom: `1.5px solid ${dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                  paddingBottom: 4,
                }}
              />
            ) : (
              <h1
                onClick={() => { setTitleDraft(note.title); setEditingTitle(true); }}
                style={{
                  margin: 0, fontFamily: TYPE.display, fontWeight: 700, fontSize: 28,
                  lineHeight: 1.15, letterSpacing: -0.8, color: ink, cursor: 'text',
                }}
                title="Tap to edit title"
              >
                {note.title}
              </h1>
            )}
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color: subInk }}>
              {new Date(note.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            {note.duration > 0 && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: subInk, display: 'inline-block' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="3" width="6" height="12" rx="3" fill={dark ? '#c4a8ff' : '#7755cc'}/>
                  </svg>
                  <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.8, color: subInk }}>{fmtDuration(note.duration)}</span>
                </div>
              </>
            )}
            <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.6, color: subInk, marginLeft: 'auto' }}>
              {relativeTime(note.createdAt)}
            </span>
          </div>

          {/* Transcript / body */}
          <GlassCard radius={20} padding={18} tint={dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'}>
            {note.transcript ? (
              <p style={{ margin: 0, fontFamily: TYPE.ui, fontSize: 16, lineHeight: 1.7, color: ink }}>
                {note.transcript}
              </p>
            ) : (
              <p style={{ margin: 0, fontFamily: TYPE.ui, fontSize: 15, fontStyle: 'italic', color: subInk }}>
                No transcript — audio-only recording.
              </p>
            )}
          </GlassCard>

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
              {note.tags.map(tag => (
                <span key={tag} style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1, padding: '4px 10px', borderRadius: 9999, background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: subInk, textTransform: 'uppercase' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Word count */}
          {note.transcript && (
            <div style={{ marginTop: 12, fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.8, color: subInk }}>
              {note.transcript.split(/\s+/).filter(Boolean).length} words
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div style={{
        padding: `14px 18px`,
        paddingBottom: `max(20px, var(--sab, 20px))`,
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        {/* Record more */}
        <button onClick={() => go('voice')} style={{
          flex: 1, padding: '14px', borderRadius: 18, border: 'none', cursor: 'pointer',
          background: dark ? 'rgba(164,140,230,0.25)' : 'rgba(164,140,230,0.18)',
          backdropFilter: 'blur(16px)',
          color: dark ? '#d4c0ff' : '#5533aa',
          fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor"/>
            <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          New note
        </button>

        {/* Delete */}
        <button onClick={handleDelete} style={{
          padding: '14px 20px', borderRadius: 18, border: 'none', cursor: 'pointer',
          background: confirmDelete
            ? 'rgba(220,60,60,0.85)'
            : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'),
          backdropFilter: 'blur(16px)',
          color: confirmDelete ? '#fff' : (dark ? 'rgba(255,100,100,0.85)' : 'rgba(180,40,40,0.8)'),
          fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14,
          transition: 'background 0.2s',
        }}
          onBlur={() => setConfirmDelete(false)}
        >
          {confirmDelete ? 'Confirm delete' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
