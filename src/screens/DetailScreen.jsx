import React from 'react';
import { TYPE, GlassCard } from '../design-system.jsx';
import { ScreenHeader } from '../components/ScreensCommon.jsx';
import { useNotes, makeTitle, relativeTime, fmtDuration } from '../store/notes.jsx';
import { loadAudio } from '../store/audioDB.js';

export function DetailScreen({ go, dark = false, payload }) {
  const { notes, addNote, updateNote, deleteNote } = useNotes();

  const isDraft = !!payload?.draft && !payload?.noteId;
  const existing = payload?.noteId ? notes.find(n => n.id === payload.noteId) : null;

  // Note not found (deleted / bad link) and not a draft
  if (!existing && !isDraft) {
    return <NotFound go={go} dark={dark} />;
  }

  return (
    <Editor
      key={existing?.id || 'draft'}
      go={go} dark={dark}
      existing={existing}
      isDraft={isDraft}
      addNote={addNote} updateNote={updateNote} deleteNote={deleteNote}
    />
  );
}

function Editor({ go, dark, existing, isDraft, addNote, updateNote, deleteNote }) {
  const ink    = dark ? '#fff' : '#1a1322';
  const subInk = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.48)';

  const [title, setTitle] = React.useState(existing?.title || '');
  const [body, setBody]   = React.useState(existing?.text || '');
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const idRef       = React.useRef(existing?.id || null);
  const bodyRef     = React.useRef(null);
  const firstRun    = React.useRef(true);
  const kind        = existing?.kind || 'text';

  // Autofocus body for fresh drafts
  React.useEffect(() => {
    if (isDraft) setTimeout(() => bodyRef.current?.focus(), 300);
  }, [isDraft]);

  // Debounced autosave (create on first content, update thereafter)
  React.useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const hasContent = title.trim() || body.trim();
    const t = setTimeout(() => {
      if (idRef.current) {
        updateNote(idRef.current, { title: title.trim() || makeTitle(body), text: body });
        flashSaved();
      } else if (hasContent) {
        const n = addNote({ kind: 'text', title, text: body });
        idRef.current = n.id;
        flashSaved();
      }
    }, 500);
    return () => clearTimeout(t);
  }, [title, body]); // eslint-disable-line

  function flashSaved() {
    setSaved(true);
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(() => setSaved(false), 1400);
  }

  function handleBack() {
    // Final flush
    if (idRef.current) {
      updateNote(idRef.current, { title: title.trim() || makeTitle(body), text: body });
    } else if (title.trim() || body.trim()) {
      addNote({ kind: 'text', title, text: body });
    }
    go('home');
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    if (idRef.current) deleteNote(idRef.current);
    go('home');
  }

  const createdAt = existing?.createdAt;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <ScreenHeader
          dark={dark}
          back={handleBack}
          eyebrow={isDraft && !idRef.current ? 'New note' : kind === 'voice' ? 'Voice note' : 'Note'}
        />

        <div style={{ padding: '8px 18px 24px' }}>
          {/* Title */}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontFamily: TYPE.display, fontWeight: 700, fontSize: 28, lineHeight: 1.15,
              letterSpacing: -0.8, color: ink, marginBottom: 8, padding: 0,
            }}
          />

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color: subInk }}>
              {createdAt
                ? new Date(createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                : 'Now'}
            </span>
            {existing?.duration > 0 && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: subInk }} />
                <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.8, color: subInk }}>{fmtDuration(existing.duration)}</span>
              </>
            )}
            <span style={{ marginLeft: 'auto', fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.6, color: saved ? '#3a9d6e' : subInk, transition: 'color 0.3s' }}>
              {saved ? '✓ saved' : createdAt ? relativeTime(createdAt) : ''}
            </span>
          </div>

          {/* Audio player for voice notes */}
          {existing?.hasAudio && <AudioPlayer noteId={existing.id} duration={existing.duration} dark={dark} />}

          {/* Body — always editable */}
          <textarea
            ref={bodyRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={kind === 'voice' ? 'Transcript — edit if needed…' : 'Start typing your note…'}
            style={{
              width: '100%', minHeight: 240, resize: 'none',
              border: 'none', outline: 'none', background: 'transparent',
              fontFamily: TYPE.ui, fontSize: 16, lineHeight: 1.7, color: ink,
              marginTop: existing?.hasAudio ? 16 : 0, padding: 0,
            }}
          />
        </div>
      </div>

      {/* Bottom actions */}
      <div style={{ padding: '12px 18px', paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))', display: 'flex', gap: 10, flexShrink: 0 }}>
        <button onClick={() => go('voice')} style={{
          flex: 1, padding: '14px', borderRadius: 18, border: 'none', cursor: 'pointer',
          background: dark ? 'rgba(164,140,230,0.25)' : 'rgba(164,140,230,0.18)',
          color: dark ? '#d4c0ff' : '#5533aa', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor"/>
            <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          New voice note
        </button>

        <button onClick={handleDelete} onBlur={() => setConfirmDelete(false)} style={{
          padding: '14px 20px', borderRadius: 18, border: 'none', cursor: 'pointer',
          background: confirmDelete ? 'rgba(220,60,60,0.9)' : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'),
          color: confirmDelete ? '#fff' : (dark ? 'rgba(255,120,120,0.9)' : 'rgba(180,40,40,0.8)'),
          fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14, transition: 'background 0.2s',
        }}>
          {confirmDelete ? 'Confirm' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// ── Audio player ──────────────────────────────────────────────────────────────
function AudioPlayer({ noteId, duration, dark }) {
  const [url, setUrl]         = React.useState(null);
  const [playing, setPlaying] = React.useState(false);
  const [cur, setCur]         = React.useState(0);
  const [total, setTotal]     = React.useState(duration || 0);
  const [missing, setMissing] = React.useState(false);
  const audioRef = React.useRef(null);

  React.useEffect(() => {
    let revoked = false, objUrl;
    loadAudio(noteId).then(blob => {
      if (revoked) return;
      if (blob) { objUrl = URL.createObjectURL(blob); setUrl(objUrl); }
      else setMissing(true);
    });
    return () => { revoked = true; if (objUrl) URL.revokeObjectURL(objUrl); };
  }, [noteId]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); }
    else { a.play().catch(() => {}); }
  }

  const accent = '#7755cc';
  const pct = total ? Math.min(100, (cur / total) * 100) : 0;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  if (missing) {
    return (
      <GlassCard radius={16} padding={14} tint={dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)'}>
        <div style={{ fontFamily: TYPE.ui, fontSize: 13, color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
          Audio unavailable on this device.
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard radius={16} padding={12} tint={dark ? 'rgba(164,140,230,0.18)' : 'rgba(164,140,230,0.14)'}>
      <audio
        ref={audioRef}
        src={url || undefined}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCur(0); }}
        onTimeUpdate={e => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={e => { const d = e.currentTarget.duration; if (isFinite(d) && d > 0) setTotal(d); }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={toggle} disabled={!url} style={{
          width: 44, height: 44, borderRadius: 22, border: 'none', cursor: url ? 'pointer' : 'default',
          background: accent, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(119,85,204,0.4)', opacity: url ? 1 : 0.5,
        }}>
          {playing
            ? <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ width: 4, height: 16, background: '#fff', borderRadius: 1 }} />
                <div style={{ width: 4, height: 16, background: '#fff', borderRadius: 1 }} />
              </div>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 5, borderRadius: 3, background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 3, transition: 'width 0.2s linear' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: TYPE.mono, fontSize: 9.5, color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
            <span>{fmt(cur)}</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ── Not found ─────────────────────────────────────────────────────────────────
function NotFound({ go, dark }) {
  const ink = dark ? '#fff' : '#1a1322';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader dark={dark} back={() => go('home')} eyebrow="Not found" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
        <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 16, color: ink, marginBottom: 8 }}>Note not found</div>
        <div style={{ fontFamily: TYPE.ui, fontSize: 14, color: sub, marginBottom: 24 }}>It may have been deleted.</div>
        <button onClick={() => go('home')} style={{ padding: '12px 24px', borderRadius: 9999, border: 'none', cursor: 'pointer', background: dark ? 'rgba(255,255,255,0.9)' : 'rgba(30,20,50,0.88)', color: dark ? '#1a1322' : '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14 }}>Back to notes</button>
      </div>
    </div>
  );
}
