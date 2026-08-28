import { io } from "socket.io-client";

let socket = null;

const noopSocket = {
    on: () => noopSocket,
    off: () => noopSocket,
    emit: () => noopSocket,
    connect: () => noopSocket,
    disconnect: () => noopSocket,
    connected: false,
};

export const getSocket = () => {
    if (!socket) {
        const socketUrl = import.meta.env.VITE_SOCKET_URL;
        
        // Supabase manages realtime via supabase-js channel, not socket.io
        if (socketUrl && socketUrl.includes('supabase.co')) {
            return noopSocket;
        }

        const url = socketUrl || (
            import.meta.env.DEV
                ? '/'
                : 'https://api.nextkinlife.live'
        );

        try {
            socket = io(url, {
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 30000,
                randomizationFactor: 0.5,
            });

            socket.connect();
        } catch (e) {
            return noopSocket;
        }
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket && typeof socket.disconnect === 'function') {
        socket.disconnect();
        socket = null;
    }
};
