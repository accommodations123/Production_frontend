import { configureStore } from '@reduxjs/toolkit'
import { hostApi } from '@/store/api/hostApi'
import { authApi } from '@/store/api/authApi'
import authReducer from '@/store/slices/authSlice'
import notificationReducer from '@/store/slices/notificationSlice'

export const store = configureStore({
    reducer: {
        [hostApi.reducerPath]: hostApi.reducer,
        [authApi.reducerPath]: authApi.reducer,
        auth: authReducer,
        notifications: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(hostApi.middleware, authApi.middleware),
})
