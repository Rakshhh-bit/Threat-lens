import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, ShieldAlert, LayoutDashboard, MessageSquare, FileText, Clock, LogOut, ChevronDown, User, Sun, Moon, Menu, X } from "lucide-react";
import api from "../utils/api";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { useTheme } from "../context/ThemeContext";
import Logo from "./Logo";

function getFormattedName(d) {
  if (!d) return 'Rakshit Rawal';
  const fn = d.firstName ? String(d.firstName).trim() : '';
  const ln = d.lastName ? String(d.lastName).trim() : '';
  if (fn && ln) {
    const full = `${fn} ${ln}`.trim();
    if (full.length > 2 && full !== 'RR' && full !== 'R R' && full !== 'Security Operator' && full !== 'Demo User') {
      return full;
    }
  }
  if (fn && fn.length > 2 && fn !== 'RR' && fn !== 'Demo') return fn;
  if (d.name && d.name.length > 2 && d.name !== 'RR' && d.name !== 'R R' && d.name !== 'Account') return d.name;
  if (d.email) {
    if (d.email.toLowerCase().includes('rakshitrawal')) return 'Rakshit Rawal';
    const prefix = d.email.split('@')[0].replace(/[0-9_.-]+/g, ' ').trim();
    if (prefix.length > 2) {
      return prefix.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return 'Rakshit Rawal';
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const logout = () => {
    disconnectSocket();
    localStorage.removeItem("token");
    sessionStorage.removeItem("profile");
    window.location.href = "/";
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [alerts] = useState([]);
  const menuRef = useRef(null);

  const fetchUserProfile = () => {
    const token = localStorage.getItem('token');
    if (!token) return setUser(null);

    try { connectSocket(token); } catch (e) {}

    api.get('/auth/me').then(res => {
      const d = res.data;
      const formatted = getFormattedName(d);
      setUser({ name: formatted, email: d.email, role: d.role, mobile: d.mobile });
      try { sessionStorage.setItem('profile', JSON.stringify(d)); } catch (e) {}
    }).catch(() => {
      try {
        const cached = sessionStorage.getItem('profile');
        if (cached) {
          const d = JSON.parse(cached);
          setUser({ name: getFormattedName(d), email: d.email, role: d.role, mobile: d.mobile });
          return;
        }
      } catch (err) {}
      setUser(null);
    });
  };

  useEffect(() => {
    fetchUserProfile();

    const handleProfileUpdate = () => fetchUserProfile();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "AI Advisor", path: "/ai-chat", icon: MessageSquare },
    { label: "Threat Reports", path: "/reports", icon: FileText },
    { label: "Timeline", path: "/timeline", icon: Clock },
  ];

  return (
    <div className="navbar-shell" style={{ padding: '16px 24px 0', position: 'relative', zIndex: 50 }}>
      {/* Toast Alert Stack */}
      <div className="toast-stack" style={{ position: 'fixed', right: 20, top: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alerts.map((a, idx) => (
          <div key={idx} style={{
            maxWidth: 380,
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            padding: '12px 16px',
            borderRadius: 12,
            color: 'var(--text-primary)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
            fontSize: 13,
            animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {a.type || 'SCAN ALERT'}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                color: a.risk === 'HIGH' ? '#f87171' : a.risk === 'MEDIUM' ? '#fbbf24' : '#34d399',
                background: a.risk === 'HIGH' ? 'rgba(239,68,68,0.15)' : a.risk === 'MEDIUM' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
              }}>
                {a.risk}
              </span>
            </div>
            <div style={{ marginTop: 6, color: 'var(--text-secondary)', wordBreak: 'break-word', lineHeight: 1.4 }}>
              {(a.content && (a.content.length > 100 ? a.content.slice(0, 97) + '...' : a.content)) || (a.message || '')}
            </div>
          </div>
        ))}
      </div>

      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        borderRadius: '16px',
        background: 'var(--nav-bg)',
        border: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>

        {/* BRAND */}
        <Logo
          size={38}
          iconSize={20}
          showText={true}
          subtitle="INTELLIGENT SECURITY"
          onClick={() => navigate('/home')}
        />

        {/* NAVIGATION LINKS */}
        <div style={{ gap: '6px', alignItems: 'center' }} className="nav-links-desktop">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: active ? '1px solid rgba(129, 140, 248, 0.3)' : '1px solid transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.84rem',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                <Icon size={15} color={active ? '#818cf8' : 'var(--text-muted)'} />
                {link.label}
              </button>
            );
          })}
        </div>

        {/* RIGHT ACTION / USER MENU & THEME TOGGLE */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {user ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 10px 6px 6px',
                  borderRadius: '99px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', flexShrink: 0,
                }}>
                  <User size={15} color="white" />
                </div>
                <span className="user-name-desktop" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {user?.name || 'Rakshit Rawal'}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {/* DROPDOWN */}
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: 260,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                  zIndex: 60,
                  animation: 'fadeUp 0.2s ease',
                  padding: '12px',
                }}>
                  <div style={{ padding: '8px 8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                        {user?.name || 'Rakshit Rawal'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, wordBreak: 'break-all' }}>
                        {user?.email}
                      </div>
                    </div>
                    {user?.role === 'admin' && (
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        ADMIN
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '8px 0 0' }}>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => { setMenuOpen(false); navigate('/admin'); }}
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: 10,
                          background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                          display: 'flex', alignItems: 'center', gap: 10,
                          color: '#f87171', fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', textAlign: 'left', marginBottom: 6,
                        }}
                      >
                        <ShieldAlert size={16} color="#f87171" />
                        Admin Control Panel
                      </button>
                    )}

                    <button
                      onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 10,
                        background: 'transparent', border: 'none',
                        display: 'flex', alignItems: 'center', gap: 10,
                        color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <User size={16} color="#818cf8" />
                      Account Settings
                    </button>

                    <button
                      onClick={logout}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 10,
                        background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)',
                        display: 'flex', alignItems: 'center', gap: 10,
                        color: '#f87171', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', textAlign: 'left', marginTop: 6,
                      }}
                    >
                      <LogOut size={16} color="#f87171" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              Get Started
            </button>
          )}

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)', cursor: 'pointer',
            }}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* MOBILE NAV OVERLAY */}
      {mobileNavOpen && (
        <div style={{
          position: 'fixed', inset: 0, top: '72px', background: 'var(--surface-1)',
          zIndex: 99, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
          borderTop: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }} className="md:hidden">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => { setMobileNavOpen(false); navigate(link.path); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: active ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface-2)',
                  border: active ? '1px solid rgba(129, 140, 248, 0.3)' : '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <Icon size={18} color={active ? '#818cf8' : 'var(--text-muted)'} />
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Navbar;
