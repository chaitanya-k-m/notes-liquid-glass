import React from 'react';
import { TYPE, NotesMark } from '../design-system.jsx';
import { CircleBtn } from '../components/ScreensCommon.jsx';

export function PaywallScreen({ go, dark = false }) {
  const [plan, setPlan] = React.useState('yearly');

  const features = [
    { kind: 'voice',  title: 'Unlimited voice notes',        sub: "You're at 9 of 10 this month" },
    { kind: 'search', title: 'Ask anything, in your words',  sub: 'Natural-language search across everything' },
    { kind: 'sync',   title: 'Sync across all your devices', sub: 'Phone, tablet, web — instantly' },
    { kind: 'export', title: 'Export to PDF & Markdown',     sub: 'Take your notes anywhere' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px 0' }}>
        <NotesMark size={28} dark={dark} />
        <CircleBtn dark={dark} onClick={() => go('home')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke={dark ? '#fff' : '#222'} strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </CircleBtn>
      </div>

      {/* Usage story hero */}
      <div style={{ padding: '22px 24px 0' }}>
        <div style={{
          fontFamily: TYPE.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', marginBottom: 14,
        }}>This month, so far</div>

        <div style={{
          fontFamily: TYPE.display, fontSize: 56, lineHeight: 0.92, fontWeight: 700,
          color: dark ? '#fff' : '#1a1322', letterSpacing: -2.5,
        }}>
          3<span style={{
            fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400,
            color: '#a4537a', fontSize: 32, marginLeft: 4, marginRight: 8,
          }}>hr</span>
          47<span style={{
            fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400,
            color: '#a4537a', fontSize: 32, marginLeft: 4,
          }}>min</span>
        </div>

        <div style={{
          fontFamily: TYPE.serif, fontStyle: 'italic', fontWeight: 400,
          fontSize: 22, lineHeight: 1.2, color: dark ? 'rgba(255,255,255,0.78)' : '#5a4a6a',
          marginTop: 12, marginBottom: 10,
        }}>of thoughts you spoke out loud.</div>

        <div style={{
          fontFamily: TYPE.ui, fontSize: 14, lineHeight: 1.5,
          color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.62)',
          marginTop: 4,
        }}>
          Go <b style={{ color: dark ? '#fff' : '#1a1322' }}>Pro</b> to keep every one of them — and find any of them later, just by asking.
        </div>
      </div>

      {/* Feature list */}
      <div style={{ padding: '22px 22px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {features.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 14px', borderRadius: 16,
            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
            border: '0.5px solid rgba(255,255,255,0.6)',
            backdropFilter: 'blur(10px)',
          }}>
            <FeatureIcon kind={f.kind} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: TYPE.ui, fontWeight: 600, fontSize: 13.5, color: dark ? '#fff' : '#1a1322' }}>
                {f.title}
              </div>
              <div style={{ fontFamily: TYPE.ui, fontSize: 11.5, color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)', marginTop: 2 }}>
                {f.sub}
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke={dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Plan selector */}
      <div style={{ padding: '18px 22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <PlanCard
          active={plan === 'monthly'}
          onClick={() => setPlan('monthly')}
          eyebrow="Monthly"
          price="$4.99"
          unit="/ month"
          note="Cancel anytime"
          dark={dark}
        />
        <PlanCard
          active={plan === 'yearly'}
          onClick={() => setPlan('yearly')}
          eyebrow="Yearly"
          price="$2.49"
          unit="/ month"
          note="Billed $29.88 / year"
          badge="Save 50%"
          dark={dark}
        />
      </div>

      {/* CTA */}
      <div style={{ padding: '18px 22px 30px' }}>
        <button onClick={() => go('home')} style={{
          width: '100%', padding: '16px 24px', borderRadius: 9999, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(160deg, #2a1a40, #1a1322)',
          color: '#fff', fontFamily: TYPE.ui, fontWeight: 600, fontSize: 15,
          boxShadow: '0 6px 20px rgba(40,20,60,0.4), inset 0 1px 0 rgba(255,255,255,0.18)',
          letterSpacing: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Start 7-day free trial
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{
          textAlign: 'center', marginTop: 10,
          fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 0.6,
          color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
        }}>
          Restore purchase · Terms · Privacy
        </div>
      </div>
    </div>
  );
}

function PlanCard({ active, onClick, eyebrow, price, unit, note, badge, dark }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative', textAlign: 'left', padding: '14px 14px 12px',
      borderRadius: 18, border: 'none', cursor: 'pointer',
      background: active
        ? (dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.9)')
        : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)'),
      boxShadow: active
        ? '0 0 0 2px #2a1a40, 0 4px 14px rgba(40,20,60,0.18)'
        : 'inset 0 0 0 0.5px rgba(255,255,255,0.6)',
      transition: 'all 0.15s ease',
    }}>
      {badge && (
        <div style={{
          position: 'absolute', top: -8, right: 10,
          padding: '3px 8px', borderRadius: 9999,
          background: '#fff36a', color: '#1a1322',
          fontFamily: TYPE.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
          textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>{badge}</div>
      )}
      <div style={{
        fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: 1.4, textTransform: 'uppercase',
        color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
      }}>{eyebrow}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
        <span style={{
          fontFamily: TYPE.display, fontWeight: 700, fontSize: 28, color: dark ? '#fff' : '#1a1322',
          letterSpacing: -0.6,
        }}>{price}</span>
        <span style={{
          fontFamily: TYPE.ui, fontSize: 11, color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
        }}>{unit}</span>
      </div>
      <div style={{
        fontFamily: TYPE.ui, fontSize: 10.5, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
        marginTop: 4,
      }}>{note}</div>
    </button>
  );
}

function FeatureIcon({ kind }) {
  const wrap = (svg, bg) => (
    <div style={{
      width: 36, height: 36, borderRadius: 12, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
    }}>{svg}</div>
  );
  if (kind === 'voice') return wrap(
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="12" rx="3" fill="#fff"/>
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>,
    'linear-gradient(160deg, #a48ce6, #6644b8)');
  if (kind === 'search') return wrap(
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6" stroke="#fff" strokeWidth="2"/>
      <path d="M16 16l4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>,
    'linear-gradient(160deg, #5b9be6, #2a6fbf)');
  if (kind === 'sync') return wrap(
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 12a8 8 0 0 1 14-5l2-2v6h-6l2.5-2.5A6 6 0 0 0 6 12M20 12a8 8 0 0 1-14 5l-2 2v-6h6L7.5 15.5A6 6 0 0 0 18 12" fill="#fff"/>
    </svg>,
    'linear-gradient(160deg, #6ec4a0, #2c8a68)');
  if (kind === 'export') return wrap(
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
    'linear-gradient(160deg, #e6a36b, #b8703a)');
  return null;
}
