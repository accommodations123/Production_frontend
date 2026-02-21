import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const rawBase = fetchBaseQuery({
    baseUrl: import.meta.env.PROD
        ? "https://api.nextkinlife.live"
        : "/api",
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

const baseQueryWithLogger = async (args, api, extraOptions) => {
    try {
        const result = await rawBase(args, api, extraOptions)

        if (result.error) {
            const status = result.error.status;
            const url = args.url || args;

            if (status === 401) {
                // console.log(`🔐 Auth: Unauthorized (401) on ${url} - User might not be logged in.`);
            } else if (status === 403) {
                console.warn(`🚫 Auth: Forbidden (403) on ${url}`);
            } else {
                console.error(`⬅️ RTK Request Error [${status}] on ${url}:`, result.error);
            }
        }
        return result
    } catch (err) {
        console.error("❌ RTK baseQuery fatal error", err)
        return { error: { status: 'CUSTOM_ERROR', error: err.message } }
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
                const CLOUDFRONT = 'https://d3dqp3l6ug81j3.cloudfront.net';
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
