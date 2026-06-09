import React from 'react';
import { PALETTES } from '../design-system.jsx';

// Theme presets matching the original design language.
export const PRESETS = {
  editorial: { label: 'Editorial', palette: 'sunset',   accent: '#a48ce6', dark: false },
  retro:     { label: 'Retro',     palette: 'sand',     accent: '#e08aa0', dark: false },
  quiet:     { label: 'Quiet',     palette: 'ocean',    accent: '#5b9be6', dark: false },
  midnight:  { label: 'Midnight',  palette: 'midnight', accent: '#c4a0ff', dark: true  },
  light:     { label: 'Light',     palette: 'paper',    accent: '#a48ce6', dark: false },
  dark:      { label: 'Dark',      palette: 'ink',      accent: '#b49cf0', dark: true  },
};

const KEY = 'theme_v1';
const Ctx = React.createContext(null);

function load() {
  const base = { preset: 'editorial', ...PRESETS.editorial };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...base, ...saved };
  } catch { return base; }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(load);

  const stops = PALETTES[theme.palette] || PALETTES.sunset;
  const gradient = `linear-gradient(160deg, ${stops.join(', ')})`;

  React.useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(theme)); } catch { /* quota */ }
    // keep the browser/status bar UI in sync with the active palette
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', stops[0]);
  }, [theme, stops]);

  const setPreset = (name) => { const p = PRESETS[name]; if (p) setTheme({ preset: name, palette: p.palette, accent: p.accent, dark: p.dark }); };
  const setPalette = (palette) => setTheme(t => ({ ...t, palette, preset: 'custom' }));
  const setAccent  = (accent)  => setTheme(t => ({ ...t, accent, preset: 'custom' }));
  const setDark    = (dark)    => setTheme(t => ({ ...t, dark }));

  const value = {
    theme, preset: theme.preset, palette: theme.palette,
    dark: !!theme.dark, accent: theme.accent, gradient,
    setPreset, setPalette, setAccent, setDark,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => React.useContext(Ctx);
