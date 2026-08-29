import { createApi } from '@reduxjs/toolkit/query/react'
import { resolveImageUrl } from '../../lib/imageUtils';
import { supabase } from '../../lib/supabaseClient';
import { baseQueryWithAuth } from '@/store/baseQuery';

export const authApi = createApi({
    reducerPath: 'authApi',
    tagTypes: ['User', 'Trips'],
    baseQuery: baseQueryWithAuth,
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: 'login',
                method: 'POST',
                body: credentials,
            }),
        }),
        getMe: builder.query({
            query: () => "auth/me",
            providesTags: ["User"],
            transformResponse: (response) => {
                const fixImage = (obj) => {
                    if (obj?.profile_image && !obj.profile_image.startsWith('http')) {
                        obj.profile_image = resolveImageUrl(obj.profile_image);
                    }
                    return obj;
                };
                if (response?.user && (response.user.id || response.user.email)) {
                    fixImage(response.user);
                    return response.user;
                } else if (response && (response.id || response.email)) {
                    fixImage(response);
                    return response;
                }
                return null;
            },
        }),
        getMyTrips: builder.query({
            query: () => "travel/trips/me",
            providesTags: ["Trips"],
        }),
        createTrip: builder.mutation({
            query: (data) => ({
                url: "travel/trips",
                method: "POST",
                body: data
            }),
            invalidatesTags: ["Trips"]
        }),
        searchTrips: builder.query({
            query: (params) => ({
                url: "travel/trips/search",
                params
            }),
        }),
        travelMatchAction: builder.mutation({
            query: (data) => ({
                url: "travel/matches/action",
                method: "POST",
                body: data
            }),
            invalidatesTags: ["Trips"]
        }),
        getPublicTrips: builder.query({
            query: (params) => ({
                url: "travel/trips",
                params
            }),
        }),
        getPublicSearchTrips: builder.query({
            query: (params) => ({
                url: "travel/trips/search",
                params
            }),
        }),
        getPublicTrip: builder.query({
            query: (tripId) => `travel/trips/${tripId}`,
        }),
        logout: builder.mutation({
            query: () => ({
                url: 'otp/logout',
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),
        sendOtp: builder.mutation({
            query: ({ email, phone }) => ({
                url: "otp/send-otp",
                method: "POST",
                body: { email, phone },
            }),
        }),
        verifyOtp: builder.mutation({
            query: ({ email, phone, otp }) => ({
                url: "otp/verify-otp",
                method: "POST",
                body: { email, phone, otp },
            }),
            invalidatesTags: ['User'],
            transformResponse: (response) => {
                const user = response?.user || response?.data?.user;
                return { ...response, user };
            },
        }),
        updateUserProfile: builder.mutation({
            query: (formData) => ({
                url: "otp/update-profile",
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ['User'],
        }),
    }),
})

export const {
    useLoginMutation,
    useGetMeQuery,
    useLazyGetMeQuery,
    useLogoutMutation,
    useSendOtpMutation,
    useVerifyOtpMutation,
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
    useUpdateUserProfileMutation
} = authApi
