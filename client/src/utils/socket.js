import { io } from "socket.io-client";

let _socket = null;
let _lastToken = null;

export function getSocket() {
  const token = localStorage.getItem("token");
  if (!token) {
    if (_socket) {
      _socket.disconnect();
      _socket = null;
    }
    return null;
  }
  
  if (!_socket || _lastToken !== token) {
    if (_socket) _socket.disconnect();
    _lastToken = token;
    _socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      autoConnect: false,
      auth: { token },
      transports: ["websocket", "polling"],   // Explicit transport order
      reconnection: true,                      // Enable auto-reconnection
      reconnectionAttempts: 15,                // Retry up to 15 times
      reconnectionDelay: 1000,                 // Start with 1 s delay
      reconnectionDelayMax: 5000,              // Max 5 s between retries
      timeout: 20000,                          // 20 s timeout (covers Render cold starts)
    });
  }
  return _socket;
}
