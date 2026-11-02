import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Shield } from "lucide-react";

const OFFICIAL_EMAIL = "cybershieldai398@gmail.com";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer
      style={{
        marginTop: "40px",
        paddingTop: "20px",
        paddingBottom: "24px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        fontSize: "0.8rem",
        color: "var(--text-secondary)",
      }}
      className="app-simple-footer"
    >
      {/* CLEAN LINKS ROW (Like Instagram/Facebook) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "18px",
          rowGap: "8px",
          textAlign: "center",
        }}
      >
        <span
          onClick={() => navigate("/about")}
          style={{ cursor: "pointer", transition: "color 0.15s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          About
        </span>

        <span style={{ color: "var(--border-bright)", fontSize: "0.7rem" }}>•</span>

        <span
          onClick={() => navigate("/contact")}
          style={{
            cursor: "pointer",
            color: "var(--accent-blue)",
            fontWeight: 600,
            transition: "all 0.15s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          <Mail size={13} />
          Contact Us
        </span>

        <span style={{ color: "var(--border-bright)", fontSize: "0.7rem" }}>•</span>

        <span
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer", transition: "color 0.15s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          Security Dashboard
        </span>

        <span style={{ color: "var(--border-bright)", fontSize: "0.7rem" }}>•</span>

        <span
          onClick={() => navigate("/reports")}
          style={{ cursor: "pointer", transition: "color 0.15s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          Threat Reports
        </span>

        <span style={{ color: "var(--border-bright)", fontSize: "0.7rem" }}>•</span>

        <span
          onClick={() => navigate("/contact")}
          style={{ cursor: "pointer", transition: "color 0.15s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          Help &amp; Support
        </span>

        <span style={{ color: "var(--border-bright)", fontSize: "0.7rem" }}>•</span>

        <span
          onClick={() => navigate("/privacy")}
          style={{ cursor: "pointer", transition: "color 0.15s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          Privacy Policy
        </span>

        <span style={{ color: "var(--border-bright)", fontSize: "0.7rem" }}>•</span>

        <span
          onClick={() => navigate("/terms")}
          style={{ cursor: "pointer", transition: "color 0.15s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          Terms
        </span>
      </div>

      {/* COPYRIGHT & OFFICIAL INQUIRY EMAIL */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "8px",
          fontSize: "0.74rem",
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <Shield size={12} color="var(--accent-indigo)" />
          © {new Date().getFullYear()} ThreatLens Inc.
        </span>
        <span>•</span>
        <span>Official Support:</span>
        <a
          href={`mailto:${OFFICIAL_EMAIL}`}
          style={{
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontWeight: 500,
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-blue)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          {OFFICIAL_EMAIL}
        </a>
      </div>
    </footer>
  );
}

export default Footer;
