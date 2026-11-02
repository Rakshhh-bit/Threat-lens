import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import RevealOnScroll from "../components/RevealOnScroll";
import {
  Shield,
  Lock,
  FileText,
  Eye,
  Server,
  KeyRound,
  UserCheck,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const OFFICIAL_EMAIL = "cybershieldai398@gmail.com";

function PrivacyPolicy() {
  const navigate = useNavigate();

  const SECTIONS = [
    {
      id: "commitment",
      title: "1. Privacy Commitment & Architecture",
      icon: Shield,
      content: (
        <>
          <p>
            At <strong>ThreatLens</strong> (“we”, “our”, or “us”), we believe that security software should safeguard your digital life without compromising your personal privacy. This Privacy Policy sets forth how ThreatLens collects, uses, processes, and protects your information when you interact with our website, diagnostic scan engines, REST APIs, and AI Security Advisor.
          </p>
          <p>
            Unlike advertising-supported platforms or speculative data aggregators, ThreatLens operates on a strict <strong>Data Minimization and Zero-Harvesting Standard</strong>. We do not sell, rent, monetize, or disclose your scanned content, communication payloads, or personal records to commercial data brokers.
          </p>
        </>
      ),
    },
    {
      id: "information-collected",
      title: "2. Information We Collect",
      icon: Eye,
      content: (
        <>
          <p>We collect only the minimal data necessary to deliver real-time cybersecurity inspection and authenticated account features:</p>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
            <li>
              <strong>Account &amp; Authentication Credentials:</strong> When creating an account, we collect your name, email address, password hash (encrypted via salted bcrypt algorithms), and optional mobile phone number for multi-factor authentication (OTP).
            </li>
            <li>
              <strong>User-Submitted Diagnostic Payloads:</strong> Content explicitly submitted by you for threat inspection—including URLs, domain names, email headers, text snippets, and uploaded screenshots for OCR extraction.
            </li>
            <li>
              <strong>Technical Telemetry &amp; System Logs:</strong> Non-personally identifiable metadata such as IP address, browser user-agent, operating system, and request timestamps used exclusively for rate limiting, DDoS mitigation, and server diagnostics.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "processing-retention",
      title: "3. Ephemeral Processing & Payload Retention",
      icon: Server,
      content: (
        <>
          <p>
            A cornerstone of our technical design is <strong>Ephemeral In-Memory Inspection</strong>. When you scan an email, message, or link:
          </p>
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "16px",
              margin: "12px 0",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem" }}>
              <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span><strong>Volatile Parsing:</strong> Text payloads and OCR image frames are evaluated in ephemeral RAM buffers. Once the heuristic scoring completes, the raw input buffer is discarded.</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem" }}>
              <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span><strong>Timeline Metadata:</strong> Only high-level audit summaries (verdict, threat score, target domain, and timestamp) are stored in your private history timeline to provide your security reports.</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem" }}>
              <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span><strong>Client-Side Optical Recognition:</strong> Screenshot OCR is processed directly in your local browser sandbox via WebAssembly (Tesseract.js) whenever feasible to minimize server data transit.</span>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "subprocessors",
      title: "4. Multi-Engine Security Integrations & Sub-Processors",
      icon: KeyRound,
      content: (
        <>
          <p>
            To cross-reference zero-day threat intelligence and emerging malware campaigns, ThreatLens queries industry-standard reputational feeds via secure proxy endpoints:
          </p>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
            <li><strong>Google Safe Browsing:</strong> Sanitized domain hashes are queried to verify against known malware, deceptive landing pages, and exploit kits.</li>
            <li><strong>DNSBL &amp; WHOIS Registries:</strong> Autonomous system (ASN) routing and domain age data are verified to catch newly registered lookalike domains.</li>
            <li><strong>URLScan &amp; Threat Intelligence Proxies:</strong> URLs are evaluated against known malicious redirect graphs and bad SSL certificates.</li>
          </ul>
        </>
      ),
    },
    {
      id: "security-safeguards",
      title: "5. Cryptographic & Operational Safeguards",
      icon: Lock,
      content: (
        <>
          <p>
            We implement defense-in-depth cryptographic and administrative security controls:
          </p>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
            <li><strong>Transport Security:</strong> All client-to-server traffic is mandated over TLS 1.3 encryption with strict HTTP Strict Transport Security (HSTS) headers.</li>
            <li><strong>Password Protection:</strong> Passwords are cryptographically salted and hashed using standard bcrypt algorithms. Plaintext passwords are never logged or stored.</li>
            <li><strong>Role-Based Access Control (RBAC):</strong> Administrative operations are strictly segregated and require elevated administrative role tokens.</li>
            <li><strong>Session Isolation:</strong> JWT authentication tokens are signed with cryptographically random secrets and expire automatically.</li>
          </ul>
        </>
      ),
    },
    {
      id: "user-rights",
      title: "6. User Rights & Data Subject Control (GDPR / CCPA)",
      icon: UserCheck,
      content: (
        <>
          <p>
            Regardless of your geographic location, ThreatLens extends comprehensive data autonomy rights:
          </p>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
            <li><strong>Right to Access &amp; Portability:</strong> You can review your profile metadata and scan audit history at any time through your Profile and Timeline dashboards.</li>
            <li><strong>Right to Rectification:</strong> Update or modify your profile details instantly in your Account Settings.</li>
            <li><strong>Right to Erasure (“Right to Be Forgotten”):</strong> You may request permanent deletion of your account and associated audit history by contacting our Data Privacy Desk.</li>
            <li><strong>Right to Opt-Out:</strong> You have the right to disable non-essential notification alerts and audio feedback in your interface preferences.</li>
          </ul>
        </>
      ),
    },
    {
      id: "contact-updates",
      title: "7. Policy Updates & Data Protection Contact",
      icon: Mail,
      content: (
        <>
          <p>
            ThreatLens may periodically update this Privacy Policy to reflect advancements in our threat inspection engines or legal compliance requirements. Material changes will be highlighted via in-app banners or notification advisories.
          </p>
          <p>
            For privacy inquiries, audit deletion requests, or data protection officer communications:
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
            <div><strong>ThreatLens Data Privacy &amp; Compliance Office</strong></div>
            <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
              Inquiry Mailbox:{" "}
              <a href={`mailto:${OFFICIAL_EMAIL}`} style={{ color: "var(--accent-blue)", fontWeight: 600 }}>
                {OFFICIAL_EMAIL}
              </a>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "4px" }}>
              Response SLA: 24 to 48 business hours for formal compliance requests.
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
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#38bdf8",
                marginBottom: "10px",
              }}
            >
              <Lock size={13} />
              <span>TRANSPARENCY &amp; COMPLIANCE</span>
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
              ThreatLens Privacy Policy
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <span>Effective Date: August 2026</span>
              <span>•</span>
              <span>Version: 3.2 (Production Security Standard)</span>
              <span>•</span>
              <span style={{ color: "#34d399", fontWeight: 600 }}>GDPR &amp; CCPA Aligned</span>
            </div>
          </div>
        </RevealOnScroll>

        {/* POLICY SUMMARY CALLOUT */}
        <RevealOnScroll threshold={0.08} style={{ marginBottom: "32px" }}>
          <div
            className="liquid-glass-card"
            style={{
              padding: "20px 24px",
              borderRadius: "var(--radius-lg)",
              borderLeft: "4px solid #38bdf8",
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
            }}
          >
            <Shield size={22} color="#38bdf8" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.88rem", lineHeight: 1.65, color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Our Fundamental Privacy Rule:</strong> We treat every link, email header, and text message you inspect as confidential diagnostic material. ThreatLens evaluates payloads in volatile memory buffers and will never sell or syndicate your diagnostic data to advertisers.
            </div>
          </div>
        </RevealOnScroll>

        {/* POLICY SECTIONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {SECTIONS.map((sec, idx) => {
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
            onClick={() => navigate("/terms")}
            className="btn btn-secondary"
            style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "10px" }}
          >
            <FileText size={14} />
            View Terms of Service
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

export default PrivacyPolicy;
