// Native (Android/iOS) live speech-to-text via the OS speech engine — instant,
// accurate, free, no model download. Web-safe: isNativeSpeech is false off-device
// and the start/stop functions simply aren't used there.
import { Capacitor } from '@capacitor/core';

export const isNativeSpeech = (() => {
  try { return Capacitor.isNativePlatform(); } catch { return false; }
})();

let _plugin = null;
async function plugin() {
  if (_plugin) return _plugin;
  const mod = await import('@capacitor-community/speech-recognition');
  _plugin = mod.SpeechRecognition;
  return _plugin;
}

export async function speechAvailable() {
  if (!isNativeSpeech) return false;
  try {
    const p = await plugin();
    const r = await p.available();
    return !!(r && (r.available ?? r));
  } catch { return false; }
}

// Ensure RECORD_AUDIO / speech permission. Returns true if granted.
export async function ensureSpeechPermission() {
  const p = await plugin();
  try {
    if (p.checkPermissions) {
      const c = await p.checkPermissions();
      if (c.speechRecognition === 'granted') return true;
      const r = await p.requestPermissions();
      return r.speechRecognition === 'granted';
    }
  } catch { /* fall through to legacy API */ }
  try { await p.requestPermission(); return true; } catch { return false; }
}

// Start a continuous dictation session. `onText(fullText)` fires with the running
// transcript as the user speaks. Android's recognizer stops itself after a pause,
// so we commit the segment and restart to keep it continuous. Returns a controller
// with stop() → final text.
export async function startSpeechSession({ language = 'en-US', onText }) {
  const p = await plugin();
  let committed = '';
  let interim = '';
  let stopped = false;
  let restartTimer = null;

  const emit = () => onText(((committed ? committed + ' ' : '') + interim).trim());

  const partialL = await p.addListener('partialResults', (d) => {
    interim = (d && d.matches && d.matches[0]) || interim;
    emit();
  });

  const commitSegment = () => {
    if (interim) { committed = (committed ? committed + ' ' : '') + interim.trim(); interim = ''; emit(); }
  };

  const stateL = await p.addListener('listeningState', (d) => {
    if (d && d.status === 'stopped' && !stopped) {
      // Segment ended on silence — commit and restart for continuous capture.
      commitSegment();
      clearTimeout(restartTimer);
      restartTimer = setTimeout(() => {
        if (!stopped) p.start({ language, partialResults: true, popup: false }).catch(() => {});
      }, 250);
    }
  });

  await p.start({ language, partialResults: true, popup: false });

  return {
    async stop() {
      stopped = true;
      clearTimeout(restartTimer);
      try { await p.stop(); } catch { /* ignore */ }
      try { await partialL.remove(); } catch { /* ignore */ }
      try { await stateL.remove(); } catch { /* ignore */ }
      commitSegment();
      return committed.trim();
    },
  };
}
