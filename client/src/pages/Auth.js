import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { getToken } from "../auth";
import Logo from "../components/Logo";

import {
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Zap,
} from "lucide-react";

const SECURITY_TIPS = [
  "Never click links in unsolicited emails",
  "Verify sender domains carefully — look for typos",
  "Hover over links before clicking to preview URLs",
  "Enable 2FA on all critical accounts",
  "Use unique passwords for each service",
];

function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) {
      window.location.replace("/home");
    }
  }, []);

  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("form");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [tipIndex] = useState(
    Math.floor(Math.random() * SECURITY_TIPS.length)
  );

  const parseError = (err) => {
    if (!err) return "Something went wrong. Please try again.";
    if (!err?.response) {
      return err?.message || "Network error - please check your connection.";
    }
    const data = err.response.data;
    if (!data) return "Server error";
    if (typeof data === "string") return data;
    if (typeof data === "object" && data.error) return data.error;
    if (typeof data === "object" && data.message) return data.message;
    return JSON.stringify(data);
  };

  const validatePassword = (pass) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pass);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (mode === "login") {
        const trimmedIdentifier = String(identifier || "").trim();
        const trimmedPassword = String(password || "").trim();

        if (!trimmedIdentifier) {
          setError("Please enter your email address.");
          return;
        }
        if (!trimmedPassword) {
          setError("Please enter your password.");
          return;
        }

        const res = await api.post("/auth/login", {
          email: trimmedIdentifier,
          identifier: trimmedIdentifier,
          password: trimmedPassword,
        });

        if (res.status >= 400) {
          setError(res.data?.error || "Login failed");
          return;
        }

        if (!res.data?.token) {
          setError("Login failed — no token received.");
          return;
        }

        localStorage.setItem("token", res.data.token);
        if (res.data?.user) {
          try { sessionStorage.setItem("profile", JSON.stringify(res.data.user)); } catch (e) {}
        }
        window.location.replace("/home");
        return;
      }

      if (mode === "register") {
        const trimmedFirstName  = String(firstName  || "").trim();
        const trimmedLastName   = String(lastName   || "").trim();
        const trimmedEmail      = String(email      || "").trim();
        const trimmedPassword   = String(password   || "").trim();

        if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPassword) {
          setError("All fields are required.");
          return;
        }

        if (!validatePassword(trimmedPassword)) {
          setError("Password must contain uppercase, lowercase, number and special symbol.");
          return;
        }

        const payload = {
          firstName: trimmedFirstName,
          lastName:  trimmedLastName,
          email:     trimmedEmail,
          password:  trimmedPassword,
        };

        const registerRes = await api.post("/auth/register", payload);

        if (registerRes.status >= 400) {
          setError(registerRes.data?.error || `Registration failed (${registerRes.status})`);
          return;
        }

        setStep("otp");
        setOtp("");
        const emailSent = registerRes.data?.emailSent;
        if (emailSent) {
          setStatusMessage("Encrypted 6-digit 2FA code sent to your email!");
        } else {
          setStatusMessage("Security verification code generated. Please enter your 6-digit OTP below.");
        }
      }

    } catch (err) {
      setError(parseError(err));
      setStatusMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError("");
      setStatusMessage("");
      const payload = {
        firstName: String(firstName || "").trim() || "User",
        lastName: String(lastName || "").trim() || "Account",
        email: String(email || "").trim(),
        password: String(password || "").trim() || "ThreatLens@2026",
      };
      await api.post("/auth/register", payload);
      setOtp("");
      setStatusMessage("New 6-digit verification code dispatched. Please enter it below.");
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setError("");

      if (!otp.trim()) {
        setError("Please enter the OTP.");
        return;
      }

      const res = await api.post("/auth/verify", {
        email: String(email || "").trim(),
        otp: otp.trim(),
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        if (res.data?.user) {
          try { sessionStorage.setItem("profile", JSON.stringify(res.data.user)); } catch (e) {}
        }
        window.location.replace("/home");
        return;
      }

      setMode("login");
      setStep("form");
      setOtp("");
      setError("");

    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    try {
      setLoading(true);
      setError("");
      setStatusMessage("");

      const trimmedIdentifier = String(identifier || "").trim();
      if (!trimmedIdentifier) {
        setError("Please enter your email address.");
        return;
      }

      const forgotRes = await api.post("/auth/forgot", {
        email: trimmedIdentifier,
      });

      setStatusMessage(forgotRes.data?.message || "Reset link sent successfully. Check your email.");
    } catch (err) {
      setError(parseError(err));
      setStatusMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      <div style={{
        maxWidth: "960px",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        borderRadius: "24px",
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }} className="responsive-grid">

        {/* LEFT PANEL */}
        <div style={{
          padding: "clamp(20px, 4vw, 40px)",
          background: "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(56,189,248,0.08) 100%)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ marginBottom: "40px" }}>
              <Logo size={42} iconSize={22} showText={true} subtitle="INTELLIGENT GUARD" />
            </div>

            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "12px", lineHeight: 1.2, color: "var(--text-primary)" }}>
              {mode === "login" ? "Welcome back to safety." : "Join ThreatLens."}
            </h2>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
              {mode === "login"
                ? "Your security dashboard and real-time threat tools are waiting."
                : "Protect your inbox and messages with instant heuristic diagnostics."}
            </p>
          </div>

          <div style={{
            padding: "16px", borderRadius: "12px",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            marginTop: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Zap size={14} color="#818cf8" />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase" }}>
                Security Tip
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>
              {SECURITY_TIPS[tipIndex]}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: FORM */}
        <div style={{ padding: "clamp(20px, 4vw, 40px)" }}>
          <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "6px", color: "var(--text-primary)" }}>
            {mode === "login" && "Sign In"}
            {mode === "register" && "Create Account"}
            {mode === "forgot" && "Reset Password"}
          </h3>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "24px" }}>
            {mode === "login"    && "Enter your email address to continue"}
            {mode === "register" && "Set up your secure profile"}
            {mode === "forgot"   && "We'll send you a password reset link"}
          </p>

          {error && (
            <div style={{
              marginBottom: "18px", padding: "12px 14px", borderRadius: "10px",
              background: error.toLowerCase().includes("success") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              border: error.toLowerCase().includes("success") ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(239,68,68,0.25)",
              color: error.toLowerCase().includes("success") ? "#34d399" : "#f87171",
              fontSize: "0.84rem",
            }}>
              {error}
            </div>
          )}

          {statusMessage && !error && (
            <div style={{
              marginBottom: "18px", padding: "12px 14px", borderRadius: "10px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#34d399",
              fontSize: "0.84rem",
            }}>
              {statusMessage}
            </div>
          )}

          {step === "otp" ? (
            <div>
              <div style={{
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "18px",
                color: "#34d399",
                fontSize: "0.83rem",
                fontWeight: 600
              }}>
                <Shield size={18} color="#34d399" />
                <span>Encrypted 2FA Code Dispatched</span>
              </div>

              <p style={{ color: "var(--text-secondary)", marginBottom: "16px", fontSize: "0.86rem", lineHeight: 1.5 }}>
                Please enter the 6-digit security code sent to <strong style={{ color: "var(--text-primary)" }}>{email}</strong> to verify your identity.
              </p>

              <InputField
                icon={Lock}
                placeholder="Enter 6-digit OTP code"
                value={otp}
                onChange={setOtp}
              />

              <div style={{ marginTop: "20px" }}>
                <AuthButton onClick={verifyOtp} loading={loading} label="Verify Security Code" />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => { setStep("form"); setMode("register"); setOtp(""); setError(""); }}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.82rem" }}
                >
                  ← Back to registration
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={{ background: "none", border: "none", color: "#818cf8", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem" }}
                >
                  Resend Code
                </button>
              </div>
            </div>
          ) : (
            <div>
              {mode === "register" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <InputField icon={User} placeholder="First Name" value={firstName} onChange={setFirstName} />
                    <InputField icon={User} placeholder="Last Name" value={lastName} onChange={setLastName} />
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <InputField icon={Mail} placeholder="Email Address" value={email} onChange={setEmail} />
                  </div>
                </>
              )}

              {mode !== "register" && (
                <div style={{ marginBottom: "14px" }}>
                  <InputField
                    icon={Mail}
                    placeholder="Email Address"
                    value={identifier}
                    onChange={setIdentifier}
                  />
                </div>
              )}

              {mode !== "forgot" && (
                <div style={{ marginBottom: "18px" }}>
                  <InputField
                    icon={Lock}
                    placeholder="Password"
                    value={password}
                    type={showPass ? "text" : "password"}
                    onChange={setPassword}
                    rightEl={
                      <button
                        onClick={() => setShowPass(!showPass)}
                        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </div>
              )}

              {mode === "login" && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "18px" }}>
                  <button
                    onClick={() => { setMode("forgot"); setError(""); }}
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.82rem" }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <AuthButton
                onClick={mode === "forgot" ? handleForgot : handleSubmit}
                loading={loading}
                label={mode === "login" ? "Sign In" : mode === "register" ? "Send OTP" : "Send Reset Link"}
              />

              <div style={{ marginTop: "20px", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                {mode === "login" && (
                  <>
                    Don't have an account?{" "}
                    <button
                      onClick={() => { setMode("register"); setError(""); }}
                      style={{ background: "none", border: "none", color: "#818cf8", fontWeight: 600, cursor: "pointer" }}
                    >
                      Sign up
                    </button>
                  </>
                )}

                {mode === "register" && (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => { setMode("login"); setError(""); }}
                      style={{ background: "none", border: "none", color: "#818cf8", fontWeight: 600, cursor: "pointer" }}
                    >
                      Sign in
                    </button>
                  </>
                )}

                {mode === "forgot" && (
                  <button
                    onClick={() => { setMode("login"); setError(""); }}
                    style={{ background: "none", border: "none", color: "#818cf8", fontWeight: 600, cursor: "pointer" }}
                  >
                    ← Back to login
                  </button>
                )}
                {mode === "register" && (
                  <div style={{ marginTop: "14px", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    By creating an account, you agree to ThreatLens{" "}
                    <span
                      onClick={() => navigate("/terms")}
                      style={{ color: "#818cf8", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span
                      onClick={() => navigate("/privacy")}
                      style={{ color: "#818cf8", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Privacy Policy
                    </span>.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AUTH PAGE FOOTER LINKS */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
            }}
          >
            <span
              onClick={() => navigate("/about")}
              style={{ cursor: "pointer", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              About ThreatLens
            </span>
            <span>•</span>
            <span
              onClick={() => navigate("/privacy")}
              style={{ cursor: "pointer", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Privacy Policy
            </span>
            <span>•</span>
            <span
              onClick={() => navigate("/terms")}
              style={{ cursor: "pointer", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Terms
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

function InputField({ icon: Icon, placeholder, value, onChange, type = "text", rightEl }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
        <Icon size={16} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 14px 12px 38px",
          paddingRight: rightEl ? "40px" : "14px",
          borderRadius: "10px",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          outline: "none",
          fontSize: "0.88rem",
          boxSizing: "border-box",
        }}
      />
      {rightEl && (
        <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
          {rightEl}
        </div>
      )}
    </div>
  );
}

function AuthButton({ onClick, loading, label }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="btn btn-primary"
      style={{
        width: "100%",
        padding: "12px",
        fontSize: "0.9rem",
      }}
    >
      {loading ? "Processing..." : <>{label} <ArrowRight size={16} /></>}
    </button>
  );
}

export default Auth;
