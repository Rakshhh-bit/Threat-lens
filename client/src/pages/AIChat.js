import React, { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import RevealOnScroll from "../components/RevealOnScroll";
import {
  Send,
  Download,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  CheckCircle2,
  Camera,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import Tesseract from "tesseract.js";

const SUGGESTIONS = [
  "How can I spot fake login pages?",
  "Is 'http://paypal-security-auth.net' safe?",
  "What should I do if I clicked a phishing link?",
  "How to verify email sender headers?",
];

function AIChat() {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hello! I am your ThreatLens Security Advisor. You can ask me any cybersecurity questions or upload/paste a screenshot of any suspicious email, link, or message.",
    },
  ]);
  const [input, setInput] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");
  const fileInputRef = useRef(null);

  const processImageFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setScreenshotPreview(dataUrl);
      setIsOcrProcessing(true);
      setOcrStatus("Analyzing screenshot with OCR...");

      try {
        const result = await Tesseract.recognize(dataUrl, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              const p = Math.round((m.progress || 0) * 100);
              setOcrStatus(`Extracting text... ${p}%`);
            }
          },
        });

        const rawText = (result?.data?.text || "").trim();
        if (rawText) {
          setInput((prev) => (prev ? `${prev}\n\n[Screenshot Content]: ${rawText}` : `[Screenshot Content]: ${rawText}`));
          setOcrStatus("Text extracted from screenshot! Add a question or click Send.");
        } else {
          setOcrStatus("Screenshot loaded. Please describe what you want me to check.");
        }
      } catch (err) {
        console.error(err);
        setOcrStatus("Screenshot loaded.");
      } finally {
        setIsOcrProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            processImageFile(blob);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const send = (msgText) => {
    const textToSend = msgText || input;
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = {
      from: "user",
      text: textToSend.trim(),
      image: screenshotPreview,
    };
    setMessages((m) => [...m, userMsg]);
    if (!msgText) {
      setInput("");
      setScreenshotPreview(null);
      setOcrStatus("");
    }

    setTimeout(() => {
      const lower = userMsg.text.toLowerCase();
      let reply = `Here is my assessment for your query:\n\n1. Check for mismatched sender domain extensions (.xyz, .tk, .top, .live).\n2. Look for urgent demand tactics (e.g. "account suspended in 24 hours").\n3. Never enter credentials on unverified third-party pages.\n4. Always inspect URL redirects before submitting sensitive tokens.`;

      if (lower.includes("paypal")) {
        reply = `🚨 Warning: Unverified domain detected. Official PayPal communications ONLY originate from "paypal.com". Never enter passwords on alternative domains.`;
      } else if (lower.includes("usps") || lower.includes("package") || lower.includes("delivery")) {
        reply = `🚨 High Smishing Alert: Package tracking notifications requiring redelivery fees or personal address confirmation via shortened or lookalike URLs are frequent parcel delivery scams. Genuine carriers never ask for credit cards over SMS.`;
      } else if (lower.includes("bank") || lower.includes("otp") || lower.includes("verify")) {
        reply = `⚠️ Security Precaution: Legitimate financial institutions will never solicit your one-time password (OTP), PIN, or login credentials via email or SMS link.`;
      }

      setMessages((m) => [...m, { from: "ai", text: reply }]);
    }, 600);
  };

  const exportPDF = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const html = `
      <html><head><title>ThreatLens Security Transcript</title></head>
      <body style="background:#0a0d14;color:#f8fafc;font-family:sans-serif;padding:30px;">
        <h2>ThreatLens Security Advisor Transcript</h2>
        <hr style="border-color:rgba(255,255,255,0.1)"/>
        ${messages
          .map(
            (m) =>
              `<div style="margin: 16px 0;"><strong>${
                m.from === "ai" ? "AI Advisor" : "You"
              }:</strong><p style="color:#cbd5e1">${m.text}</p></div>`
          )
          .join("")}
      </body></html>`;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  return (
    <Layout>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "10px 0 40px" }}>
        {/* HEADER */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
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
              <span>AI THREAT CONSULTANT</span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              AI Security Advisor
            </h1>
          </div>
          <button
            onClick={exportPDF}
            className="btn btn-secondary"
            style={{ fontSize: "0.85rem", padding: "10px 18px", borderRadius: "12px" }}
          >
            <Download size={15} />
            Export Advisory Log
          </button>
        </div>

        {/* CHAT CONTAINER WITH REVEAL ON SCROLL */}
        <RevealOnScroll threshold={0.05}>
          <div
            className="liquid-glass-card"
            style={{
              borderRadius: "var(--radius-xl)",
              display: "flex",
              flexDirection: "column",
              height: "580px",
              overflow: "hidden",
            }}
          >
            {/* TOP CHAT STATUS BAR */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 6px #10b981",
                  }}
                />
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Advisor Online
                </span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Screenshot OCR &amp; Multi-Engine v3.0
              </span>
            </div>

            {/* MESSAGES LIST */}
            <div
              style={{
                flex: 1,
                padding: "20px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {messages.map((m, i) => {
                const isAi = m.from === "ai";
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignSelf: isAi ? "flex-start" : "flex-end",
                      maxWidth: "85%",
                    }}
                  >
                    {isAi && (
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                        }}
                      >
                        <Bot size={18} color="white" />
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {m.image && (
                        <div
                          style={{
                            maxWidth: "240px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <img
                            src={m.image}
                            alt="Uploaded Screenshot"
                            style={{ width: "100%", display: "block" }}
                          />
                        </div>
                      )}
                      <div
                        style={{
                          padding: "12px 18px",
                          borderRadius: isAi
                            ? "16px 16px 16px 4px"
                            : "16px 16px 4px 16px",
                          background: isAi
                            ? "var(--surface-2)"
                            : "linear-gradient(135deg, #4f46e5, #3b82f6)",
                          color: isAi ? "var(--text-primary)" : "#ffffff",
                          fontSize: "0.9rem",
                          lineHeight: 1.55,
                          border: isAi ? "1px solid var(--border)" : "none",
                          whiteSpace: "pre-wrap",
                          boxShadow: isAi ? "none" : "0 4px 14px rgba(79,70,229,0.3)",
                        }}
                      >
                        {m.text}
                      </div>
                    </div>

                    {!isAi && (
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: "var(--surface-3)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <User size={18} color="var(--text-primary)" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SUGGESTION CHIPS */}
            <div
              style={{
                padding: "8px 20px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: "8px",
                overflowX: "auto",
                background: "var(--surface-1)",
              }}
            >
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => send(s)}
                  style={{
                    fontSize: "0.75rem",
                    padding: "5px 12px",
                    borderRadius: "99px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* SCREENSHOT ATTACHMENT PREVIEW */}
            {screenshotPreview && (
              <div
                style={{
                  padding: "8px 20px",
                  background: "var(--surface-2)",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={screenshotPreview}
                    alt="Attached thumbnail"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      objectFit: "cover",
                      border: "1px solid var(--border)",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-blue)", fontWeight: 600 }}>
                    {ocrStatus || "Screenshot attached"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setScreenshotPreview(null);
                    setOcrStatus("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#f87171",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* INPUT BOX */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: "10px",
                alignItems: "center",
                background: "var(--surface-1)",
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processImageFile(e.target.files[0]);
                  }
                }}
                style={{ display: "none" }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                title="Upload screenshot to extract text & question"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--accent-blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Camera size={18} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about a suspicious email, URL, or paste a screenshot (Ctrl+V)..."
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: "12px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: "0.88rem",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                }}
              />

              <button
                onClick={() => send()}
                className="btn btn-primary"
                style={{ padding: "11px 18px", borderRadius: "12px" }}
              >
                <Send size={15} />
                Send
              </button>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </Layout>
  );
}

export default AIChat;
