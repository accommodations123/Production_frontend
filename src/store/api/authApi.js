import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { CLOUDFRONT_BASE } from '@/shared/utils/imageUtils';
import { API_BASE_URL } from '@/shared/utils/apiConfig';

const rawBase = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
        const countryData = localStorage.getItem("selectedCountry");

        if (countryData) {
            try {
                const country = JSON.parse(countryData);
                if (country?.name) {
                    // Backend expects full name for primary filtering (e.g. "India")
                    headers.set("X-Country", country.name);

                    // Send code for future use
                    if (country.code) {
                        headers.set("X-Country-Code", country.code);
                    }
                } else if (country?.code) {
                    headers.set("X-Country", country.code);
                }
            } catch (e) {
                console.error("Error parsing selectedCountry for header", e);
            }
        }
        return headers;
    },
})

const isNetworkError = (result) => {
    if (!result?.error) return false;
    const { status, error } = result.error;
    return (
        status === 'FETCH_ERROR' ||
        status === 'TIMEOUT_ERROR' ||
        (typeof error === 'string' && /load failed|network|fetch/i.test(error))
    );
};

const baseQueryWithLogger = async (args, api, extraOptions) => {
    try {
        let result = await rawBase(args, api, extraOptions);

        // Retry once on network-level errors (iOS Safari throws TypeError: Load failed)
        if (isNetworkError(result)) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            result = await rawBase(args, api, extraOptions);
        }

        if (result.error) {
            const status = result.error.status;
            const url = String(args.url || args);

            // Silently ignore expected errors
            const isExpected =
                status === 401 ||                                     // Not logged in yet
                (status === 404 && url.includes('host/get')) ||       // No host profile
                (status === 400 && url.includes('my-events'));        // No events

            if (!isExpected && status !== 403) {
                console.error(`⬅️ RTK Request Error [${status}] on ${url}:`, result.error);
            }

            // Replace raw network error messages with user-friendly text
            if (isNetworkError(result)) {
                return {
                    error: {
                        status: 'FETCH_ERROR',
                        error: 'Unable to connect. Please check your internet connection and try again.'
                    }
                };
            }
        }
        return result
    } catch (err) {
        // Suppress abort errors from navigation race conditions
        if (err.name === 'AbortError') {
            return { error: { status: 'CUSTOM_ERROR', error: 'Request was cancelled.' } };
        }
        console.error("❌ RTK baseQuery fatal error", err)
        return {
            error: {
                status: 'CUSTOM_ERROR',
                error: 'Something went wrong. Please try again.'
            }
        }
    }
}

export const authApi = createApi({
    reducerPath: 'authApi',
    tagTypes: ['User', 'Trips'],
    baseQuery: baseQueryWithLogger,
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
                // The backend getMe returns profile_image as just the S3 key
                // (e.g. "properties/abc.jpeg"). We need the full CloudFront URL.
                const CLOUDFRONT = CLOUDFRONT_BASE;
                const fixImage = (obj) => {
                    if (obj?.profile_image && !obj.profile_image.startsWith('http')) {
                        const key = obj.profile_image.startsWith('/')
                            ? obj.profile_image
                            : `/${obj.profile_image}`;
                        obj.profile_image = `${CLOUDFRONT}${key}`;
                    }
                    return obj;
                };
                // Handle both { user: {...} } and flat user object shapes
                if (response?.user) {
                    fixImage(response.user);
                } else if (response) {
                    fixImage(response);
                }
                return response;
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
