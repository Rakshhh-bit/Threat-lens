import React, { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  X,
  ExternalLink,
  Sparkles,
  Shield,
  Activity,
  ArrowRight
} from "lucide-react";

function ToastItem({ toast, onDismiss }) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const duration = toast.duration || 5000;
  const isHighRisk = toast.risk === "HIGH" || toast.type === "error" || toast.risk === "High";
  const isMedRisk = toast.risk === "MEDIUM" || toast.type === "warning" || toast.risk === "Medium";
  const isLowRisk = toast.risk === "LOW" || toast.type === "success" || toast.risk === "Low";

  // Color & Aesthetic tokens
  let accentColor = "#38bdf8";
  let bgGradient = "linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.94) 100%)";
  let borderStyle = "1px solid rgba(56, 189, 248, 0.3)";
  let glowShadow = "0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.15)";
  let IconComponent = Info;
  let badgeText = toast.risk ? `${toast.risk} RISK` : toast.type?.toUpperCase();

  if (isHighRisk) {
    accentColor = "#ef4444";
    borderStyle = "1px solid rgba(239, 68, 68, 0.45)";
    glowShadow = "0 10px 32px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(239, 68, 68, 0.25)";
    IconComponent = ShieldAlert;
    badgeText = toast.score ? `${toast.score}% RISK • HIGH` : "HIGH RISK THREAT";
  } else if (isMedRisk) {
    accentColor = "#f59e0b";
    borderStyle = "1px solid rgba(245, 158, 11, 0.4)";
    glowShadow = "0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 16px rgba(245, 158, 11, 0.2)";
    IconComponent = AlertTriangle;
    badgeText = toast.score ? `${toast.score}% RISK • MEDIUM` : "MEDIUM RISK";
  } else if (isLowRisk) {
    accentColor = "#10b981";
    borderStyle = "1px solid rgba(16, 185, 129, 0.35)";
    glowShadow = "0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 16px rgba(16, 185, 129, 0.15)";
    IconComponent = CheckCircle2;
    badgeText = toast.score !== undefined ? `${toast.score}% RISK • SAFE` : "VERIFIED SAFE";
  }

  // Timer countdown
  useEffect(() => {
    if (duration === 0 || isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, isPaused, toast.id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        width: "100%",
        maxWidth: "400px",
        borderRadius: "14px",
        background: bgGradient,
        border: borderStyle,
        boxShadow: glowShadow,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        overflow: "hidden",
        position: "relative",
        animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        color: "#f8fafc",
        pointerEvents: "auto",
        marginBottom: "10px",
      }}
    >
      {/* GLOW BAR TOP ACCENT */}
      <div
        style={{
          height: "3px",
          width: "100%",
          background: accentColor,
          opacity: 0.8,
        }}
      />

      <div style={{ padding: "14px 16px 14px 14px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
        {/* ICON CONTAINER */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}35`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: accentColor,
            marginTop: "1px",
          }}
        >
          <IconComponent size={20} />
        </div>

        {/* CONTENT BLOCK */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* HEADER ROW WITH BADGE & DISMISS */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: "99px",
                  background: `${accentColor}20`,
                  color: accentColor,
                  border: `1px solid ${accentColor}40`,
                  letterSpacing: "0.04em",
                }}
              >
                {badgeText}
              </span>

              {toast.scanType && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    color: "rgba(248, 250, 252, 0.6)",
                    textTransform: "capitalize",
                  }}
                >
                  • {toast.scanType}
                </span>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Close notification"
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(248, 250, 252, 0.4)",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248, 250, 252, 0.4)")}
            >
              <X size={15} />
            </button>
          </div>

          {/* TOAST TITLE */}
          <div
            style={{
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#f8fafc",
              lineHeight: 1.35,
              marginBottom: "4px",
            }}
          >
            {toast.title}
          </div>

          {/* TOAST MESSAGE */}
          {toast.message && (
            <div
              style={{
                fontSize: "0.78rem",
                color: "rgba(248, 250, 252, 0.75)",
                lineHeight: 1.45,
                wordBreak: "break-word",
              }}
            >
              {toast.message}
            </div>
          )}

          {/* TARGET SNIPPET IF PRESENT */}
          {toast.target && (
            <div
              style={{
                marginTop: "6px",
                padding: "4px 8px",
                borderRadius: "6px",
                background: "rgba(0, 0, 0, 0.35)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "0.7rem",
                fontFamily: "JetBrains Mono, monospace",
                color: "rgba(248, 250, 252, 0.8)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "280px",
              }}
              title={toast.target}
            >
              🎯 {toast.target}
            </div>
          )}

          {/* ACTION BUTTON IF PROVIDED */}
          {toast.action && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => {
                  if (typeof toast.action.onClick === "function") {
                    toast.action.onClick();
                  }
                  onDismiss(toast.id);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "7px",
                  background: `${accentColor}25`,
                  border: `1px solid ${accentColor}50`,
                  color: "#f8fafc",
                  fontSize: "0.74rem",
                  fontWeight: 650,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${accentColor}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${accentColor}25`;
                }}
              >
                <span>{toast.action.label || "Inspect Threat"}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AUTO DISMISS PROGRESS BAR */}
      {duration > 0 && (
        <div
          style={{
            height: "2.5px",
            width: "100%",
            background: "rgba(255, 255, 255, 0.06)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: accentColor,
              transition: isPaused ? "none" : "width 50ms linear",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
        pointerEvents: "none",
        maxWidth: "calc(100vw - 32px)",
      }}
      className="threatlens-toast-container"
    >
      <style>{`
        @keyframes toastSlideIn {
          0% {
            opacity: 0;
            transform: translateX(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @media (max-width: 640px) {
          .threatlens-toast-container {
            top: 14px !important;
            right: 14px !important;
            left: 14px !important;
            align-items: center !important;
          }
        }
      `}</style>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
