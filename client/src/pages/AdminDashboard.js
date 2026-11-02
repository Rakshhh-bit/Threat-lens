import React, { useEffect, useState } from "react";
import api from "../utils/api";
import Layout from "../components/Layout";
import RevealOnScroll from "../components/RevealOnScroll";
import {
  Users,
  Trash2,
  Lock,
  Activity,
  Shield,
  ShieldAlert,
  Search,
  RefreshCw,
  Sliders,
  Cpu,
  HardDrive,
  UserCheck,
  UserX,
  AlertTriangle,
  Eye,
  Filter,
  CheckCircle,
  XCircle,
  Layers,
  Sparkles,
  Terminal,
  Zap,
  Server,
  Mail,
  Headphones,
  ExternalLink,
} from "lucide-react";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [queries, setQueries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // "users" | "scans" | "security" | "system"

  // User search & filters
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Scan search & filters
  const [scanSearch, setScanSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  // Selected Detail Modal
  const [selectedScan, setSelectedScan] = useState(null);

  // Security Policy Toggles
  const [policies, setPolicies] = useState({
    autoBlockPhishing: true,
    strictUrlSandbox: true,
    aiDeepAnalysis: true,
    rateLimiterActive: true,
    liveWebSocketBroadcast: true,
    ipAnonymization: false,
  });

  // Action Audit Trail
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: "Admin Panel Loaded", time: new Date().toLocaleTimeString(), type: "info" },
  ]);

  const addAuditLog = (action, type = "info") => {
    setAuditLogs((prev) => [
      { id: Date.now(), action, time: new Date().toLocaleTimeString(), type },
      ...prev.slice(0, 19),
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [uRes, sRes, statsRes, qRes] = await Promise.allSettled([
        api.get("/admin/users"),
        api.get("/admin/scans"),
        api.get("/admin/stats"),
        api.get("/contact"),
      ]);

      if (uRes.status === "fulfilled") setUsers(uRes.value.data || []);
      if (sRes.status === "fulfilled") setScans(sRes.value.data || []);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (qRes.status === "fulfilled") setQueries(qRes.value.data || []);

      addAuditLog("Synchronized system telemetry & telemetry database");
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;

    try {
      await api.put(`/admin/user/${userId}/role`, { role: newRole });
      addAuditLog(`Updated user ${userId} role to ${newRole.toUpperCase()}`, "success");
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update role");
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete user (${email})? All associated threat scans will also be purged.`)) return;

    try {
      await api.delete(`/admin/user/${id}`);
      addAuditLog(`Deleted user ${email}`, "warning");
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete user");
    }
  };

  const handleDeleteScan = async (id) => {
    try {
      await api.delete(`/admin/scan/${id}`);
      addAuditLog(`Purged scan record #${id.slice(-6)}`, "warning");
      setScans((prev) => prev.filter((s) => s._id !== id));
      if (selectedScan?._id === id) setSelectedScan(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete scan");
    }
  };

  const handleClearAllScans = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to purge ALL recorded threat scan logs? This action cannot be undone.")) return;

    try {
      await api.delete("/admin/scans/clear");
      addAuditLog("Purged all threat scan records from database", "danger");
      setScans([]);
      setSelectedScan(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to clear scans");
    }
  };

  const togglePolicy = (key, label) => {
    setPolicies((prev) => {
      const next = !prev[key];
      addAuditLog(`Security Policy '${label}' set to ${next ? 'ENABLED' : 'DISABLED'}`, next ? 'success' : 'warning');
      return { ...prev, [key]: next };
    });
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.email || "").toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.firstName || "").toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.lastName || "").toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Scans
  const filteredScans = scans.filter((s) => {
    const contentStr = JSON.stringify(s).toLowerCase();
    const matchesSearch = contentStr.includes(scanSearch.toLowerCase());
    const matchesRisk =
      riskFilter === "ALL" ||
      (s.risk || "").toUpperCase() === riskFilter.toUpperCase();
    const matchesType =
      typeFilter === "ALL" ||
      (s.type || "").toLowerCase() === typeFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateFilter !== "ALL") {
      const scanDate = new Date(s.createdAt || Date.now());
      const now = new Date();
      if (dateFilter === "TODAY") {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        matchesDate = scanDate >= startOfToday;
      } else if (dateFilter === "LAST_7_DAYS") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = scanDate >= sevenDaysAgo;
      } else if (dateFilter === "LAST_30_DAYS") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = scanDate >= thirtyDaysAgo;
      }
    }

    return matchesSearch && matchesRisk && matchesType && matchesDate;
  });

  // Calculated Stats Fallbacks
  const totalUsersCount = stats?.totalUsers ?? users.length;
  const totalScansCount = stats?.totalScans ?? scans.length;
  const highRiskCount =
    stats?.highRiskScans ??
    scans.filter((s) => (s.risk || "").toUpperCase() === "HIGH" || (s.risk || "").toUpperCase() === "CRITICAL").length;

  return (
    <Layout>
      <div className="responsive-page" style={{ animation: "fadeUp 0.4s ease both", maxWidth: "1280px", margin: "0 auto" }}>

        {/* TOP BANNER / HEADER */}
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{
                fontSize: "0.68rem", fontWeight: 800, padding: "3px 10px", borderRadius: "6px",
                background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)",
                fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em"
              }}>
                ✦ RESTRICTED ACCESS
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>• Security Level 4 Clearances</span>
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "12px" }}>
              <ShieldAlert size={28} color="#f87171" />
              Admin Control Panel
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Global threat posture monitoring, user permissions management, and platform security policies.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={loadData}
              disabled={refreshing}
              className="btn btn-secondary"
              style={{ fontSize: "0.82rem", gap: "8px" }}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Syncing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* METRICS & TELEMETRY CARDS */}
        <RevealOnScroll threshold={0.05} style={{ marginBottom: "28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            
            <div className="card-panel liquid-glass-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 600 }}>
                <span>TOTAL REGISTERED USERS</span>
                <Users size={18} color="#38bdf8" />
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "8px" }}>
                {totalUsersCount}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#38bdf8", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <UserCheck size={12} /> {users.filter(u => u.role === 'admin').length} Admin Administrators
              </div>
            </div>

            <div className="card-panel liquid-glass-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 600 }}>
                <span>THREAT LOGS RECORDED</span>
                <Activity size={18} color="#818cf8" />
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "8px" }}>
                {totalScansCount}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#818cf8", marginTop: "4px" }}>
                Inspected by ThreatLens Engine
              </div>
            </div>

            <div className="card-panel liquid-glass-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 600 }}>
                <span>CRITICAL / HIGH THREATS</span>
                <AlertTriangle size={18} color="#f87171" />
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#f87171", marginTop: "8px" }}>
                {highRiskCount}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#f87171", marginTop: "4px" }}>
                {totalScansCount > 0 ? `${Math.round((highRiskCount / totalScansCount) * 100)}% of total scans` : '0%'}
              </div>
            </div>

            <div className="card-panel liquid-glass-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 600 }}>
                <span>SYSTEM DEFENSE STATUS</span>
                <Server size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#10b981", marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 10px #10b981" }}></span>
                HEALTHY & ACTIVE
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "6px", fontFamily: "JetBrains Mono, monospace" }}>
                Node {stats?.nodeVersion || 'v18+'} • Heap {stats?.serverMemory || '64MB'}
              </div>
            </div>

          </div>
        </RevealOnScroll>

        {/* CONTROL PANEL TABS NAVIGATION */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            { id: "users", label: "User Management", icon: Users, count: users.length },
            { id: "scans", label: "Threat Logs & Inspection", icon: Activity, count: scans.length },
            { id: "inquiries", label: "Support Inquiries", icon: Headphones, count: queries.length },
            { id: "security", label: "Security Policies & Firewall", icon: Sliders },
            { id: "system", label: "System Health & Audit Logs", icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 18px", borderRadius: "10px",
                  background: active ? "rgba(99, 102, 241, 0.15)" : "var(--surface-1)",
                  border: active ? "1px solid rgba(129, 140, 248, 0.35)" : "1px solid var(--border)",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  fontSize: "0.86rem", fontWeight: active ? 700 : 500,
                  cursor: "pointer", transition: "all 0.2s ease"
                }}
              >
                <Icon size={16} color={active ? "#818cf8" : "var(--text-muted)"} />
                {tab.label}
                {tab.count !== undefined && (
                  <span style={{
                    fontSize: "0.7rem", padding: "2px 8px", borderRadius: "99px",
                    background: active ? "rgba(129, 140, 248, 0.2)" : "var(--surface-2)",
                    color: active ? "#818cf8" : "var(--text-muted)", fontWeight: 700
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="card-panel" style={{ padding: "24px" }}>
            
            {/* SEARCH & FILTERS */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
              <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
                <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  className="input"
                  placeholder="Search user by email or name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ paddingLeft: "38px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>ROLE:</span>
                {["ALL", "admin", "user"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    style={{
                      padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600,
                      background: roleFilter === role ? "var(--surface-3)" : "var(--surface-2)",
                      border: roleFilter === role ? "1px solid var(--accent-indigo)" : "1px solid var(--border)",
                      color: roleFilter === role ? "var(--text-primary)" : "var(--text-secondary)",
                      cursor: "pointer", textTransform: "uppercase"
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* USERS TABLE */}
            {filteredUsers.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No registered users matching search criteria.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <th style={{ padding: "12px 14px" }}>User Identity</th>
                      <th style={{ padding: "12px 14px" }}>Role</th>
                      <th style={{ padding: "12px 14px" }}>Created At</th>
                      <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isAdminRole = u.role === "admin";
                      const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ");

                      return (
                        <tr key={u._id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}>
                          <td style={{ padding: "14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{
                                width: "36px", height: "36px", borderRadius: "10px",
                                background: isAdminRole ? "rgba(239, 68, 68, 0.15)" : "rgba(99, 102, 241, 0.15)",
                                border: isAdminRole ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(99, 102, 241, 0.3)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: isAdminRole ? "#f87171" : "#818cf8", fontWeight: 700
                              }}>
                                {u.email ? u.email[0].toUpperCase() : "U"}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                  {fullName || u.email?.split("@")[0] || "User"}
                                </div>
                                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: "14px" }}>
                            <span style={{
                              fontSize: "0.72rem", fontWeight: 800, padding: "3px 10px", borderRadius: "99px",
                              background: isAdminRole ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.12)",
                              color: isAdminRole ? "#f87171" : "#10b981",
                              border: isAdminRole ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(16, 185, 129, 0.2)",
                              fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase"
                            }}>
                              {u.role || "user"}
                            </span>
                          </td>

                          <td style={{ padding: "14px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                          </td>

                          <td style={{ padding: "14px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => handleRoleToggle(u._id, u.role)}
                                className="btn btn-secondary"
                                style={{ padding: "6px 12px", fontSize: "0.76rem" }}
                                title="Toggle Role"
                              >
                                {isAdminRole ? <UserX size={14} color="#f87171" /> : <UserCheck size={14} color="#10b981" />}
                                {isAdminRole ? "Revoke Admin" : "Make Admin"}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u._id, u.email)}
                                className="btn btn-danger"
                                style={{ padding: "6px 10px" }}
                                title="Delete User Account"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: THREAT LOGS & INSPECTION */}
        {activeTab === "scans" && (
          <div className="card-panel" style={{ padding: "24px" }}>
            
            {/* SEARCH & FILTERS */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
              <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
                <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  className="input"
                  placeholder="Filter scan content, URLs, or indicators..."
                  value={scanSearch}
                  onChange={(e) => setScanSearch(e.target.value)}
                  style={{ paddingLeft: "38px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                {/* THREAT TYPE FILTER */}
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>TYPE:</span>
                  {[
                    { id: "ALL", label: "ALL" },
                    { id: "email", label: "EMAIL" },
                    { id: "link", label: "URL" },
                    { id: "message", label: "SMS" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTypeFilter(t.id)}
                      style={{
                        padding: "5px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600,
                        background: typeFilter === t.id ? "var(--surface-3)" : "var(--surface-2)",
                        border: typeFilter === t.id ? "1px solid var(--accent-indigo)" : "1px solid var(--border)",
                        color: typeFilter === t.id ? "var(--text-primary)" : "var(--text-secondary)",
                        cursor: "pointer"
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* RISK FILTER */}
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>RISK:</span>
                  {["ALL", "HIGH", "MEDIUM", "LOW"].map((rk) => (
                    <button
                      key={rk}
                      onClick={() => setRiskFilter(rk)}
                      style={{
                        padding: "5px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600,
                        background: riskFilter === rk ? "var(--surface-3)" : "var(--surface-2)",
                        border: riskFilter === rk ? "1px solid var(--accent-indigo)" : "1px solid var(--border)",
                        color: riskFilter === rk ? "var(--text-primary)" : "var(--text-secondary)",
                        cursor: "pointer"
                      }}
                    >
                      {rk}
                    </button>
                  ))}
                </div>

                {/* DATE FILTER */}
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>DATE:</span>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: "var(--surface-2)",
                      border: dateFilter !== "ALL" ? "1px solid var(--accent-indigo)" : "1px solid var(--border)",
                      color: "var(--text-primary)",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="ALL">ALL DATES</option>
                    <option value="TODAY">TODAY</option>
                    <option value="LAST_7_DAYS">LAST 7 DAYS</option>
                    <option value="LAST_30_DAYS">LAST 30 DAYS</option>
                  </select>
                </div>

                <button
                  onClick={handleClearAllScans}
                  className="btn btn-danger"
                  style={{ fontSize: "0.78rem", padding: "8px 14px", gap: "6px" }}
                >
                  <Trash2 size={14} />
                  Purge All Scans
                </button>
              </div>
            </div>

            {/* SCANS LIST TABLE */}
            {filteredScans.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No threat scan records found matching filters.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <th style={{ padding: "12px 14px" }}>Scan Type</th>
                      <th style={{ padding: "12px 14px" }}>Risk Rating</th>
                      <th style={{ padding: "12px 14px" }}>Threat / Target Content</th>
                      <th style={{ padding: "12px 14px" }}>Timestamp</th>
                      <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScans.map((s) => {
                      const riskUpper = (s.risk || "").toUpperCase();
                      const isHigh = riskUpper === "HIGH" || riskUpper === "CRITICAL";
                      const isMed = riskUpper === "MEDIUM";

                      const contentPreview = s.url || s.emailContent || s.messageContent || s.content || "Scan Data Record";

                      return (
                        <tr key={s._id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "14px" }}>
                            <span style={{
                              fontSize: "0.7rem", fontWeight: 800, padding: "3px 8px", borderRadius: "6px",
                              background: "rgba(99, 102, 241, 0.12)", color: "#818cf8", border: "1px solid rgba(99, 102, 241, 0.25)",
                              fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase"
                            }}>
                              {s.type || "GENERIC"}
                            </span>
                          </td>

                          <td style={{ padding: "14px" }}>
                            <span style={{
                              fontSize: "0.72rem", fontWeight: 800, padding: "3px 10px", borderRadius: "99px",
                              background: isHigh ? "rgba(239, 68, 68, 0.15)" : isMed ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.12)",
                              color: isHigh ? "#f87171" : isMed ? "#fbbf24" : "#10b981",
                              border: isHigh ? "1px solid rgba(239, 68, 68, 0.3)" : isMed ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(16, 185, 129, 0.2)",
                              fontFamily: "JetBrains Mono, monospace"
                            }}>
                              {s.risk || "Low"}
                            </span>
                          </td>

                          <td style={{ padding: "14px", maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)" }}>
                            {contentPreview}
                          </td>

                          <td style={{ padding: "14px", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                            {s.createdAt ? new Date(s.createdAt).toLocaleString() : "Just now"}
                          </td>

                          <td style={{ padding: "14px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => setSelectedScan(s)}
                                className="btn btn-secondary"
                                style={{ padding: "5px 10px", fontSize: "0.75rem" }}
                              >
                                <Eye size={14} /> Inspect
                              </button>

                              <button
                                onClick={() => handleDeleteScan(s._id)}
                                className="btn btn-danger"
                                style={{ padding: "5px 8px" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SECURITY POLICIES & FIREWALL */}
        {activeTab === "security" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            
            <div className="card-panel" style={{ padding: "24px" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                <Shield size={20} color="#38bdf8" />
                Active Defense Policies
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { key: "autoBlockPhishing", label: "Automated Phishing Containment", desc: "Instantly flag & quarantine high-probability phishing links across all user accounts." },
                  { key: "strictUrlSandbox", label: "Strict Sandbox URL Parsing", desc: "Execute deep multi-redirect analysis before permitting outbound links." },
                  { key: "aiDeepAnalysis", label: "Gemini AI Threat Reasoning Engine", desc: "Utilize Gemini model context windows for complex smishing heuristic analysis." },
                  { key: "rateLimiterActive", label: "API Request Rate-Limiting Guard", desc: "Enforce strict per-IP threshold limits to mitigate automated scraping." },
                  { key: "liveWebSocketBroadcast", label: "Live WebSocket Threat Broadcasts", desc: "Stream live threat alerts to operator dashboards in real time." },
                ].map((item) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", borderRadius: "12px", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div style={{ paddingRight: "12px" }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>{item.label}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{item.desc}</div>
                    </div>

                    <button
                      onClick={() => togglePolicy(item.key, item.label)}
                      style={{
                        padding: "6px 14px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 800,
                        background: policies[item.key] ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.12)",
                        color: policies[item.key] ? "#10b981" : "#f87171",
                        border: policies[item.key] ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                        cursor: "pointer", flexShrink: 0, fontFamily: "JetBrains Mono, monospace"
                      }}
                    >
                      {policies[item.key] ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-panel" style={{ padding: "24px" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                <Zap size={20} color="#fbbf24" />
                IP & Domain Rule Overrides
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ padding: "12px 14px", borderRadius: "10px", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f87171" }}>BLOCKED DOMAINS (AUTO-ISOLATED)</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "JetBrains Mono, monospace", marginTop: "4px" }}>
                    • login-verify-secure-auth.xyz<br />
                    • paypal-update-account-info.top<br />
                    • verify-banking-session-alert.online
                  </div>
                </div>

                <div style={{ padding: "12px 14px", borderRadius: "10px", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#10b981" }}>ALLOWLISTED VERIFIED PROVIDERS</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "JetBrains Mono, monospace", marginTop: "4px" }}>
                    • *.google.com • *.microsoft.com<br />
                    • *.github.com • *.stripe.com
                  </div>
                </div>

                <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.2)", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  🔒 Rules are evaluated in memory and synchronized across all active ThreatLens API proxy instances.
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SYSTEM HEALTH & AUDIT LOGS */}
        {activeTab === "system" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            
            <div className="card-panel" style={{ padding: "24px" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                <Terminal size={20} color="#818cf8" />
                Live Admin Audit Trail
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "380px", overflowY: "auto" }}>
                {auditLogs.map((log) => (
                  <div key={log.id} style={{
                    padding: "10px 12px", borderRadius: "8px", background: "var(--surface-2)", border: "1px solid var(--border)",
                    display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem"
                  }}>
                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{log.action}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-panel" style={{ padding: "24px" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                <Cpu size={20} color="#38bdf8" />
                Container & Engine Health
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.84rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderRadius: "8px", background: "var(--surface-2)" }}>
                  <span style={{ color: "var(--text-muted)" }}>REST API Gateway</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>200 OK (Port 3000)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderRadius: "8px", background: "var(--surface-2)" }}>
                  <span style={{ color: "var(--text-muted)" }}>MongoDB Persistence Layer</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>Connected (Mongoose)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderRadius: "8px", background: "var(--surface-2)" }}>
                  <span style={{ color: "var(--text-muted)" }}>WebSocket Server</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>Socket.IO Operational</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderRadius: "8px", background: "var(--surface-2)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Gemini AI SDK Status</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>Ready (Server-side)</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB: SUPPORT INQUIRIES */}
        {activeTab === "inquiries" && (
          <div className="card-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px" }}>
                  Submitted Support Queries &amp; Incidents
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                  All inquiries sent via the Contact page or routed to <strong style={{ color: "var(--accent-blue)" }}>cybershieldai398@gmail.com</strong>
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <a
                  href="mailto:cybershieldai398@gmail.com"
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid rgba(129, 140, 248, 0.3)",
                    color: "var(--accent-indigo)",
                    fontSize: "0.8rem",
                    fontWeight: 650,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Mail size={14} />
                  <span>Open Inbox (cybershieldai398@gmail.com)</span>
                </a>
              </div>
            </div>

            {queries.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)", background: "var(--surface-2)", borderRadius: "12px" }}>
                <Headphones size={36} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <div style={{ fontSize: "0.95rem", fontWeight: 650, color: "var(--text-primary)" }}>No Support Queries Logged Yet</div>
                <div style={{ fontSize: "0.82rem", marginTop: "4px" }}>
                  When users submit the Contact form, incoming messages and emails will populate here in real-time.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {queries.map((q) => (
                  <div
                    key={q.id || Math.random()}
                    style={{
                      padding: "18px 20px",
                      borderRadius: "12px",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background: q.priority === "Critical" ? "rgba(239, 68, 68, 0.15)" : q.priority === "High" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: q.priority === "Critical" ? "#f87171" : q.priority === "High" ? "#fbbf24" : "#10b981",
                            border: `1px solid ${q.priority === "Critical" ? "rgba(239, 68, 68, 0.3)" : q.priority === "High" ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                            textTransform: "uppercase",
                          }}
                        >
                          {q.priority}
                        </span>
                        <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {q.subject || "Support Query"}
                        </span>
                        <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "4px", background: "var(--surface-1)", color: "var(--text-secondary)" }}>
                          {q.category}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>
                        {q.createdAt ? new Date(q.createdAt).toLocaleString() : "Recent"}
                      </div>
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, background: "var(--surface-1)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--border)", whiteSpace: "pre-wrap" }}>
                      {q.message}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", fontSize: "0.78rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)" }}>
                        <span>Sender: <strong style={{ color: "var(--text-primary)" }}>{q.name}</strong></span>
                        <span>•</span>
                        <span>Email: <strong style={{ color: "var(--accent-blue)" }}>{q.email}</strong></span>
                        {q.phone && (
                          <>
                            <span>•</span>
                            <span>Phone: <strong style={{ color: "var(--text-primary)" }}>{q.phone}</strong></span>
                          </>
                        )}
                        <span>•</span>
                        <span style={{ fontFamily: "JetBrains Mono, monospace" }}>Ref: {q.id}</span>
                      </div>

                      <a
                        href={`mailto:${q.email}?subject=Re: [ThreatLens Support] ${encodeURIComponent(q.subject || "Support Query")}&body=Hello ${encodeURIComponent(q.name)},%0D%0A%0D%0AThank you for contacting ThreatLens Security Operations regarding Reference ID: ${q.id}.%0D%0A%0D%0A`}
                        className="btn btn-secondary"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Mail size={13} />
                        <span>Reply to {q.name}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCAN DETAIL INSPECTION MODAL */}
        {selectedScan && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
          }}>
            <div className="card-panel" style={{ maxWidth: "600px", width: "100%", padding: "24px", maxHeight: "85vh", overflowY: "auto", position: "relative", border: "1px solid var(--border-bright)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Eye size={20} color="#818cf8" /> Threat Payload Inspection
                </div>
                <button onClick={() => setSelectedScan(null)} className="btn btn-secondary" style={{ padding: "4px 10px" }}>✕</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.86rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>SCAN ID:</span>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-primary)" }}>{selectedScan._id}</div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>TYPE & RISK:</span>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <span className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>{selectedScan.type}</span>
                    <span style={{
                      fontSize: "0.75rem", fontWeight: 800, padding: "2px 10px", borderRadius: "99px",
                      color: selectedScan.risk === "High" ? "#f87171" : selectedScan.risk === "Medium" ? "#fbbf24" : "#10b981",
                      background: "rgba(255,255,255,0.05)"
                    }}>
                      {selectedScan.risk} RISK
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>PAYLOAD CONTENT:</span>
                  <pre style={{
                    padding: "12px", borderRadius: "8px", background: "var(--surface-2)", border: "1px solid var(--border)",
                    fontSize: "0.8rem", fontFamily: "JetBrains Mono, monospace", whiteSpace: "pre-wrap", color: "var(--text-primary)", marginTop: "4px"
                  }}>
                    {JSON.stringify(selectedScan, null, 2)}
                  </pre>
                </div>
              </div>

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => handleDeleteScan(selectedScan._id)} className="btn btn-danger">
                  <Trash2 size={14} /> Delete Record
                </button>
                <button onClick={() => setSelectedScan(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default AdminDashboard;
