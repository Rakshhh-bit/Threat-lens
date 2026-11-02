import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Mail,
  Link as LinkIcon,
  MessageSquare,
  Home,
  Menu,
  X,
  ShieldAlert,
  LogOut,
  FileText,
  Clock,
  Sparkles,
  Sun,
  Moon,
  User,
  Shield,
  ChevronRight,
  Headphones,
  Info,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";
import Logo from "./Logo";
import Footer from "./Footer";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();

  // Reset mobile menu drawer state on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Check cached profile first
    try {
      const cached = sessionStorage.getItem("profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        if (parsed?.role === "admin") setIsAdmin(true);
      }
    } catch (e) {}

    // Verify profile with server
    api
      .get("/auth/me")
      .then((res) => {
        if (res.data) {
          setUser(res.data);
          try {
            sessionStorage.setItem("profile", JSON.stringify(res.data));
          } catch (e) {}
          setIsAdmin(res.data.role === "admin");
        }
      })
      .catch(() => {});
  }, []);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (window.innerWidth > 768) {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      setMousePos({ x, y });
    }
  };

  const navItems = [
    { name: "Overview", path: "/home", icon: Home },
    { name: "Security Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Email Scanner", path: "/email", icon: Mail },
    { name: "URL Scanner", path: "/link", icon: LinkIcon },
    { name: "SMS Guard", path: "/message", icon: MessageSquare },
    { name: "AI Advisor", path: "/ai-chat", icon: Sparkles },
    { name: "Threat Reports", path: "/reports", icon: FileText },
    { name: "Security Timeline", path: "/timeline", icon: Clock },
    { name: "About Us", path: "/about", icon: Info },
    { name: "Contact Us", path: "/contact", icon: Headphones },
  ];

  if (isAdmin) {
    navItems.push({
      name: "Admin Panel",
      path: "/admin",
      icon: ShieldAlert,
      badge: "ADMIN",
    });
  }

  const sidebarWidth = "232px";

  return (
    <div
      onMouseMove={handleMouseMove}
      className="app-shell flex min-h-screen relative"
      style={{
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        transition: "background-color 0.25s, color 0.25s",
        overflowX: "hidden",
      }}
    >
      {/* GLOBAL AMBIENT RADIAL SPOTLIGHT ACCENT */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: `
            radial-gradient(circle 800px at ${50 + mousePos.x * 0.8}% ${
            20 + mousePos.y * 0.8
          }%, rgba(56, 189, 248, 0.05), transparent 70%),
            radial-gradient(circle 700px at ${80 - mousePos.x * 0.5}% ${
            80 - mousePos.y * 0.5
          }%, rgba(99, 102, 241, 0.04), transparent 65%)
          `,
          transition: "background 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* TOP NAVBAR HEADER */}
      <header
        className="app-top-bar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "var(--surface-1)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          zIndex: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(12px, 3vw, 24px)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        }}
      >
        {/* LEFT: LOGO (DESKTOP) / HAMBURGER (MOBILE) */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-hamburger-btn"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div
            onClick={() => navigate("/home")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Logo size={30} iconSize={16} showText={true} subtitle="INTELLIGENT GUARD" />
          </div>
        </div>

        {/* RIGHT: THEME TOGGLE & USER PROFILE */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={toggleTheme}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-primary)",
              transition: "all 0.15s ease",
            }}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#6366f1" />}
          </button>

          <div
            onClick={() => navigate("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px 4px 4px",
              borderRadius: "20px",
              background: location.pathname === "/profile" ? "rgba(99, 102, 241, 0.18)" : "var(--surface-2)",
              border: location.pathname === "/profile" ? "1px solid rgba(129, 140, 248, 0.4)" : "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="User Profile & Settings"
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                flexShrink: 0,
              }}
            >
              <User size={14} color="white" />
            </div>
            <span
              className="topbar-user-name"
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
              }}
            >
              {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || "Profile"}
            </span>
          </div>
        </div>
      </header>

      {/* CLEAN, MINIMAL & INTUITIVE SIDEBAR */}
      <aside
        style={{
          width: sidebarWidth,
          background: "var(--surface-1)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "calc(100vh - 60px)",
          zIndex: 100,
          left: 0,
          top: "60px",
          overflowY: "auto",
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`}
      >
        {/* MOBILE CLOSE HEADER */}
        <div
          className="mobile-close-btn"
          style={{
            padding: "16px 18px 12px",
            borderBottom: "1px solid var(--border)",
            display: "none",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo size={28} iconSize={15} showText={true} onClick={() => { navigate("/home"); setMobileOpen(false); }} />
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-primary)",
            }}
            aria-label="Close Sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* SECTION LABEL */}
        <div
          style={{
            padding: "16px 18px 8px",
            fontSize: "0.68rem",
            fontWeight: 700,
            color: "var(--text-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Navigation
        </div>

        {/* NAVIGATION LINKS */}
        <nav
          style={{
            flex: 1,
            padding: "0 10px",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <div
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: active ? "rgba(99, 102, 241, 0.12)" : "transparent",
                  border: active ? "1px solid rgba(129, 140, 248, 0.25)" : "1px solid transparent",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  <Icon
                    size={17}
                    color={active ? "var(--accent-indigo)" : "var(--text-muted)"}
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: "0.84rem",
                      fontWeight: active ? 650 : 500,
                      color: active ? "var(--text-primary)" : "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "6px",
                      background: "rgba(239, 68, 68, 0.15)",
                      color: "#f87171",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* BOTTOM USER & LOGOUT FOOTER */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <button
            onClick={() => {
              localStorage.removeItem("token");
              sessionStorage.removeItem("profile");
              window.location.href = "/";
            }}
            title="Sign Out"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
              fontSize: "0.8rem",
              fontWeight: 600,
              transition: "all 0.15s ease",
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY BACKDROP FOR MOBILE */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 90,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          marginTop: "60px",
          padding: "clamp(16px, 3.5vw, 32px)",
          position: "relative",
          zIndex: 1,
          maxWidth: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 60px)",
        }}
        className="app-content"
      >
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
