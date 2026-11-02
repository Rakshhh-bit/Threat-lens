import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import RevealOnScroll from "../components/RevealOnScroll";
import {
  FileText,
  Shield,
  AlertTriangle,
  Scale,
  Ban,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Mail,
  Eye,
  HelpCircle
} from "lucide-react";

const OFFICIAL_EMAIL = "cybershieldai398@gmail.com";

function TermsOfService() {
  const navigate = useNavigate();

  const SECTIONS = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms & Eligibility",
      icon: Scale,
      content: (
        <>
          <p>
            Welcome to <strong>ThreatLens</strong>. By accessing our website, creating an account, invoking our API endpoints, utilizing our AI Security Advisor, or executing security scans, you agree to be bound by these Terms of Service (“Terms”) and our Privacy Policy.
          </p>
          <p>
            If you are accessing ThreatLens on behalf of an enterprise or organization, you represent and warrant that you possess the legal authority to bind that entity to these Terms. If you do not agree to these Terms, you must immediately discontinue all use of the platform.
          </p>
        </>
      ),
    },
    {
      id: "services-scope",
      title: "2. Description of Services & Defensive Purpose",
      icon: Shield,
      content: (
        <>
          <p>
            ThreatLens provides real-time cybersecurity diagnostic capabilities, including:
          </p>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
            <li><strong>URL &amp; Domain Threat Scanning:</strong> Analysis of web addresses for malicious redirect loops, SSL anomalies, phishing clones, and known malware signatures.</li>
            <li><strong>Email Header &amp; Content Inspection:</strong> Parsing sender domains, SPF/DKIM flags, and psychological deception patterns.</li>
            <li><strong>SMS &amp; Smishing Defense:</strong> Pattern evaluation of messaging vectors, suspicious payment links, and fake bank notifications.</li>
            <li><strong>ThreatLens AI Advisor:</strong> Interactive cybersecurity guidance and incident response suggestions.</li>
          </ul>
        </>
      ),
    },
    {
      id: "acceptable-use",
      title: "3. Acceptable Use Policy & Restrictions",
      icon: Ban,
      content: (
        <>
          <p>
            ThreatLens is strictly engineered as a <strong>defensive cybersecurity and diagnostic tool</strong>. You agree to use the platform exclusively for lawful personal and organizational defensive security verification.
          </p>
          <div
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "12px",
              padding: "16px",
              margin: "12px 0",
            }}
          >
            <div style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem", marginBottom: "8px" }}>
              Strictly Prohibited Activities:
            </div>
            <ul style={{ paddingLeft: "18px", color: "var(--text-secondary)", fontSize: "0.84rem", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>Using ThreatLens to reverse-engineer defensive heuristics for the purpose of creating evasion techniques or weaponizing malware.</li>
              <li>Launching automated Denial of Service (DoS/DDoS) attacks or deliberately exhausting API rate limits.</li>
              <li>Attempting to bypass authentication mechanisms, forge JWT tokens, or escalate privilege levels.</li>
              <li>Using automated scrapers or bots without express prior written authorization from ThreatLens Inc.</li>
            </ul>
          </div>
        </>
      ),
    },
    {
      id: "heuristic-disclaimer",
      title: "4. Heuristic Scoring & Diagnostic Disclaimer",
      icon: AlertTriangle,
      content: (
        <>
          <p>
            ThreatLens delivers industry-leading multi-engine heuristic detection with high precision (99.8% detection threshold). However, due to the constantly evolving nature of zero-day exploits, novel malware variants, and state-sponsored cyber operations:
          </p>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
            <li>
              <strong>Diagnostic Nature:</strong> ThreatLens verdicts (SAFE, CAUTION, HIGH RISK) and numerical threat scores represent automated probabilistic assessments and expert heuristic analysis, not absolute guarantees of safety or compromise.
            </li>
            <li>
              <strong>User Discretion:</strong> You remain solely responsible for exercising prudent digital hygiene, verifying critical financial/credential requests, and refraining from executing unknown binaries.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "account-security",
      title: "5. User Account Integrity & Credentials",
      icon: Lock,
      content: (
        <>
          <p>
            When creating an account, you are responsible for maintaining the confidentiality of your login credentials and one-time verification passcodes (OTP).
          </p>
          <p>
            You agree to immediately notify our Security Operations team at <a href={`mailto:${OFFICIAL_EMAIL}`} style={{ color: "var(--accent-blue)", fontWeight: 600 }}>{OFFICIAL_EMAIL}</a> if you detect any unauthorized access or security anomaly related to your account.
          </p>
        </>
      ),
    },
    {
      id: "intellectual-property",
      title: "6. Intellectual Property Rights",
      icon: FileText,
      content: (
        <>
          <p>
            All software code, user interface designs, scoring algorithms, trademark assets, and defensive engine rules associated with <strong>ThreatLens</strong> are the exclusive intellectual property of ThreatLens Inc.
          </p>
          <p>
            Users are granted a non-exclusive, non-transferable, revocable license to access the web application and APIs in accordance with their subscription tier or permitted access rights.
          </p>
        </>
      ),
    },
    {
      id: "limitation-liability",
      title: "7. Limitation of Liability",
      icon: Scale,
      content: (
        <>
          <p>
            To the maximum extent permitted by applicable law, ThreatLens Inc., its officers, employees, and licensors shall not be held liable for any indirect, incidental, punitive, or consequential damages resulting from:
          </p>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
            <li>Decisions made or links visited based on diagnostic verdicts;</li>
            <li>Third-party service outages or latency in external threat intelligence feeds;</li>
            <li>Zero-day vulnerabilities or targeted spear-phishing attacks beyond standard algorithmic detection.</li>
          </ul>
        </>
      ),
    },
    {
      id: "governing-law",
      title: "8. Termination, Modifications & Contact",
      icon: Mail,
      content: (
        <>
          <p>
            ThreatLens reserves the right to suspend or terminate accounts that violate our Acceptable Use Policy or engage in abusive traffic patterns.
          </p>
          <p>
            We may update these Terms from time to time. Continued use of ThreatLens after revisions take effect constitutes acceptance of the amended Terms.
          </p>
          <div
            style={{
              marginTop: "12px",
              padding: "16px 20px",
              borderRadius: "10px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              fontSize: "0.88rem",
            }}
          >
            <div><strong>ThreatLens Legal &amp; Governance Desk</strong></div>
            <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
              Inquiry Mailbox:{" "}
              <a href={`mailto:${OFFICIAL_EMAIL}`} style={{ color: "var(--accent-blue)", fontWeight: 600 }}>
                {OFFICIAL_EMAIL}
              </a>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "10px 0 50px" }}>
        {/* HEADER */}
        <RevealOnScroll threshold={0.05}>
          <div style={{ marginBottom: "28px" }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                fontSize: "0.8rem",
                cursor: "pointer",
                marginBottom: "16px",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

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
              <FileText size={13} />
              <span>LEGAL AGREEMENT</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 3.5vw, 2.7rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: "8px",
              }}
            >
              ThreatLens Terms of Service
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <span>Effective Date: August 2026</span>
              <span>•</span>
              <span>Version: 3.2</span>
              <span>•</span>
              <span style={{ color: "var(--accent-indigo)", fontWeight: 600 }}>Standard User Agreement</span>
            </div>
          </div>
        </RevealOnScroll>

        {/* SUMMARY CARD */}
        <RevealOnScroll threshold={0.08} style={{ marginBottom: "32px" }}>
          <div
            className="liquid-glass-card"
            style={{
              padding: "20px 24px",
              borderRadius: "var(--radius-lg)",
              borderLeft: "4px solid var(--accent-indigo)",
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
            }}
          >
            <Shield size={22} color="var(--accent-indigo)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.88rem", lineHeight: 1.65, color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Summary:</strong> These Terms outline your rights, our defensive security mission, acceptable use mandates, and the diagnostic nature of our automated scanning algorithms.
            </div>
          </div>
        </RevealOnScroll>

        {/* SECTIONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <RevealOnScroll key={sec.id} threshold={0.05}>
                <div
                  id={sec.id}
                  className="liquid-glass-card"
                  style={{
                    padding: "28px",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "rgba(99, 102, 241, 0.12)",
                        border: "1px solid rgba(129, 140, 248, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent-indigo)",
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <h2
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        margin: 0,
                      }}
                    >
                      {sec.title}
                    </h2>
                  </div>

                  <div
                    style={{
                      fontSize: "0.88rem",
                      lineHeight: 1.7,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {sec.content}
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* BOTTOM NAVIGATION */}
        <div
          style={{
            marginTop: "36px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <button
            onClick={() => navigate("/privacy")}
            className="btn btn-secondary"
            style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "10px" }}
          >
            <Lock size={14} />
            View Privacy Policy
          </button>

          <button
            onClick={() => navigate("/about")}
            className="btn btn-secondary"
            style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "10px" }}
          >
            <Eye size={14} />
            About ThreatLens
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default TermsOfService;
