const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API;
  if (envUrl && !envUrl.includes("onrender.com")) {
    return trimTrailingSlash(envUrl);
  }
  return "/api";
};

const getSocketUrl = () => {
  if (typeof window !== "undefined") {
    const envUrl = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || process.env.REACT_APP_API;
    if (envUrl && !envUrl.includes("onrender.com")) {
      return trimTrailingSlash(envUrl.replace(/\/api$/, ""));
    }
    return window.location.origin;
  }
  return "";
};

export const API_BASE_URL = getApiBaseUrl();

export const SOCKET_URL = getSocketUrl();

