import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {

  if (!socket) {

    socket = io(
      "http://localhost:5000",
      {
        autoConnect: false,
        transports: ["websocket"],
        reconnection: false
      }
    );

  }

  return socket;
};