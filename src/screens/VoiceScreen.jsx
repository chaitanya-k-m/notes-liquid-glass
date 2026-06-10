import React from 'react';
import { TYPE } from '../design-system.jsx';
import { CircleBtn } from '../components/ScreensCommon.jsx';
import { useNotes } from '../store/notes.jsx';
import { useTheme } from '../store/theme.jsx';

// Voice note = a calm, keyboard-driven dictation surface. The app does no speech
// recognition itself — the user dictates with their own keyboard's voice typing
// (Gboard, Wispr Flow, etc.), which is far better than any in-WebView engine.
export function VoiceScreen({ go, dark = false }) {
  const { addNote } = useNotes();
  const { accent } = useTheme();
  const [body, setBody] = React.useState('');
  const taRef = React.useRef(null);

  // Try to open the keyboard right away (works on most devices since we arrived
  // from a tap). If it doesn't, the big field is one tap away.
  React.useEffect(() => {
    const t = setTimeout(() => { try { taRef.current?.focus(); } catch {} }, 350);
    return () => clearTimeout(t);
  }, []);

  function done() {
    const text = body.trim();
    if (!text) { go('home'); return; }
    const note = addNote({ kind: 'voice', text });
    go('detail', { noteId: note.id });
  }

  const ink    = dark ? '#fff' : '#1a1322';
  const subInk = dark ? 'rgba(255,255,255,0.7)' : 'rgba(40,30,55,0.7)';
  const empty  = body.trim().length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 4px', flexShrink: 0 }}>
        <CircleBtn dark={dark} onClick={() => go('home')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke={dark ? '#fff' : '#3a3340'} strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </CircleBtn>
        <button onClick={done} style={{
          padding: '9px 20px', borderRadius: 9999, border: 'none', cursor: 'pointer',
          background: accent, color: '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14,
          boxShadow: `0 4px 14px ${accent}66`,
        }}>Done</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column' }}>
        {/* Voice identity — warm glow + mic badge (decorative) */}
        <div style={{ position: 'relative', textAlign: 'center', paddingTop: 8, flexShrink: 0 }}>
          <div aria-hidden style={{
            position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
            width: 300, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,180,120,0.38) 0%, rgba(255,180,120,0) 62%)',
            filter: 'blur(28px)', pointerEvents: 'none',
            animation: 'vGlow 4s ease-in-out infinite alternate',
          }} />
          <div style={{
            position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 80, height: 80, borderRadius: '50%', marginBottom: 14,
            background: 'linear-gradient(160deg, #b490f0, #6644b8)',
            boxShadow: '0 10px 28px rgba(102,68,184,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="3" width="6" height="11" rx="3" fill="#fff"/>
              <path d="M6 11a6 6 0 0 0 12 0M12 17v3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span aria-hidden style={{ position: 'absolute', inset: -7, borderRadius: '50%', border: `2px solid ${accent}77` }} />
          </div>
          <div style={{ fontFamily: TYPE.mono, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(60,40,70,0.55)', marginBottom: 10, position: 'relative' }}>
            Voice Memo
          </div>
          <div style={{ fontFamily: TYPE.serif, fontStyle: 'italic', fontSize: 18, lineHeight: 1.35, color: subInk, padding: '0 40px', position: 'relative' }}>
            Speak freely — your words appear as you talk.
          </div>

          {/* Dictation hint — fades once there's text */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18,
            padding: '9px 15px', borderRadius: 9999,
            background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.55)',
            border: `0.75px solid ${dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.7)'}`,
            fontFamily: TYPE.ui, fontSize: 12.5, color: subInk,
            opacity: empty ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: 'none',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="3" width="6" height="11" rx="3" fill={accent}/>
              <path d="M6 11a6 6 0 0 0 12 0M12 17v3" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Tap your keyboard’s mic to dictate
          </div>
        </div>

        {/* Editable dictation surface */}
        <textarea
          ref={taRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start talking…"
          style={{
            flex: 1, minHeight: 160, margin: '20px 0 24px', padding: '0 26px',
            resize: 'none', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: TYPE.ui, fontSize: 17, lineHeight: 1.6, color: ink,
            width: '100%', boxSizing: 'border-box',
          }}
        />
      </div>

      <style>{`
        @keyframes vGlow { from{opacity:0.7;transform:translateX(-50%) scale(0.92)} to{opacity:1;transform:translateX(-50%) scale(1.06)} }
        textarea::placeholder { color: ${dark ? 'rgba(255,255,255,0.35)' : 'rgba(40,30,55,0.34)'}; font-style: italic; }
      `}</style>
    </div>
  );
}
