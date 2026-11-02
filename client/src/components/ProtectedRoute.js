import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../auth";
import api from "../utils/api";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = getToken();
  const [loading, setLoading] = useState(adminOnly);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!token || !adminOnly) {
      setLoading(false);
      return;
    }

    // Check cached profile first for fast response
    try {
      const cached = sessionStorage.getItem("profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.role === "admin") {
          setIsAdmin(true);
        }
      }
    } catch (e) {}

    // Verify current profile with backend
    api.get("/auth/me")
      .then((res) => {
        if (res.data?.role === "admin") {
          setIsAdmin(true);
          try {
            sessionStorage.setItem("profile", JSON.stringify(res.data));
          } catch (e) {}
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, adminOnly]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly) {
    if (loading) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0d14",
          color: "#94a3b8",
          fontFamily: "sans-serif"
        }}>
          Verifying security privileges...
        </div>
      );
    }

    if (!isAdmin) {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;