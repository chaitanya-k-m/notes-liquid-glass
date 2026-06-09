import React from 'react';
import { TYPE, GlassCard, Waveform } from '../design-system.jsx';
import { ScreenHeader, CircleBtn } from '../components/ScreensCommon.jsx';
import { useNotes } from '../store/notes.jsx';
import { useTheme } from '../store/theme.jsx';
import { saveAudio } from '../store/audioDB.js';

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/mpeg'];
  for (const c of candidates) {
    try { if (MediaRecorder.isTypeSupported(c)) return c; } catch { /* skip */ }
  }
  return '';
}

const isNativeApp = (() => {
  try { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); }
  catch { return false; }
})();

export function VoiceScreen({ go, dark = false }) {
  const { addNote } = useNotes();
  const { accent } = useTheme();

  const [phase, setPhase]             = React.useState('idle'); // idle | recording | saving
  const [seconds, setSeconds]         = React.useState(0);
  const [transcript, setTranscript]   = React.useState('');
  const [interimText, setInterimText] = React.useState('');
  const [levels, setLevels]           = React.useState(null);
  const [permissionDenied, setPermissionDenied] = React.useState(false);

  // Transcription via the Web Speech API — the same mechanism the Search screen
  // uses, which works in the Android WebView. On the native app we DON'T also run
  // MediaRecorder (the recognizer needs the mic), so a voice note saves text only.
  // On the web build we additionally record the audio clip for playback.
  const hasSpeech = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const recordAudio = !isNativeApp;
  const supported = hasSpeech || recordAudio;

  const recognitionRef     = React.useRef(null);
  const mediaStreamRef     = React.useRef(null);
  const mediaRecorderRef   = React.useRef(null);
  const chunksRef          = React.useRef([]);
  const audioCtxRef        = React.useRef(null);
  const animFrameRef       = React.useRef(null);
  const timerRef           = React.useRef(null);
  const vizTimerRef        = React.useRef(null);
  const savedTranscriptRef = React.useRef('');
  const secondsRef         = React.useRef(0);
  const stoppingRef        = React.useRef(false);

  React.useEffect(() => () => cleanup(), []);
  React.useEffect(() => { secondsRef.current = seconds; }, [seconds]);

  function cleanup() {
    clearInterval(timerRef.current);
    clearInterval(vizTimerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} recognitionRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }
    setLevels(null);
  }

  function startViz(stream) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        setLevels(Array.from({ length: 38 }, (_, i) => (buf[Math.floor(i / 38 * buf.length)] / 255) * 0.9 + 0.1));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* viz is optional */ }
  }

  // A gentle animated waveform when we have no audio analyser (native path).
  function startFakeViz() {
    let ph = 0;
    vizTimerRef.current = setInterval(() => {
      ph += 0.3;
      setLevels(Array.from({ length: 38 }, (_, i) => 0.22 + 0.5 * Math.abs(Math.sin(ph + i * 0.35))));
    }, 90);
  }

  function startSpeech() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || 'en-US';
    recognitionRef.current = rec;
    rec.onresult = (e) => {
      let interim = '';
      let final = savedTranscriptRef.current;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          final += (final ? ' ' : '') + txt.trim();
          savedTranscriptRef.current = final;
          setTranscript(final);
          setInterimText('');
        } else { interim += txt; }
      }
      if (interim) setInterimText(interim);
    };
    rec.onerror = (e) => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setPermissionDenied(true); };
    // Android's recognizer auto-stops on silence — restart for continuous dictation.
    rec.onend = () => { if (recognitionRef.current && !stoppingRef.current) { try { rec.start(); } catch {} } };
    try { rec.start(); } catch { /* may throw if already started */ }
  }

  async function startRecording() {
    setPermissionDenied(false);

    // Web only: capture the audio clip for playback (desktop browsers handle the
    // mic + speech recognition together fine).
    if (recordAudio) {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        setPermissionDenied(true);
        return;
      }
      mediaStreamRef.current = stream;
      startViz(stream);
      const mime = pickMime();
      chunksRef.current = [];
      if (typeof MediaRecorder !== 'undefined') {
        try {
          const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
          mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
          mediaRecorderRef.current = mr;
          mr.start();
        } catch { mediaRecorderRef.current = null; }
      }
    } else {
      startFakeViz();
    }

    setPhase('recording');
    setSeconds(0);
    setTranscript('');
    setInterimText('');
    savedTranscriptRef.current = '';
    stoppingRef.current = false;
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);

    if (hasSpeech) startSpeech();
  }

  async function stopAndSave() {
    if (phase !== 'recording') return;
    stoppingRef.current = true;
    setPhase('saving');
    clearInterval(timerRef.current);
    clearInterval(vizTimerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setLevels(null);

    const finalText = (savedTranscriptRef.current + (interimText ? ' ' + interimText : '')).trim();
    const dur = secondsRef.current;

    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} recognitionRef.current = null; }

    // Finalize audio blob (web only)
    let blob = null;
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      blob = await new Promise((resolve) => {
        mr.onstop = () => {
          const type = mr.mimeType || 'audio/webm';
          resolve(chunksRef.current.length ? new Blob(chunksRef.current, { type }) : null);
        };
        try { mr.stop(); } catch { resolve(null); }
      });
    } else if (chunksRef.current.length) {
      blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    }

    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }

    if (!finalText && !blob && dur === 0) { go('home'); return; }

    const note = addNote({ kind: 'voice', text: finalText, duration: dur, hasAudio: !!blob });
    if (blob) await saveAudio(note.id, blob);
    go('detail', { noteId: note.id });
  }

  function discard() { if (phase === 'saving') return; cleanup(); go('home'); }

  const fmt = (n) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  const displayTranscript = transcript + (interimText ? (transcript ? ' ' : '') + interimText : '');
  const wordCount = displayTranscript.split(/\s+/).filter(Boolean).length;
  const recording = phase === 'recording';

  if (permissionDenied) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: '0 22px' }}>
        <ScreenHeader dark={dark} back={() => go('home')} eyebrow="Microphone needed" />
        <GlassCard radius={20} padding={24} tint={dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'} style={{ marginTop: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎙️</div>
            <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 16, color: dark ? '#fff' : '#1a1322', marginBottom: 8 }}>Microphone blocked</div>
            <div style={{ fontFamily: TYPE.ui, fontSize: 13.5, lineHeight: 1.55, color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
              Allow microphone access for this app in your device settings, then try again.
            </div>
            <button onClick={() => { setPermissionDenied(false); }} style={{ marginTop: 20, padding: '12px 24px', borderRadius: 9999, border: 'none', cursor: 'pointer', background: 'rgba(40,30,55,0.9)', color: '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14 }}>Try again</button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <ScreenHeader
          dark={dark}
          back={discard}
          eyebrow={recording ? '● recording' : phase === 'saving' ? 'saving…' : 'Tap the mic to start'}
        />

        <div style={{ position: 'relative', padding: '8px 0 0', textAlign: 'center' }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 320, height: 240, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,180,120,0.35) 0%, rgba(255,180,120,0) 60%)',
            filter: 'blur(30px)', pointerEvents: 'none',
            animation: recording ? 'vBreathe 3.6s ease-in-out infinite alternate' : 'none',
          }} />
          <div style={{ fontFamily: TYPE.mono, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', marginBottom: 10, position: 'relative' }}>
            Voice Memo
          </div>
          <div style={{ fontFamily: TYPE.display, fontSize: 72, fontWeight: 300, color: dark ? '#fff' : '#1a1322', letterSpacing: -4, lineHeight: 1, position: 'relative' }}>
            {fmt(seconds)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 8 }}>
            <Waveform color={dark ? '#fff' : '#2a1a40'} bars={38} active={recording} height={48} levels={recording ? levels : null} />
          </div>
          <div style={{ fontFamily: TYPE.serif, fontStyle: 'italic', fontSize: 15, lineHeight: 1.3, color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)', padding: '0 32px', marginBottom: 16 }}>
            {hasSpeech
              ? 'Speak naturally — your words appear below in real time.'
              : 'Recording your voice memo…'}
          </div>
        </div>

        {hasSpeech && (
          <div style={{ padding: '0 18px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.5, textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>Live transcript</div>
              <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>{wordCount} words</div>
            </div>
            <GlassCard radius={20} padding={16} tint={dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'}>
              <div style={{ fontFamily: TYPE.ui, fontSize: 15, lineHeight: 1.6, color: dark ? '#fff' : '#1a1322', minHeight: 72 }}>
                {transcript && <span>{transcript} </span>}
                {interimText && <span style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>{interimText}</span>}
                {!displayTranscript && <span style={{ color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.28)', fontStyle: 'italic' }}>{recording ? 'Listening…' : 'Your words will appear here…'}</span>}
                <span style={{ display: recording ? 'inline-block' : 'none', width: 2, height: 16, background: accent, marginLeft: 2, verticalAlign: 'middle', animation: 'caretBlink 0.9s steps(1) infinite' }} />
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ paddingBottom: 'max(22px, env(safe-area-inset-bottom, 22px))', paddingTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, flexShrink: 0 }}>
        <CircleBtn dark={dark} onClick={discard}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke={dark ? '#fff' : '#222'} strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </CircleBtn>

        <button
          onClick={() => { navigator.vibrate?.(10); recording ? stopAndSave() : startRecording(); }}
          disabled={phase === 'saving'}
          style={{
            width: 80, height: 80, borderRadius: 40, border: 'none', cursor: 'pointer',
            background: recording ? 'radial-gradient(circle at 30% 30%, #ff8a6b, #d24a3f)' : 'radial-gradient(circle at 30% 30%, #b490f0, #6644b8)',
            boxShadow: recording ? '0 8px 26px rgba(210,74,63,0.45), inset 0 2px 0 rgba(255,255,255,0.25)' : '0 8px 26px rgba(102,68,184,0.45), inset 0 2px 0 rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: phase === 'saving' ? 0.6 : 1, transition: 'transform 0.1s',
          }}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.94)'}
          onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {recording
            ? <div style={{ width: 26, height: 26, borderRadius: 6, background: '#fff' }} />
            : <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="3" width="6" height="12" rx="3" fill="#fff"/>
                <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>}
        </button>

        {/* spacer to balance layout */}
        <div style={{ width: 44 }} />
      </div>

      <style>{`
        @keyframes vBreathe { from{transform:translateX(-50%) scale(0.88);opacity:0.6} to{transform:translateX(-50%) scale(1.1);opacity:1} }
        @keyframes caretBlink { 50%{opacity:0} }
      `}</style>
    </div>
  );
}
