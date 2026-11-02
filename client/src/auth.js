// 🔐 AUTH UTIL (ROBUST SESSION & EXPIRATION MANAGEMENT)

export const isTokenValid = (token) => {
  if (!token || typeof token !== "string") return false;
  const clean = token.trim();
  if (!clean || clean === "null" || clean === "undefined" || clean.length > 4096) return false;

  try {
    const parts = clean.split(".");
    if (parts.length !== 3) return false;

    // URL-safe Base64 decode JWT payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload || !payload.id) return false;

    // Check expiration timestamp (exp is in seconds)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
};

export const setToken = (token) => {
  if (token && typeof token === "string") {
    localStorage.setItem("token", token.trim());
  }
};

export const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!isTokenValid(token)) {
    // Automatically purge invalid/expired token
    try {
      localStorage.removeItem("token");
      sessionStorage.removeItem("profile");
    } catch (e) {}
    return null;
  }

  return token.trim();
};

export const logout = () => {
  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("profile");
  } catch (e) {}
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
};
