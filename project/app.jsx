// app.jsx — Notes Android prototype

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "preset": "editorial",
  "palette": "sunset",
  "accent": "#fff36a",
  "titleFont": "display",
  "showGrain": true,
  "monochrome": false
}/*EDITMODE-END*/;

const PALETTE_KEYS = ['sunset', 'sage', 'midnight', 'sand', 'ocean'];
const TITLE_FONTS = ['display', 'serif', 'pixel'];

const PRESETS = {
  editorial: { palette: 'sunset',   accent: '#fff36a', titleFont: 'display', showGrain: false, monochrome: false },
  retro:     { palette: 'sand',     accent: '#f5b7c4', titleFont: 'pixel',   showGrain: true,  monochrome: false },
  quiet:     { palette: 'ocean',    accent: '#a4d3ff', titleFont: 'serif',   showGrain: false, monochrome: true  },
  midnight:  { palette: 'midnight', accent: '#e6c8ff', titleFont: 'display', showGrain: true,  monochrome: false },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = React.useState('home');
  const [payload, setPayload] = React.useState(null);
  const [transKey, setTransKey] = React.useState(0);

  const paletteKey = typeof t.palette === 'string' ? t.palette : 'sunset';
  const dark = paletteKey === 'midnight';

  const go = React.useCallback((s, p = null) => {
    setScreen(s);
    setPayload(p);
    setTransKey(k => k + 1);
  }, []);

  const applyPreset = (name) => {
    const p = PRESETS[name];
    if (!p) return;
    setTweak({ preset: name, ...p });
  };

  const screenProps = {
    go, dark, payload,
    accent: t.accent,
    mono: t.monochrome,
    titleFont: t.titleFont,
  };
  const ScreenComp = {
    home:     HomeScreen,
    detail:   DetailScreen,
    voice:    VoiceScreen,
    search:   SearchScreen,
    paywall:  PaywallScreen,
    files:    DetailScreen,
  }[screen] || HomeScreen;

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 16px 80px', boxSizing: 'border-box',
      background: 'radial-gradient(ellipse at top, #f4f0eb, #e6e0d6)',
      fontFamily: TYPE.ui,
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 1100, marginBottom: 22, textAlign: 'center' }}>
        <div style={{
          fontFamily: TYPE.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.45)', marginBottom: 6,
        }}>Notes · Android · liquid-glass</div>
        <div style={{
          fontFamily: TYPE.serif, fontStyle: 'italic', fontSize: 26, color: '#1a1322',
        }}>think out loud, find anything.</div>
      </div>

      {/* Phone (Android) */}
      <div style={{ position: 'relative' }}>
        <AndroidDevice dark={dark}>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <GradientBg palette={paletteKey} grain={t.showGrain} />
            <div
              key={transKey}
              style={{
                position: 'absolute', inset: 0, zIndex: 2, overflow: 'auto',
              }}
            >
              <ScreenComp {...screenProps} />
            </div>
          </div>
        </AndroidDevice>
        <style>{`
          @keyframes screenIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* Screen jump rail */}
      <div style={{
        marginTop: 22, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {[
          ['home', 'Home'],
          ['detail', 'Note'],
          ['voice', 'Voice'],
          ['search', 'Search'],
          ['paywall', 'Pro'],
        ].map(([key, label]) => (
          <button key={key} onClick={() => go(key)} style={{
            padding: '8px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer',
            fontFamily: TYPE.ui, fontWeight: 600, fontSize: 12.5,
            background: screen === key ? '#1a1322' : 'rgba(255,255,255,0.7)',
            color: screen === key ? '#fff' : '#1a1322',
            boxShadow: screen === key ? 'inset 0 1px 0 rgba(255,255,255,0.15)' : 'inset 0 0 0 0.5px rgba(0,0,0,0.08)',
          }}>{label}</button>
        ))}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Preset" />
        <TweakRadio
          label="Vibe"
          value={t.preset}
          options={['editorial', 'retro', 'quiet', 'midnight']}
          onChange={applyPreset}
        />

        <TweakSection label="Custom" />
        <TweakRadio
          label="Palette"
          value={paletteKey}
          options={PALETTE_KEYS}
          onChange={(v) => setTweak('palette', v)}
        />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={['#fff36a', '#a4d3ff', '#f5b7c4', '#c8f5b7', '#e6c8ff']}
          onChange={(v) => setTweak('accent', v)}
        />
        <TweakRadio
          label="Hero font"
          value={t.titleFont}
          options={TITLE_FONTS}
          onChange={(v) => setTweak('titleFont', v)}
        />
        <TweakToggle
          label="Film grain" value={t.showGrain}
          onChange={(v) => setTweak('showGrain', v)}
        />
        <TweakToggle
          label="Monochrome cards" value={t.monochrome}
          onChange={(v) => setTweak('monochrome', v)}
        />

        <TweakSection label="Navigate" />
        <TweakRadio
          label="Screen"
          value={screen}
          options={['home', 'detail', 'voice', 'search', 'paywall']}
          onChange={(v) => go(v)}
        />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
