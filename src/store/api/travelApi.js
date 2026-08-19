import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQuery'

export const travelApi = createApi({
    reducerPath: 'travelApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Trips', 'Match'],
    endpoints: (builder) => ({
        getMyTrips: builder.query({
            query: () => 'travel/trips/me',
            providesTags: ['Trips'],
        }),

        createTrip: builder.mutation({
            query: (data) => ({
                url: 'travel/trips',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Trips'],
        }),

        searchTrips: builder.query({
            query: (params) => ({
                url: 'travel/trips/search',
                params,
            }),
        }),

        travelMatchAction: builder.mutation({
            query: (data) => ({
                url: 'travel/matches/action',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Trips'],
        }),

        getPublicTrips: builder.query({
            query: (params) => ({
                url: 'travel/trips',
                params,
            }),
            providesTags: ['Trips'],
        }),

        getPublicSearchTrips: builder.query({
            query: (params) => ({
                url: 'travel/trips/search',
                params,
            }),
        }),

        getPublicTrip: builder.query({
            query: (tripId) => `travel/trips/${tripId}`,
        }),
    }),
})

export const {
    useGetMyTripsQuery,
    useCreateTripMutation,
    useSearchTripsQuery,
    useLazySearchTripsQuery,
    useTravelMatchActionMutation,
    useGetPublicTripsQuery,
    useGetPublicSearchTripsQuery,
    useLazyGetPublicSearchTripsQuery,
    useGetPublicTripQuery,
    useLazyGetPublicTripQuery,
} = travelApi
