// screen-search.jsx — Natural language search with type-differentiated results

function SearchScreen({ go, dark = false, accent = '#fff36a' }) {
  const [query, setQuery] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const suggestions = [
    { q: 'notes from my Lisbon trip last spring', icon: '✈' },
    { q: 'voice memos where I mentioned Maya',     icon: '🎙' },
    { q: 'recipes I saved in March',               icon: '🍋' },
    { q: 'anything tagged #design with photos',    icon: '✦' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <ScreenHeader
        dark={dark}
        back={() => go('home')}
        eyebrow="Ask in your own words"
        title="Search"
        titleFont="serif"
      />

      {/* Search input */}
      <div style={{ padding: '18px 22px 12px' }}>
        <GlassCard
          radius={18} padding={4}
          tint={dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="6.5" stroke={dark ? '#fff' : '#222'} strokeWidth="2"/>
              <path d="M16 16l4 4" stroke={dark ? '#fff' : '#222'} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSubmitted(true)}
              placeholder="What are you looking for?"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: TYPE.ui, fontSize: 15, color: dark ? '#fff' : '#1a1322',
                padding: '10px 0',
              }}
            />
            <button onClick={() => go('voice')} style={{
              width: 34, height: 34, borderRadius: 9999, border: 'none', cursor: 'pointer',
              background: 'radial-gradient(circle at 35% 30%, #a48ce6, #6644b8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(90,60,180,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="3" width="6" height="12" rx="3" fill="#fff"/>
                <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </GlassCard>
      </div>

      {!submitted && (
        <div style={{ padding: '10px 22px 100px' }}>
          <div style={{
            fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase',
            color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)', marginBottom: 10,
          }}>Try asking</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestions.map(({ q, icon }) => (
              <button key={q} onClick={() => { setQuery(q); setSubmitted(true); }} style={{
                textAlign: 'left', padding: '14px 16px', borderRadius: 16,
                border: 'none', cursor: 'pointer',
                background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: dark ? 'inset 0 0 0 0.5px rgba(255,255,255,0.1)'
                                : 'inset 0 0 0 0.5px rgba(255,255,255,0.7)',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 9999, flexShrink: 0,
                  background: 'rgba(0,0,0,0.06)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>{icon}</div>
                <div style={{
                  fontFamily: TYPE.serif, fontStyle: 'italic', fontSize: 16,
                  color: dark ? '#fff' : '#1a1322', lineHeight: 1.25,
                }}>"{q}"</div>
              </button>
            ))}
          </div>

          <div style={{
            marginTop: 22, padding: '12px 14px', borderRadius: 14,
            background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ fontSize: 20 }}>💡</div>
            <div style={{
              fontFamily: TYPE.ui, fontSize: 12, lineHeight: 1.4,
              color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
            }}>
              Search understands context — try dates, people, places, or feelings.
            </div>
          </div>
        </div>
      )}

      {submitted && (
        <div style={{ padding: '8px 22px 100px' }}>
          {/* AI summary */}
          <GlassCard
            radius={18} padding={16}
            tint={dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)'}
            style={{ marginBottom: 14 }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
              fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase',
              color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)',
            }}>
              <NotesMark size={18} dark={dark} /> Summary · 3 notes
            </div>
            <div style={{
              fontFamily: TYPE.serif, fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.4,
              color: dark ? '#fff' : '#1a1322',
            }}>
              You took 3 notes during your Lisbon trip in March — a voice memo from a sardine spot, a written reflection from Alfama at sunset, and a photo set of azulejos from Belém.
            </div>
          </GlassCard>

          <div style={{
            fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase',
            color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)', margin: '4px 4px 10px',
          }}>Matches</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <VoiceResult
              title="Tasca down the alley"
              duration="2:18"
              date="18 Mar"
              tag="LISBON"
              snippet="The grilled sardines at that tiny <em>Lisbon</em> place — Maya kept asking about the olive oil…"
              dark={dark}
              onClick={() => go('detail', { kind: 'thought' })}
            />
            <TextResult
              title="Notes from Alfama"
              date="22 Mar"
              tag="LISBON"
              snippet="Climbed up to the miradouro at sunset. The light on the <em>Tagus</em> looked unreal."
              dark={dark}
              onClick={() => go('detail', { kind: 'thought' })}
            />
            <PhotoResult
              title="Tile patterns"
              date="20 Mar"
              tag="LISBON"
              count={8}
              snippet="Azulejos from Belém — palette inspiration for the studio brand."
              dark={dark}
              onClick={() => go('detail', { kind: 'snapshots' })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Voice result — inline waveform + duration
function VoiceResult({ title, duration, date, tag, snippet, dark, onClick }) {
  return (
    <GlassCard radius={18} padding={14} onClick={onClick}
      tint={dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}
    >
      <ResultHeader title={title} date={date} dark={dark} />
      <Snippet html={snippet} dark={dark} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9999, flexShrink: 0,
          background: 'radial-gradient(circle at 35% 30%, #a48ce6, #6644b8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 8px rgba(90,60,180,0.3)',
        }}>
          <svg width="10" height="10" viewBox="0 0 14 14"><polygon points="3,1 12,7 3,13" fill="#fff"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <Waveform color={dark ? 'rgba(255,255,255,0.7)' : '#5d3fb0'} height={22} bars={20} />
        </div>
        <div style={{
          fontFamily: TYPE.mono, fontSize: 10, letterSpacing: 0.6,
          color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
        }}>{duration}</div>
      </div>
      <KindRow kind="voice" tag={tag} dark={dark} />
    </GlassCard>
  );
}

// Text result
function TextResult({ title, date, tag, snippet, dark, onClick }) {
  return (
    <GlassCard radius={18} padding={14} onClick={onClick}
      tint={dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}
    >
      <ResultHeader title={title} date={date} dark={dark} />
      <Snippet html={snippet} dark={dark} size="md" />
      <KindRow kind="text" tag={tag} dark={dark} />
    </GlassCard>
  );
}

// Photo result — thumb strip
function PhotoResult({ title, date, tag, snippet, count, dark, onClick }) {
  return (
    <GlassCard radius={18} padding={14} onClick={onClick}
      tint={dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}
    >
      <ResultHeader title={title} date={date} dark={dark} />
      <Snippet html={snippet} dark={dark} />
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: 50, borderRadius: 8, overflow: 'hidden',
            position: 'relative',
          }}>
            <PlaceholderImage label="" bg={['#b48a6b', '#a88e75', '#c2a489', '#9e7e63'][i]} stripe="#3f2f22" />
          </div>
        ))}
        <div style={{
          width: 50, height: 50, borderRadius: 8,
          background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: TYPE.mono, fontSize: 11, fontWeight: 700,
          color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
        }}>+{count - 4}</div>
      </div>
      <KindRow kind="photos" tag={tag} dark={dark} />
    </GlassCard>
  );
}

function ResultHeader({ title, date, dark }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14.5, color: dark ? '#fff' : '#1a1322' }}>
        {title}
      </div>
      <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.8, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)' }}>
        {date}
      </div>
    </div>
  );
}

function Snippet({ html, dark, size = 'sm' }) {
  return (
    <div style={{
      fontFamily: TYPE.ui, fontSize: size === 'md' ? 13.5 : 12.5, lineHeight: 1.5, marginTop: 4,
      color: dark ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.7)',
    }} dangerouslySetInnerHTML={{
      __html: html.replace(/<em>/g, '<em style="font-style:normal;background:rgba(255,210,120,0.55);padding:0 3px;border-radius:3px;color:#000;">'),
    }} />
  );
}

function KindRow({ kind, tag, dark }) {
  const map = {
    voice:  { bg: 'rgba(150,120,210,0.85)', label: 'voice'  },
    text:   { bg: 'rgba(80,140,210,0.85)',  label: 'text'   },
    photos: { bg: 'rgba(220,140,90,0.85)',  label: 'photos' },
  };
  const s = map[kind] || map.text;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
      <div style={{
        padding: '3px 9px', borderRadius: 9999,
        fontFamily: TYPE.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
        textTransform: 'uppercase', color: '#fff', background: s.bg,
      }}>{s.label}</div>
      <div style={{
        fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.8,
        color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)', textTransform: 'uppercase',
      }}>{tag}</div>
    </div>
  );
}

Object.assign(window, { SearchScreen });
