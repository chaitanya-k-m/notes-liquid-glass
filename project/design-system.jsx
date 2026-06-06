// design-system.jsx
// Shared visual primitives for the Notes redesign.
// Exports (window): GlassCard, GradientBg, SoftPill, Asterisk, PlaceholderImage,
//   Waveform, type tokens (TYPE), palette helpers.

const TYPE = {
  pixel:    `"VT323", "Courier New", monospace`,
  display:  `"Bricolage Grotesque", system-ui, sans-serif`,
  serif:    `"Instrument Serif", "Cormorant Garamond", Georgia, serif`,
  script:   `"Pinyon Script", "Brush Script MT", cursive`,
  ui:       `"Geist", -apple-system, "SF Pro Text", system-ui, sans-serif`,
  mono:     `"Geist Mono", "SF Mono", ui-monospace, monospace`,
};

// Gradient palettes. Each is a list of stops for a linear gradient.
const PALETTES = {
  sunset:   ['#fde2c8', '#f7c8d4', '#dccbf2', '#c4d8f5'],   // peach → pink → lavender → sky
  sage:     ['#dfe8db', '#cad6ce', '#b5c2b8', '#a4b1aa'],   // muted greens
  midnight: ['#1a1530', '#2a1f4a', '#3a2960', '#1f3050'],   // deep dusk
  sand:     ['#f4e6cd', '#ecd2b1', '#d4b594', '#b89175'],   // warm sand
  ocean:    ['#dbeaf2', '#bcd6e3', '#9cb9d0', '#7e9bbc'],   // cool sky
};

function gradientCSS(stops, angle = 165) {
  return `linear-gradient(${angle}deg, ${stops.join(', ')})`;
}

// Card style context
const CardStyle = React.createContext({ opacity: 0.55, mono: false });

// ────────────────────────────────────────────────────────────
// GradientBg — soft animated gradient with subtle film grain
// ────────────────────────────────────────────────────────────
function GradientBg({ palette = 'sunset', children, style, grain = true }) {
  const stops = PALETTES[palette] || PALETTES.sunset;
  const isDark = palette === 'midnight';
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: gradientCSS(stops),
      overflow: 'hidden',
      ...style,
    }}>
      {/* Decorative blurred orbs to add depth */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-20%',
        width: 400, height: 400, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle, rgba(140,100,200,0.5), transparent 70%)'
                            : 'radial-gradient(circle, rgba(255,180,140,0.55), transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-25%',
        width: 500, height: 500, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle, rgba(80,120,200,0.4), transparent 70%)'
                            : 'radial-gradient(circle, rgba(180,200,255,0.5), transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '20%',
        width: 280, height: 280, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle, rgba(200,150,220,0.25), transparent 70%)'
                            : 'radial-gradient(circle, rgba(250,220,200,0.45), transparent 70%)',
        filter: 'blur(50px)',
      }} />
      {/* grain */}
      {grain && <div style={{
        position: 'absolute', inset: 0, opacity: 0.18, mixBlendMode: 'overlay',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        pointerEvents: 'none',
      }} />}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// GlassCard — frosted card with shine + edge highlight
// ────────────────────────────────────────────────────────────
function GlassCard({
  children, style = {}, radius = 28, tint, baseTint = '255,255,255',
  borderTint = 'rgba(255,255,255,0.55)', blur = 22, padding = 16,
  dark = false, onClick,
}) {
  const ctx = React.useContext(CardStyle);
  // If a tint is provided as a full color, use as-is; else build from baseTint + opacity
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
      }} />
      {/* edge */}
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

// Soft pill (tab/filter)
function SoftPill({ children, active = false, dark = false, onClick, accent = '#fff36a', style = {} }) {
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
        : (dark ? '0 1px 0 rgba(255,255,255,0.08) inset' : '0 1px 0 rgba(255,255,255,0.75) inset, 0 2px 8px rgba(80,60,90,0.06)'),
      ...style,
    }}>
      <span style={{ position: 'relative' }}>{children}</span>
    </button>
  );
}

// Asterisk / starburst logo mark (legacy)
function Asterisk({ size = 36, color = '#fff' }) {
  const lines = 12;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <g transform="translate(50,50)">
        {Array.from({ length: lines }).map((_, i) => {
          const a = (i / lines) * Math.PI * 2;
          const x = Math.cos(a) * 42;
          const y = Math.sin(a) * 42;
          return <line key={i} x1="0" y1="0" x2={x} y2={y}
            stroke={color} strokeWidth="6" strokeLinecap="round" />;
        })}
        <circle r="6" fill={color} />
      </g>
    </svg>
  );
}

// NotesMark — custom wordmark logo.
// A rounded square with a folded corner + "n." in pixel type.
// Original mark, ties into the type system.
function NotesMark({ size = 40, dark = false }) {
  const ink = dark ? '#fff' : '#1a1322';
  const bg = dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.65)';
  return (
    <div style={{
      width: size, height: size, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ position: 'absolute', inset: 0 }}>
        {/* rounded square with folded corner */}
        <path d="M6 4 H28 L36 12 V34 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 V6 a2 2 0 0 1 2 -2 Z"
          fill={bg}
          stroke={ink} strokeOpacity="0.85" strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
        />
        {/* the fold */}
        <path d="M28 4 V12 H36" fill="none" stroke={ink} strokeOpacity="0.85" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M28 4 L36 12" fill={dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'} />
      </svg>
      <div style={{
        position: 'relative', fontFamily: TYPE.pixel, fontSize: size * 0.5,
        color: ink, lineHeight: 1, paddingTop: 2,
        textShadow: dark ? '0 1px 0 rgba(0,0,0,0.3)' : '0 1px 0 rgba(255,255,255,0.6)',
      }}>n.</div>
    </div>
  );
}

// Striped image placeholder (per instructions: no fake imagery)
function PlaceholderImage({ label = 'image', style = {}, stripe = '#5b5b5b', bg = '#cfc8be' }) {
  const stripeCss = `repeating-linear-gradient(135deg, ${bg} 0 14px, ${stripe}22 14px 16px)`;
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

// Waveform — purely visual; pass `active` to animate
function Waveform({ bars = 28, color = '#fff', active = false, height = 36 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height }}>
      {Array.from({ length: bars }).map((_, i) => {
        // deterministic pseudo-random heights
        const seed = Math.sin(i * 12.9898) * 43758.5453;
        const r = seed - Math.floor(seed);
        const h = 8 + r * (height - 8);
        return (
          <div key={i} style={{
            width: 3, height: h, borderRadius: 2, background: color, opacity: 0.85,
            animation: active ? `wfPulse 0.9s ease-in-out ${i * 0.04}s infinite alternate` : 'none',
          }} />
        );
      })}
      <style>{`@keyframes wfPulse { from { transform: scaleY(0.4); } to { transform: scaleY(1.15); } }`}</style>
    </div>
  );
}

Object.assign(window, {
  TYPE, PALETTES, gradientCSS, CardStyle,
  GradientBg, GlassCard, SoftPill, Asterisk, NotesMark, PlaceholderImage, Waveform,
});
