import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQuery'

export const stayRequestApi = createApi({
    reducerPath: 'stayRequestApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: [
        'StayRequests',
        'StayRequestDetail',
        'MyStayRequests',
        'StayRequestOffers',
        'MyOffers',
    ],
    endpoints: (builder) => ({
        // ── Public Stay Requests & Search ──────────────────────────────
        getPublicStayRequests: builder.query({
            query: (params = {}) => ({
                url: 'stay-request',
                params,
            }),
            transformResponse: (response) => response?.data ?? response,
            providesTags: ['StayRequests'],
        }),

        searchStayRequests: builder.query({
            query: (params = {}) => ({
                url: 'stay-request/search',
                params,
            }),
            transformResponse: (response) => response?.data ?? response,
            providesTags: ['StayRequests'],
        }),

        getStayRequestById: builder.query({
            query: (id) => `stay-request/request/${id}`,
            transformResponse: (response) => response?.data ?? response,
            providesTags: (result, error, id) => [
                { type: 'StayRequestDetail', id },
            ],
        }),

        getOffersForRequest: builder.query({
            query: (id) => `stay-request/offers/${id}`,
            transformResponse: (response) => response?.data ?? response,
            providesTags: (result, error, id) => [
                { type: 'StayRequestOffers', id },
            ],
        }),

        // ── Authenticated User Routes ──────────────────────────────────
        getMyStayRequests: builder.query({
            query: () => 'stay-request/me',
            transformResponse: (response) => response?.data ?? response,
            providesTags: ['MyStayRequests'],
        }),

        getMyOffers: builder.query({
            query: () => 'stay-request/me/offers',
            transformResponse: (response) => response?.data ?? response,
            providesTags: ['MyOffers'],
        }),

        createStayRequest: builder.mutation({
            query: (data) => ({
                url: 'stay-request',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['StayRequests', 'MyStayRequests'],
        }),

        updateStayRequest: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `stay-request/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                'StayRequests',
                'MyStayRequests',
                { type: 'StayRequestDetail', id },
            ],
        }),

        deleteStayRequest: builder.mutation({
            query: (id) => ({
                url: `stay-request/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['StayRequests', 'MyStayRequests'],
        }),

        createStayOffer: builder.mutation({
            query: ({ requestId, ...data }) => ({
                url: `stay-request/${requestId}/offers`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { requestId }) => [
                'MyOffers',
                { type: 'StayRequestOffers', id: requestId },
                { type: 'StayRequestDetail', id: requestId },
            ],
        }),

        reportStayRequest: builder.mutation({
            query: (data) => ({
                url: 'stay-request/report',
                method: 'POST',
                body: data,
            }),
        }),
    }),
})

export const {
    useGetPublicStayRequestsQuery,
    useSearchStayRequestsQuery,
    useGetStayRequestByIdQuery,
    useGetOffersForRequestQuery,
    useGetMyStayRequestsQuery,
    useGetMyOffersQuery,
    useCreateStayRequestMutation,
    useUpdateStayRequestMutation,
    useDeleteStayRequestMutation,
    useCreateStayOfferMutation,
    useReportStayRequestMutation,
} = stayRequestApi
