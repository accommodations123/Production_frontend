import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQuery'

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Notification'],
    endpoints: (builder) => ({
        getNotifications: builder.query({
            query: () => 'notification/',
            providesTags: ['Notification'],
            transformResponse: (response) => {
                const items = response?.notifications || response?.data || response || []
                if (!Array.isArray(items)) return []
                return items.map((n) => ({
                    ...n,
                    id: n.id || n._id,
                    is_read: n.is_read !== undefined ? n.is_read : n.read,
                }))
            },
        }),

        markNotificationAsRead: builder.mutation({
            query: (id) => ({
                url: `notification/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),

        markAllNotificationsAsRead: builder.mutation({
            query: () => ({
                url: 'notification/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),

        deleteNotification: builder.mutation({
            query: (id) => ({
                url: `notification/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),

        deleteAllNotifications: builder.mutation({
            query: () => ({
                url: 'notification/',
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
})

export const {
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useDeleteNotificationMutation,
    useDeleteAllNotificationsMutation,
} = notificationApi
