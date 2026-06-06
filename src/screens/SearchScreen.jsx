import React from 'react';
import { TYPE, GlassCard } from '../design-system.jsx';
import { ScreenHeader } from '../components/ScreensCommon.jsx';
import { useNotes, relativeTime, fmtDuration } from '../store/notes.jsx';

export function SearchScreen({ go, dark = false }) {
  const { notes } = useNotes();
  const [raw, setRaw]         = React.useState('');
  const [query, setQuery]     = React.useState('');
  const inputRef              = React.useRef(null);

  // Debounce query
  React.useEffect(() => {
    const t = setTimeout(() => setQuery(raw), 150);
    return () => clearTimeout(t);
  }, [raw]);

  // Auto-focus
  React.useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);

  const results = query.trim()
    ? notes.filter(n => {
        const q = query.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.transcript.toLowerCase().includes(q);
      })
    : [];

  const ink    = dark ? '#fff' : '#1a1322';
  const subInk = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';

  function highlight(text, q) {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'rgba(255,220,60,0.45)', borderRadius: 3, padding: '0 1px', color: 'inherit' }}>
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <ScreenHeader dark={dark} back={() => go('home')} eyebrow="Search" />

        {/* Search input */}
        <div style={{ padding: '8px 18px 16px' }}>
          <div style={{
            position: 'relative', borderRadius: 18,
            background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: `0.75px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)'}`,
            boxShadow: '0 2px 12px rgba(80,60,90,0.08)',
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{ padding: '0 14px', color: subInk, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.2"/>
                <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              ref={inputRef}
              value={raw}
              onChange={e => setRaw(e.target.value)}
              placeholder="Search notes…"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: TYPE.ui, fontSize: 16, color: ink, padding: '14px 0',
              }}
            />
            {raw && (
              <button onClick={() => setRaw('')} style={{
                padding: '0 14px', border: 'none', background: 'transparent', cursor: 'pointer',
                color: subInk, display: 'flex', alignItems: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Results / states */}
        <div style={{ padding: '0 18px 100px' }}>
          {!query.trim() && notes.length > 0 && (
            <div>
              <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.5, textTransform: 'uppercase', color: subInk, marginBottom: 10 }}>
                Recent — {notes.length} note{notes.length !== 1 ? 's' : ''}
              </div>
              {notes.slice(0, 6).map(n => (
                <SearchResult key={n.id} note={n} query="" go={go} dark={dark} ink={ink} subInk={subInk} highlight={highlight} />
              ))}
            </div>
          )}

          {query.trim() && results.length > 0 && (
            <div>
              <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.5, textTransform: 'uppercase', color: subInk, marginBottom: 10 }}>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map(n => (
                <SearchResult key={n.id} note={n} query={query} go={go} dark={dark} ink={ink} subInk={subInk} highlight={highlight} />
              ))}
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 16, color: ink, marginBottom: 8 }}>No results</div>
              <div style={{ fontFamily: TYPE.ui, fontSize: 14, color: subInk }}>Nothing matches "{query}"</div>
            </div>
          )}

          {!query.trim() && notes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 16, color: ink, marginBottom: 8 }}>No notes yet</div>
              <div style={{ fontFamily: TYPE.ui, fontSize: 14, color: subInk }}>Record a voice note to get started.</div>
              <button onClick={() => go('voice')} style={{ marginTop: 20, padding: '12px 24px', borderRadius: 9999, border: 'none', cursor: 'pointer', background: dark ? 'rgba(255,255,255,0.9)' : 'rgba(30,20,50,0.88)', color: dark ? '#1a1322' : '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14 }}>
                Start recording
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResult({ note, query, go, dark, ink, subInk, highlight }) {
  const tint = dark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.62)';
  const excerpt = note.transcript
    ? (() => {
        if (!query.trim()) return note.transcript.slice(0, 80);
        const idx = note.transcript.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return note.transcript.slice(0, 80);
        const start = Math.max(0, idx - 30);
        return (start > 0 ? '…' : '') + note.transcript.slice(start, idx + query.length + 50);
      })()
    : '';

  return (
    <GlassCard
      radius={18} padding={14} tint={tint}
      style={{ marginBottom: 8, cursor: 'pointer' }}
      onClick={() => go('detail', { noteId: note.id })}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 15, color: ink, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {highlight(note.title, query)}
          </div>
          {excerpt && (
            <div style={{ fontFamily: TYPE.ui, fontSize: 13, lineHeight: 1.5, color: subInk, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {highlight(excerpt, query)}
            </div>
          )}
        </div>
        <div style={{ fontFamily: TYPE.mono, fontSize: 9, letterSpacing: 0.6, color: subInk, whiteSpace: 'nowrap', flexShrink: 0, paddingTop: 2 }}>
          {relativeTime(note.createdAt)}
          {note.duration > 0 && <span style={{ display: 'block' }}>{fmtDuration(note.duration)}</span>}
        </div>
      </div>
    </GlassCard>
  );
}
