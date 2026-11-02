import React from "react";
import Layout from "../components/Layout";
import HeroSection from "../components/HeroSection";
import RevealOnScroll from "../components/RevealOnScroll";
import { useNavigate } from "react-router-dom";
import {
  Mail, Link as LinkIcon, MessageSquare,
  Shield, Activity, Sparkles, ArrowRight, Lock, Zap,
  CheckCircle2, AlertTriangle, ShieldCheck, Eye, Compass
} from "lucide-react";

const FEATURES = [
  {
    icon: Mail,
    title: "Email Phishing Inspection",
    desc: "Advanced NLP checks sender domain spoofing, fake login links, and high-urgency psychological triggers.",
    color: "#38bdf8",
    tag: "NLP Detection",
  },
  {
    icon: LinkIcon,
    title: "URL Threat Analysis",
    desc: "Multi-engine inspection uncovers hidden redirect chains, malicious downloads, and lookalike domains.",
    color: "#818cf8",
    tag: "Heuristics",
  },
  {
    icon: MessageSquare,
    title: "Message & Smishing Guard",
    desc: "Scans SMS, Telegram, and social messages for package delivery scams, fake bank alerts, and gift card fraud.",
    color: "#34d399",
    tag: "Pattern Engine",
  },
  {
    icon: Activity,
    title: "Real-Time Threat Intel",
    desc: "Connected to live threat monitoring feeds for early warning on new phishing campaigns.",
    color: "#fbbf24",
    tag: "Live Feeds",
  },
  {
    icon: Lock,
    title: "Encrypted Privacy",
    desc: "Scans execute in an isolated sandbox. Your personal content and history remain encrypted.",
    color: "#f472b6",
    tag: "Zero-Leak",
  },
  {
    icon: Zap,
    title: "Instant Diagnostic",
    desc: "Sub-second threat evaluation with zero waiting time and clear actionable safety recommendations.",
    color: "#a78bfa",
    tag: "< 250ms Speed",
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <Layout>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0 40px' }}>

        {/* 3D LIQUID GLASS HERO SECTION */}
        <HeroSection />

        {/* FEATURES GRID SECTION WITH REVEAL ON SCROLL */}
        <RevealOnScroll threshold={0.08} style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
              marginBottom: '12px',
            }}>
              <Sparkles size={13} />
              <span>CORE CAPABILITIES</span>
            </div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Multi-Vector Threat Defense
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Comprehensive real-time protection across your inbox, browsing, and messaging communications
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="liquid-glass-card"
                  style={{
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{
                      width: '44px', height: '44px',
                      borderRadius: '12px',
                      background: `${f.color}18`,
                      border: `1px solid ${f.color}35`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: f.color,
                      boxShadow: `0 4px 12px ${f.color}15`,
                    }}>
                      <Icon size={20} color={f.color} />
                    </div>

                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '99px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                    }}>
                      {f.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* HOW IT WORKS SECTION WITH REVEAL ON SCROLL */}
        <RevealOnScroll threshold={0.08} style={{ marginBottom: '64px' }}>
          <div
            className="liquid-glass-card"
            style={{
              padding: '36px 32px',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 14px',
                borderRadius: '99px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#38bdf8',
                marginBottom: '10px',
              }}>
                <ShieldCheck size={14} />
                <span>INSPECTION PIPELINE</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                How ThreatLens Protects You
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {[
                { step: '01', title: 'Paste Content', desc: 'Copy any suspicious link, email header, or message into our inspector.', color: '#38bdf8' },
                { step: '02', title: 'Heuristic Check', desc: 'Multi-engine parser examines spoofing markers, lookalike chars & TLS certs.', color: '#818cf8' },
                { step: '03', title: 'Threat Scoring', desc: 'Receive instant risk scoring (Safe, Caution, Malicious) in sub-second time.', color: '#34d399' },
                { step: '04', title: 'Guided Safety', desc: 'Actionable mitigation recommendations to protect your credentials & data.', color: '#fbbf24' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px',
                    background: `${item.color}20`,
                    border: `1px solid ${item.color}40`,
                    color: item.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.82rem', marginBottom: '14px',
                  }}>
                    {item.step}
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* ABOUT THREATLENS OVERVIEW SECTION */}
        <RevealOnScroll threshold={0.08} style={{ marginBottom: '40px' }}>
          <div
            className="liquid-glass-card"
            style={{
              padding: '36px 32px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--surface-1) 0%, rgba(99, 102, 241, 0.05) 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}>
                  <Eye size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    About ThreatLens
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    MODERN CYBERSECURITY PLATFORM
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/about')}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.84rem', borderRadius: '10px' }}
              >
                <span>Learn More About Us</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ fontSize: '0.94rem', lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: '960px' }}>
              <p style={{ margin: '0 0 12px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>ThreatLens</strong> is a modern cybersecurity platform focused on helping individuals stay protected in an increasingly connected digital world.
              </p>
              <p style={{ margin: '0 0 12px' }}>
                We combine intelligent threat analysis with practical security tools to identify suspicious links, emails, messages, and potential phishing threats. Our platform transforms complex security analysis into clear, understandable insights so users can make safer decisions online.
              </p>
              <p style={{ margin: '0 0 18px' }}>
                At ThreatLens, our mission is to make cybersecurity <strong style={{ color: '#38bdf8' }}>simple, proactive, and accessible</strong>—helping users recognize threats before they become security incidents.
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 16px',
                borderRadius: '99px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: 'var(--accent-indigo)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                <span>Detect</span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span>Analyze</span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span>Protect</span>
              </div>
            </div>
          </div>
        </RevealOnScroll>

      </main>
    </Layout>
  );
}

export default Home;
