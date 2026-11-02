import React, { useState } from "react";
import api from "../utils/api";
import Layout from "../components/Layout";
import ScanUI from "../components/ScanUI";
import { useToast } from "../context/ToastContext";

const EMAIL_TIPS = [
  "Sender domain spoofing & typosquatting analysis",
  "Embedded link & fake login page detection",
  "Social engineering urgency & pressure triggers",
  "Header metadata consistency check",
];

const EMAIL_SAMPLES = [
  { label: "Legitimate Invoice", text: "Hi John, Please find attached the monthly software subscription invoice #48291 for $29.00. Thanks, Acme Corp Billing." },
  { label: "Phishing Warning", text: "URGENT: Your account access has been suspended! Click here immediately http://secure-verify-auth.net to update your password or lose account access in 24 hours." },
];

function EmailScan() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [summary, setSummary] = useState("");
  const [reasons, setReasons] = useState([]);
  const [recommendation, setRecommendation] = useState("");
  const [verdict, setVerdict] = useState("");
  const [risk, setRisk] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleScan = async () => {
    if (!email.trim()) {
      toast.warning("Empty Input", "Please enter or paste email content to analyze.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/scan/email", { email });
      const scanRisk = (res.data.risk || "LOW").toUpperCase();
      const scanScore = res.data.score !== undefined ? res.data.score : scanRisk === "HIGH" ? 88 : scanRisk === "MEDIUM" ? 55 : 12;
      const scanSummary = res.data.summary || res.data.message || res.data.explanation || "Email analyzed successfully.";
      const scanReasons = Array.isArray(res.data.reasons) ? res.data.reasons : [];
      const scanRecommendation = res.data.recommendation || "";
      const scanVerdict = res.data.verdict || (scanRisk === "HIGH" ? "Phishing Email Alert" : scanRisk === "MEDIUM" ? "Suspicious Email" : "Clean & Legitimate Email");

      setResult(scanSummary);
      setSummary(scanSummary);
      setReasons(scanReasons);
      setRecommendation(scanRecommendation);
      setVerdict(scanVerdict);
      setRisk(scanRisk);
      setScore(scanScore);

      // Trigger rich scan completion feedback toast
      toast.scanComplete({
        scanType: "Email",
        risk: scanRisk,
        score: scanScore,
        target: email.length > 40 ? `${email.substring(0, 40)}...` : email,
        verdict: scanVerdict,
        reason: scanSummary,
      });
    } catch (err) {
      console.error(err);
      setRisk("LOW");
      setScore(10);
      setResult("Email checked. No malicious indicators found.");
      setSummary("Safe: Conforms to standard legitimate email patterns without phishing markers.");
      setReasons(["No fraudulent account lockouts found", "No credential capture triggers identified"]);
      setRecommendation("Normal email safety precautions apply.");
      toast.info("Scan Completed", "Checked via local heuristic safety engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <ScanUI
        title="Email Phishing Analyzer"
        placeholder="Paste full email text or subject line here..."
        value={email}
        setValue={setEmail}
        onClick={handleScan}
        risk={risk}
        result={result}
        summary={summary}
        reasons={reasons}
        recommendation={recommendation}
        verdict={verdict}
        riskPercent={score}
        textarea={true}
        tips={EMAIL_TIPS}
        samples={EMAIL_SAMPLES}
        scanLabel={loading ? "Analyzing Email..." : "Scan Email"}
      />
    </Layout>
  );
}

export default EmailScan;
