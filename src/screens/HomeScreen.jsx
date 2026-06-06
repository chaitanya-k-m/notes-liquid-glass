import React from 'react';
import { TYPE, GlassCard, SoftPill, PlaceholderImage, AppPhoto, Waveform } from '../design-system.jsx';
import { ScreenHeader, BottomDock } from '../components/ScreensCommon.jsx';

export function HomeScreen({ go, dark = false, accent = '#fff36a', mono = false, titleFont = 'display' }) {
  const [tab, setTab] = React.useState('All');
  const tabs = ['All', 'Voice', 'To-Do', 'Files', 'Photos'];

  const tints = mono ? {
    list:  'rgba(255,255,255,0.55)',
    voice: 'rgba(255,255,255,0.50)',
    files: 'rgba(255,255,255,0.55)',
    pdf:   'rgba(255,255,255,0.55)',
    hero:  'rgba(255,255,255,0.40)',
  } : {
    list:  'rgba(220,235,225,0.55)',
    voice: 'rgba(200,195,235,0.55)',
    files: 'rgba(225,210,170,0.45)',
    pdf:   'rgba(245,210,225,0.55)',
    hero:  'rgba(255,255,255,0.10)',
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <ScreenHeader
        title="Notes"
        dark={dark}
        titleFont={titleFont}
        eyebrow="Tuesday · 1 June · 6 new"
        menu={true}
      />

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 8, padding: '14px 22px 18px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {tabs.map(t => (
          <SoftPill key={t} active={tab === t} onClick={() => setTab(t)} dark={dark} accent={accent}>
            {t}
          </SoftPill>
        ))}
      </div>

      {/* Hero editorial card */}
      <div style={{ padding: '0 18px 12px' }}>
        <div onClick={() => go('detail', { kind: 'thought' })} style={{
          position: 'relative', borderRadius: 28, overflow: 'hidden', cursor: 'pointer',
          height: 220,
          boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 30px rgba(80,60,90,0.18)',
        }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <AppPhoto src="/photos/hero.jpg" label="hero photo" bg="#c2a489" stripe="#5e4030" />
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, rgba(0,0,0,0.05) 0%, rgba(20,10,30,0.55) 100%)',
          }} />
          <div style={{
            position: 'absolute', top: 16, left: 18,
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 2,
            color: '#fff', textTransform: 'uppercase', opacity: 0.92,
          }}>
            <span style={{ width: 18, height: 1, background: '#fff' }} />
            Today's thought
          </div>
          <div style={{
            position: 'absolute', top: 16, right: 18, color: '#fff',
            fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.4, opacity: 0.9,
          }}>01 / 06 / 26</div>
          <div style={{
            position: 'absolute', bottom: 50, left: 18, right: 18,
            fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400,
            fontSize: 28, lineHeight: 1.1, color: '#fff', letterSpacing: -0.4,
            textShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}>
            Embrace the moment — let your spirit soar.
          </div>
          <div style={{
            position: 'absolute', bottom: 16, left: 18, right: 18,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{
              fontFamily: TYPE.ui, fontSize: 11.5, fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
            }}>Morning Reflection · 3 min read</div>
            <div style={{
              width: 30, height: 30, borderRadius: 9999,
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bento grid */}
      <div style={{
        padding: '0 18px 140px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
      }}>
        {/* Shopping list — tall left, spans 2 rows */}
        <GlassCard
          radius={26} padding={18}
          tint={tints.list}
          borderTint="rgba(255,255,255,0.65)"
          onClick={() => go('detail', { kind: 'list', title: 'Shopping' })}
          style={{ gridRow: 'span 2', minHeight: 290 }}
        >
          <div style={{
            fontFamily: TYPE.pixel, fontSize: 36, lineHeight: 0.92,
            color: mono ? '#1a1322' : '#1f2b22', letterSpacing: 1.2, marginBottom: 18,
          }}>Shopping<br/>List</div>
          <Checklist items={[
            { label: 'Sourdough', done: true },
            { label: 'Aged cheddar', done: true },
            { label: 'Tomatoes on the vine', done: false },
            { label: 'Espresso beans', done: false },
            { label: 'Lemons', done: false },
          ]} />
        </GlassCard>

        {/* Voice memo — compact */}
        <GlassCard
          radius={22} padding={14}
          tint={tints.voice}
          onClick={() => go('voice')}
          style={{ minHeight: 80 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: '100%' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9999,
              background: 'radial-gradient(circle at 35% 30%, #a48ce6, #6644b8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 4px 10px rgba(90,60,180,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}>
              <svg width="11" height="12" viewBox="0 0 14 14"><polygon points="3,1 12,7 3,13" fill="#fff"/></svg>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Waveform color={mono ? '#1a1322' : '#5d3fb0'} height={26} bars={14} />
              <div style={{ fontFamily: TYPE.mono, fontSize: 9, letterSpacing: 0.8, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
                MEMO · 1:24
              </div>
            </div>
          </div>
        </GlassCard>

        {/* PDFs — script accent */}
        <GlassCard
          radius={22} padding={14}
          tint={tints.pdf}
          onClick={() => go('files')}
          style={{ minHeight: 200, position: 'relative' }}
        >
          <div style={{ position: 'absolute', top: 14, right: 16, display: 'flex', gap: 2 }}>
            <PaperIcon color={mono ? '#1a1322' : '#a4537a'} />
            <PaperIcon offset color={mono ? '#1a1322' : '#a4537a'} />
          </div>
          <div style={{
            position: 'absolute', top: 14, left: 16,
            fontFamily: TYPE.mono, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.5)',
          }}>12 saved</div>
          <div style={{
            position: 'absolute', bottom: 0, left: 12,
            fontFamily: TYPE.script, fontWeight: 400,
            fontSize: 88, lineHeight: 0.85, color: mono ? '#1a1322' : '#a4537a',
            transform: 'rotate(-3deg)',
          }}>Pdf</div>
        </GlassCard>

        {/* Snapshots — full width */}
        <GlassCard
          radius={22} padding={0}
          tint="rgba(255,255,255,0.1)"
          onClick={() => go('detail', { kind: 'snapshots' })}
          style={{ gridColumn: 'span 2', minHeight: 160, overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', inset: 0 }}>
            <AppPhoto src="/photos/snapshots-bg.jpg" label="snapshots" bg="#a89175" stripe="#3f3022" />
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55))',
          }} />
          <div style={{ position: 'absolute', top: 14, left: 16, color: '#fff' }}>
            <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 15 }}>Snapshots</div>
            <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, opacity: 0.85, marginTop: 2, letterSpacing: 1 }}>
              25 MAY · 14 ITEMS
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, display: 'flex', gap: 6 }}>
            {[1,2,3,4].map((n, i) => (
              <div key={i} style={{
                flex: 1, height: 38, borderRadius: 10, overflow: 'hidden', position: 'relative',
                background: ['#c2a489', '#8a7f9a', '#b88567', '#7e9bbc'][i],
              }}>
                <AppPhoto src={`/photos/photo-${n}.jpg`} label="" bg={['#c2a489', '#8a7f9a', '#b88567', '#7e9bbc'][i]} stripe="#3f2f22" />
              </div>
            ))}
            <div style={{
              padding: '0 10px', height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)',
              color: '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>+10</div>
          </div>
        </GlassCard>

        {/* Files — serif accent */}
        <GlassCard
          radius={22} padding={14}
          tint={tints.files}
          onClick={() => go('files')}
          style={{ minHeight: 130 }}
        >
          <div style={{ position: 'absolute', top: 12, right: 14, display: 'flex', gap: 2 }}>
            <PaperIcon color={mono ? '#1a1322' : '#8a6f2e'} />
            <PaperIcon offset color={mono ? '#1a1322' : '#8a6f2e'} />
          </div>
          <div style={{
            position: 'absolute', top: 12, left: 14,
            fontFamily: TYPE.mono, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.5)',
          }}>archive</div>
          <div style={{
            position: 'absolute', bottom: 8, left: 12,
            fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400,
            fontSize: 48, lineHeight: 0.85, color: mono ? '#1a1322' : '#8a6f2e', letterSpacing: -1,
          }}>Files</div>
        </GlassCard>

        {/* Speak a note — dark CTA */}
        <GlassCard
          radius={22} padding={14}
          tint="rgba(40,30,55,0.78)"
          borderTint="rgba(255,255,255,0.15)"
          onClick={() => go('voice')}
          style={{ minHeight: 130 }}
        >
          <div style={{
            position: 'absolute', top: 12, left: 14,
            fontFamily: TYPE.mono, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
          }}>quick capture</div>
          <div style={{
            position: 'absolute', top: 36, left: 14,
            fontFamily: TYPE.display, fontWeight: 700, fontSize: 22, lineHeight: 1.0,
            color: '#fff', letterSpacing: -0.6,
          }}>Speak<br/>a note</div>
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            width: 42, height: 42, borderRadius: 9999,
            background: 'radial-gradient(circle at 35% 30%, #a48ce6, #6644b8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(90,60,180,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="3" width="6" height="12" rx="3" fill="#fff"/>
              <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </GlassCard>
      </div>

      <BottomDock
        onAdd={() => go('detail', { kind: 'new' })}
        onMic={() => go('voice')}
        onSearch={() => go('search')}
        dark={dark}
      />
    </div>
  );
}

function PaperIcon({ offset = false, color = '#fff' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none"
      style={{ transform: offset ? 'translateX(-4px) rotate(-3deg)' : 'rotate(3deg)' }}>
      <rect x="3" y="4" width="22" height="20" rx="2" fill={color} fillOpacity="0.85"
        stroke={color} strokeOpacity="0.4"/>
      <path d="M7 10h14M7 14h14M7 18h10" stroke="#333" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function Checklist({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '7px 12px', borderRadius: 14,
          background: 'rgba(255,255,255,0.45)',
          border: '0.5px solid rgba(255,255,255,0.7)',
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: 9999,
            border: '1.5px solid rgba(0,0,0,0.35)',
            background: it.done ? 'rgba(0,0,0,0.75)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {it.done && (
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <path d="M2 6.5l2.5 2.5L10 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div style={{
            fontFamily: TYPE.ui, fontSize: 12.5, fontWeight: 500, color: '#1f2b22',
            textDecoration: it.done ? 'line-through' : 'none',
            opacity: it.done ? 0.5 : 1,
          }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}
