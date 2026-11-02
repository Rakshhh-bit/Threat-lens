import React, { useState, useRef, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  RefreshCw,
  Lock,
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  FileSearch,
  Check,
  Zap,
} from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";
import Tesseract from "tesseract.js";
import { useToast } from "../context/ToastContext";

function ScanUI({
  title,
  placeholder,
  value,
  setValue,
  onClick,
  risk,
  result,
  summary,
  reasons = [],
  recommendation,
  verdict,
  riskPercent,
  textarea,
  tips = [],
  samples = [],
  scanLabel = "Analyze Threat",
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFileName, setImageFileName] = useState("");
  const [imageFileSize, setImageFileSize] = useState("");
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState("");
  const [extractedSnippet, setExtractedSnippet] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [detectedUrls, setDetectedUrls] = useState([]);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState("");
  const toast = useToast();

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const isHigh = risk === "HIGH" || risk === "High";
  const isMed = risk === "MEDIUM" || risk === "Medium";

  const riskColor = isHigh ? "#ef4444" : isMed ? "#f59e0b" : "#10b981";
  const riskBg = isHigh
    ? "rgba(239,68,68,0.1)"
    : isMed
    ? "rgba(245,158,11,0.1)"
    : "rgba(16,185,129,0.08)";
  const riskBorder = isHigh
    ? "rgba(239,68,68,0.3)"
    : isMed
    ? "rgba(245,158,11,0.3)"
    : "rgba(16,185,129,0.25)";

  const RiskIcon = isHigh ? AlertTriangle : isMed ? Info : CheckCircle;

  // Process and extract text from an image file
  const processImageFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.warning("Invalid File", "Please select a valid image screenshot (PNG, JPG, WebP).");
      return;
    }

    toast.info("Processing Screenshot", `Running OCR text extraction on ${file.name || "image"}...`);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setImagePreview(dataUrl);
      setImageFileName(file.name || "Screenshot.png");
      setImageFileSize((file.size / 1024).toFixed(1) + " KB");
      setIsOcrProcessing(true);
      setOcrProgress(5);
      setOcrStatusText("Initializing image OCR engine...");
      setExtractedSnippet("");
      setOcrSuccessMsg("");

      try {
        const result = await Tesseract.recognize(dataUrl, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              const p = Math.round((m.progress || 0) * 100);
              setOcrProgress(p);
              setOcrStatusText(`Reading screenshot text... ${p}%`);
            } else if (m.status) {
              setOcrStatusText(`${m.status}...`);
            }
          },
        });

        const rawText = (result?.data?.text || "").trim();

        if (rawText) {
          // Extract URLs if available
          const urlRegex = /(https?:\/\/[^\s"'<>\)]+|www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s"'<>\)]*|[a-zA-Z0-9-]+\.(?:com|org|net|io|co|xyz|info|biz|ru|cn|top|app|dev|me|online|live|shop|club)(?:\/[^\s"'<>\)]*)?)/gi;
          const foundUrls = Array.from(new Set(rawText.match(urlRegex) || []));
          setDetectedUrls(foundUrls);

          // If this is a URL scanner (not textarea) and URLs were found, prioritize the primary URL
          if (!textarea && foundUrls.length > 0) {
            let primaryUrl = foundUrls[0];
            if (!primaryUrl.startsWith("http://") && !primaryUrl.startsWith("https://")) {
              primaryUrl = "https://" + primaryUrl;
            }
            setValue(primaryUrl);
            setExtractedSnippet(primaryUrl);
          } else {
            setValue(rawText);
            setExtractedSnippet(rawText);
          }

          setOcrSuccessMsg("Screenshot text extracted successfully!");
          toast.success(
            "Screenshot Parsed",
            foundUrls.length > 0
              ? `Extracted text and identified ${foundUrls.length} link(s) for threat analysis.`
              : "Screenshot content extracted successfully into scanner."
          );
        } else {
          setOcrSuccessMsg("No clear text detected in screenshot. You can type directly or upload another image.");
          toast.info("No Text Detected", "No clear text was found in the image. Please enter content manually.");
        }
      } catch (err) {
        console.error("OCR Error:", err);
        setOcrSuccessMsg("Could not parse image text automatically. Please enter text manually.");
        toast.error("OCR Parsing Failed", "Could not read text from screenshot. Please type or paste manually.");
      } finally {
        setIsOcrProcessing(false);
        setOcrProgress(100);
      }
    };
    reader.readAsDataURL(file);
  };

  // Listen for Clipboard Paste (Ctrl+V / Cmd+V)
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
  }, [textarea]);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        processImageFile(file);
      }
    }
  };

  const clearScreenshot = () => {
    setImagePreview(null);
    setImageFileName("");
    setImageFileSize("");
    setExtractedSnippet("");
    setDetectedUrls([]);
    setOcrSuccessMsg("");
    setOcrProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "10px 0 40px" }}>
      {/* PAGE HEADER */}
      <div style={{ marginBottom: "24px" }}>
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
          <span>MULTI-ENGINE THREAT INSPECTOR</span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3vw, 2.3rem)",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
          Paste suspicious text, enter links, or directly <strong>upload a screenshot</strong> to scan with AI &amp; multi-engine heuristics.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: "24px",
          alignItems: "start",
        }}
        className="responsive-grid"
      >
        {/* LEFT COLUMN: INPUT, SCREENSHOT UPLOAD & ANALYSIS */}
        <div>
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="liquid-glass-card"
            style={{
              padding: "24px",
              borderRadius: "var(--radius-lg)",
              marginBottom: "20px",
              border: isDragging
                ? "2px dashed var(--accent-blue)"
                : "1px solid var(--border)",
              background: isDragging
                ? "rgba(56, 189, 248, 0.08)"
                : "var(--surface-1)",
              transition: "all 0.2s ease",
            }}
          >
            {/* TOP BAR WITH SCREENSHOT UPLOAD TRIGGER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <label
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Content To Inspect</span>
              </label>

              {/* UPLOAD SCREENSHOT BUTTON */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                  id="screenshot-upload-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    borderRadius: "8px",
                    background: "rgba(56, 189, 248, 0.12)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    color: "var(--accent-blue)",
                    fontSize: "0.78rem",
                    fontWeight: 650,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  title="Upload or drop a screenshot to extract text & links automatically"
                >
                  <Camera size={14} />
                  <span>Upload Screenshot</span>
                </button>
              </div>
            </div>

            {/* SCREENSHOT PREVIEW & OCR STATUS CARD */}
            {imagePreview && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: "var(--surface-2)",
                  border: "1px solid rgba(129, 140, 248, 0.3)",
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid var(--border)",
                        flexShrink: 0,
                        background: "#000",
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="Uploaded Screenshot"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {imageFileName}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {imageFileSize} • Screenshot loaded
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: "var(--surface-1)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                      }}
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={clearScreenshot}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#f87171",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title="Remove Screenshot"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* OCR PROGRESS OR RESULT */}
                {isOcrProcessing ? (
                  <div style={{ marginTop: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "var(--accent-blue)", marginBottom: "4px", fontWeight: 600 }}>
                      <span>{ocrStatusText}</span>
                      <span>{ocrProgress}%</span>
                    </div>
                    <div style={{ width: "100%", height: "5px", background: "var(--surface-1)", borderRadius: "99px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${ocrProgress}%`,
                          background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                          borderRadius: "99px",
                          transition: "width 0.2s ease",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  ocrSuccessMsg && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#34d399",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 600,
                      }}
                    >
                      <Check size={14} color="#10b981" />
                      <span>{ocrSuccessMsg}</span>
                    </div>
                  )
                )}

                {/* DETECTED URL CHIPS IF APPLICABLE */}
                {detectedUrls.length > 0 && (
                  <div style={{ marginTop: "4px" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>
                      Detected Links in Screenshot:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {detectedUrls.map((u, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setValue(u)}
                          style={{
                            fontSize: "0.72rem",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background: value === u ? "rgba(99, 102, 241, 0.2)" : "var(--surface-1)",
                            border: value === u ? "1px solid var(--accent-indigo)" : "1px solid var(--border)",
                            color: value === u ? "var(--text-primary)" : "var(--accent-blue)",
                            cursor: "pointer",
                            maxWidth: "280px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={`Click to set as scan target: ${u}`}
                        >
                          🔗 {u}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TEXT INPUT / TEXTAREA */}
            {textarea ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                rows={6}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.6,
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
              />
            )}

            {/* DRAG-AND-DROP HINT */}
            {!imagePreview && (
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                }}
              >
                <span>💡 Tip: Drag &amp; drop or press <strong>Ctrl+V / Cmd+V</strong> to paste a screenshot directly</span>
              </div>
            )}

            {/* QUICK SAMPLES */}
            {samples.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                {samples.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setValue(s.text)}
                    style={{
                      fontSize: "0.75rem",
                      padding: "5px 12px",
                      borderRadius: "8px",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontWeight: 500,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={onClick}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  fontSize: "0.92rem",
                  borderRadius: "12px",
                }}
              >
                <Shield size={16} />
                {scanLabel}
              </button>

              {(value || imagePreview) && (
                <button
                  type="button"
                  onClick={() => {
                    setValue("");
                    clearScreenshot();
                  }}
                  className="btn btn-secondary"
                  style={{ padding: "12px 18px", borderRadius: "12px" }}
                >
                  <RefreshCw size={15} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ANALYSIS RESULTS WITH REVEAL */}
          {risk && (
            <RevealOnScroll threshold={0.05}>
              <div
                className="liquid-glass-card"
                style={{
                  padding: "24px",
                  borderRadius: "var(--radius-lg)",
                  background: riskBg,
                  border: `1px solid ${riskBorder}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {/* HEADER */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <RiskIcon size={22} color={riskColor} />
                    <div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Security Assessment
                      </div>
                      {verdict && (
                        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                          Verdict: <strong style={{ color: riskColor }}>{verdict}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "5px 14px",
                      borderRadius: "99px",
                      background: "var(--surface-1)",
                      border: `1px solid ${riskBorder}`,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: riskColor,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {(risk || "").toUpperCase()} THREAT LEVEL
                  </div>
                </div>

                {/* RISK METER */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      THREAT PROBABILITY SCORE
                    </span>
                    <span style={{ fontSize: "0.85rem", color: riskColor, fontWeight: 800 }}>
                      {riskPercent || 0}%
                    </span>
                  </div>
                  <div style={{ height: "8px", background: "var(--surface-2)", borderRadius: "99px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(Math.max(riskPercent || 0, isHigh ? 75 : isMed ? 40 : 5), 100)}%`,
                        borderRadius: "99px",
                        background: isHigh
                          ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                          : isMed
                          ? "linear-gradient(90deg, #10b981, #f59e0b)"
                          : "#10b981",
                        transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    />
                  </div>
                </div>

                {/* SHORT EXECUTIVE THREAT SUMMARY */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "var(--surface-1)",
                    border: `1px solid ${riskBorder}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Sparkles size={16} color={riskColor} />
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: riskColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Executive Threat Summary
                    </span>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                    {summary || result || "Scan completed with no significant threat markers identified."}
                  </p>
                </div>

                {/* WHY IS THIS A THREAT / KEY REASONS BREAKDOWN */}
                {((reasons && reasons.length > 0) || result) && (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <FileSearch size={16} color="var(--accent-blue)" />
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {isHigh || isMed ? "Why This Was Flagged (Key Threat Reasons)" : "Security & Safety Verification Highlights"}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {reasons && reasons.length > 0 ? (
                        reasons.map((r, i) => {
                          const parts = typeof r === "string" ? r.split(/:\s*(.+)/) : [String(r)];
                          const titlePart = parts.length > 1 ? parts[0] : "";
                          const detailPart = parts.length > 1 ? parts[1] : parts[0];

                          return (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                background: "var(--surface-2)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <div style={{ marginTop: "2px", flexShrink: 0 }}>
                                {isHigh ? (
                                  <AlertTriangle size={15} color="#ef4444" />
                                ) : isMed ? (
                                  <Info size={15} color="#f59e0b" />
                                ) : (
                                  <Check size={15} color="#10b981" />
                                )}
                              </div>
                              <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                {titlePart && (
                                  <strong style={{ color: "var(--text-primary)", marginRight: "6px" }}>
                                    {titlePart}:
                                  </strong>
                                )}
                                <span>{detailPart}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          {result}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* RECOMMENDED ACTION */}
                {recommendation && (
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "12px",
                      background: isHigh
                        ? "rgba(239, 68, 68, 0.08)"
                        : isMed
                        ? "rgba(245, 158, 11, 0.08)"
                        : "rgba(16, 185, 129, 0.08)",
                      border: `1px solid ${riskBorder}`,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <Shield size={16} color={riskColor} style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: riskColor, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "2px" }}>
                        Recommended Action
                      </div>
                      <div style={{ fontSize: "0.84rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
                        {recommendation}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </RevealOnScroll>
          )}
        </div>

        {/* RIGHT COLUMN: REASSURING GUIDE & SCREENSHOT TIPS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* SCREENSHOT OCR FEATURE CARD */}
          <RevealOnScroll threshold={0.05}>
            <div
              className="liquid-glass-card"
              style={{
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                background: "rgba(56, 189, 248, 0.05)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Camera size={16} color="var(--accent-blue)" />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent-blue)" }}>
                  Screenshot Quick Scan
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                Have a suspicious email, message, or website on your screen? Take a quick screenshot, paste or upload it here, and our client-side OCR engine will extract text and links instantly.
              </p>
            </div>
          </RevealOnScroll>

          {/* WHAT WE INSPECT */}
          <RevealOnScroll threshold={0.05}>
            <div
              className="liquid-glass-card"
              style={{
                padding: "22px",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--accent-indigo)",
                  marginBottom: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Multi-Layer Inspection
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <CheckCircle size={15} color="var(--accent-indigo)" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          {/* REASSURING TRUST CARD */}
          <RevealOnScroll threshold={0.05}>
            <div
              className="liquid-glass-card"
              style={{
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                background: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Lock size={16} color="var(--accent-green)" />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent-green)" }}>
                  Sandboxed Privacy Guarantee
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                All scans execute in a memory-isolated sandbox. Your uploaded screenshots and input content are evaluated strictly on demand and never stored or shared.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}

export default ScanUI;
