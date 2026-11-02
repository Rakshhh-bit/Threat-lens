import { io } from "socket.io-client";
import { SOCKET_URL } from "./config";

const socketUrl = SOCKET_URL || (typeof window !== "undefined" ? window.location.origin : "");

const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: false,
  reconnectionAttempts: 10,
  reconnectionDelay: 1500,
  timeout: 10000,
});

socket.on("connect", () => {
  console.log("🟢 Socket connected successfully:", socket.id);
});

socket.on("connect_error", (err) => {
  console.warn("Socket connection warning:", err.message);
});

export const connectSocket = (token = localStorage.getItem("token")) => {
  if (token && typeof token === "string" && token.trim() !== "" && token !== "null" && token !== "undefined") {
    socket.auth = { token: token.trim() };
  } else {
    socket.auth = {};
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;

