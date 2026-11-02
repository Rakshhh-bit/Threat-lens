const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const OFFICIAL_EMAIL = "cybershieldai398@gmail.com";
const QUERIES_FILE = path.join(__dirname, "../data/contact_queries.json");

// Ensure queries data file directory exists
function ensureDataFile() {
  try {
    const dir = path.dirname(QUERIES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(QUERIES_FILE)) {
      fs.writeFileSync(QUERIES_FILE, JSON.stringify([], null, 2), "utf8");
    }
  } catch (err) {
    console.warn("[Contact Controller] Could not init queries file:", err.message);
  }
}

ensureDataFile();

function saveQuery(queryData) {
  try {
    let list = [];
    if (fs.existsSync(QUERIES_FILE)) {
      list = JSON.parse(fs.readFileSync(QUERIES_FILE, "utf8") || "[]");
    }
    list.unshift(queryData);
    // Keep last 300 queries
    if (list.length > 300) list = list.slice(0, 300);
    fs.writeFileSync(QUERIES_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch (err) {
    console.warn("[Contact Controller] Error saving query locally:", err.message);
  }
}

// Mail transporter configured with environment variables or fallback
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const submitContactQuery = async (req, res) => {
  try {
    const { name, email, subject, category, priority, message, phone } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Please provide your full name" });
    }
    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Please provide your inquiry or message" });
    }

    const queryRecord = {
      id: "QRY-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      subject: subject ? subject.trim() : "General Security & Support Query",
      category: category || "General Support",
      priority: priority || "Normal",
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: "received",
      forwardedTo: OFFICIAL_EMAIL,
    };

    // Save record locally
    saveQuery(queryRecord);

    const emailSubject = `[ThreatLens Support] [${queryRecord.category}] ${queryRecord.subject} (${queryRecord.priority} Priority)`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0b0f19; color: #f1f5f9; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #4f46e5, #0ea5e9); padding: 24px 30px; text-align: left;">
          <h2 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: -0.02em;">🛡️ ThreatLens — New Support Query</h2>
          <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">Inquiry Reference ID: <strong>${queryRecord.id}</strong></p>
        </div>
        
        <div style="padding: 28px 30px; background: #0f172a;">
          <div style="background: #1e293b; border-radius: 8px; padding: 18px; margin-bottom: 22px; border-left: 4px solid #6366f1;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; width: 130px;">Sender Name:</td>
                <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${queryRecord.name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Email Address:</td>
                <td style="padding: 6px 0; color: #38bdf8; font-weight: 600;"><a href="mailto:${queryRecord.email}" style="color: #38bdf8; text-decoration: none;">${queryRecord.email}</a></td>
              </tr>
              ${queryRecord.phone ? `
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Phone Number:</td>
                <td style="padding: 6px 0; color: #ffffff;">${queryRecord.phone}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Inquiry Category:</td>
                <td style="padding: 6px 0; color: #cbd5e1;"><span style="background: #334155; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${queryRecord.category}</span></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Priority:</td>
                <td style="padding: 6px 0; color: ${queryRecord.priority === 'Critical' ? '#ef4444' : queryRecord.priority === 'High' ? '#f59e0b' : '#10b981'}; font-weight: 700;">${queryRecord.priority.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Received At:</td>
                <td style="padding: 6px 0; color: #94a3b8; font-size: 12px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px; color: #f8fafc; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Message Body:</h4>
            <div style="background: #111827; border: 1px solid #1e293b; border-radius: 8px; padding: 18px; color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${queryRecord.message}</div>
          </div>

          <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center;">
            Sent to official desk: <strong style="color: #94a3b8;">${OFFICIAL_EMAIL}</strong> • Reply directly to this email to contact the user.
          </div>
        </div>
      </div>
    `;

    // Attempt SMTP delivery
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: `"ThreatLens Contact Desk" <${process.env.EMAIL_USER}>`,
          to: OFFICIAL_EMAIL,
          replyTo: queryRecord.email,
          subject: emailSubject,
          html: htmlContent,
        });

        // Optional confirmation receipt to user
        try {
          await transporter.sendMail({
            from: `"ThreatLens Support" <${process.env.EMAIL_USER}>`,
            to: queryRecord.email,
            subject: `[Received] We received your inquiry (Ref: ${queryRecord.id})`,
            html: `
              <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 10px; border: 1px solid #1e293b;">
                <h3 style="color: #38bdf8; margin-top: 0;">🛡️ ThreatLens Support Acknowledgment</h3>
                <p>Hello ${queryRecord.name},</p>
                <p style="color: #cbd5e1; line-height: 1.6;">Thank you for contacting ThreatLens. Your inquiry regarding <strong>"${queryRecord.subject}"</strong> has been logged with reference ID <strong>${queryRecord.id}</strong> and dispatched directly to our security &amp; support desk at <strong>${OFFICIAL_EMAIL}</strong>.</p>
                <p style="color: #cbd5e1; line-height: 1.6;">Our security engineering team typically responds within 2-4 hours during business operational hours.</p>
                <hr style="border-color: #1e293b; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">ThreatLens Intelligent Threat Protection • Incident Desk: ${OFFICIAL_EMAIL}</p>
              </div>
            `,
          });
        } catch (confErr) {
          console.warn("[Contact Controller] Confirmation email failed:", confErr.message);
        }
      } catch (mailErr) {
        console.warn("[Contact Controller] Mail send failed (saved to storage):", mailErr.message);
      }
    } else {
      console.log(`[Contact Controller] Logged query for ${OFFICIAL_EMAIL}:`, queryRecord);
    }

    return res.status(200).json({
      success: true,
      message: `Your query has been recorded and submitted to our official security desk at ${OFFICIAL_EMAIL}. Our team will review and respond promptly.`,
      referenceId: queryRecord.id,
      officialEmail: OFFICIAL_EMAIL,
    });
  } catch (error) {
    console.error("[Contact Controller] Error submitting contact query:", error);
    return res.status(500).json({
      error: "An unexpected error occurred while sending your query. Please try again or email us directly at " + OFFICIAL_EMAIL,
    });
  }
};

const getContactQueries = async (req, res) => {
  try {
    let list = [];
    if (fs.existsSync(QUERIES_FILE)) {
      list = JSON.parse(fs.readFileSync(QUERIES_FILE, "utf8") || "[]");
    }
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ error: "Failed to load queries" });
  }
};

module.exports = {
  submitContactQuery,
  getContactQueries,
  OFFICIAL_EMAIL,
};
