import { configureStore } from '@reduxjs/toolkit'
import { hostApi } from './api/hostApi'
import { authApi } from './api/authApi'
import authReducer from './slices/authSlice'
import notificationReducer from './slices/notificationSlice'

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
