import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import socket, { connectSocket } from "../utils/socket";

const ToastContext = createContext(null);

// Optional subtle audio chime synthesizer using Web Audio API (doesn't require external files)
const playChime = (type = "info") => {
  try {
    if (typeof window === "undefined") return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.04, now);
    
    if (type === "threat-high" || type === "HIGH") {
      // Urgent dual-tone alert
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "threat-medium" || type === "MEDIUM") {
      // Caution notification
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(650, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Pleasant confirmation blip
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // Audio contexts might be blocked until user gesture, safely ignore
  }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Remove toast by ID
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add a generic toast
  const addToast = useCallback((toastData) => {
    const id = toastData.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const duration = toastData.duration !== undefined ? toastData.duration : 5000;
    
    const newToast = {
      id,
      type: toastData.type || "info", // "success" | "error" | "warning" | "info" | "threat" | "scan"
      title: toastData.title,
      message: toastData.message,
      risk: toastData.risk, // "HIGH" | "MEDIUM" | "LOW"
      score: toastData.score,
      target: toastData.target,
      scanType: toastData.scanType, // "email" | "link" | "message"
      details: toastData.details,
      action: toastData.action, // { label: string, onClick: () => void }
      duration,
      createdAt: Date.now(),
    };

    if (soundEnabled) {
      playChime(newToast.risk || newToast.type);
    }

    setToasts((prev) => [newToast, ...prev.slice(0, 5)]); // Keep max 6 toasts
    return id;
  }, [soundEnabled]);

  // Convenience methods
  const success = useCallback((title, message, options = {}) => {
    return addToast({ type: "success", title, message, ...options });
  }, [addToast]);

  const error = useCallback((title, message, options = {}) => {
    return addToast({ type: "error", title, message, ...options });
  }, [addToast]);

  const warning = useCallback((title, message, options = {}) => {
    return addToast({ type: "warning", title, message, ...options });
  }, [addToast]);

  const info = useCallback((title, message, options = {}) => {
    return addToast({ type: "info", title, message, ...options });
  }, [addToast]);

  // Specialized Threat Alert Toast
  const threat = useCallback((threatData) => {
    const risk = (threatData.risk || "LOW").toUpperCase();
    const isHigh = risk === "HIGH";
    const isMed = risk === "MEDIUM";

    return addToast({
      type: "threat",
      risk,
      score: threatData.score || (isHigh ? 92 : isMed ? 60 : 8),
      title: threatData.title || (isHigh ? "🚨 CRITICAL THREAT DETECTED" : isMed ? "⚠️ SUSPICIOUS ACTIVITY FLAGGED" : "✅ SCAN COMPLETE: SAFE"),
      message: threatData.message || (isHigh ? "Malicious attack vector flagged by inspection engines." : isMed ? "Potential phishing or deceptive markers found." : "No malicious indicators detected in content."),
      scanType: threatData.scanType || threatData.type || "threat",
      target: threatData.target || threatData.url || threatData.email || threatData.text,
      duration: isHigh ? 8000 : 5500, // Stay longer for high threats
      action: threatData.action,
      ...threatData,
    });
  }, [addToast]);

  // Specialized Scan Complete Feedback Toast
  const scanComplete = useCallback(({ scanType = "Content", risk = "LOW", score, target, verdict, reason, action }) => {
    const normalizedRisk = (risk || "LOW").toUpperCase();
    const isHigh = normalizedRisk === "HIGH";
    const isMed = normalizedRisk === "MEDIUM";

    const typeNames = {
      email: "Email Phishing Scan",
      link: "URL & Domain Scan",
      url: "URL & Domain Scan",
      message: "SMS / Message Scan",
      quick: "Quick Threat Scan",
    };

    const friendlyTypeName = typeNames[scanType.toLowerCase()] || `${scanType} Scan`;

    let title = `${friendlyTypeName} Complete`;
    let message = verdict || reason || (isHigh ? "High-risk threat detected! Do not trust this source." : isMed ? "Suspicious patterns identified. Exercise caution." : "Clean & safe. Verified by heuristic engines.");

    return addToast({
      type: "scan",
      risk: normalizedRisk,
      score: score !== undefined ? score : isHigh ? 90 : isMed ? 58 : 10,
      title,
      message,
      scanType,
      target,
      duration: isHigh ? 7500 : 5000,
      action,
    });
  }, [addToast]);

  // Listen to Global Socket Alerts
  useEffect(() => {
    const handleSocketAlert = (data) => {
      if (!data) return;
      console.log("🔔 [ToastSystem] Realtime Socket Threat Alert received:", data);
      
      const risk = (data.risk || "LOW").toUpperCase();
      const type = (data.type || "Threat").toUpperCase();
      
      threat({
        risk,
        scanType: data.type,
        title: `Real-Time ${type} Alert: ${risk} Risk`,
        message: data.reason || data.result || `Live threat intelligence detected a ${risk} risk payload.`,
        target: data.target || data.url || data.email,
        score: data.score,
        duration: 7000,
      });
    };

    socket.on("scanAlert", handleSocketAlert);

    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      connectSocket();
    }

    return () => {
      socket.off("scanAlert", handleSocketAlert);
    };
  }, [threat]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearAll,
        success,
        error,
        warning,
        info,
        threat,
        scanComplete,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastContext;
