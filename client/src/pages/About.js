import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import RevealOnScroll from "../components/RevealOnScroll";
import {
  Shield,
  Eye,
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Globe2,
  FileCheck,
  Search,
  Mail,
  Link as LinkIcon,
  MessageSquare,
  HeartHandshake
} from "lucide-react";

function About() {
  const navigate = useNavigate();

  const PILLARS = [
    {
      title: "Detect",
      icon: Search,
      color: "#38bdf8",
      description:
        "Proactively monitor and capture malicious payload indicators across links, email headers, domains, and messaging networks.",
      points: [
        "Multi-engine URL reputation & redirect chain tracing",
        "Deep email header SPF, DKIM, and spoofing heuristics",
        "SMS and chat smishing pattern recognition",
      ],
    },
    {
      title: "Analyze",
      icon: Cpu,
      color: "#818cf8",
      description:
        "Transform complex telemetry, heuristic signals, and machine learning verdicts into clear, actionable risk diagnostics.",
      points: [
        "Sub-second behavioral risk scoring (0–100 Scale)",
        "Zero-day phishing and credential-harvesting markers",
        "Local client-side OCR for screenshots & QR captures",
      ],
    },
    {
      title: "Protect",
      icon: Shield,
      color: "#34d399",
      description:
        "Empower users to make safe, informed decisions with real-time AI security guidance and automated threat containment.",
      points: [
        "Interactive ThreatLens AI Security Advisor",
        "Detailed step-by-step mitigation guidance",
        "Encrypted audit logging and timeline forensics",
      ],
    },
  ];

  const STATS = [
    { label: "Threat Detection Rate", value: "99.8%", color: "#34d399" },
    { label: "Inspection Latency", value: "< 250ms", color: "#38bdf8" },
    { label: "Security Engines", value: "Multi-Vector", color: "#818cf8" },
    { label: "Data Harvesting", value: "Zero-Leak", color: "#f43f5e" },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "10px 0 50px" }}>
        {/* HERO SECTION */}
        <RevealOnScroll threshold={0.05}>
          <div
            className="liquid-glass-card"
            style={{
              padding: "48px 36px",
              borderRadius: "var(--radius-xl)",
              marginBottom: "36px",
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            {/* Background Accent Glow */}
            <div
              style={{
                position: "absolute",
                top: "-30%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "480px",
                height: "280px",
                background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                borderRadius: "99px",
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#38bdf8",
                marginBottom: "20px",
              }}
            >
              <Eye size={15} />
              <span>ABOUT THREATLENS</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: "20px",
                maxWidth: "850px",
                margin: "0 auto 20px",
              }}
            >
              Intelligent Cybersecurity Made Simple &amp; Proactive
            </h1>

            {/* User Requested Core About Description */}
            <div
              style={{
                maxWidth: "820px",
                margin: "0 auto 30px",
                fontSize: "1.05rem",
                lineHeight: 1.75,
                color: "var(--text-secondary)",
                textAlign: "center",
              }}
            >
              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "var(--text-primary)" }}>ThreatLens</strong> is a modern cybersecurity platform focused on helping individuals stay protected in an increasingly connected digital world.
              </p>
              <p style={{ marginBottom: "16px" }}>
                We combine intelligent threat analysis with practical security tools to identify suspicious links, emails, messages, and potential phishing threats. Our platform transforms complex security analysis into clear, understandable insights so users can make safer decisions online.
              </p>
              <p style={{ marginBottom: "24px" }}>
                At ThreatLens, our mission is to make cybersecurity <strong style={{ color: "#38bdf8" }}>simple, proactive, and accessible</strong>—helping users recognize threats before they become security incidents.
              </p>

              {/* Tagline Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 24px",
                  borderRadius: "99px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--accent-indigo)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <span>Detect</span>
                <span style={{ color: "var(--text-muted)" }}>•</span>
                <span>Analyze</span>
                <span style={{ color: "var(--text-muted)" }}>•</span>
                <span>Protect</span>
              </div>
            </div>

            {/* STATS STRIP */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                maxWidth: "880px",
                margin: "0 auto",
                paddingTop: "24px",
                borderTop: "1px solid var(--border)",
              }}
            >
              {STATS.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      color: s.color,
                      fontFamily: "JetBrains Mono, monospace",
                      marginBottom: "4px",
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* THREE CORE PILLARS SECTION */}
        <RevealOnScroll threshold={0.08} style={{ marginBottom: "40px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 14px",
                borderRadius: "99px",
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(129, 140, 248, 0.25)",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--accent-indigo)",
                marginBottom: "10px",
              }}
            >
              <Sparkles size={13} />
              <span>OUR SECURITY ARCHITECTURE</span>
            </div>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              How ThreatLens Delivers Defense
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "6px" }}>
              Engineered from the ground up for high precision, absolute privacy, and instant clarity.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="liquid-glass-card"
                  style={{
                    padding: "28px 24px",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: `${p.color}15`,
                      border: `1px solid ${p.color}35`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: p.color,
                      marginBottom: "18px",
                    }}
                  >
                    <Icon size={22} color={p.color} />
                  </div>

                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      marginBottom: "8px",
                    }}
                  >
                    {p.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      marginBottom: "20px",
                    }}
                  >
                    {p.description}
                  </p>

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "16px",
                      borderTop: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {p.points.map((pt, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          fontSize: "0.82rem",
                          color: "var(--text-primary)",
                          lineHeight: 1.45,
                        }}
                      >
                        <CheckCircle2 size={15} color={p.color} style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* SECURITY & PRIVACY PROMISE */}
        <RevealOnScroll threshold={0.08} style={{ marginBottom: "40px" }}>
          <div
            className="liquid-glass-card"
            style={{
              padding: "36px 32px",
              borderRadius: "var(--radius-xl)",
              background: "linear-gradient(135deg, var(--surface-1) 0%, rgba(56, 189, 248, 0.04) 100%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(52, 211, 153, 0.15)",
                  border: "1px solid rgba(52, 211, 153, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#34d399",
                }}
              >
                <Lock size={18} />
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Our Privacy &amp; Ethical Guarantee
              </h3>
            </div>

            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 20px" }}>
              Unlike traditional scanning utilities that store, catalog, or resell telemetry payloads, ThreatLens operates on a strict <strong style={{ color: "var(--text-primary)" }}>Zero-Harvesting Standard</strong>. Scanned URLs, message text, and email contents are processed in volatile memory exclusively to compute threat indicators and are never monetized or exposed to third-party advertisers.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <button
                onClick={() => navigate("/privacy")}
                className="btn btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.84rem", borderRadius: "10px" }}
              >
                <FileCheck size={14} />
                Read Full Privacy Policy
              </button>

              <button
                onClick={() => navigate("/terms")}
                className="btn btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.84rem", borderRadius: "10px" }}
              >
                <HeartHandshake size={14} />
                Terms of Service
              </button>

              <button
                onClick={() => navigate("/contact")}
                className="btn btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.84rem", borderRadius: "10px" }}
              >
                <Globe2 size={14} />
                Contact Security Desk
              </button>
            </div>
          </div>
        </RevealOnScroll>

        {/* QUICK ACCESS SCAN TOOLS */}
        <RevealOnScroll threshold={0.08}>
          <div
            style={{
              padding: "30px",
              borderRadius: "var(--radius-xl)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
              Ready to Inspect a Suspicious Item?
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Choose a dedicated ThreatLens scanner below or consult with our AI Security Advisor.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <button
                onClick={() => navigate("/link")}
                className="btn btn-primary"
                style={{ padding: "10px 18px", fontSize: "0.88rem", borderRadius: "10px" }}
              >
                <LinkIcon size={15} />
                Inspect URL
              </button>

              <button
                onClick={() => navigate("/email")}
                className="btn btn-primary"
                style={{ padding: "10px 18px", fontSize: "0.88rem", borderRadius: "10px" }}
              >
                <Mail size={15} />
                Analyze Email
              </button>

              <button
                onClick={() => navigate("/message")}
                className="btn btn-primary"
                style={{ padding: "10px 18px", fontSize: "0.88rem", borderRadius: "10px" }}
              >
                <MessageSquare size={15} />
                Scan Message
              </button>

              <button
                onClick={() => navigate("/ai-chat")}
                className="btn btn-secondary"
                style={{ padding: "10px 18px", fontSize: "0.88rem", borderRadius: "10px" }}
              >
                <Sparkles size={15} color="#38bdf8" />
                AI Security Advisor
              </button>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </Layout>
  );
}

export default About;
