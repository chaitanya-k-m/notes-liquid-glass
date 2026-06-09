import React from 'react';

// App version — keep in sync with android/app/build.gradle versionName.
export const APP_VERSION = '1.0.4';

export const TYPE = {
  pixel:   `"VT323", "Courier New", monospace`,
  display: `"Bricolage Grotesque", system-ui, sans-serif`,
  serif:   `"Instrument Serif", "Cormorant Garamond", Georgia, serif`,
  script:  `"Pinyon Script", "Brush Script MT", cursive`,
  ui:      `"Geist", -apple-system, "SF Pro Text", system-ui, sans-serif`,
  mono:    `"Geist Mono", "SF Mono", ui-monospace, monospace`,
};

export const PALETTES = {
  sunset:   ['#fde2c8', '#f7c8d4', '#dccbf2', '#c4d8f5'],
  sage:     ['#dfe8db', '#cad6ce', '#b5c2b8', '#a4b1aa'],
  midnight: ['#1a1530', '#2a1f4a', '#3a2960', '#1f3050'],
  sand:     ['#f4e6cd', '#ecd2b1', '#d4b594', '#b89175'],
  ocean:    ['#dbeaf2', '#bcd6e3', '#9cb9d0', '#7e9bbc'],
  paper:    ['#ffffff', '#f6f6f8', '#efeff2', '#e9e9ed'],
  ink:      ['#0e0e12', '#15151b', '#1b1b22', '#101015'],
};

export function gradientCSS(stops, angle = 165) {
  return `linear-gradient(${angle}deg, ${stops.join(', ')})`;
}

export const CardStyle = React.createContext({ opacity: 0.55, mono: false });

// ── GradientBg ──────────────────────────────────────────────────────────────
export function GradientBg({ palette = 'sunset', children, style, grain = true }) {
  const stops = PALETTES[palette] || PALETTES.sunset;
  const isDark = palette === 'midnight';
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: gradientCSS(stops),
      overflow: 'hidden',
      pointerEvents: 'none',   // purely decorative — never intercept clicks
      ...style,
    }}>
      <div style={{
        position: 'absolute', top: '-15%', right: '-20%',
        width: 400, height: 400, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(140,100,200,0.5), transparent 70%)'
          : 'radial-gradient(circle, rgba(255,180,140,0.55), transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-25%',
        width: 500, height: 500, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(80,120,200,0.4), transparent 70%)'
          : 'radial-gradient(circle, rgba(180,200,255,0.5), transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '20%',
        width: 280, height: 280, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(200,150,220,0.25), transparent 70%)'
          : 'radial-gradient(circle, rgba(250,220,200,0.45), transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />
      {grain && (
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.18, mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

// ── GlassCard ───────────────────────────────────────────────────────────────
export function GlassCard({
  children, style = {}, radius = 28, tint, baseTint = '255,255,255',
  borderTint = 'rgba(255,255,255,0.55)', blur = 22, padding = 16,
  dark = false, onClick,
}) {
  const ctx = React.useContext(CardStyle);
  const resolvedTint = tint || `rgba(${ctx.mono ? '255,255,255' : baseTint},${ctx.opacity})`;
  return (
    <div onClick={onClick} style={{
      position: 'relative', borderRadius: radius, overflow: 'hidden',
      boxShadow: dark
        ? '0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 24px rgba(0,0,0,0.35)'
        : '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 24px rgba(80,60,90,0.12)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backdropFilter: `blur(${blur}px) saturate(160%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(160%)`,
        background: resolvedTint,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: radius, pointerEvents: 'none',
        border: `0.75px solid ${borderTint}`,
        boxShadow: dark
          ? 'inset 1px 1px 0.5px rgba(255,255,255,0.12), inset -1px -1px 0.5px rgba(255,255,255,0.05)'
          : 'inset 1px 1px 0.5px rgba(255,255,255,0.85), inset -1px -1px 0.5px rgba(255,255,255,0.35)',
      }} />
      <div style={{ position: 'relative', zIndex: 1, padding, height: '100%', boxSizing: 'border-box' }}>
        {children}
      </div>
    </div>
  );
}

// ── SoftPill ─────────────────────────────────────────────────────────────────
export function SoftPill({ children, active = false, dark = false, onClick, accent = '#fff36a', style = {} }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative', borderRadius: 9999, padding: '10px 18px',
      border: 'none', cursor: 'pointer',
      fontFamily: TYPE.ui, fontSize: 13.5, fontWeight: 600, letterSpacing: 0.1,
      color: dark ? '#fff' : '#262329',
      whiteSpace: 'nowrap',
      background: active
        ? accent
        : (dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)'),
      backdropFilter: 'blur(14px) saturate(170%)',
      WebkitBackdropFilter: 'blur(14px) saturate(170%)',
      boxShadow: active
        ? '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 14px rgba(220,200,80,0.35)'
        : (dark
            ? '0 1px 0 rgba(255,255,255,0.08) inset'
            : '0 1px 0 rgba(255,255,255,0.75) inset, 0 2px 8px rgba(80,60,90,0.06)'),
      ...style,
    }}>
      <span style={{ position: 'relative' }}>{children}</span>
    </button>
  );
}

// ── NotesMark — redesigned, more distinctive ─────────────────────────────────
// A rounded pill containing a stylised "n" with a small mic dot —
// communicates "notes + voice" at a glance without copying any brand.
export function NotesMark({ size = 40, dark = false }) {
  const ink = dark ? '#fff' : '#1a1322';
  const pillBg = dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.72)';
  const accentDot = '#a48ce6';
  const s = size;
  return (
    <div style={{
      width: s, height: s, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Pill container */}
      <div style={{
        width: s, height: s, borderRadius: s * 0.3,
        background: pillBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `0.75px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)'}`,
        boxShadow: dark
          ? 'inset 0 1px 0 rgba(255,255,255,0.12)'
          : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(80,60,90,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* "n" in pixel font */}
        <span style={{
          fontFamily: TYPE.pixel,
          fontSize: s * 0.52,
          color: ink,
          lineHeight: 1,
          letterSpacing: -1,
          paddingTop: 1,
          userSelect: 'none',
        }}>n</span>
        {/* Mic accent dot — bottom right */}
        <div style={{
          position: 'absolute',
          bottom: s * 0.1,
          right: s * 0.1,
          width: s * 0.18,
          height: s * 0.18,
          borderRadius: '50%',
          background: accentDot,
          boxShadow: `0 0 ${s * 0.1}px ${accentDot}88`,
        }} />
      </div>
    </div>
  );
}

// ── AppPhoto — real photo with stripe fallback ───────────────────────────────
// src: path under /photos/ e.g. "/photos/hero.jpg"
// Falls back to striped placeholder if the image 404s.
export function AppPhoto({ src, label = 'photo', style = {}, stripe = '#5b5b5b', bg = '#cfc8be' }) {
  const [failed, setFailed] = React.useState(false);
  const stripeCss = `repeating-linear-gradient(135deg, ${bg} 0 14px, ${stripe}22 14px 16px)`;

  if (failed || !src) {
    return (
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        background: stripeCss,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}>
        <span style={{
          fontFamily: TYPE.mono, fontSize: 10, letterSpacing: 1.5,
          color: '#3a3a3a', textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.65)',
          padding: '3px 8px', borderRadius: 4,
        }}>{label}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={label}
      onError={() => setFailed(true)}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover',
        ...style,
      }}
    />
  );
}

// Keep PlaceholderImage as alias for backwards compat
export function PlaceholderImage({ label = 'image', style = {}, stripe = '#5b5b5b', bg = '#cfc8be' }) {
  const stripeCss = `repeating-linear-gradient(135deg, ${bg} 0 14px, ${stripe}22 14px 16px)`;
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: stripeCss,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      {label && (
        <span style={{
          fontFamily: TYPE.mono, fontSize: 10, letterSpacing: 1.5,
          color: '#3a3a3a', textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.65)',
          padding: '3px 8px', borderRadius: 4,
        }}>{label}</span>
      )}
    </div>
  );
}

// ── Waveform ─────────────────────────────────────────────────────────────────
export function Waveform({ bars = 28, color = '#fff', active = false, height = 36, levels }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height }}>
      {Array.from({ length: bars }).map((_, i) => {
        const seed = Math.sin(i * 12.9898) * 43758.5453;
        const r = seed - Math.floor(seed);
        // Use live audio level if provided, otherwise static
        const liveScale = levels ? (levels[i % levels.length] || 0.3) : 1;
        const h = (8 + r * (height - 8)) * (active && levels ? liveScale : 1);
        return (
          <div key={i} style={{
            width: 3, height: Math.max(4, h), borderRadius: 2, background: color, opacity: 0.85,
            animation: active && !levels ? `wfPulse 0.9s ease-in-out ${i * 0.04}s infinite alternate` : 'none',
            transition: levels ? 'height 0.08s ease' : 'none',
          }} />
        );
      })}
      <style>{`@keyframes wfPulse { from { transform: scaleY(0.4); } to { transform: scaleY(1.15); } }`}</style>
    </div>
  );
}
