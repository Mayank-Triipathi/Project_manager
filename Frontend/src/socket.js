import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"], // ensures faster, reliable connection on Render
});

export default socket;
