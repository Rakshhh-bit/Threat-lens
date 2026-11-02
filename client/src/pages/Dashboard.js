import React, { useEffect, useState } from "react";
import api from "../utils/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import Layout from "../components/Layout";
import ThreatHeatmap from "../components/ThreatHeatmap";
import RevealOnScroll from "../components/RevealOnScroll";
import {
  Shield, TrendingUp, AlertTriangle, CheckCircle,
  Search, Filter, X, Calendar, Eye, RotateCcw,
  Mail, Link as LinkIcon, MessageSquare, SlidersHorizontal,
  Sparkles, Activity
} from "lucide-react";

function Dashboard() {
  const [scans, setScans] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [customDate, setCustomDate] = useState("");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [selectedScanDetail, setSelectedScanDetail] = useState(null);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const res = await api.get("/scan");
      setScans(res.data || []);
    } catch (err) {
      console.log("Error loading scans", err);
    }
  };

  const total = scans.length;
  const high = scans.filter((s) => s.risk === "HIGH").length;
  const medium = scans.filter((s) => s.risk === "MEDIUM").length;
  const low = scans.filter((s) => s.risk === "LOW").length;

  const pieData = [
    { name: "High Risk", value: high || 0 },
    { name: "Medium Risk", value: medium || 0 },
    { name: "Safe / Low", value: low || 0 },
  ];
  const PIE_COLORS = ["#ef4444", "#f59e0b", "#10b981"];

  const barData = [
    { name: "Email", value: scans.filter(s => s.type === 'email').length },
    { name: "URL & Domain", value: scans.filter(s => s.type === 'link').length },
    { name: "SMS / Chat", value: scans.filter(s => s.type === 'message').length },
  ];

  const stats = [
    { label: "Total Scans", value: total, icon: Shield, color: "#38bdf8" },
    { label: "High Risk", value: high, icon: AlertTriangle, color: "#ef4444" },
    { label: "Medium Risk", value: medium, icon: TrendingUp, color: "#f59e0b" },
    { label: "Safe / Verified", value: low, icon: CheckCircle, color: "#10b981" },
  ];

  // Filtering & Sorting Logic
  const filteredScans = scans.filter((s) => {
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const contentText = (s.content || s.url || s.text || "").toLowerCase();
      const resultText = (s.result || s.message || "").toLowerCase();
      const typeText = (s.type || "").toLowerCase();
      const idText = (s._id || "").toLowerCase();
      const matches =
        contentText.includes(q) ||
        resultText.includes(q) ||
        typeText.includes(q) ||
        idText.includes(q);
      if (!matches) return false;
    }

    // 2. Threat Type Filter
    if (typeFilter !== "ALL") {
      if ((s.type || "").toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
    }

    // 3. Risk Rating Filter
    if (riskFilter !== "ALL") {
      if ((s.risk || "LOW").toUpperCase() !== riskFilter.toUpperCase()) {
        return false;
      }
    }

    // 4. Date Filter
    if (dateFilter !== "ALL") {
      const scanDate = new Date(s.createdAt || Date.now());
      const now = new Date();

      if (dateFilter === "TODAY") {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (scanDate < startOfToday) return false;
      } else if (dateFilter === "LAST_7_DAYS") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (scanDate < sevenDaysAgo) return false;
      } else if (dateFilter === "LAST_30_DAYS") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (scanDate < thirtyDaysAgo) return false;
      } else if (dateFilter === "CUSTOM" && customDate) {
        const targetStr = scanDate.toISOString().split("T")[0];
        if (targetStr !== customDate) return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "OLDEST") {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    } else if (sortBy === "HIGHEST_RISK") {
      const weight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (weight[b.risk || "LOW"] || 1) - (weight[a.risk || "LOW"] || 1);
    } else if (sortBy === "LOWEST_RISK") {
      const weight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (weight[a.risk || "LOW"] || 1) - (weight[b.risk || "LOW"] || 1);
    }
    // Default NEWEST
    return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
  });

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "ALL" ||
    riskFilter !== "ALL" ||
    dateFilter !== "ALL" ||
    customDate !== "" ||
    sortBy !== "NEWEST";

  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("ALL");
    setRiskFilter("ALL");
    setDateFilter("ALL");
    setCustomDate("");
    setSortBy("NEWEST");
  };

  const getTypeIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "email") return <Mail size={14} color="#38bdf8" />;
    if (t === "link" || t === "url") return <LinkIcon size={14} color="#818cf8" />;
    if (t === "message" || t === "sms") return <MessageSquare size={14} color="#34d399" />;
    return <Shield size={14} color="#a78bfa" />;
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 0 40px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: '99px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(129, 140, 248, 0.25)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--accent-indigo)',
            marginBottom: '10px',
          }}>
            <Sparkles size={13} />
            <span>COMMAND & CONTROL CENTER</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Security Intelligence Dashboard
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Real-time multi-vector threat analytics, heuristic metrics, and inspection history
          </p>
        </div>

        {/* STAT CARDS ROW WITH REVEAL ON SCROLL */}
        <RevealOnScroll threshold={0.05} style={{ marginBottom: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%' }}>
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="liquid-glass-card"
                  style={{
                    padding: '20px 24px',
                    borderRadius: '16px',
                    minWidth: 0,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{s.label}</span>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={s.color} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>
                    {s.value}
                  </div>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* CHARTS ROW WITH REVEAL ON SCROLL */}
        <RevealOnScroll threshold={0.05} style={{ marginBottom: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%' }}>
            
            {/* PIE CHART */}
            <div className="liquid-glass-card" style={{ padding: '24px', borderRadius: '16px', minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Risk Severity Breakdown
              </h3>
              <div style={{ height: 220, width: '100%', minWidth: 0 }}>
                {total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No scan data recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* BAR CHART */}
            <div className="liquid-glass-card" style={{ padding: '24px', borderRadius: '16px', minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Scans by Channel Vector
              </h3>
              <div style={{ height: 220, width: '100%', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </RevealOnScroll>

        {/* D3 THREAT DETECTION HEATMAP WITH REVEAL ON SCROLL */}
        <RevealOnScroll threshold={0.05} style={{ marginBottom: '28px' }}>
          <ThreatHeatmap scans={scans} />
        </RevealOnScroll>

        {/* RECENT SCANS LOG & FILTER BAR WITH REVEAL ON SCROLL */}
        <RevealOnScroll threshold={0.05}>
          <div className="liquid-glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#38bdf8" />
                Scan History &amp; Inspection Logs
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Search and filter your past analysis results by threat type, risk, or date
              </p>
            </div>
            
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '6px 14px', borderRadius: '99px', border: '1px solid var(--border)', fontWeight: 600 }}>
              Showing {filteredScans.length} of {scans.length} scans
            </div>
          </div>

          {/* SEARCH & FILTER CONTROLS BAR */}
          <div style={{
            background: 'var(--surface-2)',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid var(--border)',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {/* TOP ROW: SEARCH INPUT & CLEAR BUTTON */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              {/* SEARCH INPUT */}
              <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '220px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search by keywords, URL, content, or scan result..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    borderRadius: '10px',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* CLEAR FILTERS BUTTON */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <RotateCcw size={13} />
                  Reset Filters
                </button>
              )}
            </div>

            {/* BOTTOM ROW: DROPDOWN SELECTORS FOR TYPE, RISK, DATE, SORT */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', width: '100%' }}>
              
              {/* THREAT TYPE FILTER */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Filter size={11} />
                  Threat Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--surface-1)',
                    border: typeFilter !== 'ALL' ? '1px solid #818cf8' : '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">All Types</option>
                  <option value="email">Email Phishing</option>
                  <option value="link">URL &amp; Domain</option>
                  <option value="message">SMS &amp; Message</option>
                </select>
              </div>

              {/* RISK LEVEL FILTER */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <AlertTriangle size={11} />
                  Risk Rating
                </label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--surface-1)',
                    border: riskFilter !== 'ALL' ? '1px solid #818cf8' : '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">All Risks</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="LOW">Low / Safe</option>
                </select>
              </div>

              {/* DATE FILTER */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Calendar size={11} />
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--surface-1)',
                    border: dateFilter !== 'ALL' ? '1px solid #818cf8' : '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">All Dates</option>
                  <option value="TODAY">Today</option>
                  <option value="LAST_7_DAYS">Last 7 Days</option>
                  <option value="LAST_30_DAYS">Last 30 Days</option>
                  <option value="CUSTOM">Specific Date...</option>
                </select>
              </div>

              {/* CUSTOM DATE INPUT IF CUSTOM SELECTED */}
              {dateFilter === "CUSTOM" && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      background: 'var(--surface-1)',
                      border: '1px solid #818cf8',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {/* SORT ORDER */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <SlidersHorizontal size={11} />
                  Sort Order
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="HIGHEST_RISK">Highest Risk First</option>
                  <option value="LOWEST_RISK">Lowest Risk First</option>
                </select>
              </div>

            </div>

            {/* ACTIVE FILTERS TAGS BAR */}
            {hasActiveFilters && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', paddingTop: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Filters:</span>
                
                {searchQuery.trim() && (
                  <span style={{ fontSize: '0.74rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '3px 10px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(129,140,248,0.3)' }}>
                    Query: "{searchQuery}"
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery("")} />
                  </span>
                )}

                {typeFilter !== "ALL" && (
                  <span style={{ fontSize: '0.74rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '3px 10px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(56,189,248,0.3)' }}>
                    Type: {typeFilter.toUpperCase()}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => setTypeFilter("ALL")} />
                  </span>
                )}

                {riskFilter !== "ALL" && (
                  <span style={{ fontSize: '0.74rem', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '3px 10px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(245,158,11,0.3)' }}>
                    Risk: {riskFilter}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => setRiskFilter("ALL")} />
                  </span>
                )}

                {dateFilter !== "ALL" && (
                  <span style={{ fontSize: '0.74rem', background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '3px 10px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(52,211,153,0.3)' }}>
                    Date: {dateFilter === "CUSTOM" ? customDate || "Custom" : dateFilter.replace("_", " ")}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setDateFilter("ALL"); setCustomDate(""); }} />
                  </span>
                )}
              </div>
            )}

          </div>

          {/* SCAN HISTORY TABLE */}
          {filteredScans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)', fontSize: '0.88rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              {scans.length === 0 ? (
                <span>No scan history recorded yet. Try analyzing an email, URL, or message!</span>
              ) : (
                <div>
                  <p style={{ marginBottom: '12px', fontWeight: 600 }}>No scan results match your selected search and filters.</p>
                  <button
                    onClick={handleResetFilters}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      background: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      color: '#818cf8',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Clear Filter Search
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Channel / Type</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Inspected Target Content</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Threat Rating</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Timestamp</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScans.map((s, idx) => {
                    const contentStr = s.content || s.url || s.text || '-';
                    const isHigh = s.risk === 'HIGH';
                    const isMed = s.risk === 'MEDIUM';

                    return (
                      <tr
                        key={s._id || idx}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize' }}>
                            {getTypeIcon(s.type)}
                            {s.type || 'Scan'}
                          </span>
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          maxWidth: '280px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--text-secondary)',
                          fontFamily: 'monospace',
                          fontSize: '0.82rem',
                        }} title={contentStr}>
                          {contentStr}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '99px',
                            color: isHigh ? '#f87171' : isMed ? '#fbbf24' : '#34d399',
                            background: isHigh ? 'rgba(239,68,68,0.12)' : isMed ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                            border: `1px solid ${isHigh ? 'rgba(239,68,68,0.25)' : isMed ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.2)'}`,
                          }}>
                            {s.risk || 'LOW'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                          {s.createdAt ? new Date(s.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'Just now'}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedScanDetail(s)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-primary)',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Eye size={12} color="#38bdf8" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </RevealOnScroll>

        {/* SCAN INSPECTION DETAIL MODAL */}
        {selectedScanDetail && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }} onClick={() => setSelectedScanDetail(null)}>
            <div style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              maxHeight: '90vh',
              overflowY: 'auto',
              animation: 'fadeUp 0.2s ease forwards',
            }} onClick={(e) => e.stopPropagation()}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getTypeIcon(selectedScanDetail.type)}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {selectedScanDetail.type || 'Scan'} Analysis Result
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedScanDetail(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.78rem', fontWeight: 700, padding: '4px 12px', borderRadius: '99px',
                  color: selectedScanDetail.risk === 'HIGH' ? '#f87171' : selectedScanDetail.risk === 'MEDIUM' ? '#fbbf24' : '#34d399',
                  background: selectedScanDetail.risk === 'HIGH' ? 'rgba(239,68,68,0.15)' : selectedScanDetail.risk === 'MEDIUM' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                }}>
                  {selectedScanDetail.risk || 'LOW'} RISK
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedScanDetail.createdAt ? new Date(selectedScanDetail.createdAt).toLocaleString() : 'Recent'}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', uppercase: 'true' }}>
                  INSPECTED TARGET / CONTENT
                </label>
                <div style={{
                  marginTop: '6px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  wordBreak: 'break-all',
                  maxHeight: '140px',
                  overflowY: 'auto',
                }}>
                  {selectedScanDetail.content || selectedScanDetail.url || selectedScanDetail.text || 'No content recorded'}
                </div>
              </div>

              {(selectedScanDetail.explanation || selectedScanDetail.result || selectedScanDetail.message) && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    DIAGNOSTIC SUMMARY &amp; THREAT REASONS
                  </label>
                  <div style={{
                    marginTop: '6px',
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    lineHeight: '1.6',
                  }}>
                    {selectedScanDetail.explanation || selectedScanDetail.result || selectedScanDetail.message}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setSelectedScanDetail(null)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
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

export default Dashboard;
