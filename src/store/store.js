import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '@/store/api/authApi'
import { propertyApi } from '@/store/api/propertyApi'
import { eventApi } from '@/store/api/eventApi'
import { marketplaceApi } from '@/store/api/marketplaceApi'
import { careerApi } from '@/store/api/careerApi'
import { travelApi } from '@/store/api/travelApi'
import { notificationApi } from '@/store/api/notificationApi'
import { wishlistApi } from '@/store/api/wishlistApi'
import { hostApi } from '@/store/api/hostApi'
import authReducer from '@/store/slices/authSlice'
import notificationReducer from '@/store/slices/notificationSlice'

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [propertyApi.reducerPath]: propertyApi.reducer,
        [eventApi.reducerPath]: eventApi.reducer,
        [marketplaceApi.reducerPath]: marketplaceApi.reducer,
        [careerApi.reducerPath]: careerApi.reducer,
        [travelApi.reducerPath]: travelApi.reducer,
        [notificationApi.reducerPath]: notificationApi.reducer,
        [wishlistApi.reducerPath]: wishlistApi.reducer,
        [hostApi.reducerPath]: hostApi.reducer,
        auth: authReducer,
        notifications: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            propertyApi.middleware,
            eventApi.middleware,
            marketplaceApi.middleware,
            careerApi.middleware,
            travelApi.middleware,
            notificationApi.middleware,
            wishlistApi.middleware,
            hostApi.middleware,
        ),
})
