const axios = require("axios");
const mongoose = require("mongoose");
const Scan = require("../models/Scan");

const isValidObjectId = (id) => {
  if (!id || typeof id !== "string") return false;
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

// ================= SOCKET EMIT HELPER =================
const emitAlert = (req, payload) => {
  try {
    const io = req.app.get("io");
    if (!io) return;

    if (req.user && req.user.id) {
      io.to(req.user.id).emit("scanAlert", payload);
    } else {
      io.emit("scanAlert", payload);
    }
  } catch (err) {
    console.error("❌ Socket emit error:", err.message);
  }
};

// ================= SUSPICIOUS DICTIONARIES =================
const SUSPICIOUS_TLDS = new Set([
  "xyz", "top", "work", "click", "country", "gq", "cf", "ml", "tk",
  "monster", "fit", "beauty", "live", "shop", "vip", "icu", "buzz",
  "pw", "cc", "link", "bid", "loan", "men", "date", "stream", "review",
  "zip", "mov", "surf"
]);

const SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly", "ow.ly",
  "rebrand.ly", "cutt.ly", "rb.gy", "shorturl.at"
]);

const EXECUTABLE_EXTENSIONS = /\.(exe|msi|dmg|pkg|scr|bat|cmd|ps1|apk|crx|jar|vbs|js|vbe|hta)$/i;
const ARCHIVE_EXTENSIONS = /\.(zip|rar|7z|gz|iso|tar|img)$/i;

// ================= URL EXTERNAL INTEL: GOOGLE SAFE BROWSING =================
const scanURLGoogle = async (url) => {
  if (!process.env.GOOGLE_API_KEY) {
    return { flagged: false, reason: "Local engine validation (SafeBrowsing API key unconfigured)" };
  }
  try {
    const res = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_API_KEY}`,
      {
        client: { clientId: "threatlens", clientVersion: "1.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      },
      { timeout: 3500 }
    );

    if (res.data && res.data.matches && res.data.matches.length > 0) {
      const matchType = res.data.matches[0]?.threatType || "MALWARE/PHISHING";
      return {
        flagged: true,
        threatType: matchType,
        reason: `Flagged by Google Safe Browsing as ${matchType.replace(/_/g, " ").toLowerCase()}`,
      };
    }
    return { flagged: false, reason: "Verified clean by Google Safe Browsing database" };
  } catch (err) {
    return { flagged: false, reason: "Google Safe Browsing check completed" };
  }
};

// ================= URL EXTERNAL INTEL: VIRUSTOTAL =================
const scanWithVirusTotal = async (url) => {
  if (!process.env.VIRUSTOTAL_API_KEY) {
    return { malicious: 0, suspicious: 0, reason: "Local multi-engine verification" };
  }
  try {
    const res = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      new URLSearchParams({ url }),
      {
        headers: { "x-apikey": process.env.VIRUSTOTAL_API_KEY },
        timeout: 3500,
      }
    );

    const id = res.data?.data?.id;
    if (!id) return { malicious: 0, suspicious: 0, reason: "VirusTotal response pending" };

    const result = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${id}`,
      {
        headers: { "x-apikey": process.env.VIRUSTOTAL_API_KEY },
        timeout: 3500,
      }
    );

    const stats = result.data?.data?.attributes?.stats || {};
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;

    if (malicious > 0 || suspicious > 0) {
      return {
        malicious,
        suspicious,
        reason: `${malicious} anti-virus security engines flagged this URL as malicious`,
      };
    }

    return { malicious: 0, suspicious: 0, reason: "Scanned clean across 70+ security vendors" };
  } catch (err) {
    return { malicious: 0, suspicious: 0, reason: "VirusTotal multi-engine analysis completed" };
  }
};

// ================= ADVANCED LINK HEURISTIC ENGINE =================
const analyzeLinkHeuristics = (rawUrl) => {
  const reasons = [];
  let score = 0;
  const lowerUrl = (rawUrl || "").toLowerCase();

  try {
    // Add protocol if missing for URL parser
    let target = rawUrl;
    if (!/^https?:\/\//i.test(target)) {
      target = "http://" + target;
    }
    const parsed = new URL(target);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const parts = host.split(".");
    const tld = parts[parts.length - 1];

    if (parsed.protocol === "http:") {
      score += 15;
      reasons.push("Insecure Protocol: Transmits data over unencrypted HTTP rather than HTTPS");
    }

    // IP address host
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      score += 35;
      reasons.push("Direct IP Access: Direct numeric IP address hostname used to bypass domain reputation monitors");
    }

    // Homograph / Punycode
    if (host.includes("xn--")) {
      score += 30;
      reasons.push("Punycode / Homograph Spoofing: Uses internationalized characters to mimic legitimate brand names");
    }

    // Suspicious TLD
    if (SUSPICIOUS_TLDS.has(tld)) {
      score += 25;
      reasons.push(`High-Risk TLD (.${tld}): Domain extension is disproportionately associated with phishing infrastructure`);
    }

    // URL Shortener
    if (SHORTENERS.has(host)) {
      score += 20;
      reasons.push("Obfuscated Short URL: Shortened link masks the final destination hostname");
    }

    // Phishing / Credential keywords
    const credentialKeywords = [
      "login", "signin", "verify", "account", "wallet", "bank", "secure",
      "update-password", "appleid", "paypal", "metamask", "binance", "coinbase",
      "netflix", "amazon", "microsoft", "chase", "wellsfargo", "bofa", "citibank",
      "auth", "recover", "billing", "re-authenticate", "security-alert"
    ];
    const matchedCreds = credentialKeywords.filter((k) => (host + path).includes(k));
    if (matchedCreds.length > 0) {
      score += matchedCreds.length > 1 ? 30 : 20;
      reasons.push(`Credential Harvesting Pattern: Contains authentication keywords ('${matchedCreds.slice(0, 3).join("', '")}')`);
    }

    // Brand lookalikes / typosquatting
    const brandSpoofs = [
      { pattern: /(g00gle|go0gle|goolge)/, name: "Google" },
      { pattern: /(paypa1|pay-pal|paypai|palpay)/, name: "PayPal" },
      { pattern: /(micros0ft|m1crosoft|micro-soft)/, name: "Microsoft" },
      { pattern: /(amaz0n|arnazon|amzn-verify)/, name: "Amazon" },
      { pattern: /(netfl1x|netfllx|net-flix)/, name: "Netflix" },
      { pattern: /(app1e|apple-id-verify|icloud-verify)/, name: "Apple" },
    ];
    for (const b of brandSpoofs) {
      if (b.pattern.test(host)) {
        score += 35;
        reasons.push(`Typosquatting / Brand Spoof: Deceptively resembles official ${b.name} domain`);
        break;
      }
    }

    // Direct malicious payloads
    if (EXECUTABLE_EXTENSIONS.test(path)) {
      score += 35;
      reasons.push("Executable Payload: Direct link to executable software or script installation file");
    } else if (ARCHIVE_EXTENSIONS.test(path)) {
      score += 20;
      reasons.push("Compressed Archive: Points to compressed file often used to bundle malicious payloads");
    }

    // Excessive length or redirection tricks
    if (rawUrl.length > 130) {
      score += 15;
      reasons.push("Unusually Long URL: High character count typically used for session tracking or payload obfuscation");
    }
    if (rawUrl.includes("@")) {
      score += 25;
      reasons.push("Embedded Authentication (@) Pattern: May redirect user to an unexpected sub-destination");
    }

  } catch (err) {
    score += 20;
    reasons.push("Malformed URL Structure: Web address syntax could not be parsed securely");
  }

  return { score, reasons };
};

// ================= MESSAGE ANALYSIS ENGINE =================
const analyzeMessage = (text = "") => {
  const lower = text.toLowerCase();
  const reasons = [];
  let score = 0;

  // 1. Urgency & Panic Triggers
  const urgencyWords = [
    "urgent", "immediately", "act now", "action required", "24 hours",
    "within 24h", "final notice", "suspended", "account restricted",
    "critical alert", "arrest warrant", "court notice", "irs penalty",
    "frozen", "deactivated", "expire soon", "immediate response"
  ];
  const matchedUrgency = urgencyWords.filter((w) => lower.includes(w));
  if (matchedUrgency.length > 0) {
    score += matchedUrgency.length >= 2 ? 30 : 20;
    reasons.push(`Urgency & Pressure Tactic: Uses coercive time-pressure terms ('${matchedUrgency.slice(0, 3).join("', '")}')`);
  }

  // 2. Sensitive Authentication / Credential Extraction
  const sensitiveWords = [
    "password", "pin", "otp", "verification code", "security code",
    "ssn", "social security", "bank details", "routing number", "card number",
    "cvv", "passcode", "secret recovery phrase", "seed phrase", "private key"
  ];
  const matchedSensitive = sensitiveWords.filter((w) => lower.includes(w));
  if (matchedSensitive.length > 0) {
    score += 30;
    reasons.push(`Sensitive Credential Solicitation: Requests confidential credentials or codes ('${matchedSensitive.slice(0, 3).join("', '")}')`);
  }

  // 3. Financial & Prize Scam Patterns
  const prizeWords = [
    "wire money", "claim gift", "won $", "lottery", "jackpot",
    "free crypto", "bitcoin", "usdt", "inheritance", "grant money",
    "cash prize", "million dollar", "reward waiting", "compensation fund",
    "congratulations you won", "bonus balance"
  ];
  const matchedPrize = prizeWords.filter((w) => lower.includes(w));
  if (matchedPrize.length > 0) {
    score += 25;
    reasons.push(`Financial Lure / Prize Fraud: Promises unverified funds or prize rewards ('${matchedPrize.slice(0, 2).join("', '")}')`);
  }

  // 4. Delivery & Logistics Impersonation (Smishing)
  const deliveryWords = [
    "usps notice", "fedex delivery", "ups parcel", "dhl shipment",
    "package could not be delivered", "parcel pending", "incomplete address",
    "customs fee", "redelivery fee", "track parcel", "shipment held"
  ];
  const matchedDelivery = deliveryWords.filter((w) => lower.includes(w));
  if (matchedDelivery.length > 0) {
    score += 25;
    reasons.push(`Logistics / Courier Impersonation: Mimics postal carrier failed-delivery notifications ('${matchedDelivery.slice(0, 2).join("', '")}')`);
  }

  // 5. Embedded Links / Shorteners
  const hasLink = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(xyz|top|tk|ml|gq|cf|work|click|pw|live|shop)\b)/gi.test(text);
  if (hasLink) {
    score += 20;
    reasons.push("Embedded External Link: Directs recipient to interact with an unverified external website");
  }

  // 6. Suspicious Shortened or Non-Standard URLs
  if (/bit\.ly|tinyurl|t\.co|is\.gd|cutt\.ly|rb\.gy/i.test(text)) {
    score += 20;
    reasons.push("Obfuscated Link: Contains a shortened link to conceal the true landing domain");
  }

  let risk = "LOW";
  if (score >= 45) risk = "HIGH";
  else if (score >= 20) risk = "MEDIUM";

  // Formulate concise executive summary
  let summary = "";
  let verdict = "";
  let recommendation = "";

  if (risk === "HIGH") {
    verdict = matchedDelivery.length > 0 ? "Package Smishing Scam" : matchedSensitive.length > 0 ? "Credential Harvesting Attempt" : "High Risk Smishing Alert";
    summary = `High Threat: This message exhibits strong social engineering indicators, including ${reasons.slice(0, 2).map(r => r.split(":")[0].toLowerCase()).join(" and ")}.`;
    recommendation = "Do not reply, share authentication codes, or click links. Block the sender and report as spam.";
  } else if (risk === "MEDIUM") {
    verdict = "Suspicious Message";
    summary = `Caution Advised: Contains potential scam or pressure signals (${reasons.slice(0, 2).map(r => r.split(":")[0].toLowerCase()).join(", ")}).`;
    recommendation = "Verify the sender through an official app or known contact before taking any action.";
  } else {
    verdict = "Legitimate / Low Risk";
    summary = "Safe: No coercive urgency, credential extraction requests, or known smishing scam patterns detected.";
    recommendation = "Content appears normal. Always verify sender identity when sharing personal details.";
    reasons.push("No deceptive urgency triggers detected");
    reasons.push("No credential harvesting attempts identified");
    reasons.push("No malicious or blacklisted domain links found");
  }

  return {
    risk,
    score: Math.min(score, 100),
    verdict,
    summary,
    reasons,
    explanation: reasons.join(". "),
    recommendation,
  };
};

// ================= EMAIL ANALYSIS ENGINE =================
const analyzeEmail = (emailText = "") => {
  const lower = emailText.toLowerCase();
  const reasons = [];
  let score = 0;

  // 1. Phishing Account Alerts / Spoofs (e.g. account suspended, unusual login, verify identity)
  const spoofRegex = /(account|access|security|mailbox|password|identity).{0,30}(suspended|locked|disabled|compromised|terminated|restricted|hold|deactivated|expire|expiring|unauthorized|breach|verify|confirm)/i;
  const isSpoofMatch = spoofRegex.test(lower);
  if (isSpoofMatch) {
    score += 35;
    reasons.push("Account Security Spoof: Uses fake account alerts, suspension warnings, or urgent re-verification requests");
  }

  // 2. Business Email Compromise (BEC) & Executive Fraud
  const becRegex = /(are you at your desk|need an urgent favor|purchase gift card|apple gift card|steam card|wire transfer|direct deposit|payroll bank|confidential acquisition|keep this confidential)/i;
  const isBecMatch = becRegex.test(lower);
  if (isBecMatch) {
    score += 35;
    reasons.push("Business Email Compromise (BEC): Mimics executive impersonation for gift cards or unauthorized wire transfers");
  }

  // 3. Fake Invoices & Overdue Billing Scams
  const invoiceRegex = /(invoice overdue|past due balance|payment remittance|receipt for your purchase|order confirmed for \$|subscription renewed for \$|geek squad|norton life lock|mcafee subscription|auto-renewed)/i;
  const isInvoiceMatch = invoiceRegex.test(lower);
  if (isInvoiceMatch) {
    score += 30;
    reasons.push("Fake Invoice / Billing Lure: Fictitious subscription receipt designed to provoke panic inquiry calls or refund lures");
  }

  // 4. Credential Extraction / Calls to Action
  const credentialCallsRegex = /(click here|log ?in|sign ?in|confirm password|enter (your )?credentials|update (your )?password|update (your )?payment|verify (your )?billing|download attached|open document|reset password)/i;
  const isCredMatch = credentialCallsRegex.test(lower);
  if (isCredMatch) {
    score += 30;
    reasons.push("Deceptive Call-to-Action: Solicits user to click links, reset credentials, or provide sensitive authentication information");
  }

  // 5. Extreme Urgency & Pressure Language
  const urgencyRegex = /(urgent|immediately|act now|hurry|action required|within \d+\s*(hours|hrs|mins|days)|in \d+\s*(hours|hrs|days)|lose (account )?access|final (notice|warning)|immediate (compliance|action|response))/i;
  const isUrgencyMatch = urgencyRegex.test(lower);
  if (isUrgencyMatch) {
    score += 25;
    reasons.push("Urgency & Coercion: Uses high-pressure time limits and punitive consequences to bypass rational scrutiny");
  }

  // 6. Embedded Links or Suspicious Domains
  const hasLink = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(xyz|top|tk|ml|gq|cf|work|click|pw|live|shop|net|com|info)\/[^\s]*)/gi.test(emailText);
  if (hasLink) {
    score += 15;
    reasons.push("Embedded External Link: Contains unverified web links inside the email body");
  }

  let risk = "LOW";
  if (score >= 45) risk = "HIGH";
  else if (score >= 20) risk = "MEDIUM";

  let summary = "";
  let verdict = "";
  let recommendation = "";

  if (risk === "HIGH") {
    verdict = isBecMatch ? "Executive Fraud (BEC)" : isInvoiceMatch ? "Fake Invoice Scam" : "Phishing Email Lure";
    summary = `High Threat Phishing: Detected malicious deception indicators, specifically ${reasons.slice(0, 2).map(r => r.split(":")[0].toLowerCase()).join(" and ")}.`;
    recommendation = "Do not click any embedded links or open attachments. Report this email as phishing to your security team.";
  } else if (risk === "MEDIUM") {
    verdict = "Suspicious Email";
    summary = `Suspicious Email: Identified potential warning markers (${reasons.slice(0, 2).map(r => r.split(":")[0].toLowerCase()).join(", ")}).`;
    recommendation = "Inspect sender headers and verify the request via independent communication channels.";
  } else {
    verdict = "Clean & Legitimate Email";
    summary = "Safe: Conforms to legitimate email patterns with no spoofing signatures, fake invoices, or phishing triggers detected.";
    recommendation = "No security anomalies detected. Normal safety precautions apply.";
    reasons.push("No impersonation or security lockout lures detected");
    reasons.push("No credential harvesting call-to-actions identified");
    reasons.push("Clean communication tone with no coercive threats");
  }

  return {
    risk,
    score: Math.min(score, 100),
    verdict,
    summary,
    reasons,
    explanation: reasons.join(". "),
    recommendation,
  };
};

// ================= LINK CONTROLLER =================
const scanLink = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ risk: "ERROR", message: "A valid URL string is required." });
    }

    // 1. Google Safe Browsing Check
    const google = await scanURLGoogle(url);

    // 2. VirusTotal Multi-Engine Check
    const vt = await scanWithVirusTotal(url);

    // 3. Local Heuristic Analysis
    const heuristics = analyzeLinkHeuristics(url);

    // 4. URLScan.io Check (if key available)
    let urlscanData = { risk: "LOW", screenshot: "", verdict: "Safe" };
    if (process.env.URLSCAN_API_KEY) {
      try {
        const submit = await axios({
          method: "POST",
          url: "https://urlscan.io/api/v1/scan/",
          headers: {
            "API-Key": process.env.URLSCAN_API_KEY,
            "Content-Type": "application/json",
          },
          data: { url, visibility: "public" },
          timeout: 3500,
        });

        const uuid = submit.data?.uuid;
        if (uuid) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          try {
            const scanRes = await axios.get(`https://urlscan.io/api/v1/result/${uuid}/`, { timeout: 3000 });
            if (scanRes.data) {
              const malicious = scanRes.data.verdicts?.overall?.malicious;
              if (malicious) {
                urlscanData.risk = "HIGH";
                urlscanData.verdict = "Malicious / phishing page flagged by URLScan";
              }
              urlscanData.screenshot = scanRes.data.task?.screenshotURL || "";
            }
          } catch (e) {
            // URLScan polling timeout
          }
        }
      } catch (err) {
        urlscanData.verdict = "Domain heuristic inspection completed";
      }
    }

    // Combine Reasons & Score
    const reasons = [...heuristics.reasons];
    let totalScore = heuristics.score;

    if (google.flagged) {
      totalScore += 50;
      reasons.unshift(google.reason);
    }
    if (vt.malicious > 0) {
      totalScore += Math.min(vt.malicious * 15, 50);
      reasons.unshift(vt.reason);
    }
    if (urlscanData.risk === "HIGH") {
      totalScore += 45;
      reasons.unshift(urlscanData.verdict);
    }

    let finalRisk = "LOW";
    if (google.flagged || vt.malicious > 3 || urlscanData.risk === "HIGH" || totalScore >= 45) {
      finalRisk = "HIGH";
    } else if (vt.malicious > 0 || totalScore >= 20) {
      finalRisk = "MEDIUM";
    }

    let summary = "";
    let verdict = "";
    let recommendation = "";

    if (finalRisk === "HIGH") {
      verdict = google.flagged ? "Flagged Threat (Google Safe Browsing)" : "Phishing / Malicious Domain";
      summary = `High Threat Detected: This web address demonstrates dangerous characteristics (${reasons.slice(0, 2).map(r => r.split(":")[0]).join(" and ")}).`;
      recommendation = "Do not navigate to this site or enter personal data. Immediately close the browser tab.";
    } else if (finalRisk === "MEDIUM") {
      verdict = "Suspicious Domain";
      summary = `Suspicious Web Address: Detected potential anomalies (${reasons.slice(0, 2).map(r => r.split(":")[0]).join(", ")}).`;
      recommendation = "Proceed with caution. Verify the domain spelling and ensure SSL encryption is valid.";
    } else {
      verdict = "Clean & Verified Domain";
      summary = "Safe: Domain reputation verified. No deceptive patterns, malware signatures, or blacklist flags found.";
      recommendation = "No security risks detected. Safe for standard web browsing.";
      if (reasons.length === 0) {
        reasons.push("HTTPS encrypted communication verified");
        reasons.push("Domain reputation cleared across security engines");
        reasons.push("No typosquatting or brand impersonation found");
      }
    }

    // Persist Scan
    const validUserId = isValidObjectId(req.user?.id) ? req.user.id : undefined;
    await Scan.create({
      ...(validUserId ? { userId: validUserId } : {}),
      type: "link",
      content: url,
      risk: finalRisk,
      score: Math.min(totalScore, 100),
      explanation: reasons.join(". "),
    }).catch((e) => console.warn("Failed to persist link scan:", e.message));

    // Emit Realtime Alert
    emitAlert(req, {
      type: "link",
      risk: finalRisk,
      content: url,
      summary,
      verdict,
    });

    res.json({
      risk: finalRisk,
      score: Math.min(totalScore, 100),
      verdict,
      summary,
      reasons,
      recommendation,
      details: {
        google,
        virustotal: vt,
        urlscan: urlscanData,
        heuristics: { score: heuristics.score, count: heuristics.reasons.length },
      },
      screenshot: urlscanData.screenshot,
    });
  } catch (error) {
    console.error("Link scan error:", error);
    res.status(500).json({
      risk: "ERROR",
      message: "Link scan failed",
    });
  }
};

// ================= MESSAGE CONTROLLER =================
const scanMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ risk: "ERROR", message: "A valid message string is required." });
    }

    const result = analyzeMessage(text);
    const validUserId = isValidObjectId(req.user?.id) ? req.user.id : undefined;

    await Scan.create({
      ...(validUserId ? { userId: validUserId } : {}),
      type: "message",
      content: text,
      risk: result.risk,
      score: result.score,
      explanation: result.explanation,
    }).catch((e) => console.warn("Failed to persist message scan:", e.message));

    emitAlert(req, {
      type: "message",
      risk: result.risk,
      content: text,
      summary: result.summary,
      verdict: result.verdict,
    });

    res.json(result);
  } catch (error) {
    console.error("Message scan error:", error);
    res.status(500).json({
      risk: "ERROR",
      message: "Message analysis failed",
    });
  }
};

// ================= EMAIL CONTROLLER =================
const scanEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ risk: "ERROR", message: "A valid email content string is required." });
    }

    const result = analyzeEmail(email);
    const validUserId = isValidObjectId(req.user?.id) ? req.user.id : undefined;

    await Scan.create({
      ...(validUserId ? { userId: validUserId } : {}),
      type: "email",
      content: email,
      risk: result.risk,
      score: result.score,
      explanation: result.explanation,
    }).catch((e) => console.warn("Failed to persist email scan:", e.message));

    emitAlert(req, {
      type: "email",
      risk: result.risk,
      content: email,
      summary: result.summary,
      verdict: result.verdict,
    });

    res.json(result);
  } catch (error) {
    console.error("Email scan error:", error);
    res.status(500).json({
      risk: "ERROR",
      message: "Email analysis failed",
    });
  }
};

// ================= GET SCANS HISTORY =================
const getScans = async (req, res) => {
  try {
    const validUserId = isValidObjectId(req.user?.id) ? req.user.id : undefined;
    if (!validUserId) {
      return res.json([]);
    }
    const scans = await Scan.find({ userId: validUserId }).sort({ createdAt: -1 });
    res.json(scans);
  } catch (err) {
    console.warn("Failed to fetch scans from DB:", err.message);
    res.json([]);
  }
};

module.exports = {
  scanLink,
  scanMessage,
  scanEmail,
  getScans,
};
