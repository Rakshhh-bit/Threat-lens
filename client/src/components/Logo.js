import React from "react";
import { Shield } from "lucide-react";

export default function Logo({
  size = 38,
  iconSize = 22,
  showText = true,
  subtitle = "INTELLIGENT GUARD",
  onClick,
  className = "",
}) {
  return (
    <div
      onClick={onClick}
      className={`logo-container ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      {/* VIVID GRADIENT SQUIRCLE WITH HIGH-CONTRAST WHITE SHIELD */}
      <div
        className="logo-icon-sq"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.32)}px`,
          background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #0284c7 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 18px rgba(37, 99, 235, 0.45)",
          flexShrink: 0,
          border: "1px solid rgba(255, 255, 255, 0.25)",
        }}
      >
        <Shield size={iconSize} color="#ffffff" strokeWidth={2.4} />
      </div>

      {showText && (
        <div className="logo-text-block" style={{ display: "flex", flexDirection: "column" }}>
          <div
            className="logo-title"
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: "0.98rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            ThreatLens
          </div>
          {subtitle && (
            <div
              className="logo-subtitle"
              style={{
                fontSize: "0.62rem",
                color: "var(--text-muted)",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginTop: "2px",
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

