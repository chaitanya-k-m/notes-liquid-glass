import React from 'react';
import { TYPE, GlassCard } from '../design-system.jsx';
import { ScreenHeader, Thumb } from '../components/ScreensCommon.jsx';
import { useNotes, relativeTime, fmtDuration } from '../store/notes.jsx';
import { useTheme } from '../store/theme.jsx';
import {
  loadEmbedder, embed, cosine, noteText, hashContent,
  loadCache, saveCache, keywordScore,
} from '../store/semantic.js';

const SUGGESTIONS = ['movies', 'food & recipes', 'travel plans', 'work tasks', 'ideas'];

export function SearchScreen({ go }) {
  const { notes } = useNotes();
  const { dark, accent } = useTheme();
  const [raw, setRaw]     = React.useState('');
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState('loading'); // loading | ready | fallback
  const [indexing, setIndexing] = React.useState({ done: 0, total: 0 });
  const [results, setResults] = React.useState([]);
  const [listening, setListening] = React.useState(false);
  const [tick, setTick] = React.useState(0);

  const extractorRef = React.useRef(null);
  const embedsRef    = React.useRef(loadCache());
  const recRef       = React.useRef(null);
  const inputRef     = React.useRef(null);

  const hasSpeech = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const ink    = dark ? '#fff' : '#1a1322';
  const subInk = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';

  // Debounce query
  React.useEffect(() => { const t = setTimeout(() => setQuery(raw), 180); return () => clearTimeout(t); }, [raw]);

  // Load the model
  React.useEffect(() => {
    let alive = true;
    loadEmbedder()
      .then(ex => { if (alive) { extractorRef.current = ex; setStatus('ready'); } })
      .catch(() => { if (alive) setStatus('fallback'); });
    return () => { alive = false; if (recRef.current) { try { recRef.current.stop(); } catch {} } };
  }, []);

  // Build/refresh embeddings when ready or notes change
  React.useEffect(() => {
    if (status !== 'ready' || !extractorRef.current) return;
    let alive = true;
    (async () => {
      const cache = embedsRef.current;
      const todo = notes.filter(n => { const h = hashContent(noteText(n)); return !cache[n.id] || cache[n.id].h !== h; });
      if (todo.length) {
        setIndexing({ done: 0, total: todo.length });
        let i = 0;
        for (const n of todo) {
          if (!alive) return;
          const text = noteText(n);
          try { cache[n.id] = { h: hashContent(text), v: await embed(extractorRef.current, text) }; } catch {}
          setIndexing({ done: ++i, total: todo.length });
        }
      }
      const ids = new Set(notes.map(n => n.id));
      for (const k of Object.keys(cache)) if (!ids.has(k)) delete cache[k];
      saveCache(cache);
      if (alive) { setIndexing({ done: 0, total: 0 }); setTick(t => t + 1); }
    })();
    return () => { alive = false; };
  }, [status, notes]);

  // Run search
  React.useEffect(() => {
    let alive = true;
    (async () => {
      const q = query.trim();
      if (!q) { setResults([]); return; }
      if (status === 'ready' && extractorRef.current) {
        let qv = null;
        try { qv = await embed(extractorRef.current, q); } catch {}
        if (!alive) return;
        const cache = embedsRef.current;
        const scored = notes.map(n => {
          const e = cache[n.id];
          const sem = (qv && e) ? cosine(qv, e.v) : 0;
          const kw = keywordScore(q, n);
          return { n, score: Math.max(sem, kw * 0.55) + (kw > 0 ? 0.04 : 0), sem, kw };
        }).filter(r => r.score > 0.24 || r.kw >= 0.5)
          .sort((a, b) => b.score - a.score);
        setResults(scored);
      } else {
        const scored = notes.map(n => { const kw = keywordScore(q, n); return { n, score: kw, kw }; })
          .filter(r => r.score > 0).sort((a, b) => b.score - a.score);
        setResults(scored);
      }
    })();
    return () => { alive = false; };
  }, [query, status, tick, notes]);

  // Voice input
  function toggleVoice() {
    if (listening) { try { recRef.current?.stop(); } catch {} setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = navigator.language || 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    recRef.current = rec;
    setListening(true);
    setRaw('');
    let finalT = '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalT += t; else interim += t;
      }
      setRaw((finalT || interim).trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    try { rec.start(); } catch { setListening(false); }
  }

  const statusLine = (() => {
    if (indexing.total > 0) return `Indexing notes… ${indexing.done}/${indexing.total}`;
    if (status === 'loading') return 'Preparing AI search…';
    if (status === 'ready') return 'AI search · understands meaning, on-device';
    return 'Keyword search · offline mode';
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <ScreenHeader dark={dark} back={() => go('home')} eyebrow="Search" menu={false} />

        {/* Search input */}
        <div style={{ padding: '8px 18px 10px' }}>
          <div style={{
            position: 'relative', borderRadius: 18,
            background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)',
            border: `0.75px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)'}`,
            boxShadow: listening ? `0 0 0 2.5px ${accent}88` : '0 2px 12px rgba(80,60,90,0.08)',
            display: 'flex', alignItems: 'center', transition: 'box-shadow 0.2s',
          }}>
            <div style={{ padding: '0 12px 0 14px', color: subInk, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.2"/>
                <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              ref={inputRef} value={raw} onChange={e => setRaw(e.target.value)}
              placeholder={listening ? 'Listening…' : 'Search or ask…'}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: TYPE.ui, fontSize: 16, color: ink, padding: '14px 0' }}
            />
            {raw && (
              <button onClick={() => setRaw('')} aria-label="Clear" style={{ padding: '0 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: subInk, display: 'flex', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
              </button>
            )}
            {hasSpeech && (
              <button onClick={toggleVoice} aria-label="Voice search" style={{
                margin: '5px 6px 5px 2px', width: 40, height: 40, borderRadius: 14, border: 'none', cursor: 'pointer', flexShrink: 0,
                background: listening ? accent : (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              }}>
                {listening && <span style={{ position: 'absolute', inset: -3, borderRadius: 16, border: `2px solid ${accent}`, animation: 'pulseRing 1.2s ease-out infinite' }} />}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="3" width="6" height="12" rx="3" fill={listening ? '#fff' : (dark ? '#fff' : '#1a1322')}/>
                  <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke={listening ? '#fff' : (dark ? '#fff' : '#1a1322')} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* status line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, paddingLeft: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: status === 'ready' ? '#3a9d6e' : status === 'loading' ? accent : '#c98a3a', flexShrink: 0 }} />
            <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.6, color: subInk }}>{statusLine}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '6px 18px 100px' }}>
          {/* Suggestions when empty */}
          {!query.trim() && (
            <div>
              <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.5, textTransform: 'uppercase', color: subInk, margin: '10px 0' }}>Try asking for</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => setRaw(s)} style={{ padding: '9px 14px', borderRadius: 9999, cursor: 'pointer', border: `1px solid ${dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)'}`, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.5)', color: ink, fontFamily: TYPE.ui, fontWeight: 500, fontSize: 13 }}>{s}</button>
                ))}
              </div>
              {notes.length > 0 && (
                <>
                  <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.5, textTransform: 'uppercase', color: subInk, marginBottom: 10 }}>Recent</div>
                  {notes.slice(0, 6).map(n => <ResultCard key={n.id} note={n} go={go} dark={dark} ink={ink} subInk={subInk} accent={accent} />)}
                </>
              )}
            </div>
          )}

          {query.trim() && results.length > 0 && (
            <div>
              <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.5, textTransform: 'uppercase', color: subInk, marginBottom: 10 }}>
                {results.length} result{results.length !== 1 ? 's' : ''} for “{query}”
              </div>
              {results.map(({ n, score }) => <ResultCard key={n.id} note={n} go={go} dark={dark} ink={ink} subInk={subInk} accent={accent} score={score} query={query} />)}
            </div>
          )}

          {query.trim() && results.length === 0 && status !== 'loading' && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 16, color: ink, marginBottom: 8 }}>No matches</div>
              <div style={{ fontFamily: TYPE.ui, fontSize: 14, color: subInk }}>Nothing related to “{query}” yet.</div>
            </div>
          )}

          {query.trim() && results.length === 0 && status === 'loading' && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontFamily: TYPE.ui, fontSize: 14, color: subInk }}>Warming up the AI model…</div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes pulseRing { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.5);opacity:0} }`}</style>
    </div>
  );
}

function ResultCard({ note, go, dark, ink, subInk, accent, score, query }) {
  const tint = dark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.64)';
  const excerpt = note.text ? note.text.slice(0, 90) + (note.text.length > 90 ? '…' : '') : '';
  const cover = (note.photos && note.photos.length > 0) ? note.photos[0] : null;
  const pct = score != null ? Math.round(Math.min(1, score) * 100) : null;

  return (
    <GlassCard radius={18} padding={12} tint={tint} style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => go('detail', { noteId: note.id })}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {cover && <Thumb id={cover} radius={12} style={{ width: 52, height: 52, flexShrink: 0 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <KindDot kind={note.kind} />
            <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 15, color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title || 'Untitled'}</div>
          </div>
          {excerpt && <div style={{ fontFamily: TYPE.ui, fontSize: 13, lineHeight: 1.45, color: subInk, marginTop: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{excerpt}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
            <span style={{ fontFamily: TYPE.mono, fontSize: 9, letterSpacing: 0.6, color: subInk }}>{relativeTime(note.createdAt)}{note.duration > 0 ? ` · ${fmtDuration(note.duration)}` : ''}</span>
            {pct != null && (
              <span style={{ fontFamily: TYPE.mono, fontSize: 8.5, letterSpacing: 0.4, color: accent, background: `${accent}22`, padding: '1px 6px', borderRadius: 9999 }}>{pct}% match</span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function KindDot({ kind }) {
  const c = { voice: '#7755cc', todo: '#2c8a68', photo: '#2a6fbf', text: '#c98a3a' }[kind] || '#999';
  return <span style={{ width: 7, height: 7, borderRadius: 4, background: c, flexShrink: 0 }} />;
}
