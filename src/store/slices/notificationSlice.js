import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
    },
    reducers: {
        addNotification: (state, action) => {
            const newNotif = {
                id: action.payload.id || Date.now().toString(),
                message: action.payload.message,
                time: action.payload.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false,
                type: action.payload.type || 'info',
                entityType: action.payload.entityType,
                entityId: action.payload.entityId,
            };
            state.items = [newNotif, ...state.items];
            state.unreadCount += 1;
        },
        markAllAsRead: (state) => {
            state.items = state.items.map(n => ({ ...n, read: true }));
            state.unreadCount = 0;
        },
        markAsRead: (state, action) => {
            const index = state.items.findIndex(n => n.id === action.payload);
            if (index !== -1 && !state.items[index].read) {
                state.items[index].read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        removeNotification: (state, action) => {
            const index = state.items.findIndex(n => n.id === action.payload);
            if (index !== -1) {
                if (!state.items[index].read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.items.splice(index, 1);
            }
        },
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
        },
    },
});

export const { addNotification, markAllAsRead, markAsRead, clearNotifications, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
