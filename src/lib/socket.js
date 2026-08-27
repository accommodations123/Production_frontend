import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
    if (!socket) {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || "";
        if (!socketUrl) return null;

        socket = io(socketUrl, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: false,
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
