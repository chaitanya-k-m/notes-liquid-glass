import React from 'react';
import { TYPE, GlassCard, SoftPill, Waveform } from '../design-system.jsx';
import { ScreenHeader, BottomDock, Thumb } from '../components/ScreensCommon.jsx';
import { useNotes, relativeTime, fmtDuration } from '../store/notes.jsx';
import { useTheme } from '../store/theme.jsx';

const TABS = ['All', 'Notes', 'Voice', 'To-Do', 'Photos'];

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
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <NoteCard note={hero} go={go} dark={dark} ink={ink} subInk={subInk} accent={accent} hero />
      {rest.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'start' }}>
          {rest.map(n => <NoteCard key={n.id} note={n} go={go} dark={dark} ink={ink} subInk={subInk} accent={accent} />)}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, go, dark, ink, subInk, accent, hero = false }) {
  const isPhoto = (note.kind === 'photo' || (note.photos && note.photos.length > 0)) && note.photos?.length > 0;
  if (isPhoto) return <ImageCard note={note} go={go} hero={hero} subInk={subInk} />;

  const tint = dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)';
  return (
    <GlassCard radius={hero ? 26 : 20} padding={hero ? 18 : 14} tint={tint} style={{ cursor: 'pointer' }} onClick={() => go('detail', { noteId: note.id })}>
      <MetaRow note={note} dark={dark} subInk={subInk} />
      <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: hero ? 17 : 14, lineHeight: 1.3, color: ink, margin: '6px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {note.title || 'Untitled'}
      </div>
      <KindBody note={note} hero={hero} dark={dark} ink={ink} subInk={subInk} accent={accent} />
    </GlassCard>
  );
}

// ── Image-forward photo card ──────────────────────────────────────────────────
function ImageCard({ note, go, hero, subInk }) {
  const count = note.photos.length;
  return (
    <div onClick={() => go('detail', { noteId: note.id })} style={{
      position: 'relative', borderRadius: hero ? 26 : 20, overflow: 'hidden', cursor: 'pointer',
      height: hero ? 230 : 168,
      boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 10px 28px rgba(60,40,80,0.18)',
    }}>
      <Thumb id={note.photos[0]} radius={0} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.05) 100%)' }} />
      {count > 1 && (
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 9999, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="13" r="2.6" stroke="#fff" strokeWidth="2"/></svg>
          <span style={{ fontFamily: TYPE.mono, fontSize: 10, color: '#fff', fontWeight: 600 }}>{count}</span>
        </div>
      )}
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
        <div style={{ fontFamily: TYPE.mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>{relativeTime(note.createdAt)}</div>
        <div style={{ fontFamily: TYPE.display, fontWeight: 700, fontSize: hero ? 20 : 15, lineHeight: 1.15, color: '#fff', letterSpacing: -0.4, textShadow: '0 1px 8px rgba(0,0,0,0.4)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {note.title || 'Photos'}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ note, dark, subInk }) {
  const badge = {
    voice: { c: '#7755cc', bg: dark ? 'rgba(164,140,230,0.35)' : 'rgba(164,140,230,0.25)' },
    todo:  { c: '#2c8a68', bg: dark ? 'rgba(110,196,160,0.3)' : 'rgba(110,196,160,0.22)' },
    photo: { c: '#2a6fbf', bg: dark ? 'rgba(91,155,230,0.3)' : 'rgba(91,155,230,0.2)' },
    text:  null,
  }[note.kind];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {badge && <div style={{ width: 18, height: 18, borderRadius: 5, background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KindIcon kind={note.kind} color={dark ? '#fff' : badge.c} /></div>}
        <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.8, color: subInk, textTransform: 'uppercase' }}>
          {relativeTime(note.createdAt)}{note.duration > 0 ? ` · ${fmtDuration(note.duration)}` : ''}
        </span>
      </div>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}><path d="M9 6l6 6-6 6" stroke={dark ? '#fff' : '#222'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
}

function KindBody({ note, hero, dark, ink, subInk, accent }) {
  if (note.kind === 'todo') {
    const items = note.items || [];
    const done = items.filter(i => i.done).length;
    const pct = items.length ? (done / items.length) * 100 : 0;
    return (
      <div>
        {items.length > 0 && (
          <div style={{ height: 5, borderRadius: 3, background: dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.slice(0, hero ? 4 : 3).map(it => (
            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 15, height: 15, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${it.done ? accent : (dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.28)')}`, background: it.done ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {it.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </span>
              <span style={{ fontFamily: TYPE.ui, fontSize: 12.5, color: it.done ? subInk : ink, textDecoration: it.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.text || 'Item'}</span>
            </div>
          ))}
          {items.length === 0 && <span style={{ fontFamily: TYPE.ui, fontSize: 12.5, color: subInk, fontStyle: 'italic' }}>Empty checklist</span>}
        </div>
        {items.length > 0 && <span style={{ display: 'inline-block', marginTop: 8, fontFamily: TYPE.mono, fontSize: 9, letterSpacing: 0.8, color: subInk }}>{done} of {items.length} done</span>}
      </div>
    );
  }

  if (note.kind === 'voice') {
    return (
      <div>
        <div style={{ opacity: 0.75, marginBottom: note.text ? 8 : 0 }}>
          <Waveform color={dark ? '#fff' : '#5a4a6a'} bars={hero ? 30 : 18} height={hero ? 28 : 20} />
        </div>
        {note.text
          ? <div style={{ fontFamily: TYPE.ui, fontSize: hero ? 13.5 : 12, lineHeight: 1.5, color: subInk, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.text}</div>
          : <span style={{ fontFamily: TYPE.ui, fontSize: 12, color: subInk, fontStyle: 'italic' }}>Tap to play</span>}
      </div>
    );
  }

  const preview = note.text ? note.text.slice(0, hero ? 150 : 75) : '';
  return preview
    ? <div style={{ fontFamily: TYPE.ui, fontSize: hero ? 13.5 : 12, lineHeight: 1.5, color: subInk, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{preview}</div>
    : <span style={{ fontFamily: TYPE.ui, fontSize: 12, color: subInk, fontStyle: 'italic' }}>Empty note</span>;
}

function KindIcon({ kind, color }) {
  if (kind === 'voice') return <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="12" rx="3" fill={color}/></svg>;
  if (kind === 'todo')  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (kind === 'photo') return <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2" stroke={color} strokeWidth="2.5"/><circle cx="12" cy="13" r="3" stroke={color} strokeWidth="2.5"/></svg>;
  return null;
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
      <div style={{ fontFamily: TYPE.display, fontWeight: 700, fontSize: 24, color: ink, marginBottom: 8, letterSpacing: -0.5 }}>
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
