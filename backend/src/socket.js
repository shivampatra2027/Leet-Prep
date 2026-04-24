import { Server } from "socket.io";

let io;
const connectedClients = new Set();

function createOriginValidator(allowedOrigins) {
  return (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  };
}

function broadcastOnlineUsers() {
  if (!io) return;
  io.emit("onlineUsers", connectedClients.size);
}

export function initializeSocket(server, allowedOrigins = []) {
  io = new Server(server, {
    cors: {
      origin: createOriginValidator(allowedOrigins),
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    connectedClients.add(socket.id);
    broadcastOnlineUsers();

    socket.on("disconnect", () => {
      connectedClients.delete(socket.id);
      broadcastOnlineUsers();
    });
  });

  return io;
}

export function getOnlineUsersCount() {
  return connectedClients.size;
}
