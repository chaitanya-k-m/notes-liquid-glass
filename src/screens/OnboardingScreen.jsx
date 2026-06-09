import React from 'react';
import { TYPE, GlassCard, NotesMark } from '../design-system.jsx';

// First-launch swipe-through that shows what the app can do. Swipe (touch) or use
// the button to advance. Persisted via localStorage so it shows only once.

const SLIDES = [
  {
    art: (accent, dark) => <NotesMark size={72} dark={dark} />,
    kicker: 'Welcome',
    title: 'Notes that keep up\nwith your mind',
    body: 'Capture thoughts by voice, photo, or text — in a calm space that organizes itself.',
  },
  {
    art: () => <Emoji>🎙️</Emoji>,
    kicker: 'Voice notes',
    title: 'Speak it.\nWe write it down.',
    body: 'Record a voice memo and it’s transcribed to text automatically — right on your device. The audio is saved too, so you can replay it any time.',
  },
  {
    art: () => <Emoji>📷</Emoji>,
    kicker: 'Photo notes',
    title: 'Snap a photo,\nit tags itself',
    body: 'Photos are labeled on-device by what’s in them, so a picture of your whiteboard or a receipt turns up later when you search.',
  },
  {
    art: () => <Emoji>🔍</Emoji>,
    kicker: 'Smart search',
    title: 'Find it by meaning,\nnot just keywords',
    body: 'Search understands what you meant. Look for “trip ideas” and find the note where you wrote “places to visit” — plus checklists, themes, and more to make it yours.',
  },
];

function Emoji({ children }) {
  return (
    <div style={{
      width: 96, height: 96, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 46, background: 'linear-gradient(160deg, rgba(255,255,255,0.9), rgba(255,255,255,0.55))',
      boxShadow: '0 14px 34px rgba(90,60,130,0.22), inset 0 2px 0 rgba(255,255,255,0.7)',
    }}>{children}</div>
  );
}

export function OnboardingScreen({ dark = false, accent = '#a48ce6', gradient, onDone }) {
  const [i, setI] = React.useState(0);
  const startX = React.useRef(null);
  const last = SLIDES.length - 1;
  const ink = dark ? '#fff' : '#1a1322';
  const sub = dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.58)';

  const next = () => (i >= last ? onDone?.() : setI(i + 1));

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx < -45 && i < last) setI(i + 1);
    else if (dx > 45 && i > 0) setI(i - 1);
    startX.current = null;
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column',
        background: gradient || (dark ? '#1a1530' : '#f3e6d4'),
        paddingTop: 'max(18px, env(safe-area-inset-top, 18px))',
        paddingBottom: 'max(22px, env(safe-area-inset-bottom, 22px))',
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Skip */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px' }}>
        <button
          onClick={() => onDone?.()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, fontFamily: TYPE.ui, fontSize: 13.5, color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)', visibility: i === last ? 'hidden' : 'visible' }}
        >Skip</button>
      </div>

      {/* Sliding track */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: '100%', width: `${SLIDES.length * 100}%`, transform: `translateX(-${i * (100 / SLIDES.length)}%)`, transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
          {SLIDES.map((s, idx) => (
            <div key={idx} style={{ width: `${100 / SLIDES.length}%`, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
              <div style={{ marginBottom: 30 }}>{s.art(accent, dark)}</div>
              <div style={{ fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: 2.5, textTransform: 'uppercase', color: accent, marginBottom: 14 }}>{s.kicker}</div>
              <div style={{ fontFamily: TYPE.display, fontWeight: 500, fontSize: 30, lineHeight: 1.12, letterSpacing: -0.5, color: ink, marginBottom: 16, whiteSpace: 'pre-line' }}>{s.title}</div>
              <div style={{ fontFamily: TYPE.ui, fontSize: 15, lineHeight: 1.62, color: sub, maxWidth: 340 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 22 }}>
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{ width: idx === i ? 22 : 7, height: 7, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s', background: idx === i ? accent : (dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.16)') }}
          />
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 24px' }}>
        <button
          onClick={next}
          style={{
            width: '100%', padding: '16px', borderRadius: 18, border: 'none', cursor: 'pointer',
            background: dark ? 'rgba(255,255,255,0.92)' : 'rgba(40,30,55,0.92)',
            color: dark ? '#1a1322' : '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 15.5,
            boxShadow: '0 8px 22px rgba(60,40,90,0.25)',
          }}
        >{i === last ? 'Get started' : 'Next'}</button>
      </div>
    </div>
  );
}
