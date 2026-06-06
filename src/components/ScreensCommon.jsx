import React from 'react';
import { TYPE, NotesMark } from '../design-system.jsx';

// ── BottomDock — tab bar, no SVG filters (mobile compatibility) ──────────────
export function BottomDock({ onAdd, onMic, onSearch, dark = false, mobile = false }) {
  const bg = dark ? 'rgba(20,15,35,0.75)' : 'rgba(255,255,255,0.72)';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)';

  return (
    <div style={{
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: mobile ? 'max(20px, var(--sab, 20px))' : '20px',
      paddingTop: 10,
      paddingLeft: 24,
      paddingRight: 24,
      gap: 14,
    }}>
      {/* Search */}
      <DockButton onClick={onSearch} dark={dark} label="Search" bg={bg} border={border}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="6.5" stroke={dark ? '#fff' : '#1a1322'} strokeWidth="2"/>
          <path d="M16.5 16.5l3.5 3.5" stroke={dark ? '#fff' : '#1a1322'} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </DockButton>

      {/* Mic — primary action, larger */}
      <button
        onClick={() => { navigator.vibrate?.(8); onMic?.(); }}
        aria-label="Record voice note"
        style={{
          width: 64, height: 64, borderRadius: 32,
          border: 'none', cursor: 'pointer',
          background: 'linear-gradient(145deg, #b490f0, #6644b8)',
          boxShadow: '0 6px 22px rgba(102,68,184,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          flexShrink: 0,
          transition: 'transform 0.1s, box-shadow 0.1s',
          active: 'transform: scale(0.94)',
        }}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.94)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="3" width="6" height="12" rx="3" fill="#fff"/>
          <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Compose */}
      <DockButton onClick={onAdd} dark={dark} label="New note" bg={bg} border={border}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke={dark ? '#fff' : '#1a1322'} strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </DockButton>
    </div>
  );
}

function DockButton({ children, onClick, dark, label, bg, border }) {
  return (
    <button
      onClick={() => { navigator.vibrate?.(6); onClick?.(); }}
      aria-label={label}
      style={{
        width: 48, height: 48, borderRadius: 24,
        border: 'none', cursor: 'pointer',
        background: bg,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: `inset 0 0.5px 0 ${border}, 0 4px 14px rgba(60,40,80,0.13)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        flexShrink: 0,
        transition: 'transform 0.1s',
      }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.92)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
    </button>
  );
}

// ── ScreenHeader ──────────────────────────────────────────────────────────────
export function ScreenHeader({ title, dark = false, back, menu, eyebrow, titleFont = 'display', align = 'left' }) {
  const fonts = { display: TYPE.display, serif: TYPE.serif, pixel: TYPE.pixel };
  const ink = dark ? '#fff' : '#1a1322';
  return (
    <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 44 }}>
        {back
          ? <CircleBtn onClick={back} dark={dark} aria-label="Back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke={dark ? '#fff' : '#222'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CircleBtn>
          : <NotesMark dark={dark} />}
        {menu !== false && (
          <CircleBtn dark={dark} aria-label="Menu">
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
          margin: 0,
          fontFamily: fonts[titleFont] || TYPE.display,
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
export function CircleBtn({ children, onClick, dark = false, ...rest }) {
  return (
    <button
      onClick={onClick}
      {...rest}
      style={{
        width: 44, height: 44, borderRadius: 22,
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        boxShadow: dark
          ? 'inset 0 0 0 0.5px rgba(255,255,255,0.18)'
          : 'inset 0 0 0 0.5px rgba(255,255,255,0.9), 0 2px 8px rgba(80,60,90,0.08)',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 0.1s',
      }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.9)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
    </button>
  );
}
