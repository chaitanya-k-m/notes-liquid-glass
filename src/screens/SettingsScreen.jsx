import React from 'react';
import { TYPE, GlassCard, PALETTES } from '../design-system.jsx';
import { ScreenHeader } from '../components/ScreensCommon.jsx';
import { useTheme, PRESETS } from '../store/theme.jsx';
import { useNotes } from '../store/notes.jsx';

export function SettingsScreen({ go, pro }) {
  const { dark, preset, palette, accent, setPreset, setPalette, setAccent, setDark } = useTheme();
  const { notes } = useNotes();
  const ink = dark ? '#fff' : '#1a1322';
  const subInk = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

  const accents = ['#a48ce6', '#e08aa0', '#5b9be6', '#6ec4a0', '#e6a36b', '#fff36a'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <ScreenHeader dark={dark} back={() => go('home')} title="Settings" eyebrow="Make it yours" menu={false} />

        <div style={{ padding: '8px 18px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Pro banner */}
          <button onClick={() => go('paywall')} style={{ border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, borderRadius: 22, overflow: 'hidden' }}>
            <div style={{ position: 'relative', padding: '18px 20px', background: pro ? 'linear-gradient(135deg,#2c8a68,#1f6b4f)' : 'linear-gradient(135deg,#2a1a40,#1a1322)', borderRadius: 22 }}>
              <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>{pro ? 'Active' : 'Upgrade'}</div>
              <div style={{ fontFamily: TYPE.display, fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: -0.5 }}>{pro ? 'You’re on Pro ✦' : 'Notes Pro'}</div>
              <div style={{ fontFamily: TYPE.ui, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{pro ? 'Thanks for supporting the app.' : 'Unlimited everything, sync & export'}</div>
            </div>
          </button>

          {/* Theme presets */}
          <Section label="Theme" subInk={subInk}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.entries(PRESETS).map(([key, p]) => {
                const stops = PALETTES[p.palette];
                const active = preset === key;
                return (
                  <button key={key} onClick={() => setPreset(key)} style={{
                    position: 'relative', padding: 0, borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                    border: active ? `2px solid ${ink}` : `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                    height: 76,
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(150deg, ${stops.join(',')})` }} />
                    <div style={{ position: 'absolute', left: 12, bottom: 10, fontFamily: TYPE.ui, fontWeight: 600, fontSize: 13, color: p.dark ? '#fff' : '#1a1322' }}>{p.label}</div>
                    {active && <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, background: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={dark ? '#1a1322' : '#fff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Palette */}
          <Section label="Palette" subInk={subInk}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.keys(PALETTES).map(key => (
                <button key={key} onClick={() => setPalette(key)} aria-label={key} style={{
                  width: 44, height: 44, borderRadius: 14, cursor: 'pointer',
                  background: `linear-gradient(150deg, ${PALETTES[key].join(',')})`,
                  border: palette === key ? `2.5px solid ${ink}` : `1px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'}`,
                }} />
              ))}
            </div>
          </Section>

          {/* Accent */}
          <Section label="Accent" subInk={subInk}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {accents.map(c => (
                <button key={c} onClick={() => setAccent(c)} aria-label={c} style={{
                  width: 36, height: 36, borderRadius: 18, cursor: 'pointer', background: c,
                  border: accent === c ? `2.5px solid ${ink}` : '1px solid rgba(0,0,0,0.1)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                }} />
              ))}
            </div>
          </Section>

          {/* Dark mode */}
          <GlassCard radius={18} padding={16} tint={dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 15, color: ink }}>Dark mode</div>
                <div style={{ fontFamily: TYPE.ui, fontSize: 12.5, color: subInk, marginTop: 2 }}>Easier on the eyes at night</div>
              </div>
              <Toggle on={dark} onChange={setDark} />
            </div>
          </GlassCard>

          {/* About */}
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.8, color: subInk }}>
              {notes.length} note{notes.length !== 1 ? 's' : ''} · stored on this device
            </div>
            <div style={{ fontFamily: TYPE.serif, fontStyle: 'italic', fontSize: 15, color: subInk, marginTop: 8 }}>think out loud, find anything.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, subInk, children }) {
  return (
    <div>
      <div style={{ fontFamily: TYPE.mono, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: subInk, marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 50, height: 30, borderRadius: 15, border: 'none', cursor: 'pointer', position: 'relative',
      background: on ? '#2c8a68' : 'rgba(120,120,120,0.4)', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: 12, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  );
}
