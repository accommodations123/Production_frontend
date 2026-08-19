import { createSlice } from '@reduxjs/toolkit';

const loadNotifications = () => {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem('notifications');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Failed to load notifications', e);
        return [];
    }
};

const saveNotifications = (notifications) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (e) {
        console.error('Failed to save notifications', e);
    }
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: loadNotifications(),
        unreadCount: loadNotifications().filter(n => !n.read).length,
    },
    reducers: {
        addNotification: (state, action) => {
            const newNotif = {
                id: action.payload.id || Date.now().toString(),
                message: action.payload.message,
                time: action.payload.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false,
                type: action.payload.type || 'info',
                entityType: action.payload.entityType, // 'EVENT', 'PROPERTY', 'HOST'
                entityId: action.payload.entityId,
            };
            state.items = [newNotif, ...state.items];
            state.unreadCount += 1;
            saveNotifications(state.items);
        },
        markAllAsRead: (state) => {
            state.items = state.items.map(n => ({ ...n, read: true }));
            state.unreadCount = 0;
            saveNotifications(state.items);
        },
        markAsRead: (state, action) => {
            const index = state.items.findIndex(n => n.id === action.payload);
            if (index !== -1 && !state.items[index].read) {
                state.items[index].read = true;
                state.unreadCount -= 1;
                saveNotifications(state.items);
            }
        },
        removeNotification: (state, action) => {
            const index = state.items.findIndex(n => n.id === action.payload);
            if (index !== -1) {
                if (!state.items[index].read) {
                    state.unreadCount -= 1;
                }
                state.items.splice(index, 1);
                saveNotifications(state.items);
            }
        },
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
            saveNotifications(state.items);
        },
    },
});

export const { addNotification, markAllAsRead, markAsRead, clearNotifications, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
