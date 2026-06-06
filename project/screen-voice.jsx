// screen-voice.jsx — Voice capture with cinematic pulsing glow

function VoiceScreen({ go, dark = false }) {
  const [recording, setRecording] = React.useState(true);
  const [seconds, setSeconds] = React.useState(0);
  const [transcript, setTranscript] = React.useState('');

  const target = "Remind me to call Maya about the studio lease tomorrow morning, and pick up oat milk on the way back home.";

  React.useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  React.useEffect(() => {
    if (!recording) return;
    let i = transcript.length;
    if (i >= target.length) return;
    const t = setTimeout(() => setTranscript(target.slice(0, i + 1)), 40);
    return () => clearTimeout(t);
  }, [transcript, recording]);

  const fmt = (n) => {
    const m = String(Math.floor(n / 60)).padStart(2, '0');
    const s = String(n % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ScreenHeader
        dark={dark}
        back={() => go('home')}
        eyebrow={recording ? 'Recording · live' : 'Paused · ready to review'}
        title=""
        titleFont="display"
      />

      {/* Cinematic timer + glow */}
      <div style={{ position: 'relative', marginTop: 18, height: 320 }}>
        {/* outermost glow */}
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,180,120,0.4) 0%, rgba(255,180,120,0) 60%)',
          filter: 'blur(30px)',
          animation: recording ? 'voiceBreathe 3.6s ease-in-out infinite alternate' : 'none',
        }} />
        {/* mid ring */}
        <div style={{
          position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,150,180,0.45) 0%, rgba(255,150,180,0) 65%)',
          filter: 'blur(22px)',
          animation: recording ? 'voiceBreathe 2.8s ease-in-out infinite alternate' : 'none',
        }} />

        {/* Timer */}
        <div style={{
          position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center',
        }}>
          <div style={{
            fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 2,
            textTransform: 'uppercase',
            color: dark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.5)',
            marginBottom: 6,
          }}>
            {recording ? '● recording' : '○ paused'}
          </div>
          <div style={{
            fontFamily: TYPE.display, fontSize: 84, fontWeight: 300,
            color: dark ? '#fff' : '#1a1322', letterSpacing: -4, lineHeight: 1,
            textShadow: '0 2px 24px rgba(255,255,255,0.4)',
          }}>{fmt(seconds)}</div>
        </div>

        {/* Waveform */}
        <div style={{
          position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          width: 260, display: 'flex', justifyContent: 'center',
        }}>
          <Waveform color={dark ? '#fff' : '#2a1a40'} bars={38} active={recording} height={56} />
        </div>
      </div>

      {/* Tip line */}
      <div style={{
        padding: '0 24px', textAlign: 'center', marginBottom: 14,
        fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400,
        fontSize: 17, lineHeight: 1.3, color: dark ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.6)',
      }}>
        Speak naturally — I'll punctuate, paragraph and tag.
      </div>

      {/* Live transcript */}
      <div style={{ padding: '0 22px 130px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 8,
        }}>
          <div style={{
            fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase',
            color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
          }}>Live transcript</div>
          <div style={{
            fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.6,
            color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
          }}>{transcript.split(' ').filter(Boolean).length} words</div>
        </div>
        <GlassCard
          radius={20} padding={18}
          tint={dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'}
        >
          <div style={{
            fontFamily: TYPE.ui, fontSize: 15, lineHeight: 1.55,
            color: dark ? '#fff' : '#1a1322', minHeight: 80,
          }}>
            {transcript}
            <span style={{
              display: 'inline-block', width: 2, height: 16, background: '#a4537a',
              marginLeft: 2, verticalAlign: 'middle',
              animation: 'caretBlink 0.9s steps(1) infinite',
            }} />
          </div>
        </GlassCard>
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute', bottom: 22, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20,
      }}>
        <CircleBtn dark={dark} onClick={() => go('home')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke={dark ? '#fff' : '#222'} strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </CircleBtn>

        <button onClick={() => setRecording(r => !r)} style={{
          width: 76, height: 76, borderRadius: 9999, border: 'none', cursor: 'pointer',
          background: recording
            ? 'radial-gradient(circle at 30% 30%, #ff8a6b, #d24a3f)'
            : 'radial-gradient(circle at 30% 30%, #f5f5f5, #d0d0d0)',
          boxShadow: recording
            ? '0 8px 24px rgba(210,74,63,0.45), inset 0 2px 0 rgba(255,255,255,0.25)'
            : '0 6px 20px rgba(0,0,0,0.18), inset 0 2px 0 rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {recording
            ? <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ width: 6, height: 22, background: '#fff', borderRadius: 2 }} />
                <div style={{ width: 6, height: 22, background: '#fff', borderRadius: 2 }} />
              </div>
            : <div style={{ width: 0, height: 0, borderLeft: '14px solid #1a1322', borderTop: '10px solid transparent', borderBottom: '10px solid transparent', marginLeft: 4 }} />}
        </button>

        <CircleBtn dark={dark} onClick={() => go('detail', { kind: 'thought' })}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke={dark ? '#fff' : '#222'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </CircleBtn>
      </div>

      <style>{`
        @keyframes voiceBreathe {
          from { transform: translateX(-50%) scale(0.88); opacity: 0.65; }
          to   { transform: translateX(-50%) scale(1.08); opacity: 1; }
        }
        @keyframes caretBlink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

Object.assign(window, { VoiceScreen });
