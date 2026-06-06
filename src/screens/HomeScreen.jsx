import React from 'react';
import { TYPE, GlassCard, SoftPill } from '../design-system.jsx';
import { ScreenHeader, BottomDock } from '../components/ScreensCommon.jsx';
import { useNotes, relativeTime, fmtDuration } from '../store/notes.jsx';

const TABS = ['All', 'Voice', 'Recent'];

export function HomeScreen({ go, dark = false, accent = '#fff36a', mono = false, titleFont = 'display', mobile = false }) {
  const { notes } = useNotes();
  const [tab, setTab] = React.useState('All');

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const filtered = notes.filter(n => {
    if (tab === 'Voice') return n.kind === 'voice';
    if (tab === 'Recent') return (Date.now() - new Date(n.createdAt)) < 86400000;
    return true;
  });

  const ink = dark ? '#fff' : '#1a1322';
  const subInk = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <ScreenHeader
          title="Notes"
          dark={dark}
          titleFont={titleFont}
          eyebrow={today}
          menu
        />

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 22px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <SoftPill key={t} active={tab === t} onClick={() => setTab(t)} dark={dark} accent={accent}>{t}</SoftPill>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState dark={dark} tab={tab} onRecord={() => go('voice')} onWrite={() => go('detail', { draft: true })} />
        ) : (
          <NotesList notes={filtered} go={go} dark={dark} ink={ink} subInk={subInk} />
        )}

        {/* Bottom padding so last card isn't behind dock */}
        <div style={{ height: 110 }} />
      </div>

      {/* Bottom dock — sticky at bottom, respects home indicator */}
      <BottomDock
        dark={dark}
        onAdd={() => go('detail', { draft: true })}
        onMic={() => go('voice')}
        onSearch={() => go('search')}
        mobile={mobile}
      />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ dark, tab, onRecord, onWrite }) {
  const ink = dark ? '#fff' : '#1a1322';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px 0', textAlign: 'center' }}>
      {/* Pulsing mic orb */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <div style={{
          position: 'absolute', inset: -16,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(164,140,230,0.35), transparent 70%)',
          animation: 'emptyPulse 3s ease-in-out infinite',
        }} />
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          border: `0.75px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)'}`,
          boxShadow: '0 8px 24px rgba(164,140,230,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
        }} onClick={onRecord}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="12" rx="3" fill={dark ? '#fff' : '#1a1322'}/>
            <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke={dark ? '#fff' : '#1a1322'} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div style={{ fontFamily: TYPE.display, fontWeight: 700, fontSize: 24, color: ink, marginBottom: 10, letterSpacing: -0.5 }}>
        {tab === 'Recent' ? 'Nothing recent' : tab === 'Voice' ? 'No voice notes yet' : 'No notes yet'}
      </div>
      <div style={{ fontFamily: TYPE.ui, fontSize: 15, lineHeight: 1.55, color: sub, maxWidth: 240 }}>
        {tab === 'All' ? 'Tap the mic and speak your first thought. It\'ll appear here instantly.' : 'Record a voice note and it\'ll show up here.'}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
        <button onClick={onRecord} style={{
          padding: '14px 24px', borderRadius: 9999, border: 'none', cursor: 'pointer',
          background: dark ? 'rgba(255,255,255,0.9)' : 'rgba(30,20,50,0.88)',
          color: dark ? '#1a1322' : '#fff',
          fontFamily: TYPE.ui, fontWeight: 600, fontSize: 15,
          boxShadow: '0 6px 18px rgba(80,60,100,0.25)',
        }}>Record</button>
        <button onClick={onWrite} style={{
          padding: '14px 24px', borderRadius: 9999, cursor: 'pointer',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'}`,
          background: 'transparent', color: ink,
          fontFamily: TYPE.ui, fontWeight: 600, fontSize: 15,
        }}>Write</button>
      </div>
      <style>{`@keyframes emptyPulse { 0%,100%{transform:scale(0.9);opacity:0.6} 50%{transform:scale(1.15);opacity:1} }`}</style>
    </div>
  );
}

// ── Notes list ────────────────────────────────────────────────────────────────
function NotesList({ notes, go, dark, ink, subInk }) {
  const [hero, ...rest] = notes;

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Hero card — latest note, large */}
      <NoteCard note={hero} go={go} dark={dark} ink={ink} subInk={subInk} size="hero" />

      {/* Rest in 2-col grid */}
      {rest.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {rest.map(n => (
            <NoteCard key={n.id} note={n} go={go} dark={dark} ink={ink} subInk={subInk} size="small" />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single note card ──────────────────────────────────────────────────────────
function NoteCard({ note, go, dark, ink, subInk, size = 'small' }) {
  const isHero = size === 'hero';
  const isVoice = note.kind === 'voice';
  const preview = note.text
    ? note.text.slice(0, isHero ? 120 : 60) + (note.text.length > (isHero ? 120 : 60) ? '…' : '')
    : (isVoice ? 'Voice recording' : '');

  const tint = dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)';

  return (
    <GlassCard
      radius={isHero ? 26 : 20}
      padding={isHero ? 20 : 14}
      tint={tint}
      style={{ cursor: 'pointer', minHeight: isHero ? 130 : 100 }}
      onClick={() => go('detail', { noteId: note.id })}
    >
      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isVoice && (
            <div style={{
              width: 18, height: 18, borderRadius: 4,
              background: dark ? 'rgba(164,140,230,0.35)' : 'rgba(164,140,230,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="3" width="6" height="12" rx="3" fill={dark ? '#d4c0ff' : '#7755cc'}/>
              </svg>
            </div>
          )}
          <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.8, color: subInk, textTransform: 'uppercase' }}>
            {relativeTime(note.createdAt)}{note.duration > 0 ? ` · ${fmtDuration(note.duration)}` : ''}
          </span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.35 }}>
          <path d="M9 6l6 6-6 6" stroke={dark ? '#fff' : '#222'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: TYPE.ui, fontWeight: 600,
        fontSize: isHero ? 17 : 14,
        lineHeight: 1.3, color: ink, marginBottom: preview ? 6 : 0,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {note.title}
      </div>

      {/* Preview text */}
      {preview && (
        <div style={{
          fontFamily: TYPE.ui, fontSize: isHero ? 13.5 : 12,
          lineHeight: 1.5, color: subInk,
          display: '-webkit-box', WebkitLineClamp: isHero ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {preview}
        </div>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
          {note.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: TYPE.mono, fontSize: 9, letterSpacing: 0.8,
              padding: '2px 7px', borderRadius: 9999,
              background: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)',
              color: subInk, textTransform: 'uppercase',
            }}>#{tag}</span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
