const mongoose = require('mongoose');
const Scan = require('../models/Scan');

const isValidObjectId = (id) => {
  if (!id || typeof id !== "string") return false;
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

const escapeHtml = (str = "") => {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// List reports (scans) for authenticated user
const listReports = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !isValidObjectId(String(userId))) {
      return res.json([]);
    }
    const reports = await Scan.find({ userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.warn('Failed to list reports from DB:', err.message);
    res.json([]);
  }
};

// Get single report
const getReport = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !isValidObjectId(String(id))) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const r = await Scan.findById(id);
    if (!r) return res.status(404).json({ error: 'Report not found' });
    if (String(r.userId) !== String(req.user?.id)) return res.status(403).json({ error: 'Forbidden' });
    res.json(r);
  } catch (err) {
    console.error('Failed to get report', err.message);
    res.status(500).json({ error: 'Failed to get report' });
  }
};

// Export report as printable HTML (client can open and print to PDF)
const exportReportHtml = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !isValidObjectId(String(id))) {
      return res.status(404).send('Report not found');
    }
    const r = await Scan.findById(id);
    if (!r) return res.status(404).send('Report not found');
    if (String(r.userId) !== String(req.user?.id)) return res.status(403).send('Forbidden');

    const safeType = escapeHtml(r.type || "Scan Report");
    const safeRisk = escapeHtml(r.risk || "Unknown");
    const safeContent = escapeHtml(r.content || "");
    const safeDate = escapeHtml(r.createdAt ? r.createdAt.toISOString() : new Date().toISOString());

    const html = `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>ThreatLens Security Report</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 32px; background: #f8fafc; line-height: 1.6; }
          .card { background: #ffffff; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 0.85rem; text-transform: uppercase; }
          .badge-safe { background: #dcfce7; color: #166534; }
          .badge-danger { background: #fee2e2; color: #991b1b; }
          .badge-suspicious { background: #fef3c7; color: #92400e; }
          pre { background: #f1f5f9; padding: 16px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; word-break: break-all; border: 1px solid #cbd5e1; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 style="margin: 0 0 6px; color: #0f172a;">ThreatLens Diagnostic Report</h1>
            <div style="font-size: 0.85rem; color: #64748b;">Generated: ${safeDate}</div>
          </div>
          <p><strong>Scan Type:</strong> ${safeType}</p>
          <p><strong>Risk Evaluation:</strong> <span class="badge ${safeRisk.toLowerCase() === 'safe' ? 'badge-safe' : (safeRisk.toLowerCase() === 'suspicious' ? 'badge-suspicious' : 'badge-danger')}">${safeRisk}</span></p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 18px 0;" />
          <h3 style="margin: 0 0 10px; color: #334155;">Scanned Artifact Details:</h3>
          <pre>${safeContent}</pre>
        </div>
      </body>
      </html>
    `;

    res.set('Content-Type', 'text/html');
    res.send(html);

  } catch (err) {
    console.error('Failed to export report', err.message);
    res.status(500).send('Export failed');
  }
};

module.exports = {
  listReports,
  getReport,
  exportReportHtml,
};
