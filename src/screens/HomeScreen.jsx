import React from 'react';
import { TYPE, SoftPill, Waveform } from '../design-system.jsx';
import { ScreenHeader, BottomDock, Thumb } from '../components/ScreensCommon.jsx';
import { useNotes, relativeTime, fmtDuration } from '../store/notes.jsx';
import { useTheme } from '../store/theme.jsx';
import { fetchDaily, localDaily, localRandom } from '../store/quotes.js';

const TABS = ['Pinned', 'Notes', 'Voice', 'To-Do', 'Photos', 'Files'];

const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${String(d.getFullYear()).slice(2)}`;
};
const STRIPES = 'repeating-linear-gradient(135deg, rgba(0,0,0,0.04) 0 9px, transparent 9px 18px)';

function tintFor(kind, dark) {
  if (dark) return { text: 'rgba(255,236,214,0.10)', todo: 'rgba(205,232,212,0.10)' }[kind] || 'rgba(255,255,255,0.08)';
  return { text: 'rgba(253,228,205,0.62)', todo: 'rgba(214,234,216,0.62)' }[kind] || 'rgba(255,255,255,0.55)';
}

export function HomeScreen({ go, openNew }) {
  const { notes, updateNote } = useNotes();
  const { dark, accent } = useTheme();
  const [tab, setTab] = React.useState('Pinned');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const togglePin = (n) => updateNote(n.id, { pinned: !n.pinned });

  const filtered = notes.filter(n => {
    if (tab === 'Notes')  return n.kind === 'text';
    if (tab === 'Voice')  return n.kind === 'voice';
    if (tab === 'To-Do')  return n.kind === 'todo';
    if (tab === 'Photos') return n.kind === 'photo' || (n.photos && n.photos.length > 0);
    if (tab === 'Files')  return n.kind === 'file' || (n.files && n.files.length > 0);
    return n.pinned; // Pinned tab
  });

  const allPhotos = notes.flatMap(n => (n.photos || []).map(pid => ({ pid, noteId: n.id })));
  const fileCount = notes.reduce((sum, n) => sum + (n.files?.length || 0), 0);
  const ink = dark ? '#fff' : '#1a1322';
  const subInk = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <ScreenHeader title="Notes" dark={dark} eyebrow={`${today} · ${notes.length} note${notes.length !== 1 ? 's' : ''}`} menu onMenu={() => go('settings')} />

        <div style={{ display: 'flex', gap: 8, padding: '12px 18px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => <SoftPill key={t} active={tab === t} onClick={() => setTab(t)} dark={dark} accent={accent}>{t}</SoftPill>)}
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tab === 'Pinned' && <QuoteHero dark={dark} ink={ink} subInk={subInk} />}

          {filtered.length === 0
            ? <EmptyState dark={dark} tab={tab} openNew={openNew} go={go} ink={ink} subInk={subInk} />
            : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
                {filtered.map(n => <Card key={n.id} note={n} go={go} dark={dark} ink={ink} subInk={subInk} accent={accent} onPin={() => togglePin(n)} />)}
              </div>
          }

          {tab === 'Pinned' && (allPhotos.length > 0 || fileCount > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: allPhotos.length > 0 && fileCount > 0 ? '1.6fr 1fr' : '1fr', gap: 12 }}>
              {allPhotos.length > 0 && <Snapshots photos={allPhotos} go={go} dark={dark} ink={ink} subInk={subInk} />}
              {fileCount > 0 && <SavedCard count={fileCount} onClick={() => setTab('Files')} dark={dark} ink={ink} subInk={subInk} />}
            </div>
          )}
          {tab === 'Pinned' && <QuickCapture onClick={() => go('voice')} onWrite={() => go('detail', { draft: true, kind: 'text' })} dark={dark} subInk={subInk} />}
        </div>

        <div style={{ height: 120 }} />
      </div>

      <BottomDock dark={dark} onAdd={openNew} onMic={() => go('voice')} onSearch={() => go('search')} mobile />
    </div>
  );
}

// ── Today's Thought — quote of the day ────────────────────────────────────────
function QuoteHero({ dark, ink, subInk }) {
  const [q, setQ] = React.useState(() => localDaily());
  React.useEffect(() => { let alive = true; fetchDaily().then(r => { if (alive && r) setQ(r); }); return () => { alive = false; }; }, []);
  const { text: quote, author } = q;
  const shuffle = (e) => { e.stopPropagation(); setQ(localRandom()); };

  return (
    <div style={{
      position: 'relative', borderRadius: 28, overflow: 'hidden', padding: 22,
      background: dark
        ? 'linear-gradient(150deg, rgba(120,90,170,0.45), rgba(80,70,140,0.4))'
        : 'linear-gradient(150deg, rgba(255,205,180,0.75), rgba(247,200,212,0.7) 55%, rgba(220,203,242,0.7))',
      boxShadow: dark ? '0 10px 28px rgba(0,0,0,0.3)' : '0 1px 0 rgba(255,255,255,0.6) inset, 0 10px 28px rgba(120,90,140,0.18)',
      minHeight: 188,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: STRIPES, pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.75)' : 'rgba(90,60,80,0.75)' }}>— Today’s Thought</span>
          <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.5, color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(90,60,80,0.6)' }}>{fmtDate(new Date().toISOString())}</span>
        </div>
        <h2 style={{ margin: 0, fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 30, lineHeight: 1.1, color: ink }}>{quote}</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: subInk }}>{author}</span>
          <button onClick={shuffle} aria-label="New thought" style={{ width: 32, height: 32, borderRadius: 16, border: 'none', cursor: 'pointer', background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4" stroke={ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quick Capture — Speak a note ──────────────────────────────────────────────
function QuickCapture({ onClick, onWrite, dark }) {
  return (
    <div style={{
      position: 'relative', borderRadius: 24, overflow: 'hidden', padding: 18,
      background: 'linear-gradient(145deg, #3a2a5e 0%, #2a1f4a 60%, #211a3e 100%)',
      boxShadow: '0 10px 26px rgba(40,25,70,0.4)',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Quick Capture</span>
        <div style={{ fontFamily: TYPE.display, fontWeight: 700, fontSize: 24, color: '#fff', letterSpacing: -0.5, marginTop: 4, lineHeight: 1.05 }}>Speak a note</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer', background: 'linear-gradient(145deg,#b490f0,#7a5ec8)', color: '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 13, boxShadow: '0 4px 14px rgba(120,80,200,0.5)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="12" rx="3" fill="#fff"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            Record
          </button>
          <button onClick={onWrite} style={{ padding: '9px 16px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 13 }}>Write</button>
        </div>
      </div>
      <button onClick={onClick} aria-label="Record" style={{ width: 58, height: 58, borderRadius: 29, flexShrink: 0, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="12" rx="3" fill="#fff"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

// ── Snapshots strip ───────────────────────────────────────────────────────────
function Snapshots({ photos, go, dark, ink, subInk }) {
  const shown = photos.slice(0, 7);
  const extra = photos.length - shown.length;
  return (
    <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', padding: 16, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.5)', backdropFilter: 'blur(18px)', border: `0.75px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)'}`, boxShadow: dark ? 'none' : '0 8px 22px rgba(80,60,90,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: TYPE.display, fontWeight: 700, fontSize: 18, color: ink, letterSpacing: -0.3 }}>Snapshots</div>
          <span style={{ fontFamily: TYPE.mono, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: subInk }}>{photos.length} item{photos.length !== 1 ? 's' : ''}</span>
        </div>
        <button onClick={() => {}} aria-label="Snapshots" style={{ background: 'transparent', border: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2" stroke={subInk} strokeWidth="2"/><circle cx="12" cy="13" r="3" stroke={subInk} strokeWidth="2"/></svg>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {shown.map(({ pid, noteId }) => (
          <div key={pid} onClick={() => go('detail', { noteId })} style={{ flexShrink: 0, cursor: 'pointer' }}>
            <Thumb id={pid} radius={12} style={{ width: 56, height: 56 }} />
          </div>
        ))}
        {extra > 0 && (
          <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 12, background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TYPE.mono, fontSize: 12, fontWeight: 600, color: subInk }}>+{extra}</div>
        )}
      </div>
    </div>
  );
}

// ── Saved files summary card (design's "Pdf / 12 Saved") ──────────────────────
function SavedCard({ count, onClick, dark, ink, subInk }) {
  return (
    <div onClick={onClick} style={{
      position: 'relative', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', minHeight: 150,
      background: dark ? 'linear-gradient(155deg, rgba(220,140,170,0.22), rgba(160,90,130,0.2))' : 'linear-gradient(155deg, rgba(247,210,224,0.85), rgba(238,190,210,0.8))',
      border: `0.75px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.8)'}`,
      boxShadow: dark ? '0 8px 22px rgba(0,0,0,0.28)' : '0 8px 22px rgba(160,90,130,0.16)',
      padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.7)' : '#a8336f' }}>{count} Saved</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 5a1 1 0 0 1 1-1h6l2 2h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" stroke={dark ? 'rgba(255,255,255,0.65)' : '#a8336f'} strokeWidth="1.6"/></svg>
      </div>
      <div style={{ position: 'absolute', left: 16, bottom: 8, fontFamily: TYPE.script, fontSize: 56, lineHeight: 1, color: dark ? 'rgba(255,255,255,0.92)' : '#a8336f' }}>Files</div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
function Shell({ children, onClick, tint, radius = 22, pad = 15, dark, stripes = false, corner = null, style = {} }) {
  return (
    <div onClick={onClick} style={{ position: 'relative', borderRadius: radius, overflow: 'hidden', cursor: 'pointer', boxShadow: dark ? '0 8px 22px rgba(0,0,0,0.28)' : '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 22px rgba(80,60,90,0.12)', ...style }}>
      <div style={{ position: 'absolute', inset: 0, background: tint, backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)', pointerEvents: 'none' }} />
      {stripes && <div style={{ position: 'absolute', inset: 0, background: STRIPES, pointerEvents: 'none' }} />}
      <div style={{ position: 'absolute', inset: 0, borderRadius: radius, border: `0.75px solid ${dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.7)'}`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', padding: pad }}>{children}</div>
      {corner}
    </div>
  );
}

const Eyebrow = ({ children, color }) => (
  <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', color }}>{children}</span>
);

// ── Pin toggle (overlay on cards) ─────────────────────────────────────────────
function PinToggle({ pinned, onClick, light = false }) {
  const idle = light ? '#fff' : '#1f1830';
  const bg = pinned
    ? (light ? 'rgba(255,255,255,0.92)' : 'rgba(31,24,48,0.92)')
    : (light ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.6)');
  const icon = pinned ? (light ? '#1f1830' : '#fff') : idle;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigator.vibrate?.(6); onClick(); }}
      aria-label={pinned ? 'Unpin' : 'Pin'}
      style={{ position: 'absolute', top: 8, right: 8, zIndex: 6, width: 28, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', background: bg, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: light ? 'none' : '0 1px 4px rgba(60,40,80,0.12)' }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill={pinned ? icon : 'none'} stroke={icon} strokeWidth={pinned ? 0 : 1.8} strokeLinejoin="round" strokeLinecap="round">
        <path d="M9 3.5h6l-1 5 2.5 3.2V14H7.5v-2.3L10 8.5l-1-5z" />
        <path d="M12 14v6.5" stroke={icon} strokeWidth="1.8" fill="none" />
      </svg>
    </button>
  );
}

// ── Per-kind grid card ────────────────────────────────────────────────────────
function Card({ note, go, dark, ink, subInk, accent, onPin }) {
  const open = () => go('detail', { noteId: note.id });
  const pin = <PinToggle pinned={note.pinned} onClick={onPin} />;
  const pinLight = <PinToggle pinned={note.pinned} onClick={onPin} light />;

  if (note.photos?.length > 0) {
    return (
      <div onClick={open} style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', cursor: 'pointer', height: 172, boxShadow: '0 8px 22px rgba(60,40,80,0.16)' }}>
        <Thumb id={note.photos[0]} radius={0} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 55%)' }} />
        {note.photos.length > 1 && <div style={{ position: 'absolute', top: 11, left: 11, padding: '3px 8px', borderRadius: 9999, background: 'rgba(0,0,0,0.45)', fontFamily: TYPE.mono, fontSize: 9.5, color: '#fff', fontWeight: 600 }}>{note.photos.length}</div>}
        {pinLight}
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 11 }}>
          <Eyebrow color="rgba(255,255,255,0.8)">{relativeTime(note.createdAt)}</Eyebrow>
          <div style={{ fontFamily: TYPE.serif, fontStyle: 'italic', fontSize: 17, color: '#fff', lineHeight: 1.1, marginTop: 2, textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>{note.title || 'Photos'}</div>
        </div>
      </div>
    );
  }

  if (note.kind === 'voice') {
    return (
      <div onClick={open} style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', cursor: 'pointer', padding: 16, background: 'linear-gradient(150deg, #b79bef, #8d6fd6)', boxShadow: '0 8px 22px rgba(110,80,200,0.3)' }}>
        {pinLight}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#6644b8" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
          </div>
          <Waveform color="#fff" bars={14} height={22} />
        </div>
        <Eyebrow color="rgba(255,255,255,0.9)">Memo · {fmtDuration(note.duration) || '0:00'}</Eyebrow>
        <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 13, color: '#fff', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.title}</div>
      </div>
    );
  }

  if (note.kind === 'file' || note.files?.length > 0) {
    const files = note.files || [];
    return (
      <Shell onClick={open} tint={dark ? 'rgba(220,140,170,0.12)' : 'rgba(245,210,225,0.6)'} dark={dark} radius={22} pad={15} corner={pin}>
        <Eyebrow color={subInk}>{files.length} saved</Eyebrow>
        <div style={{ fontFamily: TYPE.serif, fontStyle: 'italic', fontSize: 18, color: ink, margin: '6px 0 8px', lineHeight: 1.15, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.title || 'Saved files'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {files.slice(0, 3).map(f => (
            <div key={f.id} style={{ fontFamily: TYPE.mono, fontSize: 10, color: subInk, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>· {f.name}</div>
          ))}
        </div>
      </Shell>
    );
  }

  if (note.kind === 'todo') {
    return (
      <Shell onClick={open} tint={tintFor('todo', dark)} dark={dark} radius={22} pad={15} corner={pin}>
        <Eyebrow color={subInk}>Checklist</Eyebrow>
        <div style={{ fontFamily: TYPE.pixel, fontWeight: 400, fontSize: 26, lineHeight: 0.95, color: ink, margin: '4px 0 12px', letterSpacing: 0.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingRight: 26 }}>{note.title || 'Checklist'}</div>
        <TodoMini note={note} dark={dark} ink={ink} subInk={subInk} />
      </Shell>
    );
  }

  return (
    <Shell onClick={open} tint={tintFor('text', dark)} dark={dark} radius={22} pad={15} corner={pin}>
      <Eyebrow color={subInk}>{relativeTime(note.createdAt)}</Eyebrow>
      <div style={{ fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 19, lineHeight: 1.12, color: ink, margin: '4px 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingRight: 26 }}>{note.title || 'Untitled'}</div>
      {note.text
        ? <p style={{ margin: 0, fontFamily: TYPE.ui, fontSize: 12.5, lineHeight: 1.5, color: subInk, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.text}</p>
        : <span style={{ fontFamily: TYPE.ui, fontSize: 12, color: subInk, fontStyle: 'italic' }}>Empty note</span>}
    </Shell>
  );
}

// Pill-row checklist preview (matches design's Shopping List — no progress bar)
function TodoMini({ note, dark, ink, subInk }) {
  const items = note.items || [];
  const rowBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)';
  const rowBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.8)';
  const checkFill = dark ? '#fff' : '#1f1830';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.slice(0, 5).map(it => (
        <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 11px', borderRadius: 9999, background: rowBg, border: `0.75px solid ${rowBorder}` }}>
          <span style={{ width: 15, height: 15, borderRadius: 9999, flexShrink: 0, border: `1.5px solid ${it.done ? checkFill : (dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.28)')}`, background: it.done ? checkFill : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {it.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={dark ? '#1a1322' : '#fff'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </span>
          <span style={{ fontFamily: TYPE.ui, fontSize: 12.5, color: it.done ? subInk : ink, textDecoration: it.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.text || 'Item'}</span>
        </div>
      ))}
      {items.length === 0 && <span style={{ fontFamily: TYPE.ui, fontSize: 12.5, color: subInk, fontStyle: 'italic' }}>Empty checklist</span>}
    </div>
  );
}

function EmptyState({ dark, tab, openNew, go, ink, subInk }) {
  const isPinned = tab === 'Pinned';
  const actions = [
    { key: 'write',  label: 'Write',     onClick: () => go('detail', { draft: true, kind: 'text' }) },
    { key: 'todo',   label: 'Checklist', onClick: () => go('detail', { draft: true, kind: 'todo' }) },
    { key: 'photo',  label: 'Photo',     onClick: () => go('detail', { draft: true, kind: 'photo', pickNow: true }) },
    { key: 'voice',  label: 'Record',    onClick: () => go('voice') },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 8px', textAlign: 'center' }}>
      <div style={{ fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 22, color: ink, marginBottom: 8 }}>
        {isPinned ? 'Nothing pinned yet' : `No ${tab.toLowerCase()} yet`}
      </div>
      <div style={{ fontFamily: TYPE.ui, fontSize: 14, lineHeight: 1.5, color: subInk, maxWidth: 260, marginBottom: 18 }}>
        {isPinned
          ? 'Pin a note (tap the 📌 on any card, or open it and tap Pin) to keep it on your home screen. Browse everything with the tabs above.'
          : 'Write, make a checklist, snap a photo, or speak it out loud.'}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {actions.map(a => <button key={a.key} onClick={a.onClick} style={{ padding: '10px 16px', borderRadius: 9999, cursor: 'pointer', border: `1px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'}`, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)', color: ink, fontFamily: TYPE.ui, fontWeight: 600, fontSize: 13.5 }}>{a.label}</button>)}
      </div>
    </div>
  );
}
