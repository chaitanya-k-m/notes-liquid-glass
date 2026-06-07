import React from 'react';
import { TYPE, SoftPill, Waveform } from '../design-system.jsx';
import { ScreenHeader, BottomDock, Thumb } from '../components/ScreensCommon.jsx';
import { useNotes, relativeTime, fmtDuration } from '../store/notes.jsx';
import { useTheme } from '../store/theme.jsx';

const TABS = ['All', 'Notes', 'Voice', 'To-Do', 'Photos'];
const KIND_LABEL = { text: 'Note', voice: 'Voice memo', todo: 'Checklist', photo: 'Photos' };

const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${String(d.getFullYear()).slice(2)}`;
};

const STRIPES = 'repeating-linear-gradient(135deg, rgba(0,0,0,0.035) 0 9px, transparent 9px 18px)';

// Soft per-kind tints (work over the themed gradient backdrop)
function tintFor(kind, dark) {
  if (dark) return {
    text:  'rgba(255,236,214,0.10)',
    todo:  'rgba(205,232,212,0.10)',
    photo: 'rgba(255,255,255,0.08)',
  }[kind] || 'rgba(255,255,255,0.08)';
  return {
    text:  'rgba(253,228,205,0.62)',
    todo:  'rgba(214,234,216,0.62)',
    photo: 'rgba(255,255,255,0.5)',
  }[kind] || 'rgba(255,255,255,0.55)';
}

export function HomeScreen({ go, openNew }) {
  const { notes } = useNotes();
  const { dark, accent } = useTheme();
  const [tab, setTab] = React.useState('All');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const filtered = notes.filter(n => {
    if (tab === 'Notes')  return n.kind === 'text';
    if (tab === 'Voice')  return n.kind === 'voice';
    if (tab === 'To-Do')  return n.kind === 'todo';
    if (tab === 'Photos') return n.kind === 'photo' || (n.photos && n.photos.length > 0);
    return true;
  });

  const ink = dark ? '#fff' : '#1a1322';
  const subInk = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <ScreenHeader title="Notes" dark={dark} eyebrow={`${today} · ${notes.length} note${notes.length !== 1 ? 's' : ''}`} menu onMenu={() => go('settings')} />

        <div style={{ display: 'flex', gap: 8, padding: '12px 18px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => <SoftPill key={t} active={tab === t} onClick={() => setTab(t)} dark={dark} accent={accent}>{t}</SoftPill>)}
        </div>

        {filtered.length === 0
          ? <EmptyState dark={dark} tab={tab} openNew={openNew} go={go} ink={ink} subInk={subInk} />
          : <Bento notes={filtered} go={go} dark={dark} ink={ink} subInk={subInk} accent={accent} />
        }
        <div style={{ height: 120 }} />
      </div>

      <BottomDock dark={dark} onAdd={openNew} onMic={() => go('voice')} onSearch={() => go('search')} mobile />
    </div>
  );
}

function Bento({ notes, go, dark, ink, subInk, accent }) {
  const [hero, ...rest] = notes;
  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Hero note={hero} go={go} dark={dark} ink={ink} subInk={subInk} accent={accent} />
      {rest.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
          {rest.map(n => <Card key={n.id} note={n} go={go} dark={dark} ink={ink} subInk={subInk} accent={accent} />)}
        </div>
      )}
    </div>
  );
}

// Glass shell with optional colored tint + stripe texture
function Shell({ children, onClick, tint, radius = 24, pad = 18, dark, stripes = false, style = {} }) {
  return (
    <div onClick={onClick} style={{
      position: 'relative', borderRadius: radius, overflow: 'hidden', cursor: 'pointer',
      boxShadow: dark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 1px 0 rgba(255,255,255,0.6) inset, 0 10px 26px rgba(80,60,90,0.13)',
      ...style,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: tint, backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)', pointerEvents: 'none' }} />
      {stripes && <div style={{ position: 'absolute', inset: 0, background: STRIPES, pointerEvents: 'none' }} />}
      <div style={{ position: 'absolute', inset: 0, borderRadius: radius, border: `0.75px solid ${dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.7)'}`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', padding: pad }}>{children}</div>
    </div>
  );
}

const Eyebrow = ({ children, color }) => (
  <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', color }}>{children}</span>
);

const ArrowBtn = ({ light }) => (
  <div style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: light ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)', backdropFilter: 'blur(8px)' }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke={light ? '#fff' : '#1a1322'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </div>
);

// ── HERO — editorial treatment of the latest note ─────────────────────────────
function Hero({ note, go, dark, ink, subInk, accent }) {
  const open = () => go('detail', { noteId: note.id });
  const isPhoto = note.photos?.length > 0;
  const date = fmtDate(note.createdAt);

  // Photo hero — image with scrim, serif title
  if (isPhoto) {
    return (
      <div onClick={open} style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', cursor: 'pointer', height: 234, boxShadow: '0 10px 28px rgba(60,40,80,0.2)' }}>
        <Thumb id={note.photos[0]} radius={0} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.18) 100%)' }} />
        <div style={{ position: 'absolute', top: 16, left: 18, right: 18, display: 'flex', justifyContent: 'space-between' }}>
          <Eyebrow color="rgba(255,255,255,0.85)">Photos</Eyebrow>
          <Eyebrow color="rgba(255,255,255,0.75)">{date}</Eyebrow>
        </div>
        <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
          <h2 style={{ margin: 0, fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 30, lineHeight: 1.05, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>{note.title || 'Photos'}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <Eyebrow color="rgba(255,255,255,0.8)">{note.photos.length} photo{note.photos.length !== 1 ? 's' : ''} · {relativeTime(note.createdAt)}</Eyebrow>
            <ArrowBtn light />
          </div>
        </div>
      </div>
    );
  }

  // Voice hero — purple gradient memo
  if (note.kind === 'voice') {
    return (
      <div onClick={open} style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', cursor: 'pointer', padding: 20, background: 'linear-gradient(150deg, #b79bef 0%, #8d6fd6 60%, #7a5ec8 100%)', boxShadow: '0 10px 28px rgba(110,80,200,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Eyebrow color="rgba(255,255,255,0.85)">Voice memo</Eyebrow>
          <Eyebrow color="rgba(255,255,255,0.75)">{date}</Eyebrow>
        </div>
        <h2 style={{ margin: 0, fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 28, lineHeight: 1.1, color: '#fff' }}>{note.title || 'Voice note'}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#6644b8" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
          </div>
          <Waveform color="#fff" bars={26} height={30} />
        </div>
        <div style={{ marginTop: 12 }}><Eyebrow color="rgba(255,255,255,0.85)">Memo · {fmtDuration(note.duration) || '0:00'}</Eyebrow></div>
      </div>
    );
  }

  // Todo / text hero — warm editorial card
  const tint = tintFor(note.kind === 'todo' ? 'todo' : 'text', dark);
  return (
    <Shell onClick={open} tint={tint} dark={dark} radius={28} pad={20} stripes style={{ minHeight: 180 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <Eyebrow color={subInk}>{note.kind === 'todo' ? 'Checklist' : "Today’s note"}</Eyebrow>
        <Eyebrow color={subInk}>{date}</Eyebrow>
      </div>
      <h2 style={{ margin: 0, fontFamily: note.kind === 'todo' ? TYPE.pixel : TYPE.serif, fontStyle: note.kind === 'todo' ? 'normal' : 'italic', fontWeight: 400, fontSize: note.kind === 'todo' ? 38 : 30, lineHeight: note.kind === 'todo' ? 0.9 : 1.08, letterSpacing: note.kind === 'todo' ? 0.5 : 0, color: ink, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {note.title || (note.kind === 'todo' ? 'Checklist' : 'Untitled')}
      </h2>
      {note.kind === 'todo'
        ? <TodoMini note={note} dark={dark} ink={ink} subInk={subInk} accent={accent} large />
        : (note.text ? <p style={{ margin: '12px 0 0', fontFamily: TYPE.ui, fontSize: 14, lineHeight: 1.55, color: subInk, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.text}</p> : null)}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <Eyebrow color={subInk}>{relativeTime(note.createdAt)}</Eyebrow>
        <ArrowBtn />
      </div>
    </Shell>
  );
}

// ── GRID CARDS ────────────────────────────────────────────────────────────────
function Card({ note, go, dark, ink, subInk, accent }) {
  const open = () => go('detail', { noteId: note.id });

  if (note.photos?.length > 0) {
    return (
      <div onClick={open} style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', cursor: 'pointer', height: 172, boxShadow: '0 8px 22px rgba(60,40,80,0.16)' }}>
        <Thumb id={note.photos[0]} radius={0} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 55%)' }} />
        {note.photos.length > 1 && (
          <div style={{ position: 'absolute', top: 9, right: 9, padding: '3px 8px', borderRadius: 9999, background: 'rgba(0,0,0,0.45)', fontFamily: TYPE.mono, fontSize: 9.5, color: '#fff', fontWeight: 600 }}>{note.photos.length}</div>
        )}
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

  if (note.kind === 'todo') {
    return (
      <Shell onClick={open} tint={tintFor('todo', dark)} dark={dark} radius={22} pad={15}>
        <Eyebrow color={subInk}>Checklist</Eyebrow>
        <div style={{ fontFamily: TYPE.pixel, fontWeight: 400, fontSize: 26, lineHeight: 0.95, color: ink, margin: '4px 0 10px', letterSpacing: 0.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.title || 'Checklist'}</div>
        <TodoMini note={note} dark={dark} ink={ink} subInk={subInk} accent={accent} />
      </Shell>
    );
  }

  // text
  return (
    <Shell onClick={open} tint={tintFor('text', dark)} dark={dark} radius={22} pad={15}>
      <Eyebrow color={subInk}>{relativeTime(note.createdAt)}</Eyebrow>
      <div style={{ fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 19, lineHeight: 1.12, color: ink, margin: '4px 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.title || 'Untitled'}</div>
      {note.text
        ? <p style={{ margin: 0, fontFamily: TYPE.ui, fontSize: 12.5, lineHeight: 1.5, color: subInk, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.text}</p>
        : <span style={{ fontFamily: TYPE.ui, fontSize: 12, color: subInk, fontStyle: 'italic' }}>Empty note</span>}
    </Shell>
  );
}

// Checklist preview with pill rows (matches the design's Shopping List)
function TodoMini({ note, dark, ink, subInk, accent, large = false }) {
  const items = note.items || [];
  const done = items.filter(i => i.done).length;
  const pct = items.length ? (done / items.length) * 100 : 0;
  const rowBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)';
  const rowBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.8)';

  return (
    <div style={{ marginTop: large ? 14 : 0 }}>
      <div style={{ height: 5, borderRadius: 3, background: dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.slice(0, large ? 4 : 3).map(it => (
          <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 9999, background: rowBg, border: `0.75px solid ${rowBorder}` }}>
            <span style={{ width: 15, height: 15, borderRadius: 9999, flexShrink: 0, border: `1.5px solid ${it.done ? accent : (dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.28)')}`, background: it.done ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {it.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </span>
            <span style={{ fontFamily: TYPE.ui, fontSize: 12.5, color: it.done ? subInk : ink, textDecoration: it.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.text || 'Item'}</span>
          </div>
        ))}
        {items.length === 0 && <span style={{ fontFamily: TYPE.ui, fontSize: 12.5, color: subInk, fontStyle: 'italic' }}>Empty checklist</span>}
      </div>
      {items.length > 0 && <span style={{ display: 'inline-block', marginTop: 9, fontFamily: TYPE.mono, fontSize: 9, letterSpacing: 0.8, color: subInk, textTransform: 'uppercase' }}>{done} of {items.length} done</span>}
    </div>
  );
}

function EmptyState({ dark, tab, openNew, go, ink, subInk }) {
  const actions = [
    { key: 'write',  label: 'Write',     onClick: () => go('detail', { draft: true, kind: 'text' }) },
    { key: 'todo',   label: 'Checklist', onClick: () => go('detail', { draft: true, kind: 'todo' }) },
    { key: 'photo',  label: 'Photo',     onClick: () => go('detail', { draft: true, kind: 'photo', pickNow: true }) },
    { key: 'voice',  label: 'Record',    onClick: () => go('voice') },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '44px 32px 0', textAlign: 'center' }}>
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: 'radial-gradient(circle, rgba(164,140,230,0.35), transparent 70%)', animation: 'emptyPulse 3s ease-in-out infinite' }} />
        <div onClick={openNew} style={{ width: 76, height: 76, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: `0.75px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)'}`, boxShadow: '0 8px 24px rgba(164,140,230,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={dark ? '#fff' : '#1a1322'} strokeWidth="2.4" strokeLinecap="round"/></svg>
        </div>
      </div>
      <div style={{ fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 28, color: ink, marginBottom: 8, letterSpacing: -0.3 }}>
        {tab === 'All' ? 'Capture your first thought' : `No ${tab.toLowerCase()} yet`}
      </div>
      <div style={{ fontFamily: TYPE.ui, fontSize: 15, lineHeight: 1.55, color: subInk, maxWidth: 250, marginBottom: 22 }}>Write, make a checklist, snap a photo, or speak it out loud.</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {actions.map(a => <button key={a.key} onClick={a.onClick} style={{ padding: '11px 18px', borderRadius: 9999, cursor: 'pointer', border: `1px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'}`, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)', color: ink, fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14 }}>{a.label}</button>)}
      </div>
      <style>{`@keyframes emptyPulse { 0%,100%{transform:scale(0.9);opacity:0.6} 50%{transform:scale(1.15);opacity:1} }`}</style>
    </div>
  );
}
