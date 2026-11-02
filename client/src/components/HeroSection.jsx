import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Mail, Link as LinkIcon, MessageSquare,
  Sparkles, ArrowRight, Activity, CheckCircle2,
  Lock, Zap, Bot, ShieldCheck, Terminal, ShieldAlert,
  Radio, Cpu, RefreshCw, Layers
} from "lucide-react";

function HeroSection() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorPercent, setCursorPercent] = useState({ x: 50, y: 42 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  // High-precision mouse tracking event listener for 3D parallax & radial spotlight
  useEffect(() => {
    let animationFrameId = null;

    const handleWindowMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate whether cursor is in or near the hero section
      const isNear =
        e.clientY >= rect.top - 180 &&
        e.clientY <= rect.bottom + 180 &&
        e.clientX >= rect.left - 120 &&
        e.clientX <= rect.right + 120;

      if (isNear) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        animationFrameId = requestAnimationFrame(() => {
          // Normalized tilt offset (-24 to +24)
          const normX = Math.max(-1, Math.min(1, (e.clientX - rect.left) / rect.width - 0.5));
          const normY = Math.max(-1, Math.min(1, (e.clientY - rect.top) / rect.height - 0.5));
          
          const x = normX * 24;
          const y = normY * 24;
          
          // Exact percentage for the radial spotlight center (clamped 10% to 90%)
          const rawPercentX = ((e.clientX - rect.left) / rect.width) * 100;
          const rawPercentY = ((e.clientY - rect.top) / rect.height) * 100;
          const percentX = Math.max(10, Math.min(90, rawPercentX));
          const percentY = Math.max(10, Math.min(90, rawPercentY));

          setMousePos({ x, y });
          setCursorPercent({ x: percentX, y: percentY });
          setIsHovered(true);
        });
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleWindowMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const SCAN_MODULES = [
    {
      id: "email",
      title: "Email Phishing Inspector",
      subtitle: "Sender spoofing & urgency analysis",
      icon: Mail,
      accentHex: "#38bdf8",
      route: "/email",
      badge: "NLP Multi-Layer",
      metric: "99.8% Accuracy",
      description: "Detects lookalike domains, deceptive CTA links, and urgency-based social engineering payloads.",
    },
    {
      id: "link",
      title: "URL & Domain Guard",
      subtitle: "Redirect chain & SSL heuristics",
      icon: LinkIcon,
      accentHex: "#818cf8",
      route: "/link",
      badge: "Real-Time Heuristics",
      metric: "< 250ms Response",
      description: "Unmasks obfuscated redirection chains, typo-squatted URLs, and credential harvesting landing pages.",
    },
    {
      id: "message",
      title: "SMS & Smishing Shield",
      subtitle: "Parcel & banking scam parser",
      icon: MessageSquare,
      accentHex: "#34d399",
      route: "/message",
      badge: "Pattern Engine",
      metric: "Zero-Day Detection",
      description: "Flags fraudulent delivery notifications, fake banking 2FA prompts, and malicious shortlinks.",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="hero-outer-spotlight-wrapper"
      style={{
        position: "relative",
        marginBottom: "48px",
        perspective: "1200px",
      }}
    >
      {/* 1. LAYERED ANIMATED RADIAL GRADIENT SPOTLIGHT BEHIND HERO */}
      <div className="hero-spotlight-container">
        {/* Layer A: Ambient slow breathing orbit glow */}
        <div
          className="hero-ambient-orbit-glow"
          style={{
            background: `
              radial-gradient(ellipse 650px 420px at 50% 50%,
                rgba(99, 102, 241, 0.16) 0%,
                rgba(56, 189, 248, 0.12) 40%,
                rgba(16, 185, 129, 0.06) 70%,
                transparent 85%)
            `,
          }}
        />

        {/* Layer B: Interactive mouse-tracking radial gradient spotlight */}
        <div
          className="hero-radial-spotlight"
          style={{
            background: `
              radial-gradient(ellipse 820px 560px at ${cursorPercent.x}% ${cursorPercent.y}%, 
                rgba(56, 189, 248, ${isHovered ? 0.3 : 0.22}) 0%, 
                rgba(99, 102, 241, ${isHovered ? 0.24 : 0.16}) 32%, 
                rgba(16, 185, 129, ${isHovered ? 0.12 : 0.07}) 60%, 
                rgba(14, 165, 233, 0.03) 78%,
                transparent 88%)
            `,
            transform: isHovered
              ? `translate3d(${mousePos.x * 1.8}px, ${mousePos.y * 1.8}px, 0) scale(1.05)`
              : "translate3d(0, 0, 0) scale(1)",
            transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
          }}
        />
      </div>

      {/* 2. THREE ABSOLUTE-POSITIONED FLOATING GLASS CARDS (MOUSE SHIFTED) */}
      <div className="floating-glass-cards-layer">
        {/* Floating Card 1: Top-Left (Threat Interception Telemetry) */}
        <div
          className="liquid-glass-card floating-glass-card-badge hidden lg:flex items-center gap-3.5"
          style={{
            position: "absolute",
            top: "-18px",
            left: "24px",
            zIndex: 20,
            animation: "floatSlow 6s ease-in-out infinite",
            transform: `perspective(1000px) translate3d(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px, 30px) rotateX(${mousePos.y * 0.3}deg) rotateY(${-mousePos.x * 0.3}deg)`,
            border: "1px solid rgba(56, 189, 248, 0.35)",
            background: "rgba(15, 23, 42, 0.7)",
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#38bdf8",
              position: "relative",
            }}
          >
            <ShieldCheck size={18} />
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b981",
              }}
            />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Threat Intercepted
              </span>
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  padding: "1px 5px",
                  borderRadius: "4px",
                  background: "rgba(239, 68, 68, 0.2)",
                  color: "#f87171",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                BLOCKED
              </span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#38bdf8", fontWeight: 500 }}>
              Spoofed Gateways • 14ms
            </div>
          </div>
        </div>

        {/* Floating Card 2: Top-Right (Neural Heuristic Classifier) */}
        <div
          className="liquid-glass-card floating-glass-card-badge hidden lg:flex items-center gap-3.5"
          style={{
            position: "absolute",
            top: "-14px",
            right: "24px",
            zIndex: 20,
            animation: "floatReverse 7s ease-in-out infinite",
            transform: `perspective(1000px) translate3d(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px, 30px) rotateX(${-mousePos.y * 0.3}deg) rotateY(${mousePos.x * 0.3}deg)`,
            border: "1px solid rgba(129, 140, 248, 0.4)",
            background: "rgba(15, 23, 42, 0.7)",
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(129, 140, 248, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#818cf8",
            }}
          >
            <Zap size={18} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Neural Classifier 3.0
              </span>
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  padding: "1px 5px",
                  borderRadius: "4px",
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                }}
              >
                LIVE
              </span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#818cf8", fontWeight: 500 }}>
              NLP Precision: 99.8%
            </div>
          </div>
        </div>

        {/* Floating Card 3: Floating Accent Card (Encrypted Sandbox Protocol) */}
        <div
          className="liquid-glass-card floating-glass-card-badge hidden xl:flex items-center gap-3.5"
          style={{
            position: "absolute",
            bottom: "110px",
            right: "-16px",
            zIndex: 20,
            animation: "floatSlow 8s ease-in-out infinite 1.2s",
            transform: `perspective(1000px) translate3d(${mousePos.x * 1.2}px, ${-mousePos.y * 1.2}px, 35px) rotateX(${mousePos.y * 0.25}deg) rotateY(${mousePos.x * 0.25}deg)`,
            border: "1px solid rgba(16, 185, 129, 0.35)",
            background: "rgba(15, 23, 42, 0.75)",
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10b981",
            }}
          >
            <Lock size={18} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Encrypted Sandbox
              </span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#34d399", fontWeight: 500 }}>
              TLS 1.3 • Zero Payload Leak
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN HERO SECTION CARD */}
      <section
        style={{
          position: "relative",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          perspective: "1200px",
        }}
        className="liquid-glass-hero"
      >
        {/* Dynamic Inner Light & Mesh Canvas */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background: `
              radial-gradient(circle 600px at ${50 + mousePos.x * 1.2}% ${30 + mousePos.y * 1.2}%, rgba(56, 189, 248, 0.14), transparent 70%),
              radial-gradient(circle 500px at ${75 - mousePos.x * 0.8}% ${70 - mousePos.y * 0.8}%, rgba(99, 102, 241, 0.15), transparent 60%),
              radial-gradient(circle 450px at ${20 + mousePos.x * 0.6}% ${80 + mousePos.y * 0.6}%, rgba(16, 185, 129, 0.08), transparent 60%)
            `,
            transition: "background 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* 3D Perspective Isometric Grid Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.28,
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            transform: `perspective(800px) rotateX(${25 + mousePos.y * 0.3}deg) translateY(${mousePos.y * 0.5}px) scale(1.15)`,
            transformOrigin: "center top",
            maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, transparent 80%)",
          }}
        />

        {/* Floating Ambient Glow Orbs */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "10%",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
            animation: "floatSlow 8s ease-in-out infinite",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "5%",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)",
            filter: "blur(35px)",
            pointerEvents: "none",
            animation: "floatReverse 9s ease-in-out infinite",
            zIndex: 0,
          }}
        />

        {/* Main Content Container with 3D Parallax Tracking */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "44px 28px 36px",
            transform: `rotateX(${-mousePos.y * 0.12}deg) rotateY(${mousePos.x * 0.12}deg)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Top Floating Badge & Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                borderRadius: "99px",
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(129, 140, 248, 0.3)",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--accent-indigo)",
                letterSpacing: "0.04em",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 15px rgba(99, 102, 241, 0.15)",
              }}
            >
              <Sparkles size={14} className="text-cyan-400" />
              <span>AUTONOMOUS CYBER DEFENSE 3.0</span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 14px",
                borderRadius: "99px",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--accent-green)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--accent-green)",
                  boxShadow: "0 0 8px var(--accent-green)",
                  display: "inline-block",
                }}
              />
              <span>Heuristic Grid Active</span>
            </div>
          </div>

          {/* Hero Title with 3D Depth */}
          <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 20px" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 5vw, 3.7rem)",
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
                color: "var(--text-primary)",
                marginBottom: "16px",
              }}
            >
              Real-Time Interception for
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 4px 12px rgba(56, 189, 248, 0.2))",
                }}
              >
                Phishing, Malicious URLs &amp; Smishing
              </span>
            </h1>

            <p
              style={{
                fontSize: "clamp(0.95rem, 1.8vw, 1.12rem)",
                color: "var(--text-secondary)",
                maxWidth: "640px",
                margin: "0 auto 28px",
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Multi-vector heuristic scanner and AI safety intelligence analyzing suspicious digital payloads in sub-second speed with complete sandboxed privacy.
            </p>

            {/* Quick Action CTAs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                flexWrap: "wrap",
                marginBottom: "38px",
              }}
            >
              <button
                onClick={() => navigate("/dashboard")}
                className="btn btn-primary"
                style={{
                  padding: "13px 28px",
                  fontSize: "0.95rem",
                  borderRadius: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  boxShadow: "0 8px 24px rgba(79, 70, 229, 0.35)",
                }}
              >
                <Shield size={18} />
                <span>Launch Threat Center</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate("/ai-chat")}
                className="btn btn-secondary"
                style={{
                  padding: "13px 24px",
                  fontSize: "0.95rem",
                  borderRadius: "14px",
                  fontWeight: 600,
                  background: "var(--surface-1)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <Bot size={18} color="var(--accent-blue)" />
                <span>Ask AI Security Advisor</span>
              </button>
            </div>
          </div>

          {/* 3D Liquid Glassmorphism Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            {SCAN_MODULES.map((item) => {
              const Icon = item.icon;
              const isCardHovered = activeCard === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(item.route)}
                  onMouseEnter={() => setActiveCard(item.id)}
                  onMouseLeave={() => setActiveCard(null)}
                  className="liquid-glass-card"
                  style={{
                    padding: "24px",
                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                    transformStyle: "preserve-3d",
                    transform: isCardHovered
                      ? `translateY(-6px) translateZ(12px) scale(1.01)`
                      : "translateY(0) translateZ(0) scale(1)",
                    border: isCardHovered
                      ? `1px solid ${item.accentHex}88`
                      : "1px solid var(--border)",
                  }}
                >
                  {/* Header with Icon and Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "18px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: `radial-gradient(circle, ${item.accentHex}25 0%, ${item.accentHex}08 100%)`,
                        border: `1px solid ${item.accentHex}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: item.accentHex,
                        boxShadow: `0 6px 16px ${item.accentHex}20`,
                        transition: "transform 0.3s ease",
                        transform: isCardHovered ? "scale(1.08) rotate(-4deg)" : "scale(1)",
                      }}
                    >
                      <Icon size={22} color={item.accentHex} />
                    </div>

                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: "99px",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Card Title & Subtitle */}
                  <h3
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{item.title}</span>
                    <ArrowRight
                      size={16}
                      style={{
                        color: isCardHovered ? item.accentHex : "var(--text-muted)",
                        transform: isCardHovered ? "translateX(3px)" : "translateX(0)",
                        transition: "all 0.2s ease",
                      }}
                    />
                  </h3>

                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: item.accentHex,
                      fontWeight: 600,
                      marginBottom: "12px",
                    }}
                  >
                    {item.subtitle}
                  </div>

                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.55,
                      marginBottom: "16px",
                    }}
                  >
                    {item.description}
                  </p>

                  {/* Footer Metric Pill */}
                  <div
                    style={{
                      paddingTop: "12px",
                      borderTop: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <Zap size={13} color={item.accentHex} />
                      Benchmark
                    </span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      {item.metric}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Telemetry Glass Bar */}
          <div
            style={{
              padding: "18px 24px",
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "18px",
              alignItems: "center",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(56, 189, 248, 0.12)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#38bdf8",
                }}
              >
                <Activity size={20} />
              </div>
              <div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  99.8%
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Diagnostic Accuracy
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#818cf8",
                }}
              >
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  &lt; 300ms
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Inspection Latency
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#10b981",
                }}
              >
                <Lock size={20} />
              </div>
              <div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  Zero-Leak
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Sandboxed Privacy
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f59e0b",
                }}
              >
                <Terminal size={20} />
              </div>
              <div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  Real-Time
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Live Feeds &amp; Intel
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HeroSection;
