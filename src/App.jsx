import React from 'react';
import { NotesProvider } from './store/notes.jsx';
import { HomeScreen }    from './screens/HomeScreen.jsx';
import { DetailScreen }  from './screens/DetailScreen.jsx';
import { VoiceScreen }   from './screens/VoiceScreen.jsx';
import { SearchScreen }  from './screens/SearchScreen.jsx';

const SCREENS = {
  home:   HomeScreen,
  detail: DetailScreen,
  voice:  VoiceScreen,
  search: SearchScreen,
};

const GRADIENTS = {
  home:   'linear-gradient(160deg, #fde2c8 0%, #f7c8d4 45%, #dccbf2 100%)',
  voice:  'linear-gradient(160deg, #e8d5f5 0%, #d4bef0 50%, #c4d8f5 100%)',
  detail: 'linear-gradient(160deg, #fce8d4 0%, #f5d0e0 50%, #e0d4f0 100%)',
  search: 'linear-gradient(160deg, #dbeaf2 0%, #c4d8ea 50%, #d4d0e8 100%)',
};

export default function App() {
  const [screen, setScreen] = React.useState('home');
  const [payload, setPayload] = React.useState(null);
  const [dir, setDir]         = React.useState('forward');
  const [transKey, setTransKey] = React.useState(0);

  const go = React.useCallback((nextScreen, nextPayload = null) => {
    setDir(nextScreen === 'home' ? 'back' : 'forward');
    setScreen(nextScreen);
    setPayload(nextPayload);
    setTransKey(k => k + 1);
  }, []);

  const ScreenComp = SCREENS[screen] || HomeScreen;
  const bg = GRADIENTS[screen] || GRADIENTS.home;

  return (
    <NotesProvider>
      <div
        id="app-root"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: bg,
          transition: 'background 0.4s ease',
          display: 'flex',
          flexDirection: 'column',
          /* Safe area on all sides */
          paddingTop:    'env(safe-area-inset-top,    0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft:   'env(safe-area-inset-left,   0px)',
          paddingRight:  'env(safe-area-inset-right,  0px)',
          /* Prevent body scroll */
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs — position:absolute, pointerEvents:none, z-index:0 */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '-10%', right: '-15%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,180,140,0.45), transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: '-5%', left: '-20%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,200,255,0.4), transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Screen container — sits above blobs */}
        <div
          key={transKey}
          className={dir === 'back' ? 'screen-back' : 'screen-forward'}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <ScreenComp
            go={go}
            dark={false}
            payload={payload}
            mobile
            accent="#a48ce6"
            titleFont="display"
          />
        </div>
      </div>
    </NotesProvider>
  );
}
