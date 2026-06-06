import React from 'react';
import { TYPE, GlassCard, NotesMark, Waveform } from '../design-system.jsx';

// ── BottomDock ───────────────────────────────────────────────────────────────
export function BottomDock({ onAdd, onMic, onSearch, dark = false, mobile = false }) {
  return (
    <div style={{
      position: mobile ? 'relative' : 'absolute',
      bottom: mobile ? undefined : 0,
      left: 0, right: 0,
      paddingBottom: mobile ? 'max(18px, var(--sab, 18px))' : '22px',
      paddingTop: 10,
      display: 'flex', justifyContent: 'center',
      zIndex: 30, pointerEvents: 'none',
      flexShrink: 0,
    }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div style={{ pointerEvents: 'auto', position: 'relative', filter: 'url(#goo)', display: 'flex', alignItems: 'center' }}>
        <button onClick={onAdd} aria-label="New note" style={{
          width: 56, height: 56, borderRadius: 9999, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.92)',
          boxShadow: '0 6px 18px rgba(60,40,80,0.18), inset 0 1px 0 rgba(255,255,255,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 3,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="#1a1322" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
        </button>

        <button onClick={onMic} aria-label="Voice note" style={{
          width: 56, height: 56, borderRadius: 9999, border: 'none', cursor: 'pointer',
          marginLeft: -12,
          background: 'radial-gradient(circle at 35% 30%, #a48ce6, #6644b8)',
          boxShadow: '0 6px 18px rgba(90,60,180,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 2,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="12" rx="3" fill="#fff"/>
            <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <button onClick={onSearch} aria-label="Search" style={{
          width: 40, height: 40, borderRadius: 9999, border: 'none', cursor: 'pointer',
          marginLeft: -10, marginTop: 22,
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 4px 12px rgba(60,40,80,0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 1,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6.5" stroke="#1a1322" strokeWidth="2.2"/>
            <path d="M16 16l4 4" stroke="#1a1322" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── ScreenHeader ─────────────────────────────────────────────────────────────
export function ScreenHeader({ title, dark = false, back, menu, eyebrow, titleFont = 'display', align = 'left' }) {
  const fonts = { display: TYPE.display, serif: TYPE.serif, pixel: TYPE.pixel };
  const ink = dark ? '#fff' : '#1a1322';
  return (
    <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 44 }}>
        {back
          ? <CircleBtn onClick={back} dark={dark}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke={dark ? '#fff' : '#222'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CircleBtn>
          : <NotesMark dark={dark} />}
        {menu !== false && (
          <CircleBtn dark={dark}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="12" r="1.8" fill={dark ? '#fff' : '#222'}/>
              <circle cx="12" cy="12" r="1.8" fill={dark ? '#fff' : '#222'}/>
              <circle cx="18" cy="12" r="1.8" fill={dark ? '#fff' : '#222'}/>
            </svg>
          </CircleBtn>
        )}
      </div>
      {eyebrow && (
        <div style={{
          fontFamily: TYPE.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.48)',
        }}>{eyebrow}</div>
      )}
      {title && (
        <h1 style={{
          margin: 0, fontFamily: fonts[titleFont] || TYPE.display,
          fontWeight: titleFont === 'serif' ? 400 : 700,
          fontStyle: titleFont === 'serif' ? 'italic' : 'normal',
          fontSize: titleFont === 'pixel' ? 38 : 40,
          lineHeight: 0.95, letterSpacing: titleFont === 'display' ? -1.5 : 0,
          color: ink, textAlign: align,
          textShadow: dark ? '0 2px 18px rgba(255,255,255,0.2)' : '0 2px 18px rgba(255,255,255,0.5)',
        }}>{title}</h1>
      )}
    </div>
  );
}

// ── CircleBtn ─────────────────────────────────────────────────────────────────
export function CircleBtn({ children, onClick, dark = false }) {
  return (
    <button onClick={onClick} style={{
      width: 44, height: 44, borderRadius: 9999, border: 'none',
      cursor: onClick ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(14px) saturate(180%)',
      WebkitBackdropFilter: 'blur(14px) saturate(180%)',
      boxShadow: dark
        ? 'inset 0 0 0 0.5px rgba(255,255,255,0.18)'
        : 'inset 0 0 0 0.5px rgba(255,255,255,0.85), 0 2px 8px rgba(80,60,90,0.07)',
    }}>{children}</button>
  );
}
