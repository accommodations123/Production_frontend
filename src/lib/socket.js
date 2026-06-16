import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
    if (!socket) {
        // In Development, force use of '/' so Vite proxy handles headers (Host/Origin)
        // In Production, connect through FRONTEND domain (nginx has WebSocket config there)
        const socketUrl = import.meta.env.DEV
            ? "/"
            : (import.meta.env.VITE_SOCKET_URL || "https://api.nextkinlife.live");

        socket = io(socketUrl, {
            withCredentials: true,  // Browser will send cookies automatically
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 15,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 30000,   // Exponential backoff caps at 30s
            randomizationFactor: 0.5,      // Jitter to avoid thundering herd
        });

        // Explicitly connect
        socket.connect();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
