import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import RevealOnScroll from "../components/RevealOnScroll";
import {
  Mail,
  Send,
  Headphones,
  Shield,
  CheckCircle2,
  Clock,
  Globe,
  AlertTriangle,
  Copy,
  Check,
  Building,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";

const OFFICIAL_EMAIL = "cybershieldai398@gmail.com";

const CATEGORIES = [
  { value: "Threat & False Positive Report", label: "🛡️ Threat / False Positive Report" },
  { value: "Technical Support", label: "⚙️ Technical & Scanner Support" },
  { value: "Account & Security Access", label: "🔐 Account & Security Access" },
  { value: "Vulnerability Disclosure", label: "🚨 Security Vulnerability Disclosure" },
  { value: "Enterprise & API Inquiries", label: "🏢 Enterprise & Custom API Plans" },
  { value: "General Question / Feedback", label: "💬 General Question / Feedback" },
];

const FAQS = [
  {
    q: "How fast does ThreatLens respond to inquiries?",
    a: "Our security engineering desk operates 24/7 with continuous triage. Standard queries receive responses within 2–4 hours, while Critical Incident and Vulnerability disclosures are escalated immediately to tier-3 incident responders.",
  },
  {
    q: "How can I report a suspected zero-day phishing campaign or false positive?",
    a: "Select 'Threat / False Positive Report' as your category and provide the suspicious email headers, URL, or screenshot. Our heuristic and AI classifiers will analyze the sample and update global detection rules.",
  },
  {
    q: "Will my message reach your official team directly?",
    a: "Yes! Every inquiry submitted through this portal or sent to cybershieldai398@gmail.com is dispatched straight to our primary security mailbox with a unique tracking Reference ID.",
  },
  {
    q: "Is my query data protected and confidential?",
    a: "All submissions are processed under SOC2 Type II security guidelines, 256-bit TLS encryption, and sandboxed memory handling. We never sell, share, or expose user inquiry details.",
  },
];

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Threat & False Positive Report",
    priority: "Normal",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const toast = useToast();

  // Auto-populate user data if logged in
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("profile");
      if (cached) {
        const u = JSON.parse(cached);
        setFormData((prev) => ({
          ...prev,
          name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.name || prev.name,
          email: u.email || prev.email,
        }));
      }
    } catch (e) {}

    api
      .get("/auth/me")
      .then((res) => {
        if (res.data) {
          const u = res.data;
          setFormData((prev) => ({
            ...prev,
            name: prev.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.name || "",
            email: prev.email || u.email || "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(OFFICIAL_EMAIL);
    setCopied(true);
    toast.success("Email Copied", `Copied official support desk: ${OFFICIAL_EMAIL}`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessInfo(null);

    if (!formData.name.trim()) {
      setErrorMsg("Please enter your full name.");
      toast.warning("Missing Name", "Please enter your name.");
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMsg("Please provide a valid email address so we can reply.");
      toast.warning("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMsg("Please describe your query or security concern.");
      toast.warning("Missing Message", "Please enter your query details.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/contact", formData);
      if (res.data && res.data.success) {
        const refId = res.data.referenceId || "QRY-" + Date.now();
        setSuccessInfo({
          message: res.data.message || `Your query was dispatched to ${OFFICIAL_EMAIL}`,
          referenceId: refId,
        });
        toast.success(
          "Query Dispatched Successfully",
          `Reference #${refId} routed to ${OFFICIAL_EMAIL}. We will reply shortly!`
        );
        setFormData((prev) => ({
          ...prev,
          phone: "",
          subject: "",
          message: "",
        }));
      } else {
        const errMsg = res.data?.error || "Could not submit your query. Please email us directly.";
        setErrorMsg(errMsg);
        toast.error("Submission Failed", errMsg);
      }
    } catch (err) {
      console.error("Contact submission error:", err);
      const errMsg =
        err.response?.data?.error ||
        `Submission encountered a network delay. You can also write to us directly at ${OFFICIAL_EMAIL}.`;
      setErrorMsg(errMsg);
      toast.error("Submission Issue", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "10px 0 40px" }}>
        {/* HEADER */}
        <div style={{ marginBottom: "28px" }}>
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
            <Headphones size={13} />
            <span>THREATLENS SECURITY OPERATIONS &amp; SUPPORT</span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.7rem, 3.2vw, 2.4rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Contact &amp; Security Support Desk
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "720px" }}>
            Facing a suspected phishing campaign, need technical assistance, or have a question? Submit your query below to route it directly to our official company desk at <strong>{OFFICIAL_EMAIL}</strong>.
          </p>
        </div>

        {/* TOP CONTACT HIGHLIGHT CHIPS */}
        <RevealOnScroll threshold={0.05}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            {/* CARD 1: OFFICIAL MAIL */}
            <div
              className="liquid-glass-card"
              style={{
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(56, 189, 248, 0.04))",
                border: "1px solid rgba(129, 140, 248, 0.25)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(99, 102, 241, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-indigo)",
                    flexShrink: 0,
                  }}
                >
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Official Mailbox
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {OFFICIAL_EMAIL}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "7px 12px",
                    borderRadius: "8px",
                    background: copied ? "rgba(16, 185, 129, 0.15)" : "var(--surface-2)",
                    border: copied ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border)",
                    color: copied ? "#10b981" : "var(--text-primary)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy Address"}</span>
                </button>
                <a
                  href={`mailto:${OFFICIAL_EMAIL}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "7px 12px",
                    borderRadius: "8px",
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid rgba(129, 140, 248, 0.3)",
                    color: "var(--accent-indigo)",
                    fontSize: "0.78rem",
                    fontWeight: 650,
                    textDecoration: "none",
                  }}
                >
                  <span>Open Email</span>
                </a>
              </div>
            </div>

            {/* CARD 2: INCIDENT RESPONSE */}
            <div
              className="liquid-glass-card"
              style={{
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(16, 185, 129, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10b981",
                    flexShrink: 0,
                  }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Response SLA
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    &lt; 2 Hours Resolution
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Queries are triaged via automated heuristic categorization and routed to on-call security responders.
              </div>
            </div>

            {/* CARD 3: SECURITY COMPLIANCE */}
            <div
              className="liquid-glass-card"
              style={{
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(56, 189, 248, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-blue)",
                    flexShrink: 0,
                  }}
                >
                  <Lock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Secure Handling
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    256-Bit Encrypted Channel
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Submissions, sample payloads, and logs are handled under sandboxed confidentiality protocols.
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* MAIN LAYOUT: FORM ON LEFT + FAQS ON RIGHT */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: "28px",
            alignItems: "start",
          }}
          className="responsive-grid"
        >
          {/* LEFT: SUBMIT INQUIRY FORM */}
          <RevealOnScroll threshold={0.05}>
            <div
              className="liquid-glass-card"
              style={{
                padding: "28px",
                borderRadius: "var(--radius-xl)",
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  Send a Message to Support
                </h3>
                <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                  Fill out the form below. Your query will be delivered directly to <strong>{OFFICIAL_EMAIL}</strong>.
                </p>
              </div>

              {/* SUCCESS BANNER */}
              {successInfo && (
                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    marginBottom: "20px",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <CheckCircle2 size={20} color="#10b981" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#10b981", marginBottom: "4px" }}>
                      Query Dispatched Successfully!
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
                      {successInfo.message}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "6px" }}>
                      Reference ID: <strong>{successInfo.referenceId}</strong> (Sent to {OFFICIAL_EMAIL})
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR BANNER */}
              {errorMsg && (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    marginBottom: "20px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    color: "#f87171",
                    fontSize: "0.85rem",
                  }}
                >
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* NAME & EMAIL ROW */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="responsive-grid">
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Vance"
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        fontSize: "0.88rem",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Your Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. alex@company.com"
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        fontSize: "0.88rem",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* CATEGORY & PRIORITY ROW */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }} className="responsive-grid">
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Inquiry Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        fontSize: "0.86rem",
                        outline: "none",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value} style={{ background: "var(--surface-1)", color: "var(--text-primary)" }}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Urgency / Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        fontSize: "0.86rem",
                        outline: "none",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="Normal" style={{ background: "var(--surface-1)", color: "var(--text-primary)" }}>🟢 Normal Inquiry</option>
                      <option value="High" style={{ background: "var(--surface-1)", color: "var(--text-primary)" }}>🟡 High Priority</option>
                      <option value="Critical" style={{ background: "var(--surface-1)", color: "var(--text-primary)" }}>🔴 Critical Incident</option>
                    </select>
                  </div>
                </div>

                {/* SUBJECT */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Subject Summary
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. False positive flag on internal domain or API question"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      fontSize: "0.88rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* DETAILED MESSAGE */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Detailed Query / Security Description *
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe the issue, suspicious link, email header, or question you are facing..."
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      fontSize: "0.88rem",
                      outline: "none",
                      resize: "vertical",
                      lineHeight: 1.6,
                      boxSizing: "border-box",
                      fontFamily: "var(--font-body)",
                    }}
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "6px" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    📬 Dispatches to <strong>{OFFICIAL_EMAIL}</strong>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      padding: "12px 26px",
                      fontSize: "0.92rem",
                      borderRadius: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "wait" : "pointer",
                    }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Sending Query...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Security Query</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </RevealOnScroll>

          {/* RIGHT: FREQUENTLY ASKED QUESTIONS & DIRECT CONTACT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* DIRECT REACH INFO */}
            <RevealOnScroll threshold={0.05}>
              <div
                className="liquid-glass-card"
                style={{
                  padding: "22px",
                  borderRadius: "var(--radius-lg)",
                  background: "rgba(99, 102, 241, 0.05)",
                  border: "1px solid rgba(129, 140, 248, 0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <Building size={16} color="var(--accent-indigo)" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    ThreatLens Threat Intelligence HQ
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 12px" }}>
                  Our distributed security engineering team monitors global deception signatures and malicious domains 24/7.
                </p>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div>📍 Security Operations Center: Global Cloud Mesh</div>
                  <div>📧 Primary Desk: <strong>{OFFICIAL_EMAIL}</strong></div>
                  <div>⚡ Escalation SLA: Under 2 Hours Guaranteed</div>
                </div>
              </div>
            </RevealOnScroll>

            {/* FREQUENTLY ASKED QUESTIONS */}
            <RevealOnScroll threshold={0.05}>
              <div
                className="liquid-glass-card"
                style={{
                  padding: "24px",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--accent-indigo)",
                    marginBottom: "16px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <HelpCircle size={15} />
                  <span>Frequently Asked Questions</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {FAQS.map((faq, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div
                        key={i}
                        style={{
                          borderRadius: "10px",
                          background: isOpen ? "var(--surface-2)" : "var(--surface-1)",
                          border: "1px solid var(--border)",
                          overflow: "hidden",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            background: "transparent",
                            border: "none",
                            color: "var(--text-primary)",
                            fontSize: "0.84rem",
                            fontWeight: 650,
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp size={15} color="var(--accent-indigo)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
                        </button>

                        {isOpen && (
                          <div
                            style={{
                              padding: "0 14px 12px",
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                              lineHeight: 1.55,
                              borderTop: "1px solid rgba(255,255,255,0.04)",
                            }}
                          >
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Contact;
