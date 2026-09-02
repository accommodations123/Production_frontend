import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import notificationReducer from '@/store/slices/notificationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notifications: notificationReducer,
    },
});

export default store;
