import * as React from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "@/lib/socket";

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = React.useState(0);

  React.useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    const handleOnlineUsers = (count) => {
      setOnlineUsers(Number.isFinite(count) ? count : 0);
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
      socket.disconnect();
    };
  }, []);

  return onlineUsers;
}
