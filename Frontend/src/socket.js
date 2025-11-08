import { io } from "socket.io-client";

const socket = io(`http://localhost:8000`, {
  withCredentials: true,
  autoConnect: false, // we will manually connect after login
});

export default socket;
