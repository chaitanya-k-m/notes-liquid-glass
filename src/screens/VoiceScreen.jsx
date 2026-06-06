import React from 'react';
import { TYPE, GlassCard, Waveform } from '../design-system.jsx';
import { ScreenHeader, CircleBtn } from '../components/ScreensCommon.jsx';
import { useNotes } from '../store/notes.jsx';

export function VoiceScreen({ go, dark = false }) {
  const { addNote } = useNotes();

  const [recording, setRecording]     = React.useState(false);
  const [seconds, setSeconds]         = React.useState(0);
  const [transcript, setTranscript]   = React.useState('');
  const [interimText, setInterimText] = React.useState('');
  const [levels, setLevels]           = React.useState(null);
  const [permissionDenied, setPermissionDenied] = React.useState(false);
  const [hasSpeechAPI, setHasSpeechAPI]         = React.useState(true);

  const recognitionRef   = React.useRef(null);
  const mediaStreamRef   = React.useRef(null);
  const animFrameRef     = React.useRef(null);
  const timerRef         = React.useRef(null);
  const savedTranscriptRef = React.useRef('');
  const secondsRef       = React.useRef(0);

  React.useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setHasSpeechAPI(false);
    return () => stopEverything();
  }, []);

  React.useEffect(() => { secondsRef.current = seconds; }, [seconds]);

  const stopEverything = () => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} recognitionRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    setLevels(null);
  };

  const startViz = (stream) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(buf);
      const bars = Array.from({ length: 38 }, (_, i) => (buf[Math.floor(i / 38 * buf.length)] / 255) * 0.9 + 0.1);
      setLevels(bars);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      startViz(stream);
      setRecording(true);
      setSeconds(0);
      savedTranscriptRef.current = transcript;
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        recognitionRef.current = rec;

        rec.onresult = (e) => {
          let interim = '';
          let final = savedTranscriptRef.current;
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i][0].transcript;
            if (e.results[i].isFinal) {
              final += (final ? ' ' : '') + t.trim();
              savedTranscriptRef.current = final;
              setTranscript(final);
              setInterimText('');
            } else { interim += t; }
          }
          if (interim) setInterimText(interim);
        };
        rec.onerror = (e) => { if (e.error === 'not-allowed') setPermissionDenied(true); };
        rec.onend = () => { if (recognitionRef.current) try { rec.start(); } catch {} };
        rec.start();
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') setPermissionDenied(true);
    }
  };

  const pauseRecording = () => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setLevels(null); setRecording(false); setInterimText('');
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
  };

  const handleToggle = () => recording ? pauseRecording() : startRecording();

  const handleSave = () => {
    const finalTranscript = transcript + (interimText ? ' ' + interimText : '');
    stopEverything();
    if (finalTranscript.trim() || seconds > 0) {
      const note = addNote({ transcript: finalTranscript.trim(), duration: secondsRef.current });
      go('detail', { noteId: note.id });
    } else {
      go('home');
    }
  };

  const handleDiscard = () => { stopEverything(); go('home'); };

  const fmt = (n) => `${String(Math.floor(n / 60)).padStart(2,'0')}:${String(n % 60).padStart(2,'0')}`;
  const displayTranscript = transcript + (interimText ? (transcript ? ' ' : '') + interimText : '');
  const wordCount = displayTranscript.split(/\s+/).filter(Boolean).length;

  if (permissionDenied) {
    return (
      <div style={{ position: 'relative', width: '100%', padding: '24px 22px' }}>
        <ScreenHeader dark={dark} back={() => go('home')} eyebrow="Microphone access needed" title="" />
        <GlassCard radius={20} padding={24} tint={dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'} style={{ marginTop: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎙️</div>
            <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 16, color: dark ? '#fff' : '#1a1322', marginBottom: 8 }}>Microphone blocked</div>
            <div style={{ fontFamily: TYPE.ui, fontSize: 13.5, lineHeight: 1.55, color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
              Allow microphone access in your browser settings, then reload the page.
            </div>
            <button onClick={() => go('home')} style={{ marginTop: 20, padding: '12px 24px', borderRadius: 9999, border: 'none', cursor: 'pointer', background: 'rgba(40,30,55,0.9)', color: '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14 }}>
              Back
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Scrollable area */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <ScreenHeader
          dark={dark}
          back={handleDiscard}
          eyebrow={recording ? '● recording' : seconds > 0 ? '○ paused — tap to continue' : 'Tap the button to start'}
        />

        {/* Timer + waveform */}
        <div style={{ position: 'relative', padding: '8px 0 0', textAlign: 'center' }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 320, height: 240, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,180,120,0.35) 0%, rgba(255,180,120,0) 60%)',
            filter: 'blur(30px)',
            animation: recording ? 'vBreathe 3.6s ease-in-out infinite alternate' : 'none',
            pointerEvents: 'none',
          }} />
          <div style={{ fontFamily: TYPE.display, fontSize: 72, fontWeight: 300, color: dark ? '#fff' : '#1a1322', letterSpacing: -4, lineHeight: 1, position: 'relative' }}>
            {fmt(seconds)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 8 }}>
            <Waveform color={dark ? '#fff' : '#2a1a40'} bars={38} active={recording} height={48} levels={recording ? levels : null} />
          </div>
          <div style={{ fontFamily: TYPE.serif, fontStyle: 'italic', fontSize: 15, lineHeight: 1.3, color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)', padding: '0 32px', marginBottom: 16 }}>
            {hasSpeechAPI ? 'Speak naturally — I\'ll transcribe in real time.' : 'Recording audio.'}
          </div>
        </div>

        {/* Live transcript */}
        <div style={{ padding: '0 18px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.5, textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>Live transcript</div>
            <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>{wordCount} words</div>
          </div>
          <GlassCard radius={20} padding={16} tint={dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'}>
            <div style={{ fontFamily: TYPE.ui, fontSize: 15, lineHeight: 1.6, color: dark ? '#fff' : '#1a1322', minHeight: 80 }}>
              {transcript && <span>{transcript} </span>}
              {interimText && <span style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>{interimText}</span>}
              {!displayTranscript && !recording && (
                <span style={{ color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.28)', fontStyle: 'italic' }}>Your words will appear here…</span>
              )}
              <span style={{ display: recording ? 'inline-block' : 'none', width: 2, height: 16, background: '#a4537a', marginLeft: 2, verticalAlign: 'middle', animation: 'caretBlink 0.9s steps(1) infinite' }} />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom controls — sticky */}
      <div style={{
        paddingBottom: `max(22px, var(--sab, 22px))`,
        paddingTop: 12,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20,
        flexShrink: 0,
      }}>
        <CircleBtn dark={dark} onClick={handleDiscard}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke={dark ? '#fff' : '#222'} strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </CircleBtn>

        <button onClick={handleToggle} style={{
          width: 76, height: 76, borderRadius: 9999, border: 'none', cursor: 'pointer',
          background: recording ? 'radial-gradient(circle at 30% 30%, #ff8a6b, #d24a3f)' : 'radial-gradient(circle at 30% 30%, #a48ce6, #6644b8)',
          boxShadow: recording ? '0 8px 24px rgba(210,74,63,0.4), inset 0 2px 0 rgba(255,255,255,0.25)' : '0 8px 24px rgba(90,60,180,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {recording
            ? <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ width: 6, height: 22, background: '#fff', borderRadius: 2 }} />
                <div style={{ width: 6, height: 22, background: '#fff', borderRadius: 2 }} />
              </div>
            : <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="3" width="6" height="12" rx="3" fill="#fff"/>
                <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
          }
        </button>

        <CircleBtn dark={dark} onClick={displayTranscript || seconds > 0 ? handleSave : undefined}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" opacity={displayTranscript || seconds > 0 ? 1 : 0.3}>
            <path d="M5 13l4 4L19 7" stroke={dark ? '#fff' : '#222'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </CircleBtn>
      </div>

      <style>{`
        @keyframes vBreathe { from{transform:translateX(-50%) scale(0.88);opacity:0.6} to{transform:translateX(-50%) scale(1.1);opacity:1} }
        @keyframes caretBlink { 50%{opacity:0} }
      `}</style>
    </div>
  );
}
