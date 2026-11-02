import React from 'react';
import Layout from '../components/Layout';
import RevealOnScroll from '../components/RevealOnScroll';
import { Clock, ShieldAlert, CheckCircle, UserPlus, Link as LinkIcon, Sparkles } from 'lucide-react';

const EVENTS = [
  { ts: '2026-07-29T08:12:00Z', title: 'Email Phishing Scan Completed', detail: 'High urgency phishing triggers detected in invoice email.', icon: ShieldAlert, color: '#f87171' },
  { ts: '2026-07-28T14:40:00Z', title: 'Account Protection Initialized', detail: 'User session authenticated with JWT encryption.', icon: UserPlus, color: '#818cf8' },
  { ts: '2026-07-27T09:20:00Z', title: 'Suspicious Domain Flagged', detail: 'Domain "paypal-account-verify-login.xyz" marked as Malicious.', icon: LinkIcon, color: '#fbbf24' },
  { ts: '2026-07-26T11:05:00Z', title: 'SMS Message Clean', detail: 'Package delivery tracking message verified as legitimate.', icon: CheckCircle, color: '#34d399' },
];

function Timeline() {
  return (
    <Layout>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '10px 0 40px' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: '99px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(129, 140, 248, 0.25)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--accent-indigo)',
            marginBottom: '10px',
          }}>
            <Sparkles size={13} />
            <span>CHRONOLOGICAL AUDIT LOG</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Security Timeline
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Chronological audit log of scans, threats detected, and account events
          </p>
        </div>

        {/* TIMELINE LIST */}
        <RevealOnScroll threshold={0.05}>
          <div style={{ position: 'relative', paddingLeft: '28px' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute',
              left: '11px', top: '8px', bottom: '8px',
              width: '2px', background: 'var(--border)',
            }} />

            {EVENTS.map((e, i) => {
              const Icon = e.icon;
              return (
                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '28px', position: 'relative' }}>
                  {/* Node */}
                  <div style={{
                    position: 'absolute',
                    left: '-28px', top: '0',
                    width: '24px', height: '24px',
                    borderRadius: '50%',
                    background: 'var(--surface-1)',
                    border: `2px solid ${e.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 12px ${e.color}40`,
                    zIndex: 2,
                  }}>
                    <Icon size={12} color={e.color} />
                  </div>

                  <div
                    className="liquid-glass-card"
                    style={{
                      flex: 1,
                      padding: '18px 22px',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {e.title}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(e.ts).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {e.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>

      </div>
    </Layout>
  );
}

export default Timeline;
