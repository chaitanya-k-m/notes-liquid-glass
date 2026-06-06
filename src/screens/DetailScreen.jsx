import React from 'react';
import { TYPE, GlassCard, SoftPill, AppPhoto } from '../design-system.jsx';
import { ScreenHeader, CircleBtn } from '../components/ScreensCommon.jsx';

export function DetailScreen({ go, dark = false, payload, titleFont = 'display' }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <ScreenHeader
        dark={dark}
        back={() => go('home')}
        eyebrow="01 / 06 / 26 · Morning reflection"
        title="Thought of the day"
        titleFont={titleFont}
      />

      <div style={{ display: 'flex', gap: 8, padding: '18px 22px 18px' }}>
        {['Text', 'Images', 'Audio'].map((t, i) => (
          <SoftPill key={t} active={i === 0} dark={dark} accent="#fff36a">{t}</SoftPill>
        ))}
      </div>

      {/* Stacked paper layers + main card */}
      <div style={{ position: 'relative', padding: '0 22px', marginTop: 12 }}>
        {/* Bottom layer */}
        <div style={{
          position: 'absolute', top: -18, left: 38, right: 38, height: 180,
          background: 'rgba(255,230,200,0.65)',
          borderRadius: '22px 22px 8px 8px',
          boxShadow: '0 -1px 0 rgba(255,255,255,0.65) inset, 0 6px 16px rgba(80,60,90,0.08)',
          transform: 'rotate(-1.5deg)',
        }}>
          <div style={{
            padding: '12px 16px 0',
            fontFamily: TYPE.ui, fontSize: 11, color: 'rgba(0,0,0,0.4)',
          }}>Coffee order · 8:42 AM</div>
        </div>
        {/* Middle layer */}
        <div style={{
          position: 'absolute', top: -10, left: 30, right: 30, height: 180,
          background: 'rgba(220,235,255,0.78)',
          borderRadius: '22px 22px 8px 8px',
          boxShadow: '0 -1px 0 rgba(255,255,255,0.7) inset, 0 6px 16px rgba(80,60,90,0.08)',
          transform: 'rotate(0.8deg)',
        }}>
          <div style={{
            padding: '10px 16px 0',
            fontFamily: TYPE.ui, fontSize: 11.5, color: 'rgba(0,0,0,0.45)', fontWeight: 500,
          }}>Something new · just now</div>
        </div>

        {/* Main card */}
        <GlassCard
          radius={22} padding={20}
          tint="rgba(255,255,255,0.82)"
          borderTint="rgba(255,255,255,0.95)"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>
                Morning Reflection
              </div>
              <div style={{
                fontFamily: TYPE.mono, fontSize: 10, color: 'rgba(0,0,0,0.5)',
                letterSpacing: 0.8, marginTop: 3, textTransform: 'uppercase',
              }}>1 JUN 2026 · 10:10 AM</div>
            </div>
            <CircleBtn>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M16 4l4 4-12 12H4v-4L16 4z" stroke="#222" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </CircleBtn>
          </div>

          <div style={{
            fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 24, lineHeight: 1.18,
            color: '#1a4cbf', letterSpacing: -0.3, marginTop: 16,
          }}>
            Embrace the moment and let your spirit soar.
          </div>

          <div style={{
            fontFamily: TYPE.ui, fontSize: 13.5, lineHeight: 1.55,
            color: 'rgba(0,0,0,0.72)', marginTop: 12,
          }}>
            Every day is a fresh start — embrace it with{' '}
            <mark style={{ background: 'rgba(255,210,120,0.55)', padding: '0 2px', borderRadius: 3, color: '#000' }}>hope</mark>
            {' '}and{' '}
            <mark style={{ background: 'rgba(255,170,200,0.5)', padding: '0 2px', borderRadius: 3, color: '#000' }}>courage</mark>
            . Let each moment inspire you to grow and shine brighter than before.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
            <div style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '1.4', position: 'relative' }}>
              <AppPhoto src="/photos/detail-1.jpg" label="photo" bg="#ec9a6e" stripe="#9b4a2b" />
            </div>
            <div style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '1.4', position: 'relative' }}>
              <AppPhoto src="/photos/detail-2.jpg" label="photo" bg="#e0a8b8" stripe="#8a3a55" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            {['#morning', '#gratitude', '#text'].map(t => (
              <div key={t} style={{
                padding: '4px 10px', borderRadius: 9999,
                fontFamily: TYPE.mono, fontSize: 10, letterSpacing: 0.4,
                background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.55)',
              }}>{t}</div>
            ))}
          </div>
        </GlassCard>

        <div style={{ height: 110 }} />
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'absolute', bottom: 22, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 10,
      }}>
        <button onClick={() => go('voice')} style={{
          padding: '14px 22px', borderRadius: 9999, border: 'none',
          background: 'rgba(40,30,55,0.92)', color: '#fff', cursor: 'pointer',
          fontFamily: TYPE.ui, fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 8,
          backdropFilter: 'blur(14px)',
          boxShadow: '0 6px 20px rgba(40,20,60,0.32), inset 0 1px 0 rgba(255,255,255,0.18)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
          Add to this note
        </button>
        <button onClick={() => go('voice')} style={{
          width: 48, height: 48, borderRadius: 9999, border: 'none', cursor: 'pointer',
          background: 'radial-gradient(circle at 35% 30%, #a48ce6, #6644b8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(90,60,180,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="12" rx="3" fill="#fff"/>
            <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
