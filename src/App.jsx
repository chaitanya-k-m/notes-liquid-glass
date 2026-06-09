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
import { TYPE } from './design-system.jsx';
import { hideSplash, registerBackButton, exitApp } from './native.js';

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
  const [exitHint, setExitHint] = React.useState(false);

  const go = React.useCallback((s, p = null) => {
    setDir(s === 'home' ? 'back' : 'forward');
    setScreen(s); setPayload(p); setTransKey(k => k + 1); setSheet(false);
  }, []);
  const openNew = React.useCallback(() => setSheet(true), []);

  // Hide the native splash once the app has rendered.
  React.useEffect(() => { hideSplash(); }, []);

  // Handle PWA manifest shortcuts (?action=voice|write)
  React.useEffect(() => {
    try {
      const action = new URLSearchParams(window.location.search).get('action');
      if (action === 'voice') go('voice');
      else if (action === 'write') go('detail', { draft: true, kind: 'text' });
      if (action) window.history.replaceState({}, '', window.location.pathname);
    } catch {}
  }, [go]);

  // Android hardware/gesture back button → navigate within the app instead of
  // exiting. Refs keep the once-registered handler reading the latest state.
  const stateRef = React.useRef({});
  stateRef.current = { screen, sheet, onboarded };
  const lastBackRef = React.useRef(0);
  React.useEffect(() => {
    const maybeExit = () => {
      const now = Date.now();
      if (now - lastBackRef.current < 2000) { exitApp(); }
      else { lastBackRef.current = now; setExitHint(true); setTimeout(() => setExitHint(false), 2000); }
    };
    return registerBackButton(() => {
      const s = stateRef.current;
      if (s.sheet) { setSheet(false); return; }
      if (!s.onboarded) { maybeExit(); return; }
      if (s.screen !== 'home') { go('home'); return; }
      maybeExit();
    });
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

      {exitHint && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 'max(28px, env(safe-area-inset-bottom, 28px))',
          transform: 'translateX(-50%)', zIndex: 60, pointerEvents: 'none',
          padding: '10px 18px', borderRadius: 9999,
          background: 'rgba(20,15,30,0.85)', color: '#fff',
          fontFamily: TYPE.ui, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        }}>Press back again to exit</div>
      )}
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
