import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Layout from '../components/Layout';
import RevealOnScroll from '../components/RevealOnScroll';
import { FileText, Download, Sparkles, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

function ThreatReports() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/reports')
      .then(res => {
        if (!mounted) return;
        setReports(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelected(res.data[0]);
        }
      })
      .catch(err => {
        console.error('Failed to load reports', err.message || err);
      })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  const downloadPDF = (r) => {
    const url = `${api.defaults.baseURL || ''}/reports/${r._id}/export`;
    window.open(url, '_blank');
    toast.success("Exporting Report", `Downloading threat analysis audit for #${r._id?.substring(0, 8) || "report"}`);
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '10px 0 40px' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: '99px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#38bdf8',
            marginBottom: '10px',
          }}>
            <Sparkles size={13} />
            <span>EXECUTIVE SUMMARIES & AUDITS</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Threat Inspection Reports
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            View detailed findings or export formal PDF security assessments for audit records
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading threat reports...
          </div>
        ) : (
          <RevealOnScroll threshold={0.05}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }} className="responsive-grid">
              
              {/* REPORTS LIST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reports.length === 0 ? (
                  <div className="liquid-glass-card" style={{ padding: '32px', textAlign: 'center', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No reports generated yet. Perform a scan to automatically create a report.
                  </div>
                ) : (
                  reports.map((r) => {
                    const active = selected?._id === r._id;
                    const isHigh = r.risk === 'HIGH';
                    const isMed = r.risk === 'MEDIUM';

                    return (
                      <div
                        key={r._id}
                        onClick={() => setSelected(r)}
                        className="liquid-glass-card"
                        style={{
                          padding: '16px 20px',
                          borderRadius: '14px',
                          background: active ? 'rgba(99, 102, 241, 0.14)' : undefined,
                          border: active ? '1px solid rgba(129, 140, 248, 0.4)' : undefined,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                            {r.type} Scan Report
                          </span>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                            color: isHigh ? '#f87171' : isMed ? '#fbbf24' : '#34d399',
                            background: isHigh ? 'rgba(239,68,68,0.15)' : isMed ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                          }}>
                            {r.risk}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(r.createdAt || Date.now()).toLocaleString()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* REPORT DETAIL PANEL */}
              <div
                className="liquid-glass-card"
                style={{
                  padding: '28px',
                  borderRadius: 'var(--radius-xl)',
                  minHeight: '360px',
                }}
              >
                {selected ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                          {selected.type} Analysis Finding
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Report ID: {selected._id}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadPDF(selected)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.85rem', padding: '10px 18px', borderRadius: '12px' }}
                      >
                        <Download size={15} />
                        Export PDF Audit
                      </button>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Inspected Content
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: '0.86rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                        {selected.content || 'N/A'}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Diagnostic Result &amp; Indicators
                      </div>
                      <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                        {selected.result || 'No specific threat indicators flagged.'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    Select a report from the list to view diagnostic breakdown
                  </div>
                )}
              </div>

            </div>
          </RevealOnScroll>
        )}

      </div>
    </Layout>
  );
}

export default ThreatReports;
