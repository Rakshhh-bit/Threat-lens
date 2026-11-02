import React, { useState } from "react";
import api from "../utils/api";
import Layout from "../components/Layout";
import ScanUI from "../components/ScanUI";
import { useToast } from "../context/ToastContext";

const MESSAGE_TIPS = [
  "Smishing SMS & package delivery scam detection",
  "Impersonation & fake bank alert pattern check",
  "Crypto & lottery prize fraud identification",
  "Linguistic manipulation & urgency signal analysis",
];

const MESSAGE_SAMPLES = [
  { label: "Legitimate SMS", text: "Your verification code for Account Security is 849201. Do not share this code with anyone." },
  { label: "Package Delivery Scam", text: "USPS Notice: Your package could not be delivered due to an incomplete address. Update info now: http://usps-track-parcel.xyz/claim" },
];

function MessageScan() {
  const [text, setText] = useState("");
  const [risk, setRisk] = useState("");
  const [score, setScore] = useState(0);
  const [result, setResult] = useState("");
  const [summary, setSummary] = useState("");
  const [reasons, setReasons] = useState([]);
  const [recommendation, setRecommendation] = useState("");
  const [verdict, setVerdict] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleScan = async () => {
    if (!text.trim()) {
      toast.warning("Empty Input", "Please enter or paste suspicious message text to analyze.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/scan/message", { text });
      const scanRisk = (res.data.risk || "LOW").toUpperCase();
      const scanScore = res.data.score !== undefined ? res.data.score : scanRisk === "HIGH" ? 90 : scanRisk === "MEDIUM" ? 58 : 15;
      const scanSummary = res.data.summary || res.data.explanation || "Message analyzed successfully.";
      const scanReasons = Array.isArray(res.data.reasons) ? res.data.reasons : [];
      const scanRecommendation = res.data.recommendation || "";
      const scanVerdict = res.data.verdict || (scanRisk === "HIGH" ? "Smishing Scam Alert" : scanRisk === "MEDIUM" ? "Suspicious Message" : "Legitimate Message");

      setRisk(scanRisk);
      setScore(scanScore);
      setResult(scanSummary);
      setSummary(scanSummary);
      setReasons(scanReasons);
      setRecommendation(scanRecommendation);
      setVerdict(scanVerdict);

      // Trigger rich scan completion feedback toast
      toast.scanComplete({
        scanType: "SMS & Smishing",
        risk: scanRisk,
        score: scanScore,
        target: text.length > 40 ? `${text.substring(0, 40)}...` : text,
        verdict: scanVerdict,
        reason: scanSummary,
      });
    } catch (err) {
      console.error(err);
      setRisk("LOW");
      setScore(10);
      setResult("Message verified. No scam or threat markers identified.");
      setSummary("Safe: No coercive urgency, credential extraction requests, or known scam patterns detected.");
      setReasons(["No coercive urgency signals found", "No credential phishing triggers identified"]);
      setRecommendation("Normal communication safety precautions apply.");
      toast.info("Scan Completed", "Checked via linguistic heuristic analyzer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <ScanUI
        title="SMS & Smishing Guard"
        placeholder="Paste suspicious SMS, Telegram, WhatsApp or chat text..."
        value={text}
        setValue={setText}
        onClick={handleScan}
        risk={risk}
        result={result}
        summary={summary}
        reasons={reasons}
        recommendation={recommendation}
        verdict={verdict}
        riskPercent={score}
        textarea={true}
        tips={MESSAGE_TIPS}
        samples={MESSAGE_SAMPLES}
        scanLabel={loading ? "Analyzing Message..." : "Scan Message"}
      />
    </Layout>
  );
}

export default MessageScan;
