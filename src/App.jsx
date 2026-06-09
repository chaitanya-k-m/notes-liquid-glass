import React from 'react';
import { ThemeProvider, useTheme } from './store/theme.jsx';
import { NotesProvider } from './store/notes.jsx';
import { NewSheet } from './components/ScreensCommon.jsx';
import { HomeScreen }    from './screens/HomeScreen.jsx';
import { DetailScreen }  from './screens/DetailScreen.jsx';
import { VoiceScreen }   from './screens/VoiceScreen.jsx';
import { SearchScreen }  from './screens/SearchScreen.jsx';
import { SettingsScreen } from './screens/SettingsScreen.jsx';
import { PaywallScreen } from './screens/PaywallScreen.jsx';
import { OnboardingScreen } from './screens/OnboardingScreen.jsx';

const SCREENS = {
  home: HomeScreen, detail: DetailScreen, voice: VoiceScreen,
  search: SearchScreen, settings: SettingsScreen, paywall: PaywallScreen,
};

function usePro() {
  const [pro, setProState] = React.useState(() => {
    try { return localStorage.getItem('pro_v1') === '1'; } catch { return false; }
  });
  const setPro = (v) => { try { localStorage.setItem('pro_v1', v ? '1' : '0'); } catch {} setProState(v); };
  return [pro, setPro];
}

function useOnboarded() {
  const [done, setDone] = React.useState(() => {
    try { return localStorage.getItem('onboarded_v1') === '1'; } catch { return false; }
  });
  const finish = () => { try { localStorage.setItem('onboarded_v1', '1'); } catch {} setDone(true); };
  return [done, finish];
}

function Shell() {
  const { gradient, dark, accent, palette } = useTheme();
  const [pro, setPro] = usePro();
  const [onboarded, finishOnboarding] = useOnboarded();
  const plain = palette === 'paper' || palette === 'ink';
  const [screen, setScreen]   = React.useState('home');
  const [payload, setPayload] = React.useState(null);
  const [dir, setDir]         = React.useState('forward');
  const [transKey, setTransKey] = React.useState(0);
  const [sheet, setSheet]     = React.useState(false);

  const go = React.useCallback((s, p = null) => {
    setDir(s === 'home' ? 'back' : 'forward');
    setScreen(s); setPayload(p); setTransKey(k => k + 1); setSheet(false);
  }, []);
  const openNew = React.useCallback(() => setSheet(true), []);

  // Handle PWA manifest shortcuts (?action=voice|write)
  React.useEffect(() => {
    try {
      const action = new URLSearchParams(window.location.search).get('action');
      if (action === 'voice') go('voice');
      else if (action === 'write') go('detail', { draft: true, kind: 'text' });
      if (action) window.history.replaceState({}, '', window.location.pathname);
    } catch {}
  }, [go]);

  const ScreenComp = SCREENS[screen] || HomeScreen;
  const props = { go, payload, dark, openNew, pro, setPro };

  return (
    <div id="app-root" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: gradient, transition: 'background 0.45s ease',
      display: 'flex', flexDirection: 'column',
      paddingTop:  'env(safe-area-inset-top, 0px)',
      paddingLeft: 'env(safe-area-inset-left, 0px)',
      paddingRight:'env(safe-area-inset-right, 0px)',
      overflow: 'hidden',
    }}>
      {/* Decorative, non-interactive — suppressed on the plain (paper/ink) palettes */}
      {!plain && <>
        <div aria-hidden style={{ position: 'absolute', top: '-10%', right: '-15%', width: 300, height: 300, borderRadius: '50%', background: dark ? 'radial-gradient(circle, rgba(150,110,210,0.4), transparent 70%)' : 'radial-gradient(circle, rgba(255,180,140,0.4), transparent 70%)', filter: 'blur(45px)', pointerEvents: 'none', zIndex: 0 }} />
        <div aria-hidden style={{ position: 'absolute', bottom: '-8%', left: '-20%', width: 380, height: 380, borderRadius: '50%', background: dark ? 'radial-gradient(circle, rgba(90,120,200,0.35), transparent 70%)' : 'radial-gradient(circle, rgba(180,200,255,0.4), transparent 70%)', filter: 'blur(55px)', pointerEvents: 'none', zIndex: 0 }} />
      </>}

      <div
        key={transKey}
        className={dir === 'back' ? 'screen-back' : 'screen-forward'}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}
      >
        <ScreenComp {...props} />
      </div>

      {sheet && <NewSheet dark={dark} onClose={() => setSheet(false)} go={go} />}

      {!onboarded && <OnboardingScreen dark={dark} accent={accent} gradient={gradient} onDone={finishOnboarding} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotesProvider>
        <Shell />
      </NotesProvider>
    </ThemeProvider>
  );
}
