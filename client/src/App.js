import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

import Alert from "./components/Alert";
import ToastContainer from "./components/ToastContainer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EmailScan from "./pages/EmailScan";
import LinkScan from "./pages/LinkScan";
import MessageScan from "./pages/MessageScan";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import AIChat from "./pages/AIChat";
import ThreatReports from "./pages/ThreatReports";
import Timeline from "./pages/Timeline";
import Contact from "./pages/Contact";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          {/* GLOBAL TOAST & THREAT ALERT SYSTEM */}
          <ToastContainer />
          <Alert />

          <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Auth />} />
          <Route path="/reset/:token" element={<ResetPassword />} />

          {/* Protected General Routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/about-us" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/privacy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
          <Route path="/privacy-policy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
          <Route path="/terms" element={<ProtectedRoute><TermsOfService /></ProtectedRoute>} />
          <Route path="/terms-of-service" element={<ProtectedRoute><TermsOfService /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ThreatReports /></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/contact-us" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/email" element={<ProtectedRoute><EmailScan /></ProtectedRoute>} />
          <Route path="/link" element={<ProtectedRoute><LinkScan /></ProtectedRoute>} />
          <Route path="/message" element={<ProtectedRoute><MessageScan /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Protected Admin Route (Requires Authentication AND Admin Role) */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
