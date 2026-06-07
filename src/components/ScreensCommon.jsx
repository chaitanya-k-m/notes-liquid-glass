import React from 'react';
import { TYPE, NotesMark } from '../design-system.jsx';
import { loadBlob } from '../store/audioDB.js';

// ── Thumb — lazy-loads an image blob from IndexedDB ──────────────────────────
export function Thumb({ id, radius = 10, style = {} }) {
  const [url, setUrl] = React.useState(null);
  React.useEffect(() => {
    let revoked = false, obj;
    loadBlob(id).then(blob => {
      if (blob && !revoked) { obj = URL.createObjectURL(blob); setUrl(obj); }
    });
    return () => { revoked = true; if (obj) URL.revokeObjectURL(obj); };
  }, [id]);
  return (
    <div style={{
      borderRadius: radius,
      background: url ? `center/cover no-repeat url(${url})` : 'rgba(120,100,140,0.15)',
      ...style,
    }} />
  );
}

// ── NewSheet — bottom action sheet for creating notes ────────────────────────
export function NewSheet({ dark = false, onClose, go }) {
  const ink = dark ? '#fff' : '#1a1322';
  const cardBg = dark ? 'rgba(40,32,60,0.9)' : 'rgba(255,255,255,0.92)';

  const actions = [
    { key: 'text',  label: 'Write a note',  sub: 'Type freely',         grad: 'linear-gradient(150deg,#f0b86e,#d88a3a)', icon: <path d="M4 20h16M6 16l9-9 3 3-9 9H6v-3z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> },
    { key: 'todo',  label: 'Checklist',     sub: 'Tasks you can tick off', grad: 'linear-gradient(150deg,#6ec4a0,#2c8a68)', icon: <><path d="M4 6l2 2 3-3M4 13l2 2 3-3M4 20l2 2 3-3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 6h8M12 13h8M12 20h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></> },
    { key: 'photo', label: 'Photo note',    sub: 'Camera or gallery',   grad: 'linear-gradient(150deg,#5b9be6,#2a6fbf)', icon: <><rect x="3" y="6" width="18" height="14" rx="2" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="13" r="3.2" stroke="#fff" strokeWidth="2"/><path d="M8 6l1.5-2h5L16 6" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/></> },
    { key: 'voice', label: 'Voice note',    sub: 'Record & transcribe', grad: 'linear-gradient(150deg,#b490f0,#6644b8)', icon: <><rect x="9" y="3" width="6" height="12" rx="3" fill="#fff"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></> },
    { key: 'file',  label: 'Attach a file', sub: 'PDFs, docs & more',    grad: 'linear-gradient(150deg,#e08aa0,#c4567f)', icon: <path d="M14 3v5h5M14 3l5 5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/> },
  ];

  const pick = (key) => {
    if (key === 'voice') go('voice');
    else if (key === 'photo') go('detail', { draft: true, kind: 'photo', pickNow: true });
    else if (key === 'file') go('detail', { draft: true, kind: 'file', pickNow: true });
    else go('detail', { draft: true, kind: key });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(20,15,30,0.4)',
        backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        animation: 'sheetFade 0.2s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: cardBg,
          backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: '12px 16px',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
          animation: 'sheetUp 0.28s cubic-bezier(0.25,1,0.5,1) both',
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)', margin: '4px auto 14px' }} />
        <div style={{ fontFamily: TYPE.mono, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', padding: '0 6px 10px' }}>
          New
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {actions.map(a => (
            <button key={a.key} onClick={() => pick(a.key)} style={{
              display: 'flex', alignItems: 'center', gap: 14, width: '100%',
              padding: '12px', borderRadius: 18, border: 'none', cursor: 'pointer',
              background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
              textAlign: 'left',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: a.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">{a.icon}</svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 15, color: ink }}>{a.label}</div>
                <div style={{ fontFamily: TYPE.ui, fontSize: 12, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)' }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes sheetFade { from{opacity:0} to{opacity:1} }
        @keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>
    </div>
  );
}

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
export function ScreenHeader({ title, dark = false, back, menu, onMenu, eyebrow, titleFont = 'display', align = 'left' }) {
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
          <CircleBtn dark={dark} aria-label="Settings" onClick={onMenu}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 7h18M3 12h18M3 17h18" stroke={dark ? '#fff' : '#222'} strokeWidth="2" strokeLinecap="round"/>
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
